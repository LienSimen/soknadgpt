// React imports must come first
import React, { Suspense, useState, useEffect, useRef, lazy } from 'react';
import { ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { type User, type LnPayment } from "wasp/entities";
import { Link as WaspLink } from "wasp/client/router";
import { useAuth } from 'wasp/client/auth';

import {
  generateCoverLetter,
  createJob,
  updateCoverLetter,
  updateLnPayment,
  useQuery,
  getJob,
} from "wasp/client/operations";
import { scrapeJob } from './scrapeJob';

// Optimized imports - only import what's needed for above-the-fold content
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
  Tooltip,
  useDisclosure,
  Container,
} from '@chakra-ui/react';

// Lazy load heavy UI components that are below the fold
const SimpleGrid = lazy(() => import('@chakra-ui/react').then(module => ({ default: module.SimpleGrid })));
const Icon = lazy(() => import('@chakra-ui/react').then(module => ({ default: module.Icon })));
const Flex = lazy(() => import('@chakra-ui/react').then(module => ({ default: module.Flex })));
const Divider = lazy(() => import('@chakra-ui/react').then(module => ({ default: module.Divider })));
const Link = lazy(() => import('@chakra-ui/react').then(module => ({ default: module.Link })));
// Lazy load icons to reduce initial bundle
const CheckCircleIcon = lazy(() => import('@chakra-ui/icons').then(module => ({ default: module.CheckCircleIcon })));
const TimeIcon = lazy(() => import('@chakra-ui/icons').then(module => ({ default: module.TimeIcon })));
const StarIcon = lazy(() => import('@chakra-ui/icons').then(module => ({ default: module.StarIcon })));

// Lazy load below-the-fold content
const BelowTheFoldContent = lazy(() => import('./components/BelowTheFoldContent'));
const LightningIcon = (props: any) => (
  <Suspense fallback={<div style={{ width: 24, height: 24, backgroundColor: '#e2e8f0' }} />}>
    <Icon viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M7 2v13h3v7l7-12h-4l4-8z"
      />
    </Icon>
  </Suspense>
);
import BorderBox from './components/BorderBox';
import { LeaveATip, LoginToBegin } from './components/AlertDialog';
import { convertToSliderValue, convertToSliderLabel } from './components/CreativitySlider';
import { type CoverLetterOptionsData } from './components/CoverLetterOptions';
import { LazyCoverLetterOptions, LazyLnPaymentModal, LazyPdfProcessor, CoverLetterOptionsLoader, PaymentModalLoader, PdfProcessorLoader, LazyLoadErrorBoundary } from './components/LazyComponents';
import { fetchLightningInvoice } from './lightningUtils';
import type { LightningInvoice } from './lightningUtils';

