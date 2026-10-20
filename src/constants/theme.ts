/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F172A',
    textSecondary: '#64748B',
    background: '#F8FAFC',
    backgroundElement: '#F1F5F9',
    backgroundSelected: '#E2E8F0',
    primary: '#DC2626',
    primaryDark: '#B70011',
    primaryLight: '#FEE2E2',
    primaryContainer: '#FEF2F2',
    secondary: '#0284C7',
    secondaryLight: '#E0F2FE',
    secondaryDark: '#0369A1',
    accent: '#EF4444',
    card: '#FFFFFF',
    cardBorder: '#E2E8F0',
    success: '#16A34A',
    successLight: '#DCFCE7',
    warning: '#D97706',
    warningLight: '#FEF3C7',
  },
  dark: {
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    background: '#0B1120',
    backgroundElement: '#1E293B',
    backgroundSelected: '#334155',
    primary: '#EF4444',
    primaryDark: '#DC2626',
    primaryLight: '#451214',
    primaryContainer: '#2D1517',
    secondary: '#38BDF8',
    secondaryLight: '#082F49',
    secondaryDark: '#0284C7',
    accent: '#F87171',
    card: '#131D31',
    cardBorder: '#23324A',
    success: '#22C55E',
    successLight: '#052E16',
    warning: '#FBBF24',
    warningLight: '#451A03',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
