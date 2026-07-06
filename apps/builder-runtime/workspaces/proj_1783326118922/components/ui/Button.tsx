import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "filled" | "outlined" | "text";
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = "filled",
  children,
  className = "",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center px-6 py-3 rounded-md text-label-large transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary";

  const variants: Record<string, string> = {
    filled: "bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container",
    outlined:
      "border border-outline bg-transparent text-on-surface hover:bg-surface-variant",
    text: "bg-transparent text-on-surface hover:bg-surface-variant",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
