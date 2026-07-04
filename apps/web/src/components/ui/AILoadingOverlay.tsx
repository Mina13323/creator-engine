'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, ChevronRight, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../../lib/i18n/I18nContext';

export function AILoadingOverlay({ message }: { message?: string }) {
  const { t } = useI18n();
  const [stepIndex, setStepIndex] = useState(0);

  const translatedMessage = React.useMemo(() => {
    if (!message) return t('loading.generating');
    if (message.includes('venture dossier')) return t('loading.retrievingDossier');
    if (message.includes('Creating project')) return t('loading.creatingProject');
    if (message.includes('Analyzing Founder Profile')) return t('loading.analyzingProfile');
    if (message.includes('Discovering Opportunities') || message.includes('Discovering Startup Opportunities')) return t('loading.discoveringOpportunities');
    if (message.includes('Generating Lean Canvas') || message.includes('Generating Business Plan')) return t('loading.generatingBusinessPlan');
    if (message.includes('Generating Brand Identity')) return t('loading.generatingBrandIdentity');
    if (message.includes('Generating Marketing Strategy')) return t('loading.generatingMarketingStrategy');
    if (message.includes('Generating Pitch Deck')) return t('loading.generatingPitchDeck');
    return message;
  }, [message, t]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex(prev => (prev < 4 ? prev + 1 : prev));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-8 w-full h-full min-h-[60vh]">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] p-8 relative overflow-hidden"
      >
        {/* Animated background gradient */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/10 blur-[60px] rounded-full animate-pulse" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-500/10 blur-[60px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 flex flex-col items-center text-center">
          <motion.div 
            animate={{ 
              boxShadow: ['0px 0px 0px 0px rgba(16,185,129,0.2)', '0px 0px 0px 15px rgba(16,185,129,0)', '0px 0px 0px 0px rgba(16,185,129,0)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6"
          >
            <Sparkles className="w-8 h-8 text-emerald-500" />
          </motion.div>
          
          <h2 className="text-xl font-bold text-slate-900 mb-2">{translatedMessage}</h2>
          <p className="text-sm text-slate-500 mb-8 max-w-[250px]">{t('loading.pleaseWait')}</p>
          
          <div className="w-full space-y-4">
            {[t('loading.step1'), t('loading.step2'), t('loading.step3'), t('loading.step4'), t('loading.step5')].map((step, idx) => {
              const isActive = idx === stepIndex;
              const isCompleted = idx < stepIndex;
              const isPending = idx > stepIndex;
              
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex-shrink-0 relative flex items-center justify-center w-6 h-6">
                    {isCompleted ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </motion.div>
                    ) : isActive ? (
                      <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      >
                        <Cpu className="w-5 h-5 text-indigo-500" />
                      </motion.div>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-200" />
                    )}
                  </div>
                  
                  <span className={`text-sm font-medium transition-colors duration-300 text-left ${isCompleted ? 'text-slate-400' : isActive ? 'text-indigo-600' : 'text-slate-300'}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-8">
            <motion.div 
              className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${((stepIndex + 1) / 5) * 100}%` }}
              transition={{ ease: "easeInOut", duration: 0.8 }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
