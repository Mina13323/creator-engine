'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useI18n } from '../lib/i18n/I18nContext';
import { useState, useEffect } from 'react';
import {
  Check, X, Sparkles, Zap, Star, Shield, RefreshCw, ChevronRight,
  CreditCard, Package, Clock, BadgeCheck
} from 'lucide-react';
import { authClient } from '../lib/authClient';

export default function PricingModal() {
  const { t } = useI18n();
  const { showPricingModal, setShowPricingModal, user, credits } = useStore();
  const [plans, setPlans] = useState<any[]>([]);
  const [packs, setPacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'credits'>('subscriptions');
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    if (showPricingModal) loadData();
  }, [showPricingModal]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dataPlans, dataPacks] = await Promise.all([
        authClient.get<any>('/payments/plans'),
        authClient.get<any>('/payments/packs')
      ]);
      setPlans(dataPlans.plans || []);
      setPacks(dataPacks.packs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (type: string, id: string, amount: number) => {
    if (purchasing) return;
    setPurchasing(id);
    try {
      const data = await authClient.post<any>('/payments/paymob/create', {
        type,
        planId: type === 'subscription' ? id : undefined,
        packId: type === 'credit_pack' ? id : undefined,
        amountEGP: amount
      });
      if (data.checkoutUrl) {
        if (data.paymentIntentId) {
          localStorage.setItem('pending_payment_intent', data.paymentIntentId);
        }
        window.location.href = data.checkoutUrl;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPurchasing(null);
    }
  };

  const checkPendingPayment = async () => {
    const pendingId = localStorage.getItem('pending_payment_intent');
    if (!pendingId) return;
    setPurchasing('verify');
    try {
      await authClient.post('/payments/paymob/verify-redirect', {
        merchant_order_id: pendingId,
        success: 'true'
      });
      localStorage.removeItem('pending_payment_intent');
      useStore.getState().loadCredits();
      setShowPricingModal(false);
    } catch (e: any) {
      console.error(e);
    } finally {
      setPurchasing(null);
    }
  };

  if (!showPricingModal) return null;

  const hasPendingPayment =
    typeof window !== 'undefined' && !!localStorage.getItem('pending_payment_intent');

  // Plan highlight color map
  const planColors: Record<string, { badge: string; cta: string; ring: string; glow: string }> = {
    free:       { badge: 'bg-slate-700 text-slate-300',              cta: 'bg-slate-700 hover:bg-slate-600 text-white',                        ring: 'border-slate-700',    glow: '' },
    starter:    { badge: 'bg-emerald-900/60 text-emerald-300',       cta: 'bg-[#008465] hover:bg-emerald-600 text-white',                      ring: 'border-emerald-600',  glow: 'shadow-[0_0_32px_rgba(0,132,101,0.25)]' },
    pro:        { badge: 'bg-[#008465] text-white font-bold',        cta: 'bg-gradient-to-r from-[#008465] to-emerald-500 text-white',         ring: 'border-[#008465]',    glow: 'shadow-[0_0_40px_rgba(0,132,101,0.4)]' },
    enterprise: { badge: 'bg-amber-900/60 text-amber-300',           cta: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',         ring: 'border-amber-500',    glow: 'shadow-[0_0_32px_rgba(245,158,11,0.25)]' },
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
        onClick={() => setShowPricingModal(false)}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 16 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-700/60 rounded-3xl shadow-[0_40px_120px_rgba(0,0,0,0.7)] custom-scrollbar"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 px-8 pt-8 pb-6">
            <button
              onClick={() => setShowPricingModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Credits balance */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-[#008465] animate-pulse" />
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                    Creator Engine
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Power up your workspace
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  {t('pricing.subtitle')}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 shrink-0">
                <Sparkles className="w-4 h-4 text-[#008465]" />
                <div>
                  <p className="text-xs text-slate-400">Your balance</p>
                  <p className="text-base font-black text-white">{(credits || 0).toLocaleString()} credits</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-1 w-fit">
              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'subscriptions'
                    ? 'bg-[#008465] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                {t('pricing.subscriptions')}
              </button>
              <button
                onClick={() => setActiveTab('credits')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'credits'
                    ? 'bg-[#008465] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4" />
                {t('pricing.creditPacks')}
              </button>
            </div>

            {/* Pending Payment Banner */}
            {hasPendingPayment && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center justify-between gap-4 bg-amber-950/50 border border-amber-700/50 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-2 text-amber-300">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-semibold">Pending payment detected — click to verify and apply credits</span>
                </div>
                <button
                  onClick={checkPendingPayment}
                  disabled={purchasing === 'verify'}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-amber-950 text-xs font-bold transition-all disabled:opacity-60"
                >
                  {purchasing === 'verify' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <BadgeCheck className="w-3.5 h-3.5" />}
                  Verify Payment
                </button>
              </motion.div>
            )}
          </div>

          {/* Body */}
          <div className="px-8 pb-8 pt-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-2 border-slate-700" />
                  <div className="absolute inset-0 rounded-full border-2 border-t-[#008465] animate-spin" />
                </div>
                <p className="text-slate-500 text-sm">Loading plans...</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {activeTab === 'subscriptions' && (
                  <motion.div
                    key="subs"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
                  >
                    {plans.map((plan, idx) => {
                      const colors = planColors[plan.slug] || planColors.starter;
                      const isPopular = plan.slug === 'pro';
                      const isCurrent = plan.monthlyPriceEGP === 0;
                      return (
                        <div
                          key={plan.slug}
                          className={`relative flex flex-col rounded-2xl border bg-slate-800/50 p-6 transition-all duration-300 hover:bg-slate-800 ${colors.ring} ${colors.glow}`}
                        >
                          {isPopular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#008465] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                              <Star className="w-3 h-3 fill-white" />
                              Most Popular
                            </div>
                          )}

                          {/* Plan name + badge */}
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="text-base font-black text-white">{plan.name}</h3>
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${colors.badge}`}>
                              {isCurrent ? 'Free' : plan.slug}
                            </span>
                          </div>

                          {/* Price */}
                          <div className="mb-1">
                            <span className="text-4xl font-black text-white">{plan.monthlyPriceEGP === 0 ? '0' : plan.monthlyPriceEGP.toLocaleString()}</span>
                            <span className="text-slate-400 text-sm ml-1">EGP / mo</span>
                          </div>
                          <p className="text-xs text-[#00b37e] font-semibold mb-4">
                            {plan.monthlyCredits.toLocaleString()} {t('pricing.creditsPerMo')}
                          </p>

                          <div className="h-px bg-slate-700 mb-4" />

                          {/* Features */}
                          <ul className="space-y-2.5 flex-1 mb-6">
                            {plan.features.map((f: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                <Check className="w-4 h-4 text-[#00b37e] shrink-0 mt-0.5" />
                                <span className="leading-snug">{f}</span>
                              </li>
                            ))}
                            <li className="flex items-start gap-2 text-sm text-slate-500">
                              <Shield className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                              <span>Up to {plan.maxProjects} projects</span>
                            </li>
                          </ul>

                          {/* CTA */}
                          <button
                            onClick={() => !isCurrent && handlePurchase('subscription', plan.slug, plan.monthlyPriceEGP)}
                            disabled={isCurrent || purchasing === plan.slug}
                            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${colors.cta} disabled:opacity-60 disabled:cursor-not-allowed`}
                          >
                            {purchasing === plan.slug ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : isCurrent ? (
                              t('pricing.currentPlan')
                            ) : (
                              <>
                                {t('pricing.upgradeBtn')}
                                <ChevronRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </motion.div>
                )}

                {activeTab === 'credits' && (
                  <motion.div
                    key="credits"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
                      {packs.map((pack, idx) => {
                        const highlight = idx === 1; // middle pack
                        return (
                          <div
                            key={pack.slug}
                            className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
                              highlight
                                ? 'bg-gradient-to-b from-emerald-900/50 to-slate-800/80 border-[#008465] shadow-[0_0_40px_rgba(0,132,101,0.35)]'
                                : 'bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                            }`}
                          >
                            {highlight && (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#008465] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                                <Zap className="w-3 h-3 fill-white" />
                                Best Value
                              </div>
                            )}

                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${highlight ? 'bg-[#008465]/30' : 'bg-slate-700/60'}`}>
                              <Sparkles className={`w-6 h-6 ${highlight ? 'text-[#00b37e]' : 'text-slate-400'}`} />
                            </div>

                            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">AI Credits</p>
                            <h3 className="text-3xl font-black text-white mb-1">{pack.credits.toLocaleString()}</h3>
                            <p className="text-xs text-slate-500 mb-5">one-time top-up</p>

                            <div className="flex-1" />

                            <div className="h-px bg-slate-700 mb-5" />

                            <div className="mb-5">
                              <span className="text-3xl font-black text-white">{pack.priceEGP.toLocaleString()}</span>
                              <span className="text-slate-400 text-sm ml-1">EGP</span>
                              <p className="text-[11px] text-slate-500 mt-1">{(pack.priceEGP / pack.credits).toFixed(2)} EGP / credit</p>
                            </div>

                            <button
                              onClick={() => handlePurchase('credit_pack', pack.slug, pack.priceEGP)}
                              disabled={purchasing === pack.slug}
                              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                                highlight
                                  ? 'bg-[#008465] hover:bg-emerald-600 text-white shadow-lg'
                                  : 'bg-slate-700 hover:bg-slate-600 text-white'
                              } disabled:opacity-60`}
                            >
                              {purchasing === pack.slug ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  {t('pricing.buyCredits')}
                                  <ChevronRight className="w-4 h-4" />
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Trust row */}
                    <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
                      {[
                        { icon: Shield, text: 'Secured by Paymob' },
                        { icon: BadgeCheck, text: 'No hidden fees' },
                        { icon: Zap, text: 'Instant credit delivery' },
                      ].map(({ icon: Icon, text }) => (
                        <div key={text} className="flex items-center gap-2 text-slate-500 text-xs">
                          <Icon className="w-4 h-4 text-slate-600" />
                          {text}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
