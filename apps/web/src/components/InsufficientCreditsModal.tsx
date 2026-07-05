'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, X, TrendingUp, CreditCard, ChevronRight, Lock } from 'lucide-react';
import { useStore } from '../store/useStore';

const FEATURE_COSTS: Record<string, { label: string; cost: number; icon: string }> = {
  'opportunity-discovery': { label: 'Market Opportunity Scan', cost: 15, icon: '🔭' },
  'founder-analysis':      { label: 'Founder Profile Analysis', cost: 10, icon: '🧬' },
  'business-plan':         { label: 'Business Plan Generation', cost: 30, icon: '📋' },
  'financial-engine':      { label: 'Financial Projections', cost: 25, icon: '📊' },
  'branding':              { label: 'Brand Identity Generation', cost: 25, icon: '🎨' },
  'marketing':             { label: 'Marketing Campaign', cost: 25, icon: '📣' },
  'pitch-deck':            { label: 'Pitch Deck Creation', cost: 40, icon: '🚀' },
  'roadmap':               { label: 'Execution Roadmap', cost: 20, icon: '🗺️' },
  'ai-chat':               { label: 'AI Cofounder Chat', cost: 1, icon: '💬' },
};

interface InsufficientCreditsModalProps {
  open: boolean;
  onClose: () => void;
  requiredCredits: number;
  featureKey?: string;
}

export default function InsufficientCreditsModal({
  open,
  onClose,
  requiredCredits,
  featureKey,
}: InsufficientCreditsModalProps) {
  const { credits, setShowPricingModal } = useStore();

  const feature = featureKey ? FEATURE_COSTS[featureKey] : null;
  const shortfall = Math.max(0, requiredCredits - (credits || 0));

  const handleUpgrade = () => {
    onClose();
    setShowPricingModal(true);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header gradient */}
              <div className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-8 pt-10 pb-16">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-indigo-200 text-sm font-medium">Creator Engine</p>
                    <h2 className="text-white text-xl font-bold">Insufficient Credits</h2>
                  </div>
                </div>

                <p className="text-indigo-100 text-sm leading-relaxed">
                  {feature
                    ? `${feature.icon} ${feature.label} requires ${requiredCredits} credits, but you only have ${credits || 0}.`
                    : `This action requires ${requiredCredits} credits, but you only have ${credits || 0}.`}
                </p>
              </div>

              {/* Credit breakdown card — overlaps header */}
              <div className="mx-6 -mt-10 relative z-10">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-5">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">You Have</p>
                      <p className="text-2xl font-bold text-slate-900">{credits || 0}</p>
                      <p className="text-xs text-slate-400 mt-0.5">credits</p>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                        <ChevronRight className="w-4 h-4 text-red-400" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Need</p>
                      <p className="text-2xl font-bold text-violet-600">{requiredCredits}</p>
                      <p className="text-xs text-slate-400 mt-0.5">credits</p>
                    </div>
                  </div>

                  {shortfall > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-sm text-slate-500">Credits needed</span>
                      <span className="text-sm font-semibold text-red-500">–{shortfall} credits</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="px-6 pt-5 pb-6 space-y-4">
                {/* Other actions teaser */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Feature Costs</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(FEATURE_COSTS).slice(0, 4).map((f) => (
                      <div key={f.label} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                        <span className="text-base">{f.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs text-slate-600 truncate">{f.label}</p>
                          <p className="text-xs font-bold text-slate-900">{f.cost} credits</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTAs */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpgrade}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-2xl py-3.5 shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Upgrade Plan & Get Credits
                  <ChevronRight className="w-4 h-4" />
                </motion.button>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
