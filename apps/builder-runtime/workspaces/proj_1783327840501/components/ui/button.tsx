import React from 'react';

type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  filled:
    'bg-primary text-on-primary hover:opacity-90 active:opacity-80',
  tonal:
    'bg-surface-variant text-on-surface-variant hover:bg-surface-variant/80',
  outlined:
    'border border-outline text-on-surface bg-transparent hover:bg-surface-variant',
  text:
    'bg-transparent text-primary hover:bg-surface-variant',
};

export default function Button({ variant = 'filled', children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded px-6 py-2 text-label-large transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
