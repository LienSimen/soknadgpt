import { lazy, Suspense } from 'react';
import { Box, Spinner, Center } from '@chakra-ui/react';

// Lazy load heavy components - only load what exists
export const LazyQRCode = lazy(() => import('qrcode.react').then(module => ({ default: module.QRCodeSVG })));

// Loading fallback component
const LoadingFallback = ({ height = '200px' }: { height?: string }) => (
  <Center height={height}>
    <Spinner size="lg" color="purple.500" />
  </Center>
);

// Wrapper components with suspense
export const QRCode = (props: any) => (
  <Suspense fallback={<LoadingFallback height="150px" />}>
    <LazyQRCode {...props} />
  </Suspense>
);