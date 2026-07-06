import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'filled' | 'outlined' | 'text';
  onClick?: () => void;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'filled',
  onClick,
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center justify-center px-6 py-3 rounded font-label-large transition-colors duration-200';
  const variants = {
    filled: 'bg-primary text-on-primary hover:bg-gray-800',
    outlined: 'border-2 border-primary text-on-background bg-transparent hover:bg-gray-800 hover:text-on-primary',
    text: 'bg-transparent text-on-background hover:text-gray-400',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
