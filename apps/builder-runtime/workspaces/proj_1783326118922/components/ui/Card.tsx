import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`rounded-lg bg-surface text-on-surface shadow-sm border border-outline p-6 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
