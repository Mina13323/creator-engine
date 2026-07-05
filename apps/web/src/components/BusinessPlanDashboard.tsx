'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useI18n } from '../lib/i18n/I18nContext';
import { 
  Button, Card, CardContent, CardHeader, CardTitle, 
  EmptyState, AIThinkingPanel, PageHeader 
} from './design-system';
import { 
  FileText, Share, Settings, Download, X, Zap, Target, Briefcase, 
  TrendingUp, BarChart2, Package, Megaphone, DollarSign, Crosshair, AlertTriangle, 
  ChevronRight, ArrowUpRight, Activity, Users, ShieldAlert, Award, Compass, Eye,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BusinessPlan } from '@creator/types';

export default function BusinessPlanDashboard() {
  const { locale } = useI18n();
  const { currentProject, ventureState, generateBusinessPlan, loading } = useStore();
  const [expandedSection, setExpandedSection] = useState<string | null>('executive');

  const businessPlan = ventureState?.businessPlan as BusinessPlan | undefined;
  const selectedOpportunity = ventureState?.selectedOpportunity;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <AIThinkingPanel 
          title="Building Business Strategy..."
          stages={[
            { id: '1', label: 'Formulating Problem & Solution', status: 'completed' },
            { id: '2', label: 'Structuring Revenue Model', status: 'active' },
            { id: '3', label: 'Drafting Go-to-Market Strategy', status: 'pending' },
          ]}
        />
      </div>
    );
  }

  if (!businessPlan || !businessPlan.executiveSummary?.startupName) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto mt-20">
        <EmptyState
          icon={FileText}
          title="No Business Plan Yet"
          description="Creator Engine can build your first strategy document and business model automatically."
          actionLabel="Build Business Strategy"
          onAction={() => currentProject && generateBusinessPlan(currentProject.id, locale)}
          isLoading={loading}
        />
      </div>
    );
  }

  const bp = businessPlan;
  
  const toggleSection = (id: string) => {
    setExpandedSection(prev => prev === id ? null : id);
  };

  const ExpandableSection = ({ id, title, icon: Icon, children }: any) => {
    const isExpanded = expandedSection === id;
    
    return (
      <Card className="mb-4 overflow-hidden border border-[rgba(60,64,67,0.12)]">
        <button 
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 transition-colors focus:outline-none"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Icon className="w-5 h-5 text-[#1A73E8]" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          </div>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: { opacity: 1, height: "auto" },
                collapsed: { opacity: 0, height: 0 }
              }}
              transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            >
              <div className="p-6 pt-0 border-t border-[rgba(60,64,67,0.06)] bg-white">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    );
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <PageHeader 
        title="AI Business Document" 
        description={bp.executiveSummary?.startupName || selectedOpportunity?.title}
      >
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </PageHeader>

      <div className="space-y-2">
        <ExpandableSection id="executive" title="Executive Summary" icon={Compass}>
          <div className="space-y-6 pt-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Value Proposition</h4>
              <p className="text-gray-800 leading-relaxed text-lg">{bp.executiveSummary?.valueProposition}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Mission</h4>
                <p className="text-gray-700">{bp.executiveSummary?.mission}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Vision</h4>
                <p className="text-gray-700">{bp.executiveSummary?.vision}</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Summary</h4>
              <p className="text-gray-700">{bp.executiveSummary?.executiveSummary}</p>
            </div>
          </div>
        </ExpandableSection>

        <ExpandableSection id="problem-solution" title="Problem & Solution" icon={Zap}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-6 border-r border-gray-100 pr-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Problem</h4>
                <p className="text-sm text-gray-700">{bp.problemAndSolution?.problem}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Target Pain Points</h4>
                <ul className="list-disc pl-4 text-sm text-gray-700 space-y-1">
                  {bp.problemAndSolution?.targetPainPoints?.map((p: string, i: number) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Solution</h4>
                <p className="text-sm text-gray-700">{bp.problemAndSolution?.solution}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Unique Advantages</h4>
                <ul className="list-disc pl-4 text-sm text-gray-700 space-y-1">
                  {bp.problemAndSolution?.uniqueAdvantages?.map((p: string, i: number) => <li key={i}>{p}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Unfair Advantage</h4>
                <p className="text-sm text-gray-700">{bp.problemAndSolution?.unfairAdvantage}</p>
              </div>
            </div>
          </div>
        </ExpandableSection>

        <ExpandableSection id="market-research" title="Market Research" icon={Target}>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Market Overview</h4>
              <div className="bg-[#F8FAFD] rounded-xl p-4">
                <p className="text-gray-800 font-medium mb-1">Market Size: {bp.marketResearch?.marketSize}</p>
                <p className="text-sm text-gray-600 mb-3">Growth Rate: {bp.marketResearch?.industryGrowthRate}</p>
                <h5 className="text-xs font-semibold text-gray-500 mt-2 mb-1">Trends</h5>
                <ul className="list-disc pl-4 text-xs text-gray-600">
                  {bp.marketResearch?.trends?.map((p: string, i: number) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Target Segments</h4>
              <ul className="list-disc pl-4 text-sm text-gray-700 mb-4 space-y-1">
                {bp.marketResearch?.targetSegments?.map((s: string, i: number) => <li key={i}>{s}</li>)}
              </ul>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 mt-6">Competitors</h4>
              <div className="space-y-3">
                {bp.marketResearch?.competitors?.map((comp: any, i: number) => (
                  <div key={i} className="flex flex-col border-b border-gray-100 pb-2">
                    <span className="text-sm font-semibold text-gray-900">{comp.name}</span>
                    <span className="text-xs text-gray-600">Strengths: {comp.strengths}</span>
                    <span className="text-xs text-gray-600">Weaknesses: {comp.weaknesses}</span>
                  </div>
                ))}
              </div>
            </div>
           </div>
        </ExpandableSection>

        <ExpandableSection id="revenue" title="Business Model" icon={DollarSign}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Pricing Strategy</h4>
              <p className="text-gray-800 text-sm mb-4">{bp.businessModel?.pricingStrategy}</p>
              
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6">Revenue Streams</h4>
              <ul className="list-disc pl-4 text-sm text-gray-700 mb-4 space-y-1">
                {bp.businessModel?.revenueStreams?.map((stream: string, i: number) => (
                  <li key={i}>{stream}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Acquisition & Sales Model</h4>
              <p className="text-sm text-gray-700 mb-2"><span className="font-medium">Acquisition:</span> {bp.businessModel?.acquisitionModel}</p>
              <p className="text-sm text-gray-700 mb-4"><span className="font-medium">Sales:</span> {bp.businessModel?.salesModel}</p>

              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4">Distribution Channels</h4>
              <ul className="list-disc pl-4 text-sm text-gray-700 space-y-1">
                {bp.businessModel?.distributionChannels?.map((ch: string, i: number) => (
                  <li key={i}>{ch}</li>
                ))}
              </ul>
            </div>
          </div>
        </ExpandableSection>

        <ExpandableSection id="sales-marketing" title="Sales & Marketing" icon={Megaphone}>
          <div className="pt-4 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                 <h4 className="font-semibold text-gray-900 mb-2">Acquisition Channels</h4>
                 <ul className="list-disc pl-4 text-sm text-gray-700 space-y-1">
                   {bp.salesAndMarketing?.acquisitionChannels?.map((ch: string, i: number) => <li key={i}>{ch}</li>)}
                 </ul>
                 <h4 className="font-semibold text-gray-900 mb-2 mt-4">Growth Strategy</h4>
                 <p className="text-sm text-gray-700">{bp.salesAndMarketing?.growthStrategy}</p>
               </div>
               <div>
                 <h4 className="font-semibold text-gray-900 mb-2">Marketing Funnel</h4>
                 <div className="space-y-2">
                   <p className="text-xs text-gray-600"><span className="font-semibold text-gray-800">Awareness:</span> {bp.salesAndMarketing?.marketingFunnel?.awareness}</p>
                   <p className="text-xs text-gray-600"><span className="font-semibold text-gray-800">Interest:</span> {bp.salesAndMarketing?.marketingFunnel?.interest}</p>
                   <p className="text-xs text-gray-600"><span className="font-semibold text-gray-800">Consideration:</span> {bp.salesAndMarketing?.marketingFunnel?.consideration}</p>
                   <p className="text-xs text-gray-600"><span className="font-semibold text-gray-800">Purchase:</span> {bp.salesAndMarketing?.marketingFunnel?.purchase}</p>
                 </div>
               </div>
             </div>
          </div>
        </ExpandableSection>
        
        <ExpandableSection id="financial-insights" title="Financial Insights" icon={TrendingUp}>
          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
             <div>
               <h4 className="font-semibold text-gray-900 mb-2">Projections</h4>
               <p className="text-sm text-gray-700 mb-1"><span className="font-medium text-gray-900">Revenue:</span> {bp.financialInsights?.revenueProjection}</p>
               <p className="text-sm text-gray-700 mb-1"><span className="font-medium text-gray-900">Growth:</span> {bp.financialInsights?.monthlyGrowth}</p>
               <p className="text-sm text-gray-700 mb-1"><span className="font-medium text-gray-900">Break-Even:</span> {bp.financialInsights?.breakEvenPoint}</p>
               <p className="text-sm text-gray-700 mb-1"><span className="font-medium text-gray-900">Profitability:</span> {bp.financialInsights?.profitabilityTimeline}</p>
             </div>
             <div>
               <h4 className="font-semibold text-gray-900 mb-2">Unit Economics & Risks</h4>
               <p className="text-sm text-gray-700 mb-4">{bp.financialInsights?.unitEconomics}</p>
               <h4 className="font-semibold text-gray-900 mb-2">Key Risks</h4>
               <ul className="list-disc pl-4 text-sm text-gray-700 space-y-1">
                 {bp.financialInsights?.keyRisks?.map((risk: string, i: number) => <li key={i}>{risk}</li>)}
               </ul>
             </div>
          </div>
        </ExpandableSection>

      </div>
    </div>
  );
}
