import type { Config } from 'tailwindcss'

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
        'primary-container': '#e0e0e0',
        'on-primary-container': '#000000',
        secondary: '#ffffff',
        'on-secondary': '#000000',
        'secondary-container': '#f5f5f5',
        'on-secondary-container': '#000000',
        tertiary: '#333333',
        'on-tertiary': '#ffffff',
        background: '#ffffff',
        'on-background': '#000000',
        surface: '#ffffff',
        'on-surface': '#000000',
        'surface-variant': '#f5f5f5',
        'on-surface-variant': '#444444',
        error: '#b00020',
        'on-error': '#ffffff',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      fontSize: {
        'display-large': ['57px', { lineHeight: '64px', letterSpacing: '-0.25px' }],
        'display-medium': ['45px', { lineHeight: '52px', letterSpacing: '0px' }],
        'display-small': ['36px', { lineHeight: '44px', letterSpacing: '0px' }],
        'headline-large': ['32px', { lineHeight: '40px', letterSpacing: '0px' }],
        'headline-medium': ['28px', { lineHeight: '36px', letterSpacing: '0px' }],
        'headline-small': ['24px', { lineHeight: '32px', letterSpacing: '0px' }],
        'title-large': ['22px', { lineHeight: '28px', letterSpacing: '0px' }],
        'title-medium': ['16px', { lineHeight: '24px', letterSpacing: '0.15px' }],
        'title-small': ['14px', { lineHeight: '20px', letterSpacing: '0.1px' }],
        'body-large': ['16px', { lineHeight: '24px', letterSpacing: '0.5px' }],
        'body-medium': ['14px', { lineHeight: '20px', letterSpacing: '0.25px' }],
        'body-small': ['12px', { lineHeight: '16px', letterSpacing: '0.4px' }],
        'label-large': ['14px', { lineHeight: '20px', letterSpacing: '0.1px' }],
        'label-medium': ['12px', { lineHeight: '16px', letterSpacing: '0.5px' }],
        'label-small': ['11px', { lineHeight: '16px', letterSpacing: '0.5px' }],
      },
      maxWidth: {
        'content': '1200px',
      },
      spacing: {
        '4dp': '4px',
        '8dp': '8px',
        '16dp': '16px',
        '24dp': '24px',
        '32dp': '32px',
        '48dp': '48px',
        '64dp': '64px',
      },
    },
  },
  plugins: [],
}

export default config