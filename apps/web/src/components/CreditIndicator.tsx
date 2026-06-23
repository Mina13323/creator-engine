'use client';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export default function CreditIndicator() {
  const { credits, isDemo, loadCredits, setShowPricingModal, isAuthenticated } = useStore();

  useEffect(() => {
    if (isAuthenticated) {
      loadCredits();
    }
  }, [isAuthenticated, loadCredits]);

  if (!isAuthenticated) return null;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setShowPricingModal(true)}
      className="flex items-center gap-2 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 px-3 py-1.5 rounded-full hover:bg-blue-800/40 transition-colors"
    >
      <Sparkles className="w-4 h-4 text-blue-400" />
      <span className="text-sm font-medium text-blue-200">
        {isDemo ? (
          <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-xs">DEMO MODE</span>
        ) : (
          `${(credits || 0).toLocaleString()} Credits`
        )}
      </span>
    </motion.button>
  );
}
