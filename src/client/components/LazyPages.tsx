import { lazy, Suspense, Component, ReactNode } from 'react';
import { Box, Spinner, VStack, Text } from '@chakra-ui/react';

// Error Boundary specifically for page-level lazy loading
interface PageErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface PageErrorBoundaryProps {
  children: ReactNode;
  pageName?: string;
}

export class PageErrorBoundary extends Component<PageErrorBoundaryProps, PageErrorBoundaryState> {
  constructor(props: PageErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): PageErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error(`Page loading error for ${this.props.pageName || 'unknown page'}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box 
          p={8} 
          textAlign="center" 
          borderWidth={1} 
          borderColor="red.200" 
          borderRadius="md" 
          bg="red.50"
          maxW="md"
          mx="auto"
          mt={8}
        >
          <VStack spacing={4}>
            <Text color="red.600" fontWeight="semibold">
              Failed to load {this.props.pageName || 'page'}
            </Text>
            <Text color="red.500" fontSize="sm">
              Please refresh the page or try again later.
            </Text>
            <Box 
              as="button" 
              onClick={() => window.location.reload()}
              px={4}
              py={2}
              bg="red.100"
              color="red.700"
              borderRadius="md"
              border="1px solid"
              borderColor="red.300"
              _hover={{ bg: 'red.200' }}
            >
              Refresh Page
            </Box>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Loading fallback component for page transitions
export const PageLoader = ({ pageName }: { pageName?: string }) => (
  <Box 
    display="flex" 
    alignItems="center" 
    justifyContent="center" 
    minH="400px"
    w="full"
  >
    <VStack spacing={4}>
      <Spinner 
        size="lg" 
        color="blue.500" 
        thickness="3px"
        speed="0.8s"
      />
      <Text color="gray.600" fontSize="sm">
        Loading {pageName || 'page'}...
      </Text>
    </VStack>
  </Box>
);

// Lazy-loaded page components with proper error boundaries and loading states
export const LazyMainPage = lazy(() => 
  import('../MainPage').then(module => ({ default: module.default }))
);

export const LazyCoverLetterPage = lazy(() => 
  import('../CoverLetterPage').then(module => ({ default: module.default }))
);

export const LazyJobsPage = lazy(() => 
  import('../JobsPage').then(module => ({ default: module.default }))
);

export const LazyProfilePage = lazy(() => 
  import('../ProfilePage').then(module => ({ default: module.default }))
);

export const LazyCheckoutPage = lazy(() => 
  import('../CheckoutPage').then(module => ({ default: module.default }))
);

export const LazyLoginPage = lazy(() => 
  import('../LoginPage').then(module => ({ default: module.default }))
);

export const LazyTosPage = lazy(() => 
  import('../legal/TosPage').then(module => ({ default: module.default }))
);

export const LazyPrivacyPage = lazy(() => 
  import('../legal/PrivacyPolicyPage').then(module => ({ default: module.default }))
);

// Higher-order component to wrap pages with lazy loading
export const withLazyLoading = (
  LazyComponent: React.LazyExoticComponent<React.ComponentType<any>>,
  pageName: string
) => {
  return function LazyPageWrapper(props: any) {
    return (
      <PageErrorBoundary pageName={pageName}>
        <Suspense fallback={<PageLoader pageName={pageName} />}>
          <LazyComponent {...props} />
        </Suspense>
      </PageErrorBoundary>
    );
  };
};

// Pre-configured lazy page components with error boundaries and loading states
export const MainPageLazy = withLazyLoading(LazyMainPage, 'Home');
export const CoverLetterPageLazy = withLazyLoading(LazyCoverLetterPage, 'Cover Letter');
export const JobsPageLazy = withLazyLoading(LazyJobsPage, 'Jobs');
export const ProfilePageLazy = withLazyLoading(LazyProfilePage, 'Profile');
export const CheckoutPageLazy = withLazyLoading(LazyCheckoutPage, 'Checkout');
export const LoginPageLazy = withLazyLoading(LazyLoginPage, 'Login');
export const TosPageLazy = withLazyLoading(LazyTosPage, 'Terms of Service');
export const PrivacyPageLazy = withLazyLoading(LazyPrivacyPage, 'Privacy Policy');