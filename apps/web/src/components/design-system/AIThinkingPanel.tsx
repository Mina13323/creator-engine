import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

export interface AIStage {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

interface AIThinkingPanelProps {
  title?: string;
  stages: AIStage[];
}

export function AIThinkingPanel({ title = "Analyzing your business...", stages }: AIThinkingPanelProps) {
  return (
    <div className="w-full max-w-md mx-auto bg-[#F8FAFD] rounded-[24px] p-6 border border-[rgba(60,64,67,0.12)]">
      <div className="flex items-center space-x-3 mb-6">
        <div className="relative flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008465] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-[#008465]"></span>
        </div>
        <h3 className="font-medium text-gray-900 text-lg">{title}</h3>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {stages.map((stage, i) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center space-x-3"
            >
              {stage.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-[#34A853]" />}
              {stage.status === 'active' && <Loader2 className="w-5 h-5 text-[#008465] animate-spin" />}
              {stage.status === 'pending' && <Circle className="w-5 h-5 text-gray-300" />}
              {stage.status === 'error' && <Circle className="w-5 h-5 text-[#EA4335]" />}
              
              <span className={`text-sm ${
                stage.status === 'active' ? 'text-gray-900 font-medium' : 
                stage.status === 'completed' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {stage.label}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
