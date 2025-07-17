import { type User, type LnPayment } from "wasp/entities";
import { generateEdit, updateLnPayment, useQuery, getUserInfo } from "wasp/client/operations";
import { VStack, ButtonGroup, Button, ButtonGroupProps, Text, Box, useDisclosure } from '@chakra-ui/react';
import { useContext, useState } from 'react';
import { TextareaContext } from '../App';
import { LeaveATip } from './AlertDialog';
import LnPaymentModal from './LnPaymentModal';
import { fetchLightningInvoice } from '../lightningUtils';
import type { LightningInvoice } from '../lightningUtils';

interface EditPopoverProps extends ButtonGroupProps {
  selectedText?: string;
  setTooltip: any;
  user: Omit<User, 'password'>;
  editCount: number;
  onEditUsed: () => void;
}

export function EditPopover({ setTooltip, selectedText, user, editCount, onEditUsed, ...props }: EditPopoverProps) {
  const [lightningInvoice, setLightningInvoice] = useState<LightningInvoice | null>(null);
  const { textareaState, setTextareaState, setIsLnPayPending } = useContext(TextareaContext);

  const { data: userInfo } = useQuery(getUserInfo, { id: user.id });

  const { isOpen: isPayOpen, onOpen: onPayOpen, onClose: onPayClose } = useDisclosure();
  const { isOpen: lnPaymentIsOpen, onOpen: lnPaymentOnOpen, onClose: lnPaymentOnClose } = useDisclosure();

  async function checkIfLnAndPay(user: Omit<User, 'password'>): Promise<LnPayment | null> {
    try {
      if (user.isUsingLn && user.credits === 0) {
        const invoice = await fetchLightningInvoice();
        let lnPayment: LnPayment;
        if (invoice) {
          invoice.status = 'pending';
          lnPayment = await updateLnPayment(invoice);
          setLightningInvoice(invoice);
          lnPaymentOnOpen();
        } else {
          throw new Error('fetching lightning invoice failed');
        }

        let status = invoice.status;
        while (status === 'pending') {
          lnPayment = await updateLnPayment(invoice);
          status = lnPayment.status;
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        if (status !== 'success') {
          throw new Error('payment failed');
        }
        return lnPayment;
      }
      return null;
    } catch (error) {
      console.error('Error processing payment, please try again');
      return null;
    }
  }

  const replaceSelectedText = async ({ improvement, lnPayment }: { improvement: string, lnPayment: LnPayment }) => {
    const selection = window.getSelection();
    let loadingInterval;

    try {
      const value = textareaState;
      const selectString = selection!.toString();
      const index = value.indexOf(selectString);

      let loadingString = 'Loading';
      loadingInterval = setInterval(() => {
        if (loadingString.length < 'Loading...'.length) {
          loadingString += '.';
          let loading =
            value.slice(0, index + selectString.length) +
            '\n --- \n' +
            loadingString +
            '\n --- \n' +
            value.slice(index + selectString.length);
          setTextareaState(loading);
        } else {
          loadingString = 'Loading';
        }
      }, 750);

      const newValue = await generateEdit({ content: selectString, improvement, lnPayment });

      clearInterval(loadingInterval);
      setTextareaState(value);

      const newText =
        value.slice(0, index + selectString.length) +
        '\n --- Revision: \n' +
        newValue +
        '\n --- \n' +
        value.slice(index + selectString.length);

      setTextareaState(newText);
    } catch (error: any) {
      console.error(error);
      clearInterval(loadingInterval);
      alert(error?.message ?? 'An error has occurred');
    }
  };

  const handleClick = async (value: string) => {
    // Check if edit limit is reached
    if (editCount >= 5) {
      alert('Du har brukt opp dine 5 gratis redigeringer for denne økten. Last inn siden på nytt for å få 5 nye redigeringer.');
      setTooltip(null);
      window.getSelection()?.removeAllRanges();
      return;
    }

    if (!userInfo?.credits && !userInfo?.hasPaid && !user.isUsingLn) {
      onPayOpen();
      setTooltip(null);
      window.getSelection()?.removeAllRanges();
      return;
    }
    let lnPayment: LnPayment | null = null;
    if (userInfo?.isUsingLn) {
      if (userInfo.credits > 0) {
        onPayOpen();
      }
      try {
        lnPayment = await checkIfLnAndPay(user);
      } catch (error) {
        console.error('error paying with ln: ', error);
      }
    }
    
    await replaceSelectedText({ improvement: value, lnPayment: lnPayment as LnPayment });
    onEditUsed(); // Increment the edit counter
    window.getSelection()?.removeAllRanges();
  };

  return (
    <>
      <VStack {...props} gap={1} bgColor='bg-modal' borderRadius='lg' boxShadow='2xl'>
        <Box layerStyle='cardLg' p={3}>
            <Text fontSize='sm' textAlign='center'>
            🤔 Be GPT om å gjøre denne delen mer..
            </Text>
            <ButtonGroup size='xs' p={1} variant='solid' colorScheme='purple' isAttached>
            <Button size='xs' color='black' fontSize='xs' onClick={() => handleClick('kortfattet')}>
              Kortfattet
            </Button>

            <Button size='xs' color='black' fontSize='xs' onClick={() => handleClick('detaljert')}>
              Detaljert
            </Button>

            <Button size='xs' color='black' fontSize='xs' onClick={() => handleClick('profesjonell')}>
              Profesjonell
            </Button>

            <Button size='xs' color='black' fontSize='xs' onClick={() => handleClick('uformell')}>
              Uformell
            </Button>
          </ButtonGroup>
        </Box>
      </VStack>
      <LeaveATip
        isOpen={isPayOpen}
        onOpen={onPayOpen}
        onClose={onPayClose}
        credits={userInfo?.credits || 0}
        isUsingLn={user?.isUsingLn || false}
      />
      <LnPaymentModal isOpen={lnPaymentIsOpen} onClose={lnPaymentOnClose} lightningInvoice={lightningInvoice} />
    </>
  );
}
