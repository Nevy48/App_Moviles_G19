export const colors = {
  // Background colors
  background: '#0E1016',
  card: '#15171F',
  cardBorder: '#1E222E',

  // Input colors
  inputBackground: '#1C1E26',
  inputBorder: '#323F52',

  // Primary accent
  primary: '#3781F7',
  primaryLight: '#5A96F9',
  primaryDark: '#2B66C5',

  // Status colors
  success: '#34D399',
  successDark: '#059669',
  warning: '#FBBF24',
  warningDark: '#D97706',
  error: '#EF4444',
  errorDark: '#DC2626',

  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',

  // Subject status
  pending: '#6B7280',
  inProgress: '#FBBF24',
  approved: '#34D399',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export const darkColors = colors;

export type Colors = typeof colors;