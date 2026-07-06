export const colors = {
  primary: '#000000',
  onPrimary: '#ffffff',
  secondary: '#ffffff',
  onSecondary: '#000000',
  surface: '#ffffff',
  onSurface: '#000000',
  background: '#ffffff',
  onBackground: '#000000',
  error: '#B00020',
  onError: '#ffffff',
  surfaceVariant: '#f5f5f5',
  onSurfaceVariant: '#49454f',
  outline: '#79747e',
} as const;

export const typography = {
  fontFamily: 'Inter, system-ui, sans-serif',
  typeScale: {
    displayLarge: { size: '57px', lineHeight: '64px', weight: 400 },
    displayMedium: { size: '45px', lineHeight: '52px', weight: 400 },
    displaySmall: { size: '36px', lineHeight: '44px', weight: 400 },
    headlineLarge: { size: '32px', lineHeight: '40px', weight: 400 },
    headlineMedium: { size: '28px', lineHeight: '36px', weight: 400 },
    headlineSmall: { size: '24px', lineHeight: '32px', weight: 400 },
    titleLarge: { size: '22px', lineHeight: '28px', weight: 500 },
    titleMedium: { size: '16px', lineHeight: '24px', weight: 500 },
    titleSmall: { size: '14px', lineHeight: '20px', weight: 500 },
    bodyLarge: { size: '16px', lineHeight: '24px', weight: 400 },
    bodyMedium: { size: '14px', lineHeight: '20px', weight: 400 },
    bodySmall: { size: '12px', lineHeight: '16px', weight: 400 },
    labelLarge: { size: '14px', lineHeight: '20px', weight: 500 },
    labelMedium: { size: '12px', lineHeight: '16px', weight: 500 },
    labelSmall: { size: '11px', lineHeight: '16px', weight: 500 },
  },
} as const;

export const spacing = {
  0: '0px',
  1: '8px',
  2: '16px',
  3: '24px',
  4: '32px',
  5: '40px',
  6: '48px',
  7: '56px',
  8: '64px',
} as const;
