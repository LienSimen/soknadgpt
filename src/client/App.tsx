// Selective Chakra UI imports for better tree shaking
import { ChakraProvider, VStack, Box, Spacer } from '@chakra-ui/react';
import { theme } from './theme';
import { useState, useEffect, createContext, useCallback, useMemo } from 'react';
import NavBar from './components/NavBar';
import { Footer } from './components/CallToAction';
import { useLocation, Outlet } from 'react-router-dom';
import { usePerformanceOptimizer } from './components/PerformanceOptimizer';
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

  const location = useLocation();
  const { throttle } = usePerformanceOptimizer();

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    textareaState,
    setTextareaState,
    isLnPayPending,
    setIsLnPayPending,
  }), [textareaState, isLnPayPending]);

  // Optimize mouse event handlers with throttling
  const handleMouseUp = useCallback(throttle((event: MouseEvent) => {
    const selection = window.getSelection();

    if (selection?.toString() && location.pathname.includes('cover-letter')) {
      // closes the tooltip when the user clicks a tooltip button
      if (selection.toString() === currentText) {
        setTooltip(null);
        return;
      }
      setCurrentText(selection.toString());
      // get the x and y coordinates of the mouse position
      const x = event.clientX;
      const y = event.clientY;
      const text = selection.toString();

      setTooltip({ x: x.toString() + 'px', y: y.toString() + 'px', text });
    } else {
      setTooltip(null);
    }
  }, 16), [location.pathname, currentText, throttle]); // 60fps throttling

  const handleMouseDown = useCallback(() => {
    if (location.pathname.includes('cover-letter')) {
      setCurrentText(null);
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
        <Box
          top={tooltip?.y}
          left={tooltip?.x}
          display={tooltip?.text ? 'block' : 'none'}
          position='absolute'
          zIndex={100}
        >
          {/* Edit popover will be handled by individual pages that need it */}
        </Box>
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
