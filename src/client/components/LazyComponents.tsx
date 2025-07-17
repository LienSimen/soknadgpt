import { lazy, Component, ReactNode } from 'react';
import type { CoverLetterOptionsProps } from './CoverLetterOptions';

// Error Boundary for lazy loading failures
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class LazyLoadErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          color: '#e53e3e',
          border: '1px solid #fed7d7',
          borderRadius: '6px',
          backgroundColor: '#fef5e7'
        }}>
          Failed to load component. Please refresh the page.
        </div>
      );
    }

    return this.props.children;
  }
}

// Lazy load heavy components for better performance
export const LazyCoverLetterOptions = lazy(() => import('./CoverLetterOptions').then(module => ({ default: module.default })));
export const LazyLnPaymentModal = lazy(() => import('./LnPaymentModal'));
export const LazyEditPopover = lazy(() => import('./Popover').then(module => ({ default: module.EditPopover })));

// Lazy load PDF processing functionality
export const LazyPdfProcessor = lazy(() => import('./PdfProcessor'));

// Loading fallback components with improved skeletons
export const CoverLetterOptionsLoader = () => (
  <div style={{ 
    height: '60px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    backgroundColor: '#f7fafc',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <div style={{
        width: '16px',
        height: '16px',
        backgroundColor: '#cbd5e0',
        borderRadius: '50%',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }} />
      <span style={{ fontSize: '14px', color: '#718096' }}>Loading options...</span>
    </div>
  </div>
);

export const PaymentModalLoader = () => (
  <div style={{ 
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '24px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
    border: '1px solid #e2e8f0',
    minWidth: '300px',
    textAlign: 'center'
  }}>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px'
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        border: '3px solid #e2e8f0',
        borderTop: '3px solid #805ad5',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <span style={{ fontSize: '14px', color: '#4a5568' }}>Loading payment...</span>
    </div>
  </div>
);

export const EditPopoverLoader = () => (
  <div style={{ 
    width: '20px', 
    height: '20px',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
  }} />
);

export const PdfProcessorLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    backgroundColor: '#f7fafc',
    borderRadius: '6px',
    border: '1px solid #e2e8f0'
  }}>
    <div style={{
      width: '16px',
      height: '16px',
      border: '2px solid #e2e8f0',
      borderTop: '2px solid #805ad5',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <span style={{ fontSize: '12px', color: '#718096' }}>Processing document...</span>
  </div>
);

// Add CSS animations via style injection in a client-only component
import { useEffect } from 'react';

export const InjectLazyComponentStyles = () => {
  useEffect(() => {
    const styleId = 'lazy-component-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);
  return null;
};