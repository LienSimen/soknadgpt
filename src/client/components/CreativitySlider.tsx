export function convertToSliderValue(value: number): number {
  const newValue = value / 50;
  return Number(newValue.toFixed(1));
}

export function convertToSliderLabel(value: number): string {
  if (value < 17) {
    return 'mest standard';
    } else if (value < 35) {
    return 'litt kreativ';
    } else if (value < 55) {
    return 'mer kreativ';
    } else if (value < 69) {
    return 'mest kreativ';
    } else {
    return 'farlig kreativ';
  }
}
