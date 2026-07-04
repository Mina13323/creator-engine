export const tokens = {
  colors: {
    primary: {
      DEFAULT: '#10b981', // emerald-500
      light: '#d1fae5', // emerald-100
      dark: '#047857', // emerald-700
      hover: '#059669', // emerald-600
    },
    background: {
      DEFAULT: '#FDFDFD', // Very light grey/white background
      surface: '#FFFFFF', // Pure white for cards/sidebar
      subtle: '#F8FAFC', // slate-50
      muted: '#F1F5F9', // slate-100
    },
    text: {
      primary: '#0F172A', // slate-900
      secondary: '#475569', // slate-600
      muted: '#94A3B8', // slate-400
    },
    border: {
      DEFAULT: '#E2E8F0', // slate-200
      light: '#F1F5F9', // slate-100
      active: '#CBD5E1', // slate-300
    },
    accent: {
      purple: {
        DEFAULT: '#9333EA',
        light: '#F3E8FF',
      },
      blue: {
        DEFAULT: '#2563EB',
        light: '#DBEAFE',
      },
      navy: {
        DEFAULT: '#1E293B',
        hover: '#0F172A',
      }
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    section: '4rem',
  },
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem', // rounded-2xl equivalent
    '2xl': '1.5rem',
    full: '9999px',
  },
  shadows: {
    card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
    hover: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.02)',
    floating: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  },
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  typography: {
    h1: 'text-3xl font-bold tracking-tight text-slate-900',
    h2: 'text-xl font-semibold tracking-tight text-slate-900',
    h3: 'text-lg font-medium text-slate-900',
    body: 'text-sm text-slate-600 leading-relaxed',
    bodySmall: 'text-xs text-slate-500',
    label: 'text-xs font-semibold text-slate-400 uppercase tracking-wider',
  }
};
