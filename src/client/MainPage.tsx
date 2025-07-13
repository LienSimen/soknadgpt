import { type User, type LnPayment } from "wasp/entities";
import { useAuth } from "wasp/client/auth";

import {
  generateCoverLetter,
  createJob,
  updateCoverLetter,
  updateLnPayment,
  useQuery,
  getJob,
  getCoverLetterCount,
} from "wasp/client/operations";
import { scrapeJob } from './scrapeJob';

import {
  Box,
  HStack,
  VStack,
  Heading,
  Text,
  FormErrorMessage,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  FormHelperText,
  Code,
  Checkbox,
  Spinner,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  RadioGroup,
  Radio,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import BorderBox from './components/BorderBox';
import { LeaveATip, LoginToBegin } from './components/AlertDialog';
import { convertToSliderValue, convertToSliderLabel } from './components/CreativitySlider';
import * as pdfjsLib from 'pdfjs-dist';
import { useState, useEffect, useRef } from 'react';
import { ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import LnPaymentModal from './components/LnPaymentModal';
import { fetchLightningInvoice } from './lightningUtils';
import type { LightningInvoice } from './lightningUtils';

function MainPage() {
  const [isPdfReady, setIsPdfReady] = useState<boolean>(false);
  const [jobToFetch, setJobToFetch] = useState<string>('');
  const [isCoverLetterUpdate, setIsCoverLetterUpdate] = useState<boolean>(false);
  const [isCompleteCoverLetter, setIsCompleteCoverLetter] = useState<boolean>(true);
  const [sliderValue, setSliderValue] = useState(30);
  const [showTooltip, setShowTooltip] = useState(false);
  const [lightningInvoice, setLightningInvoice] = useState<LightningInvoice | null>(null);
  const [isScraping, setIsScraping] = useState<boolean>(false);

  const { data: user } = useAuth();

  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const jobIdParam = urlParams.get('job');

  const {
    data: job,
    isLoading: isJobLoading,
    error: getJobError,
  } = useQuery(getJob, { id: jobToFetch }, { enabled: jobToFetch.length > 0 });

  const { data: coverLetterCount } = useQuery(getCoverLetterCount);

  const {
    handleSubmit,
    register,
    setValue,
    reset,
    clearErrors,
    getValues,
    formState: { errors: formErrors, isSubmitting },
  } = useForm();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: loginIsOpen, onOpen: loginOnOpen, onClose: loginOnClose } = useDisclosure();
  const { isOpen: lnPaymentIsOpen, onOpen: lnPaymentOnOpen, onClose: lnPaymentOnClose } = useDisclosure();

  let setLoadingTextTimeout: ReturnType<typeof setTimeout>;
  const loadingTextRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (jobIdParam) {
      setJobToFetch(jobIdParam);
      setIsCoverLetterUpdate(true);
      resetJob();
    } else {
      setIsCoverLetterUpdate(false);
      reset({
        title: '',
        company: '',
        location: '',
        description: '',
      });
    }
  }, [jobIdParam, job]);

  useEffect(() => {
    resetJob();
  }, [job]);

  function resetJob() {
    if (job) {
      reset({
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
      });
    }
  }

  // pdf to text parser
  async function onFileUpload(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files == null) return;
    if (event.target.files.length == 0) return;

    setValue('pdf', null);
    setIsPdfReady(false);
    const pdfFile = event.target.files[0];

    // Read the file using file reader
    const fileReader = new FileReader();

    fileReader.onload = function () {
      // turn array buffer into typed array
      if (this.result == null || !(this.result instanceof ArrayBuffer)) {
        return;
      }
      const typedarray = new Uint8Array(this.result);

      // pdfjs should be able to read this
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;
      const loadingTask = pdfjsLib.getDocument(typedarray);
      let textBuilder: string = '';
      loadingTask.promise
        .then(async (pdf) => {
          // Loop through each page in the PDF file
          for (let i = 1; i <= pdf.numPages; i++) {
            // Get the text content for the page
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const text = content.items
              .map((item: any) => {
                if (item.str) {
                  return item.str;
                }
                return '';
              })
              .join(' ');
            textBuilder += text;
          }
          setIsPdfReady(true);
          setValue('pdf', textBuilder);
          clearErrors('pdf');
        })
        .catch((err) => {
          alert('An Error occured uploading your PDF. Please try again.');
          console.error(err);
        });
    };
    // Read the file as ArrayBuffer
    try {
      fileReader.readAsArrayBuffer(pdfFile);
    } catch (error) {
      alert('An Error occured uploading your PDF. Please try again.');
    }
  }

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
    } catch (error) {
      console.error('Error processing payment, please try again');
    }
    return null;
  }

  function checkIfSubPastDueAndRedirect(user: Omit<User, 'password'>) {
    if (user.subscriptionStatus === 'past_due') {
      navigate('/profile')
      return true;
    } else {
      return false;
    }
  }

  async function onSubmit(values: any): Promise<void> {
    let canUserContinue = hasUserPaidOrActiveTrial();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!canUserContinue) {
      navigate('/profile');
      return;
    }

    try {
      const lnPayment = await checkIfLnAndPay(user);

      const isSubscriptionPastDue = checkIfSubPastDueAndRedirect(user);
      if (isSubscriptionPastDue) return;

      const job = await createJob(values);

      const creativityValue = convertToSliderValue(sliderValue);

      const payload = {
        jobId: job.id,
        title: job.title,
        content: values.pdf,
        description: job.description,
        isCompleteCoverLetter,
        includeWittyRemark: values.includeWittyRemark,
        temperature: creativityValue,
        gptModel: values.gptModel || 'gpt-4o',
        lnPayment: lnPayment || undefined,
      };

      setLoadingText();

      const coverLetter = await generateCoverLetter(payload);

      navigate(`/cover-letter/${coverLetter.id}`);
    } catch (error: any) {
      cancelLoadingText();
      alert(`${error?.message ?? 'Something went wrong, please try again'}`);
      console.error(error);
    }
  }

  async function onUpdate(values: any): Promise<void> {
    const canUserContinue = hasUserPaidOrActiveTrial();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!canUserContinue) {
      navigate('/profile');
      return;
    }

    try {
      const lnPayment = await checkIfLnAndPay(user);

      const isSubscriptionPastDue = checkIfSubPastDueAndRedirect(user);
      if (isSubscriptionPastDue) return;

      if (!job) {
        throw new Error('Job not found');
      }

      const creativityValue = convertToSliderValue(sliderValue);
      const payload = {
        id: job.id,
        description: values.description,
        content: values.pdf,
        isCompleteCoverLetter,
        temperature: creativityValue,
        includeWittyRemark: values.includeWittyRemark,
        gptModel: values.gptModel || 'gpt-4o-mini',
        lnPayment: lnPayment || undefined,
      };

      setLoadingText();

      const coverLetterId = await updateCoverLetter(payload);

      navigate(`/cover-letter/${coverLetterId}`);
    } catch (error: any) {
      cancelLoadingText();
      alert(`${error?.message ?? 'Something went wrong, please try again'}`);
      console.error(error);
    }
  }

  function handleFileButtonClick() {
    if (!fileInputRef.current) {
      return;
    } else {
      fileInputRef.current.click();
    }
  }

  async function handleScrapeJob() {
    const url = getValues('applicant_job_advertisement_url');
    if (!url) {
      alert('Please enter a job advertisement URL.');
      return;
    }

    setIsScraping(true);
    try {
      const scrapedData = await scrapeJob(url);
      setValue('title', scrapedData.title);
      setValue('company', scrapedData.company);
      setValue('location', scrapedData.location);
      setValue('description', scrapedData.description);
    } catch (error) {
      console.error('Error scraping job:', error);
      alert('Failed to scrape job information. Please try again or enter details manually.');
    } finally {
      setIsScraping(false);
    }
  }

  function setLoadingText() {
    setLoadingTextTimeout = setTimeout(() => {
      loadingTextRef.current && (loadingTextRef.current.innerText = ' patience, my friend 🧘...');
    }, 2000);
  }

  function cancelLoadingText() {
    clearTimeout(setLoadingTextTimeout);
    loadingTextRef.current && (loadingTextRef.current.innerText = '');
  }

  function hasUserPaidOrActiveTrial(): Boolean {
    if (user) {
      if (user.isUsingLn) {
        if (user.credits < 3 && user.credits > 0) {
          onOpen();
        }
        return true;
      }
      if (!user.hasPaid && !user.isUsingLn && user.credits > 0) {
        if (user.credits < 3) {
          onOpen();
        }
        return user.credits > 0;
      }
      if (user.hasPaid) {
        return true;
      } else if (!user.hasPaid) {
        return false;
      }
    }
    return false;
  }

  const showForm = (isCoverLetterUpdate && job) || !isCoverLetterUpdate;
  const showSpinner = isCoverLetterUpdate && isJobLoading;
  const showJobNotFound = isCoverLetterUpdate && !job && !isJobLoading;

  return (
    <>
      <Box
        layerStyle='card'
        px={4}
        py={2}
        mt={3}
        mb={-3}
        bgColor='bg-overlay'
        visibility={coverLetterCount && coverLetterCount >= 500 ? 'visible' : 'hidden'}
        _hover={{ bgColor: 'bg-contrast-xs' }}
        transition='0.1s ease-in-out'
      >
        <Text fontSize='md'>{coverLetterCount?.toLocaleString()} Søknadsbrev opprettet! 🎉</Text>
      </Box>
      <BorderBox>
        <form
          onSubmit={!isCoverLetterUpdate ? handleSubmit(onSubmit) : handleSubmit(onUpdate)}
          style={{ width: '100%' }}
        >

            <Heading size={'md'} alignSelf={'start'} mb={3} w='full'>
              Jobbinformasjon {isCoverLetterUpdate && <Code ml={1}>Redigerer...</Code>}
            </Heading>
          {showSpinner && <Spinner />}
          {showForm && (
            <>
                          <FormControl isInvalid={!!formErrors.applicant_job_advertisement_url}>
                <HStack>
                  <Input
                    id="applicant_job_advertisement_url"
                    autoComplete="on"
                    placeholder="https://www.finn.no/job/fulltime/ad.html?finnkode=255413380"
                    pattern="^https:\/\/www\.finn\.no\/(?:\d+|.*\?finnkode=\d+)$"
                    
                    className="block mt-2 w-full px-5 py-2.5 bg-white rounded-md ring-1 ring-inset ring-gray-300 placeholder:text-indigo-600/40 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    type="text"
                    {...register('applicant_job_advertisement_url', {
                      required: 'Dette er påkrevd',
                      pattern: {
                        value: /^https:\/\/www\.finn\.no\/(?:\d+|.*\?finnkode=\d+)$/,
                        message: 'Vennligst oppgi en gyldig Finn.no jobbannonse URL',
                      },
                    })}
                  />
                  <Button
                    colorScheme='purple'
                    mt={2}
                    size='sm'
                    onClick={handleScrapeJob}
                    isLoading={isScraping}
                    disabled={isScraping || isCoverLetterUpdate}
                  >
                    Hent info
                  </Button>
                </HStack>
                <FormErrorMessage>{!!formErrors.applicant_job_advertisement_url && formErrors.applicant_job_advertisement_url.message?.toString()}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!formErrors.title}>
                <Input
                  id='title'
                  borderRadius={0}
                  borderTopRadius={7}
                  placeholder='stillingstittel'
                  {...register('title', {
                    required: 'Dette er påkrevd',
                    minLength: {
                      value: 2,
                      message: 'Minimum lengde er 2',
                    },
                  })}
                  onFocus={(e: any) => {
                    if (user === null) {
                      loginOnOpen();
                      e.target.blur();
                    }
                  }}
                  disabled={isCoverLetterUpdate}
                />
                <FormErrorMessage>{!!formErrors.title && formErrors.title.message?.toString()}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!formErrors.company}>
                <Input
                  id='company'
                  borderRadius={0}
                  placeholder='firma'
                  {...register('company', {
                    required: 'Dette er påkrevd',
                    minLength: {
                      value: 1,
                      message: 'Minimum lengde er 1',
                    },
                  })}
                  disabled={isCoverLetterUpdate}
                />
                <FormErrorMessage>{!!formErrors.company && formErrors.company.message?.toString()}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!formErrors.location}>
                <Input
                  id='location'
                  borderRadius={0}
                  placeholder='sted'
                  {...register('location', {
                    required: 'Dette er påkrevd',
                    minLength: {
                      value: 2,
                      message: 'Minimum lengde er 2',
                    },
                  })}
                  disabled={isCoverLetterUpdate}
                />
                <FormErrorMessage>{!!formErrors.location && formErrors.location.message?.toString()}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!formErrors.description}>
                <Textarea
                  id='description'
                  borderRadius={0}
                  placeholder='kopier og lim inn stillingsbeskrivelsen på hvilket som helst språk'
                  {...register('description', {
                    required: 'Dette er påkrevd',
                  })}
                />
                <FormErrorMessage>
                  {!!formErrors.description && formErrors.description.message?.toString()}
                </FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!formErrors.pdf}>
                <Input
                  id='pdf'
                  type='file'
                  accept='application/pdf'
                  placeholder='pdf'
                  {...register('pdf', {
                    required: 'Vennligst last opp CV/Resumé',
                  })}
                  onChange={(e) => {
                    onFileUpload(e);
                  }}
                  display='none'
                  ref={fileInputRef}
                />
                <VStack
                  border={!!formErrors.pdf ? '1px solid #FC8181' : 'sm'}
                  boxShadow={!!formErrors.pdf ? '0 0 0 1px #FC8181' : 'none'}
                  bg='bg-contrast-xs'
                  p={3}
                  alignItems='flex-start'
                  _hover={{
                    bg: 'bg-contrast-sm',
                    borderColor: 'border-contrast-md',
                  }}
                  transition={
                    'transform 0.05s ease-in, transform 0.05s ease-out, background 0.3s, opacity 0.3s, border 0.3s'
                  }
                >
                  <HStack>
                    <FormLabel textAlign='center' htmlFor='pdf'>
                      <Button size='sm' colorScheme='contrast' onClick={handleFileButtonClick}>
                        Last opp CV
                      </Button>
                    </FormLabel>
                    {isPdfReady && <Text fontSize={'sm'}>👍 lastet opp</Text>}
                    <FormErrorMessage>{!!formErrors.pdf && formErrors.pdf.message?.toString()}</FormErrorMessage>
                  </HStack>
                  <FormHelperText mt={0.5} fontSize={'xs'}>
                    Last opp kun PDF av din CV/Resumé
                  </FormHelperText>
                </VStack>
              </FormControl>
              {(user?.gptModel === 'gpt-4' || user?.gptModel === 'gpt-4o') && (
                <FormControl>
                  <VStack
                    border={'sm'}
                    bg='bg-contrast-xs'
                    p={3}
                    alignItems='flex-start'
                    _hover={{
                      bg: 'bg-contrast-md',
                      borderColor: 'border-contrast-md',
                    }}
                    transition={
                      'transform 0.05s ease-in, transform 0.05s ease-out, background 0.3s, opacity 0.3s, border 0.3s'
                    }
                  >

                  </VStack>
                </FormControl>
              )}
              <VStack
                border={'sm'}
                bg='bg-contrast-xs'
                px={3}
                alignItems='flex-start'
                _hover={{
                  bg: 'bg-contrast-md',
                  borderColor: 'border-contrast-md',
                }}
                transition={
                  'transform 0.05s ease-in, transform 0.05s ease-out, background 0.3s, opacity 0.3s, border 0.3s'
                }
              >
                <FormControl my={2}>
                  <Slider
                    id='temperature'
                    defaultValue={30}
                    min={0}
                    max={68}
                    colorScheme='purple'
                    onChange={(v) => setSliderValue(v)}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <Tooltip
                      hasArrow
                      bg='purple.300'
                      color='white'
                      placement='top'
                      isOpen={showTooltip}
                      label={`${convertToSliderLabel(sliderValue)}`}
                    >
                      <SliderThumb />
                    </Tooltip>
                  </Slider>
                  <FormLabel
                    htmlFor='temperature'
                    color='text-contrast-md'
                    fontSize='sm'
                    _hover={{
                      color: 'text-contrast-lg',
                    }}
                  >
                    kreativitet på søknadsbrevet
                  </FormLabel>
                </FormControl>
              </VStack>
              <VStack
                border={'sm'}
                bg='bg-contrast-xs'
                px={3}
                borderRadius={0}
                borderBottomRadius={7}
                alignItems='flex-start'
                _hover={{
                  bg: 'bg-contrast-md',
                  borderColor: 'border-contrast-md',
                }}
                transition={
                  'transform 0.05s ease-in, transform 0.05s ease-out, background 0.3s, opacity 0.3s, border 0.3s'
                }
              >
                <FormControl display='flex' alignItems='center' mt={3} mb={3}>
                  <Checkbox id='includeWittyRemark' defaultChecked={true} {...register('includeWittyRemark')} />
                  <FormLabel
                    htmlFor='includeWittyRemark'
                    mb='0'
                    ml={2}
                    color='text-contrast-md'
                    fontSize='sm'
                    _hover={{
                      color: 'text-contrast-lg',
                    }}
                  >
                    inkluder en vittig kommentar på slutten av brevet
                  </FormLabel>
                </FormControl>
              </VStack>
              <HStack alignItems='flex-end' gap={1}>
                <Button
                  colorScheme='purple'
                  mt={3}
                  size='sm'
                  isLoading={isSubmitting}
                  disabled={user === null}
                  type='submit'
                >
                  {!isCoverLetterUpdate ? 'Generer søknadsbrev' : 'Opprett nytt søknadsbrev'}
                </Button>
                <Text ref={loadingTextRef} fontSize='sm' fontStyle='italic' color='text-contrast-md'>
                  {' '}
                </Text>
              </HStack>
            </>
          )}
          {showJobNotFound && (
            <>
              <Text fontSize='sm' color='text-contrast-md'>
                Finner ikke den jobben...
              </Text>
            </>
          )}
        </form>
      </BorderBox>
      <LeaveATip
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        credits={user?.credits || 0}
        isUsingLn={user?.isUsingLn || false}
      />
      <LoginToBegin isOpen={loginIsOpen} onOpen={loginOnOpen} onClose={loginOnClose} />
      <LnPaymentModal isOpen={lnPaymentIsOpen} onClose={lnPaymentOnClose} lightningInvoice={lightningInvoice} />
    </>
  );
}

export default MainPage;
