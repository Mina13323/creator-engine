import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'filled' | 'outlined' | 'text' | 'secondary' | 'secondaryOutlined'
  size?: 'medium' | 'large'
  fullWidth?: boolean
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export default function Button({
  children,
  variant = 'filled',
  size = 'medium',
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'

  const sizeStyles = {
    medium: 'px-24dp py-12dp text-label-large',
    large: 'px-32dp py-16dp text-body-large',
  }

  const variantStyles = {
    filled: 'bg-primary text-on-primary hover:bg-tertiary focus:ring-primary',
    outlined:
      'border border-on-surface text-on-surface bg-transparent hover:bg-surface-variant focus:ring-on-surface',
    text: 'text-on-surface bg-transparent hover:bg-surface-variant focus:ring-on-surface',
    secondary: 'bg-secondary text-on-secondary hover:bg-primary-container focus:ring-secondary',
    secondaryOutlined:
      'border border-on-primary text-on-primary bg-transparent hover:bg-tertiary focus:ring-on-primary',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={[
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  )
}