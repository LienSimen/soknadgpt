import { type User } from 'wasp/entities';
import { logout } from 'wasp/client/auth';

import { stripePayment, stripeGpt4Payment, stripeCreditsPayment, useQuery, getUserInfo } from 'wasp/client/operations';

import BorderBox from './components/BorderBox';
import { Box, Heading, Text, Button, Code, Spinner, VStack, HStack, Link } from '@chakra-ui/react';
import { useState } from 'react';
import { IoWarningOutline } from 'react-icons/io5';

export default function ProfilePage({ user }: { user: User }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCreditsLoading, setIsCreditsLoading] = useState(false);
  const [isGpt4loading, setIsGpt4Loading] = useState(false);

  const { data: userInfo } = useQuery(getUserInfo, { id: user.id });

  const userPaidOnDay = new Date(String(user.datePaid));
  const oneMonthFromDatePaid = new Date(userPaidOnDay.setMonth(userPaidOnDay.getMonth() + 1));

  async function handleCreditsClick() {
    setIsCreditsLoading(true);
    try {
      const response = await stripeCreditsPayment();
      const url = response.sessionUrl;
      if (url) window.open(url, '_self');
    } catch (error) {
      alert('Something went wrong. Please try again');
    }
    setIsCreditsLoading(false);
  }

  async function handleBuy4oMini() {
    setIsLoading(true);
    try {
      const response = await stripePayment();
      const url = response.sessionUrl;
      if (url) window.open(url, '_self');
    } catch (error) {
      alert('Something went wrong. Please try again');
    }
    setIsLoading(false);
  }

  async function handleBuy4o() {
    setIsGpt4Loading(true);
    try {
      const response = await stripeGpt4Payment();
      const url = response.sessionUrl;
      if (url) window.open(url, '_self');
    } catch (error) {
      alert('Something went wrong. Please try again');
    }
    setIsGpt4Loading(false);
  }

  return (
    <BorderBox>
      {!!userInfo ? (
        <>
          <Heading size='md'>👋 Hei {userInfo.email || 'der'} </Heading>
          {userInfo.subscriptionStatus === 'past_due' ? (
            <VStack gap={3} py={5} alignItems='center'>
              <Box color='purple.400'>
                <IoWarningOutline size={30} color='inherit' />
              </Box>
              <Text textAlign='center' fontSize='sm' textColor='text-contrast-lg'>
                Abonnementet ditt er utløpt. <br /> Vennligst oppdater betalingsmetoden din{' '}
                <Link textColor='purple.400' href='https://billing.stripe.com/p/login/00w00j1sLcqp4ZDaKX0Ny00'>
                  ved å klikke her
                </Link>
              </Text>
            </VStack>
          ) : userInfo.hasPaid && !userInfo.isUsingLn ? (
            <VStack gap={3} pt={5} alignItems='flex-start'>
              <Text textAlign='initial'>Tusen takk for støtten!</Text>

              <Text textAlign='initial'>Du har ubegrenset tilgang til CoverLetterGPT med {user?.gptModel === 'gpt-4' || user?.gptModel === 'gpt-4o' ? 'GPT-4o.' : 'GPT-4o-mini.'}</Text>

              {userInfo.subscriptionStatus === 'canceled' && (
                <Code alignSelf='center' fontSize='lg'>
                  {oneMonthFromDatePaid.toUTCString().slice(0, -13)}
                </Code>
              )}
              <Text alignSelf='initial' fontSize='sm' fontStyle='italic' textColor='text-contrast-sm'>
                For å administrere abonnementet ditt, vennligst{' '}
                <Link textColor='purple.600' href='https://billing.stripe.com/p/login/00w00j1sLcqp4ZDaKX0Ny00'>
                  klikk her.
                </Link>
              </Text>
            </VStack>
          ) : (
            !userInfo.isUsingLn && (
              <HStack pt={3} textAlign='center'>
                <Heading size='sm'>Du har </Heading>
                <Code>{userInfo?.credits ? userInfo.credits : '0'}</Code>
                <Heading size='sm'>søknadsbrev{userInfo?.credits === 1 ? '' : 'er'} igjen</Heading>
              </HStack>
            )
          )}
          {!userInfo.hasPaid && !userInfo.isUsingLn && (
            <VStack py={3} gap={5}>
              <VStack py={3} gap={2}>
                <HStack gap={5} w='full' justifyContent='center'>
                   <VStack
                    layerStyle='card'
                    py={5}
                    px={7}
                    gap={3}
                    height='100%'
                    justifyContent='space-between'
                    alignItems='center'
                    borderColor='purple.500'
                  >
                    <VStack gap={3} alignItems='center'>
                      <Heading size='xl'>NOK 49</Heading>
                        <Text textAlign='center' fontSize='md'>
                        150 kreditter<br />
                        (150 søknadsbrev ) 😎
                        </Text>
                    </VStack>
                    <Button mr={3} isLoading={isCreditsLoading} onClick={handleCreditsClick}>
                      Kjøp nå
                    </Button>
                  </VStack>
                </HStack>
              </VStack>
            </VStack>
          )}
          {userInfo.isUsingLn && (
            <VStack py={3} gap={5}>
              <VStack py={3} gap={2}>
                <HStack gap={5} display='grid' gridTemplateColumns='1fr'>
                  <VStack layerStyle='card' py={5} px={7} gap={3} height='100%' width='100%' justifyContent='center' alignItems='center'>
                    <VStack gap={3} alignItems='center'>
                      <Heading size='xl'>⚡️</Heading>
                      <Text textAlign='start' fontSize='md'>
                        Du har rimelig, bruk-betalt tilgang til SøknadGPT med GPT-4o via Lightning Network
                      </Text>
                      <Text textAlign='start' fontSize='sm'>
                        Merk: hvis du foretrekker et månedlig abonnement, vennligst logg ut og logg inn med Google.
                      </Text>
                    </VStack>
                  </VStack>
                </HStack>
              </VStack>
            </VStack>
          )}
          <Button alignSelf='flex-end' size='sm' onClick={() => logout()}>
            Logg ut
          </Button>
        </>
      ) : (
        <Spinner />
      )}
    </BorderBox>
  );
}
