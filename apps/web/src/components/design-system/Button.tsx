import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, fullWidth, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008465] disabled:pointer-events-none disabled:opacity-50";
    
    // MD3 styling rules
    const variants = {
      primary: "bg-[#008465] text-white hover:bg-[#007055] shadow-[0_10px_20px_rgba(0,132,101,0.16)]",
      secondary: "bg-[#e4f3ee] text-[#008465] hover:bg-[#d9eee8]",
      outline: "border border-gray-200 bg-transparent hover:bg-gray-50 text-gray-700",
      ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
      danger: "bg-[#EA4335] text-white hover:bg-red-700 shadow-[0_1px_3px_rgba(60,64,67,0.15)]",
    };

    const sizes = {
      sm: "h-8 px-4 text-xs rounded-full",
      md: "h-10 px-6 text-sm rounded-full",
      lg: "h-12 px-8 text-base rounded-full",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={disabled || isLoading ? undefined : { scale: 0.98 }}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children as any}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
