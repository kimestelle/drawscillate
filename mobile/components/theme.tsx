// utils/theme.tsx

import { Dimensions } from 'react-native';

const BORDER_WIDTH = 4;

const BASE_WIDTH = 402; // Figma frame width
const BASE_HEIGHT = 874; // Figma frame height

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const scaleFactorWidth = SCREEN_WIDTH / BASE_WIDTH;
const scaleFactorHeight = SCREEN_HEIGHT / BASE_HEIGHT;
export const scaleWidth = (size: number) => Math.min(scaleFactorWidth * size, size);
export const scaleHeight = (size: number) => Math.min(scaleFactorHeight * size, size);
export const scaleFont = (size: number) => scaleWidth(size); // Adjust as needed

export const theme = {
  colors: {
    primary: '#3B82F6',
    background: '#FFFFFF',
    text: '#111827',
    muted: '#6B7280',
  },
  spacing: {
    xs: scaleWidth(4),
    sm: scaleWidth(8),
    md: scaleWidth(16),
    lg: scaleWidth(24),
    xl: scaleWidth(32),
  },
  borderWidth: BORDER_WIDTH,
  borderRadius: {
    sm: scaleWidth(6),
    md: scaleWidth(12),
    lg: scaleWidth(24),
  },
  fontSize: {
    sm: scaleFont(12),
    md: scaleFont(16),
    lg: scaleFont(20),
    xl: scaleFont(24),
  },
};
