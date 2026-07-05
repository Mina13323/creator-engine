'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Button, Card, CardContent, CardHeader, CardTitle, 
  PageHeader, MetricCard, AIThinkingPanel
} from './design-system';
import { 
  Calculator, Zap, DollarSign, TrendingUp, AlertCircle, Building, Server, ArrowRight 
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useI18n } from '../lib/i18n/I18nContext';
import { authClient } from '../lib/authClient';

export default function FinancialEngine() {
  const { t, dir } = useI18n();
  const currentProject = useStore(state => state.currentProject);
  const ventureState = useStore(state => state.ventureState);
  
  const opportunity = ventureState?.selectedOpportunity;
  const initialIdea = opportunity ? `${opportunity.title}: ${opportunity.description}` : '';
  const [businessIdea, setBusinessIdea] = useState(initialIdea);
  const [businessModel, setBusinessModel] = useState('SaaS');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [loadingExisting, setLoadingExisting] = useState(false);

  const prevOpportunityId = React.useRef<string | undefined>(opportunity?.id || (opportunity as any)?._id);

  React.useEffect(() => {
    const currentId = opportunity?.id || (opportunity as any)?._id;
    if (currentId !== prevOpportunityId.current) {
      if (opportunity) {
        setBusinessIdea(`${opportunity.title}: ${opportunity.description}`);
      } else {
        setBusinessIdea('');
      }
      prevOpportunityId.current = currentId;
    }
  }, [opportunity]);

  React.useEffect(() => {
    if (ventureState?.financialForecast) {
      setResults({
        financial: ventureState.financialForecast,
        pricing: ventureState.pricingStrategy || {}
      });
    }
  }, [ventureState?.financialForecast, ventureState?.pricingStrategy]);

  const handleGenerate = async () => {
    if (!businessIdea || !currentProject?.id) return;
    setLoading(true);
    try {
      const data = await authClient.post<any>('/financial/generate', {
        projectId: currentProject.id,
        businessIdea,
        businessModel,
      });

      setResults({
        financial: data.financialForecast,
        pricing: data.pricing || {},
      });
    } catch (error) {
      console.error('Failed to generate financials', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      
      <PageHeader 
        title="Financial Engine" 
        description="AI-driven forecasts and pricing strategies tailored to your market."
      />

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-gray-700">Business Context / Product Description</label>
              <textarea 
                value={businessIdea}
                onChange={(e) => setBusinessIdea(e.target.value)}
                placeholder="e.g. A marketplace for local artisans..."
                className="w-full bg-[#F8FAFD] border border-[rgba(60,64,67,0.12)] rounded-xl p-4 text-gray-900 focus:ring-2 focus:ring-[#1A73E8] outline-none transition-all resize-none h-32"
              />
            </div>
            
            <div className="space-y-6 flex flex-col justify-between">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Business Model Structure</label>
                <select 
                  value={businessModel}
                  onChange={(e) => setBusinessModel(e.target.value)}
                  className="w-full bg-[#F8FAFD] border border-[rgba(60,64,67,0.12)] rounded-xl p-4 text-gray-900 focus:ring-2 focus:ring-[#1A73E8] outline-none"
                >
                  <option value="SaaS">B2B SaaS (Subscription)</option>
                  <option value="Marketplace">Marketplace (Commission)</option>
                  <option value="Agency">Agency (Retainer / Project)</option>
                  <option value="Freemium">Freemium Consumer App</option>
                  <option value="Usage-based">Usage-based API</option>
                </select>
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={loading || !businessIdea}
                isLoading={loading}
                fullWidth
              >
                {!loading && <Zap className="w-4 h-4 mr-2" />}
                Generate Financial Model
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="py-12">
          <AIThinkingPanel 
            title="Building Financial Projections..."
            stages={[
              { id: '1', label: 'Analyzing market costs', status: 'completed' },
              { id: '2', label: 'Formulating pricing strategy', status: 'active' },
              { id: '3', label: 'Calculating break-even metrics', status: 'pending' },
            ]}
          />
        </div>
      )}

      {results && !loading && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard title="Startup Capital" value={`EGP ${results.financial.totalStartupCost?.toLocaleString()}`} icon={Building} delay={0.1} />
            <MetricCard title="Burn Rate (Mo)" value={`EGP ${results.financial.monthlyBurn?.toLocaleString()}`} icon={Server} delay={0.2} />
            <MetricCard title="Break-even" value={`Month ${results.financial.breakEvenMonth}`} icon={TrendingUp} delay={0.3} />
            <MetricCard title="Pricing Model" value={results.pricing.recommendedStrategyType} icon={DollarSign} delay={0.4} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Cost Breakdown */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-[#1A73E8]" />
                    Cost Infrastructure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">One-time Startup Costs</h4>
                    <div className="space-y-3">
                      {results.financial.startupCosts?.map((cost: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-4 bg-[#F8FAFD] rounded-xl border border-[rgba(60,64,67,0.12)]">
                          <div>
                            <p className="font-semibold text-gray-900">{cost.category}</p>
                            <p className="text-sm text-gray-500 mt-0.5">{cost.description}</p>
                          </div>
                          <span className="font-bold text-[#1A73E8] bg-blue-50 px-3 py-1 rounded-lg">
                            EGP {cost.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Monthly Operating Costs</h4>
                    <div className="space-y-3">
                      {results.financial.monthlyCosts?.map((cost: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-4 bg-[#F8FAFD] rounded-xl border border-[rgba(60,64,67,0.12)]">
                          <div>
                            <p className="font-semibold text-gray-900">{cost.category}</p>
                            <p className="text-sm text-gray-500 mt-0.5">{cost.description}</p>
                          </div>
                          <span className="font-bold text-[#1A73E8] bg-blue-50 px-3 py-1 rounded-lg">
                            EGP {cost.amount.toLocaleString()}/mo
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pricing Strategy */}
            <div className="space-y-6">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[#34A853]" />
                    Market Pricing
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col space-y-6">
                  <div className="bg-[#e6f4ea] p-4 rounded-xl">
                    <p className="text-sm text-[#137333] font-medium leading-relaxed">
                      {results.pricing.marketPositioningRationale}
                    </p>
                  </div>

                  <div className="space-y-4 flex-1">
                    {results.pricing.priceTiers?.map((tier: any, i: number) => (
                      <div key={i} className={`border rounded-xl p-5 relative overflow-hidden transition-all ${i === 1 ? 'border-[#1A73E8] shadow-[0_4px_12px_rgba(26,115,232,0.15)] bg-white' : 'border-[rgba(60,64,67,0.12)] bg-[#F8FAFD]'}`}>
                        {i === 1 && (
                          <div className="absolute top-0 right-0 bg-[#1A73E8] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                            Recommended
                          </div>
                        )}
                        <h4 className="text-lg font-bold text-gray-900">{tier.tierName}</h4>
                        <div className="mt-1 mb-4 flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-gray-900">EGP {tier.amount}</span>
                          <span className="text-gray-500 text-sm font-medium">/{tier.billingCycle}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 font-medium">{tier.targetSegment}</p>
                        <ul className="space-y-2">
                          {tier.features?.map((feat: string, j: number) => (
                            <li key={j} className="text-sm text-gray-600 flex items-start gap-2">
                              <ArrowRight className="w-4 h-4 text-[#1A73E8] shrink-0 mt-0.5" />
                              <span className="leading-tight">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {results.financial.assumptionsApplied && (
                    <div className="pt-6 border-t border-[rgba(60,64,67,0.12)]">
                      <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-[#FBBC04]" /> Market Context
                      </h4>
                      <ul className="space-y-2">
                        {results.financial.assumptionsApplied.map((assump: string, i: number) => (
                          <li key={i} className="text-sm text-gray-500 flex items-start gap-2">
                            <span className="text-gray-300 mt-1">•</span>
                            {assump}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
