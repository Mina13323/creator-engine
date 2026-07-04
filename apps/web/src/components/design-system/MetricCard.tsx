import React from 'react';
import { Card } from './Card';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

export function MetricCard({ title, value, icon: Icon, trend, delay = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card hoverable className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="p-2 bg-blue-50 rounded-lg">
            <Icon className="w-5 h-5 text-[#1A73E8]" />
          </div>
        </div>
        <div className="flex items-end space-x-3">
          <h2 className="text-3xl font-semibold text-gray-900">{value}</h2>
          {trend && (
            <span className={`text-sm mb-1 font-medium ${trend.isPositive ? 'text-[#34A853]' : 'text-[#EA4335]'}`}>
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            </span>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
