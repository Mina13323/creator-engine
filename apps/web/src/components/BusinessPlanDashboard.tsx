'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
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

export default function BusinessPlanDashboard() {
  const { currentProject, ventureState, generateBusinessPlan, loading } = useStore();
  const [expandedSection, setExpandedSection] = useState<string | null>('executive');

  const businessPlan = ventureState?.businessPlan as any;
  const selectedOpportunity = ventureState?.selectedOpportunity;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <AIThinkingPanel 
          title="Building Business Strategy..."
          stages={[
            { id: '1', label: 'Formulating Lean Canvas', status: 'completed' },
            { id: '2', label: 'Structuring Revenue Model', status: 'active' },
            { id: '3', label: 'Drafting Go-to-Market Roadmap', status: 'pending' },
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
          description="Creator Engine can build your first strategy document and Lean Canvas automatically."
          actionLabel="Build Business Strategy"
          onAction={() => currentProject && generateBusinessPlan(currentProject.id)}
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
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Elevator Pitch</h4>
              <p className="text-gray-800 leading-relaxed text-lg">{bp.executiveSummary?.elevatorPitch}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Mission</h4>
                <p className="text-gray-700">{bp.executiveSummary?.missionStatement}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Vision</h4>
                <p className="text-gray-700">{bp.executiveSummary?.visionStatement}</p>
              </div>
            </div>
          </div>
        </ExpandableSection>

        <ExpandableSection id="lean-canvas" title="Lean Canvas" icon={Zap}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            <div className="space-y-6 border-r border-gray-100 pr-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Problem</h4>
                <ul className="list-disc pl-4 text-sm text-gray-700 space-y-1">
                  {bp.leanCanvas?.problem?.map((p: string, i: number) => <li key={i}>{p}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Existing Alternatives</h4>
                <ul className="list-disc pl-4 text-sm text-gray-700 space-y-1">
                  {bp.leanCanvas?.existingAlternatives?.map((p: string, i: number) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            </div>
            <div className="space-y-6 border-r border-gray-100 pr-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Solution</h4>
                <ul className="list-disc pl-4 text-sm text-gray-700 space-y-1">
                  {bp.leanCanvas?.solution?.map((p: string, i: number) => <li key={i}>{p}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Unique Value Proposition</h4>
                <p className="text-sm text-gray-700">{bp.leanCanvas?.uniqueValueProposition}</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Customer Segments</h4>
                <ul className="list-disc pl-4 text-sm text-gray-700 space-y-1">
                  {bp.leanCanvas?.customerSegments?.map((p: string, i: number) => <li key={i}>{p}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Unfair Advantage</h4>
                <p className="text-sm text-gray-700">{bp.leanCanvas?.unfairAdvantage}</p>
              </div>
            </div>
          </div>
        </ExpandableSection>

        <ExpandableSection id="market-strategy" title="Market Strategy" icon={Target}>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Target Audience</h4>
              <div className="bg-[#F8FAFD] rounded-xl p-4">
                <p className="text-gray-800 font-medium mb-1">{bp.targetMarket?.primaryAudience?.persona}</p>
                <p className="text-sm text-gray-600 mb-3">{bp.targetMarket?.primaryAudience?.demographics}</p>
                <h5 className="text-xs font-semibold text-gray-500 mt-2 mb-1">Pain Points</h5>
                <ul className="list-disc pl-4 text-xs text-gray-600">
                  {bp.targetMarket?.primaryAudience?.painPoints?.map((p: string, i: number) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Go to Market</h4>
              <div className="space-y-3">
                {bp.goToMarketStrategy?.acquisitionChannels?.map((channel: any, i: number) => (
                  <div key={i} className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="text-sm text-gray-700">{channel.channel}</span>
                    <span className="text-xs font-medium bg-blue-50 text-[#1A73E8] px-2 py-1 rounded">ROI: {channel.expectedROI}</span>
                  </div>
                ))}
              </div>
            </div>
           </div>
        </ExpandableSection>

        <ExpandableSection id="revenue" title="Revenue Model" icon={DollarSign}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Pricing Strategy</h4>
              <p className="text-gray-800 text-sm mb-4">{bp.revenueModel?.pricingStrategy}</p>
              <div className="space-y-3">
                {bp.revenueModel?.revenueStreams?.map((stream: any, i: number) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 text-sm">{stream.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{stream.description}</p>
                    <p className="text-xs font-semibold text-[#34A853] mt-2">{stream.pricePoint}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Cost Structure</h4>
              <ul className="space-y-2">
                {bp.leanCanvas?.costStructure?.map((cost: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#EA4335]"></div>
                    {cost}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ExpandableSection>

        <ExpandableSection id="roadmap" title="Product Roadmap" icon={Activity}>
          <div className="pt-4 space-y-6">
             {['Phase 1 (Months 1-3)', 'Phase 2 (Months 4-6)', 'Phase 3 (Months 7-12)'].map((phaseTitle, index) => {
               const milestones = index === 0 ? bp.roadmap?.phase1_0to3Months : index === 1 ? bp.roadmap?.phase2_3to6Months : bp.roadmap?.phase3_6to12Months;
               
               if (!milestones) return null;

               return (
                 <div key={index} className="relative pl-6 border-l-2 border-blue-100">
                   <div className="absolute w-3 h-3 bg-[#1A73E8] rounded-full -left-[7px] top-1.5"></div>
                   <h4 className="text-base font-semibold text-gray-900 mb-3">{phaseTitle}</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {milestones.map((ms: string, i: number) => (
                       <div key={i} className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-100">
                         {ms}
                       </div>
                     ))}
                   </div>
                 </div>
               );
             })}
          </div>
        </ExpandableSection>

      </div>
    </div>
  );
}
