'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useState, useEffect } from 'react';
import { Check, X, Sparkles } from 'lucide-react';
import { useI18n } from '../lib/i18n/I18nContext';

export default function PricingModal() {
  const { t } = useI18n();
  const { showPricingModal, setShowPricingModal, user } = useStore();
  const [plans, setPlans] = useState<any[]>([]);
  const [packs, setPacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'credits'>('subscriptions');

  useEffect(() => {
    if (showPricingModal) {
      loadData();
    }
  }, [showPricingModal]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resPlans, resPacks] = await Promise.all([
        fetch('http://localhost:5000/api/payments/plans'),
        fetch('http://localhost:5000/api/payments/packs')
      ]);
      const [dataPlans, dataPacks] = await Promise.all([resPlans.json(), resPacks.json()]);
      setPlans(dataPlans.plans || []);
      setPacks(dataPacks.packs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (type: string, id: string, amount: number) => {
    try {
      const res = await fetch('http://localhost:5000/api/payments/paymob/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          type,
          planId: type === 'subscription' ? id : undefined,
          packId: type === 'credit_pack' ? id : undefined,
          amountEGP: amount
        })
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (e) {
      console.error(e);
      alert('Payment initialization failed');
    }
  };

  if (!showPricingModal) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 custom-scrollbar"
        >
          <button 
            onClick={() => setShowPricingModal(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent inline-flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-blue-400" />
              {t('pricing.title')}
            </h2>
            <p className="text-gray-400 mt-2">{t('pricing.subtitle')}</p>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <button 
              onClick={() => setActiveTab('subscriptions')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'subscriptions' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
              {t('pricing.subscriptions')}
            </button>
            <button 
              onClick={() => setActiveTab('credits')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'credits' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
              {t('pricing.creditPacks')}
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="relative">
              {activeTab === 'subscriptions' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {plans.map((plan) => (
                    <div key={plan.slug} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 flex flex-col hover:border-blue-500/50 transition-all">
                      <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-white">{plan.monthlyPriceEGP}</span>
                        <span className="text-gray-400 text-sm"> EGP / mo</span>
                      </div>
                      <div className="mb-6 pb-6 border-b border-gray-700">
                        <p className="text-sm text-blue-300 font-medium">{plan.monthlyCredits.toLocaleString()} {t('pricing.creditsPerMo')}</p>
                        <p className="text-xs text-gray-500 mt-1">{t('pricing.upToProjects').replace('{count}', plan.maxProjects)}</p>
                      </div>
                      <ul className="space-y-3 mb-8 flex-1">
                        {plan.features.map((f: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <Check className="w-5 h-5 text-green-400 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <button 
                        onClick={() => handlePurchase('subscription', plan.slug, plan.monthlyPriceEGP)}
                        className={`w-full py-2.5 rounded-lg font-medium transition-colors ${plan.slug === 'pro' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                      >
                        {plan.monthlyPriceEGP === 0 ? t('pricing.currentPlan') : t('pricing.upgradeBtn')}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'credits' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  {packs.map((pack) => (
                    <div key={pack.slug} className="bg-gray-800/50 border border-indigo-500/30 rounded-xl p-8 text-center hover:border-indigo-500 transition-all">
                      <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-white mb-2">{pack.credits.toLocaleString()}</h3>
                      <p className="text-indigo-300 font-medium mb-6">{t('pricing.aiCredits')}</p>
                      <div className="mb-8">
                        <span className="text-3xl font-bold text-white">{pack.priceEGP}</span>
                        <span className="text-gray-400 text-sm"> EGP</span>
                      </div>
                      <button 
                        onClick={() => handlePurchase('credit_pack', pack.slug, pack.priceEGP)}
                        className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
                      >
                        {t('pricing.buyCredits')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