function MainPage() {
  // Set page title and optimize initial render
  useEffect(() => {
    document.title = 'SøknadGPT: Lag Profesjonelle Søknadsbrev med AI på Sekunder';

    // Performance monitoring
    if ('performance' in window) {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (perfData) {
          console.log('[MainPage] Time to Interactive:', Math.round(perfData.loadEventEnd - perfData.requestStart), 'ms');
          console.log('[MainPage] DOM Content Loaded:', Math.round(perfData.domContentLoadedEventEnd - perfData.requestStart), 'ms');
        }
      }, 0);
    }
  }, []);
  const [isPdfReady, setIsPdfReady] = useState<boolean>(false);
  const [jobToFetch, setJobToFetch] = useState<string>('');
  const [isCoverLetterUpdate, setIsCoverLetterUpdate] = useState<boolean>(false);
  const [isCompleteCoverLetter, setIsCompleteCoverLetter] = useState<boolean>(true);
  const [sliderValue, setSliderValue] = useState(30);
  const [showTooltip, setShowTooltip] = useState(false);
  const [lightningInvoice, setLightningInvoice] = useState<LightningInvoice | null>(null);
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [coverLetterOptions, setCoverLetterOptions] = useState<CoverLetterOptionsData | null>(null);
  const { data: user } = useAuth();

  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const jobIdParam = urlParams.get('job');

  const {
    data: job,
    isLoading: isJobLoading,
    error: getJobError,
  } = useQuery(getJob, { id: jobToFetch }, { enabled: jobToFetch.length > 0 });


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
  const [pdfFile, setPdfFile] = useState<File | null>(null);

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

  // PDF processor handlers for lazy loading
  const handleFileProcessed = (content: string) => {
    setIsPdfReady(true);
    setValue('pdf', content);
    clearErrors('pdf');
  };

  const handleProcessingStart = () => {
    setValue('pdf', null);
    setIsPdfReady(false);
    setIsProcessingFile(true);
  };

  const handleProcessingEnd = () => {
    setIsProcessingFile(false);
  };

  const handleProcessingError = (error: string) => {
    alert(error);
    setIsProcessingFile(false);
  };

  // file to text parser - now uses lazy-loaded PDF processor
  async function onFileUpload(event: ChangeEvent<HTMLInputElement>) {
    // The actual processing is now handled by the lazy-loaded PdfProcessor component
    // This function is kept for compatibility but the heavy lifting is done elsewhere
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
        coverLetterOptions: coverLetterOptions || undefined,
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
        gptModel: values.gptModel || 'gpt-4o',
        lnPayment: lnPayment || undefined,
        coverLetterOptions: coverLetterOptions || undefined,
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
      loadingTextRef.current && (loadingTextRef.current.innerText = ' Skriver søknaden din!🧘...');
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
      {/* Navigation and Header Section */}
      <Container maxW="container.lg" px={0} mb={6}>
        <VStack spacing={4}>
          <Heading as="h1" size="xl" textAlign="center" color="purple.600">
            Søknad GPT: Lag Profesjonelle Søknadsbrev med AI
          </Heading>
          <Text fontSize="lg" textAlign="center" color="text-contrast-md">
            Få hjelp til å skrive profesjonelle og skreddersydde søknader på et blunk. Prøv helt gratis!
          </Text>

          {/* Navigation Links */}
          <HStack spacing={6} flexWrap="wrap" justify="center">
            <WaspLink to="/jobs" style={{ textDecoration: 'none' }}>
              <Button
                variant="ghost"
                colorScheme="purple"
                size="sm"
                as="span"
              >
                Mine jobber
              </Button>
            </WaspLink>
            <WaspLink to="/profile" style={{ textDecoration: 'none' }}>
              <Button
                variant="ghost"
                colorScheme="purple"
                size="sm"
                as="span"
              >
                Profil
              </Button>
            </WaspLink>
            <WaspLink to="/tos" style={{ textDecoration: 'none' }}>
              <Button
                variant="ghost"
                colorScheme="purple"
                size="sm"
                as="span"
              >
                Vilkår
              </Button>
            </WaspLink>
            <WaspLink to="/privacy" style={{ textDecoration: 'none' }}>
              <Button
                variant="ghost"
                colorScheme="purple"
                size="sm"
                as="span"
              >
                Personvern
              </Button>
            </WaspLink>
            <Link
              href="https://www.finn.no/job"
              isExternal
              color="purple.600"
              fontSize="sm"
              fontWeight="medium"
              _hover={{ textDecoration: "underline" }}
            >
              Søk jobber på Finn.no ↗
            </Link>
          </HStack>
        </VStack>
      </Container>

      {/* Cover letter count display removed */}
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
                <HStack align="center" spacing={2}>
                  <Input
                    id="applicant_job_advertisement_url"
                    autoComplete="on"
                    placeholder="https://www.finn.no/job/fulltime/ad.html?finnkode=255413380"
                    pattern="^https:\/\/www\.finn\.no\/(?:\d+|.*\?finnkode=\d+)$"
                    className="block w-full px-5 py-2.5 bg-white rounded-md ring-1 ring-inset ring-gray-300 placeholder:text-indigo-600/40 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                    size='sm'
                    onClick={handleScrapeJob}
                    isLoading={isScraping}
                    disabled={isScraping || isCoverLetterUpdate}
                    aria-label="Hent jobbinformasjon fra Finn.no URL"
                    title="Hent jobbinformasjon fra Finn.no URL"
                    color="white"
                    bg="purple.500"
                    _hover={{ bg: "purple.600" }}
                    _active={{ bg: "purple.600" }}
                    _disabled={{ bg: "gray.500", color: "gray.100" }}
                    flexShrink={0}
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
                  accept='application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                  placeholder='pdf'
                  {...register('pdf', {
                    required: 'Vennligst last opp CV/Resumé',
                  })}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleProcessingStart();
                      // Pass the file directly to the PDF processor via callback
                      setPdfFile(e.target.files[0]);
                    }
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
                      <Button
                        size='sm'
                        colorScheme='purple'
                        onClick={handleFileButtonClick}
                        color="white"
                        bg="purple.500"
                        _hover={{ bg: "purple.600" }}
                      >
                        Last opp CV
                      </Button>
                    </FormLabel>
                    {isProcessingFile && <Text fontSize={'sm'} color="purple.500">⏳ behandler dokument...</Text>}
                    {isPdfReady && !isProcessingFile && <Text fontSize={'sm'}>👍 lastet opp</Text>}
                    <FormErrorMessage>{!!formErrors.pdf && formErrors.pdf.message?.toString()}</FormErrorMessage>
                  </HStack>
                  <FormHelperText mt={0.5} fontSize={'xs'}>
                    Last opp kun PDF, TXT, DOC eller DOCX av din CV/Resumé
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
                    aria-label='slider-ex-1'
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
              <LazyLoadErrorBoundary>
                <Suspense fallback={<CoverLetterOptionsLoader />}>
                  <LazyCoverLetterOptions
                    onChange={setCoverLetterOptions}
                  />
                </Suspense>
              </LazyLoadErrorBoundary>

              {/* Lazy-loaded PDF processor for heavy document processing */}
              <LazyLoadErrorBoundary>
                <Suspense fallback={<PdfProcessorLoader />}>
                  <LazyPdfProcessor
                    pdfFile={pdfFile}
                    onFileProcessed={handleFileProcessed}
                    onProcessingStart={handleProcessingStart}
                    onProcessingEnd={handleProcessingEnd}
                    onError={handleProcessingError}
                    fileInputRef={fileInputRef}
                  />
                </Suspense>
              </LazyLoadErrorBoundary>
              <HStack alignItems='flex-end' gap={1}>
                <Button
                  colorScheme='purple'
                  mt={3}
                  size='sm'
                  isLoading={isSubmitting}
                  disabled={user === null}
                  type='submit'
                  color="white"
                  bg="purple.500"
                  _hover={{ bg: "purple.600" }}
                  _active={{ bg: "purple.600" }}
                  _disabled={{ bg: "gray.500", color: "gray.100" }}
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

      {/* Lazy-loaded below-the-fold content */}
      <Suspense fallback={
        <Box
          maxW="container.lg"
          mx="auto"
          mt={12}
          px={4}
          textAlign="center"
        >
          <VStack spacing={4}>
            <Box
              w="40px"
              h="40px"
              borderRadius="50%"
              bg="purple.100"
              mx="auto"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="sm" color="purple.600">...</Text>
            </Box>
            <Text fontSize="sm" color="gray.500">Laster innhold...</Text>
          </VStack>
        </Box>
      }>
        <BelowTheFoldContent />
      </Suspense>

      <LeaveATip
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        credits={user?.credits || 0}
        isUsingLn={user?.isUsingLn || false}
      />
      <LoginToBegin isOpen={loginIsOpen} onOpen={loginOnOpen} onClose={loginOnClose} />
      <LazyLoadErrorBoundary>
        <Suspense fallback={<PaymentModalLoader />}>
          <LazyLnPaymentModal isOpen={lnPaymentIsOpen} onClose={lnPaymentOnClose} lightningInvoice={lightningInvoice} />
        </Suspense>
      </LazyLoadErrorBoundary>
    </>
  );
}

export default MainPage;