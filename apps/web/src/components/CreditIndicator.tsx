'use client';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useI18n } from '../lib/i18n/I18nContext';

export default function CreditIndicator() {
  const { t } = useI18n();
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
      className="flex items-center gap-2 bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-950 border border-emerald-300/70 px-3 py-1.5 rounded-full shadow-[0_0_18px_rgba(16,185,129,0.25)] hover:border-emerald-200 hover:shadow-[0_0_24px_rgba(16,185,129,0.38)] transition-all"
    >
      <Sparkles className="w-4 h-4 text-emerald-100 drop-shadow-[0_0_6px_rgba(209,250,229,0.9)]" />
      <span className="text-sm font-extrabold text-white tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,0.75)]">
        {isDemo ? (
          <span className="bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded text-xs font-extrabold">{t('pricing.demoMode')}</span>
        ) : (
          `${(credits || 0).toLocaleString()} ${t('pricing.credits')}`
        )}
      </span>
    </motion.button>
  );
}
