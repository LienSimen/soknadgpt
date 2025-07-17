const FONT_SCALE_BASE = 1;
const FONT_SCALE_MULTIPLIER = 1.25;

// Optimized font stack with local fallbacks to reduce layout shift
export const fonts = {
  heading: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
  body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
};

// Optimized text styles - only include frequently used sizes for better tree shaking
export const textStyles = {
  xs: {
    fontSize: FONT_SCALE_BASE * FONT_SCALE_MULTIPLIER ** -1 + 'rem',
    fontWeight: 400,
    lineHeight: '150%',
    letterSpacing: '0',
  },
  sm: {
    fontSize: FONT_SCALE_BASE * FONT_SCALE_MULTIPLIER ** 0 + 'rem',
    fontWeight: 400,
    lineHeight: '150%',
    letterSpacing: '0',
  },
  md: {
    fontSize: FONT_SCALE_BASE * FONT_SCALE_MULTIPLIER ** 1 + 'rem',
    fontWeight: 400,
    lineHeight: '150%',
    letterSpacing: '0',
  },
  lg: {
    fontSize: FONT_SCALE_BASE * FONT_SCALE_MULTIPLIER ** 2 + 'rem',
    fontWeight: 400,
    lineHeight: '150%',
    letterSpacing: '0',
  },
  // Removed unused xl, 2xl, 3xl, 4xl, 5xl, 6xl text styles to reduce bundle size
  // These can be added back if needed in the future
};
