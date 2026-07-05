import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  isLoading?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  isLoading
}: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center bg-[#F8FAFD] rounded-[24px] border border-dashed border-gray-300"
    >
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-[#1A73E8]" />
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm mb-8">{description}</p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction} isLoading={isLoading}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
