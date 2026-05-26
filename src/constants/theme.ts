export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const fontFamily = {
  regular: 'Syne-Regular',
  medium: 'Syne-SemiBold',
  bold: 'Syne-Bold',
  extraBold: 'Syne-ExtraBold',
  monoRegular: 'SpaceMono-Regular',
  monoBold: 'SpaceMono-Bold',
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    // @ts-ignore - web only
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)',
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    // @ts-ignore - web only
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    // @ts-ignore - web only
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.4)',
  },
} as const;