import { deleteJob, milliSatsToCents } from "wasp/client/operations";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  ButtonGroup,
  Checkbox,
  Code,
  Text,
  Spacer,
  VStack,
  Box,
  useDisclosure,
} from '@chakra-ui/react';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AiOutlineLogin } from 'react-icons/ai';
import { BiTrash } from 'react-icons/bi';

export function LeaveATip({
  isOpen,
  onClose,
  credits,
  isUsingLn,
}: {
  isUsingLn: boolean;
  credits: number;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const tipRef = useRef(null);

  const navigate = useNavigate();
  const handleClick = async () => {
    navigate('/profile');
    onClose();
  };

  return (
    <>
      <AlertDialog isOpen={isOpen} leastDestructiveRef={tipRef} onClose={onClose}>
        <AlertDialogOverlay backdropFilter='auto' backdropInvert='15%' backdropBlur='2px'>
          <AlertDialogContent bgColor='bg-modal'>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              👋 Takk for at du prøver SøknadGPT.
            </AlertDialogHeader>

            <AlertDialogBody textAlign='center'>
                <Text>
                Du har <Code>{credits}</Code> gratis søknadsbrev igjen.
                </Text>
              <Text mt={4}>
                {!isUsingLn ? (
                    <>
                    Kjøp ubegrenset tilgang for kun <Code>59 kr</Code> per måned!
                    </>
                ) : (
                    <>Etterpå kan du betale en liten avgift per søknadsbrev med din lightning ⚡️-lommebok.</>
                )}
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter>
              {!isUsingLn ? (
                <>
                  <Button isLoading={isLoading} ref={tipRef} colorScheme='purple' onClick={handleClick}>
                  💰 Kjøp mer
                  </Button>
                  <Spacer />
                  <Button alignSelf='flex-end' fontSize='sm' variant='solid' size='sm' onClick={onClose}>
                  Nei, takk
                  </Button>
                </>
                ) : (
                <Button alignSelf='flex-end' fontSize='sm' variant='solid' size='sm' onClick={onClose}>
                  OK
                </Button>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

export function LoginToBegin({ isOpen, onClose }: { isOpen: boolean; onOpen: () => void; onClose: () => void }) {
  const navigate = useNavigate();
  const loginRef = useRef(null);

  const handleClick = async () => {
    navigate('/login');
    onClose();
  };

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={loginRef} onClose={onClose}>
      <AlertDialogOverlay backdropFilter='auto' backdropInvert='15%' backdropBlur='2px'>
        <AlertDialogContent bgColor='bg-modal'>
          <AlertDialogHeader textAlign='center' fontSize='md' mt={3} fontWeight='bold'>
            ✋
          </AlertDialogHeader>

            <AlertDialogBody textAlign='center'>Vennligst logg inn for å begynne!</AlertDialogBody>

          <AlertDialogFooter justifyContent='center'>
            <Button ref={loginRef} leftIcon={<AiOutlineLogin />} colorScheme='purple' onClick={handleClick}>
              Logg inn
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}

export function DeleteJob({
  isOpen,
  onClose,
  jobId,
}: {
  jobId: string | null;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const cancelRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
      <AlertDialogOverlay backdropFilter='auto' backdropInvert='15%' backdropBlur='2px'>
        <AlertDialogContent bgColor='bg-modal'>
            <AlertDialogHeader fontSize='md' mt={3} fontWeight='bold'>
            ⛔️ Slett stilling
            </AlertDialogHeader>

            <AlertDialogBody>
            Slett denne stillingen og alle tilhørende søknadsbrev?
            <br />
            Denne handlingen kan ikke angres.
            </AlertDialogBody>

          <AlertDialogFooter display='grid' gridTemplateColumns='1fr 1fr 1fr'>
            <Button
              leftIcon={<BiTrash />}
              size='sm'
              isLoading={isLoading}
              onClick={async () => {
                if (!jobId) return;
                setIsLoading(true);
                await deleteJob({ jobId });
                setIsLoading(false);
                onClose();
              }}
            >
              Slett
            </Button>
            <Spacer />
            <Button ref={cancelRef} size='sm' colorScheme='purple' onClick={onClose}>
              Avbryt
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}

export function EditAlert({ coverLetter }: { coverLetter: boolean }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (coverLetter && localStorage.getItem('edit-alert') !== 'do not show') {
      onOpen();
    }
  }, [coverLetter]);

  const cancelRef = useRef(null);
  function handleCheckboxChange(e: any) {
    if (e.target.checked) {
      localStorage.setItem('edit-alert', 'do not show');
    } else {
      localStorage.removeItem('edit-alert');
    }
  }

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
      <AlertDialogOverlay backdropFilter='auto' backdropInvert='15%' backdropBlur='2px'>
        <AlertDialogContent bgColor='bg-modal'>
            <AlertDialogHeader fontSize='md' mt={3} fontWeight='bold'>
            📝 Søknadsbrevet ditt er klart!
            </AlertDialogHeader>

            <AlertDialogBody gap={5} pointerEvents='none'>
            <Text pb={3}>
              Hvis du vil gjøre finere endringer, marker teksten du ønsker å endre for å få opp popupen under:
            </Text>
            <VStack m={3} gap={1} borderRadius='lg'>
              <Box layerStyle='cardLg' p={3}>
              <Text fontSize='sm' textAlign='center'>
                🤔 Be GPT om å gjøre denne delen mer..
              </Text>
              <ButtonGroup size='xs' p={1} variant='solid' colorScheme='purple' isAttached>
                <Button size='xs' color='black' fontSize='xs'>
                Kortfattet
                </Button>

                <Button size='xs' color='black' fontSize='xs'>
                Detaljert
                </Button>

                <Button size='xs' color='black' fontSize='xs'>
                Profesjonell
                </Button>

                <Button size='xs' color='black' fontSize='xs'>
                Uformell
                </Button>
                </ButtonGroup>
              </Box>
            </VStack>
          </AlertDialogBody>

          <AlertDialogFooter justifyContent='space-between'>
            <Checkbox onChange={handleCheckboxChange} size='sm' color='text-contrast-md'>
              Ikke vis meg dette igjen
            </Checkbox>
            <Button ref={cancelRef} size='sm' colorScheme='purple' onClick={onClose}>
              OK
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
