import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        'on-primary': '#ffffff',
        secondary: '#ffffff',
        'on-secondary': '#000000',
        surface: '#ffffff',
        'on-surface': '#000000',
        background: '#000000',
        'on-background': '#ffffff',
        error: '#B00020',
        'on-error': '#ffffff',
        outline: '#000000',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display-large': ['57px', { lineHeight: '64px', fontWeight: '700' }],
        'display-medium': ['45px', { lineHeight: '52px', fontWeight: '700' }],
        'display-small': ['36px', { lineHeight: '44px', fontWeight: '700' }],
        'headline-large': ['32px', { lineHeight: '40px', fontWeight: '600' }],
        'headline-medium': ['28px', { lineHeight: '36px', fontWeight: '600' }],
        'headline-small': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'title-large': ['22px', { lineHeight: '28px', fontWeight: '500' }],
        'title-medium': ['16px', { lineHeight: '24px', fontWeight: '500', letterSpacing: '0.15px' }],
        'title-small': ['14px', { lineHeight: '20px', fontWeight: '500', letterSpacing: '0.1px' }],
        'body-large': ['16px', { lineHeight: '24px', fontWeight: '400', letterSpacing: '0.5px' }],
        'body-medium': ['14px', { lineHeight: '20px', fontWeight: '400', letterSpacing: '0.25px' }],
        'body-small': ['12px', { lineHeight: '16px', fontWeight: '400', letterSpacing: '0.4px' }],
        'label-large': ['14px', { lineHeight: '20px', fontWeight: '500', letterSpacing: '0.1px' }],
        'label-medium': ['12px', { lineHeight: '16px', fontWeight: '500', letterSpacing: '0.5px' }],
        'label-small': ['11px', { lineHeight: '16px', fontWeight: '500', letterSpacing: '0.5px' }],
      },
      spacing: {
        'gutter': '16px',
      },
      maxWidth: {
        'content': '1200px',
      },
    },
  },
  plugins: [],
};

export default config;
