// Optimized semantic tokens - removed unused tokens for better tree shaking
export const semanticTokens = {
  colors: {
    // Core background colors - frequently used
    'bg-body': {
      default: 'white',
      _dark: 'rgba(0, 0, 0, 0.50)',
    },
    'bg-contrast-xs': {
      default: 'rgba(0, 30, 50, 0.025)',
      _dark: 'rgba(255, 255, 255, 0.0125)',
    },
    'bg-contrast-sm': {
      default: 'rgba(0, 30, 50, 0.05)',
      _dark: 'rgba(255, 255, 255, 0.025)',
    },
    'bg-contrast-md': {
      default: 'rgba(0, 30, 50, 0.075)',
      _dark: 'rgba(255, 255, 255, 0.05)',
    },
    'bg-contrast-lg': {
      default: 'rgba(0, 30, 50, 0.1)',
      _dark: 'rgba(255, 255, 255, 0.075)',
    },
    // Used in BorderBox component
    'bg-overlay': {
      default: 'rgba(237, 242, 247, .98)',
      _dark: 'rgba(0, 0, 0, 0.87)',
    },
    'bg-modal': {
      default: 'rgb(255, 255, 255)',
      _dark: '#1f1f1f',
    },
    // Core text colors - frequently used
    'text-contrast-sm': {
      default: 'blackAlpha.700',
      _dark: 'whiteAlpha.600',
    },
    'text-contrast-md': {
      default: 'blackAlpha.800',
      _dark: 'whiteAlpha.700',
    },
    'text-contrast-lg': {
      default: 'blackAlpha.900',
      _dark: 'whiteAlpha.800',
    },
    // Core border colors - frequently used
    'border-contrast-xs': {
      default: 'rgba(0, 0, 0, 0.2)',
      _dark: 'rgba(255, 255, 255, 0.1)',
    },
    'border-contrast-sm': {
      default: 'rgba(0, 0, 0, 0.3)',
      _dark: 'rgba(255, 255, 255, 0.2)',
    },
    'border-contrast-md': {
      default: 'rgba(0, 0, 0, 0.4)',
      _dark: 'rgba(255, 255, 255, 0.3)',
    },
    // Active/focus color
    active: {
      default: 'purple.300',
      _dark: 'purple.300',
    },
  },
  borders: {
    sm: `1px solid var(--chakra-colors-border-contrast-xs)`,
    md: `2px solid var(--chakra-colors-border-contrast-xs)`,
    lg: `3px solid var(--chakra-colors-border-contrast-xs)`,
    error: `1px solid var(--chakra-colors-red-500)`,
  },
};

if (typeof window !== 'undefined') {
  const updateViewportUnits = () => {
    let vh = window.innerHeight * 0.01;
    let vw = window.innerWidth * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    document.documentElement.style.setProperty('--vw', `${vw}px`);
  };
  updateViewportUnits();
  window.addEventListener('resize', updateViewportUnits);
}
