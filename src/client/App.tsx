// Selective Chakra UI imports for better tree shaking
import { ChakraProvider, VStack, Box, Spacer } from '@chakra-ui/react';
import { theme } from './theme';
import { useState, useEffect, createContext, useCallback, useMemo } from 'react';
import NavBar from './components/NavBar';
import { Footer } from './components/CallToAction';
import { useLocation, Outlet } from 'react-router-dom';
import { usePerformanceOptimizer } from './components/PerformanceOptimizer';
import { useAuth } from 'wasp/client/auth';
import { Suspense } from 'react';
import { LazyEditPopover, EditPopoverLoader } from './components/LazyComponents';
export const TextareaContext = createContext({
  textareaState: '',
  setTextareaState: (value: string) => { },
  isLnPayPending: false,
  setIsLnPayPending: (value: boolean) => { },
});

export default function App() {
  const [tooltip, setTooltip] = useState<{ x: string; y: string; text: string } | null>(null);
  const [currentText, setCurrentText] = useState<string | null>(null);
  const [textareaState, setTextareaState] = useState<string>('');
  const [isLnPayPending, setIsLnPayPending] = useState<boolean>(false);
  const [editCount, setEditCount] = useState<number>(0);

  const location = useLocation();
  const { throttle } = usePerformanceOptimizer();
  const { data: user } = useAuth();

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    textareaState,
    setTextareaState,
    isLnPayPending,
    setIsLnPayPending,
  }), [textareaState, isLnPayPending]);

  // Optimize mouse event handlers with throttling
  const handleMouseUp = useCallback(throttle((event: MouseEvent) => {
    // Add a small delay to ensure selection is complete in Firefox
    setTimeout(() => {
      const selection = window.getSelection();
      let selectedText = selection?.toString().trim();

      // Firefox fallback - check if we're selecting from a textarea or input
      if (!selectedText || selectedText.length === 0) {
        const activeElement = document.activeElement as HTMLTextAreaElement | HTMLInputElement;
        if (activeElement && (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
          const start = activeElement.selectionStart;
          const end = activeElement.selectionEnd;
          if (start !== null && end !== null && start !== end) {
            selectedText = activeElement.value.substring(start, end).trim();
          }
        }
      }

      if (selectedText && selectedText.length > 0 && location.pathname.includes('cover-letter')) {
        // closes the tooltip when the user clicks a tooltip button
        if (selectedText === currentText) {
          setTooltip(null);
          return;
        }
        setCurrentText(selectedText);

        // Get coordinates - Firefox compatible
        const x = event.clientX || event.pageX;
        const y = event.clientY || event.pageY;

        setTooltip({
          x: x.toString() + 'px',
          y: (y + 10).toString() + 'px', // Add small offset to avoid covering selection
          text: selectedText
        });
      } else {
        setTooltip(null);
      }
    }, 10); // Small delay for Firefox
  }, 16), [location.pathname, currentText, throttle]); // 60fps throttling

  const handleMouseDown = useCallback(() => {
    if (location.pathname.includes('cover-letter')) {
      setCurrentText(null);
    }
  }, [location.pathname]);

  const handleEditUsed = useCallback(() => {
    setEditCount(prev => prev + 1);
  }, []);

  // Reset edit count when navigating away from cover letter pages
  useEffect(() => {
    if (!location.pathname.includes('cover-letter')) {
      setEditCount(0);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isLnPayPending) {
      return;
    }
    if (!location.pathname.includes('cover-letter')) {
      setTooltip(null);
    }

    // Use passive listeners for better performance
    document.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mousedown', handleMouseDown, { passive: true });

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [handleMouseUp, handleMouseDown, location.pathname, isLnPayPending]);

  return (
    <ChakraProvider theme={theme}>
      <TextareaContext.Provider value={contextValue}>
        {tooltip?.text && user && (
          <Box
            position='fixed'
            top={tooltip.y}
            left={tooltip.x}
            zIndex={1000}
            pointerEvents='auto'
          >
            <Suspense fallback={<EditPopoverLoader />}>
              <LazyEditPopover
                setTooltip={setTooltip}
                selectedText={tooltip.text}
                user={user}
                editCount={editCount}
                onEditUsed={handleEditUsed}
              />
            </Suspense>
          </Box>
        )}
        <VStack gap={5} minHeight='100vh'>
          <NavBar />
          <Outlet />
          <Spacer />
          <Footer />
        </VStack>
      </TextareaContext.Provider>
    </ChakraProvider>
  );
}
