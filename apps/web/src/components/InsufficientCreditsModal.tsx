'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, X, ChevronRight, Lock, TrendingUp } from 'lucide-react';
import { useStore } from '../store/useStore';

const FEATURE_COSTS: Record<string, { label: string; cost: number; icon: string }> = {
  'opportunity-discovery': { label: 'Market Opportunity Scan', cost: 15, icon: '🔭' },
  'founder-analysis':      { label: 'Founder Profile Analysis', cost: 10, icon: '🧬' },
  'business-plan':         { label: 'Business Plan Generation', cost: 30, icon: '📋' },
  'financial-engine':      { label: 'Financial Projections',    cost: 25, icon: '📊' },
  'branding':              { label: 'Brand Identity Generation', cost: 25, icon: '🎨' },
  'marketing':             { label: 'Marketing Campaign',       cost: 25, icon: '📣' },
  'pitch-deck':            { label: 'Pitch Deck Creation',      cost: 40, icon: '🚀' },
  'roadmap':               { label: 'Execution Roadmap',        cost: 20, icon: '🗺️' },
  'ai-chat':               { label: 'AI Cofounder Chat',        cost: 1,  icon: '💬' },
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
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-[60]"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.7)] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Dark header */}
              <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 px-6 pt-8 pb-12 border-b border-slate-700/50">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-slate-700 flex items-center justify-center border border-slate-600">
                    <Lock className="w-5 h-5 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Creator Engine</p>
                    <h2 className="text-white text-lg font-black leading-tight">Insufficient Credits</h2>
                  </div>
                </div>

                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature
                    ? `${feature.icon} ${feature.label} requires ${requiredCredits} credits.`
                    : `This action requires ${requiredCredits} credits.`}
                  {' '}You currently have{' '}
                  <span className="text-white font-semibold">{(credits || 0).toLocaleString()}</span> credits.
                </p>
              </div>

              {/* Credit balance card — overlaps header */}
              <div className="mx-5 -mt-8 relative z-10">
                <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl p-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wide">You Have</p>
                      <p className="text-xl font-black text-white">{(credits || 0).toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">credits</p>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wide">Required</p>
                      <p className="text-xl font-black text-[#00b37e]">{requiredCredits}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">credits</p>
                    </div>
                  </div>

                  {shortfall > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between">
                      <span className="text-xs text-slate-500">Credits short</span>
                      <span className="text-xs font-black text-rose-400">–{shortfall.toLocaleString()} credits</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="px-5 pt-4 pb-6 space-y-4">
                {/* AI Feature teaser */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Feature Costs</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.values(FEATURE_COSTS).slice(0, 4).map(f => (
                      <div key={f.label} className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-2 border border-slate-700/50">
                        <span className="text-sm">{f.icon}</span>
                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-400 truncate leading-tight">{f.label}</p>
                          <p className="text-[10px] font-black text-slate-200">{f.cost} cr.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Primary CTA */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpgrade}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#008465] to-emerald-500 text-white font-bold rounded-2xl py-3.5 text-sm shadow-[0_12px_40px_rgba(0,132,101,0.35)] hover:shadow-[0_16px_48px_rgba(0,132,101,0.5)] transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Get More Credits
                  <ChevronRight className="w-4 h-4" />
                </motion.button>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 text-sm text-slate-600 hover:text-slate-400 transition-colors"
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
