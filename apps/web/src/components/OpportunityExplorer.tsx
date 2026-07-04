'use client';

import React from 'react';
import { useStore } from '../store/useStore';
import { 
  Button, Card, CardContent, CardHeader, CardTitle, 
  EmptyState, AIThinkingPanel, PageHeader 
} from './design-system';
import { Radar, Trophy, Zap, TrendingUp, Search, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from './ui/checkbox';

export default function OpportunityExplorer() {
  const { 
    currentProject, 
    opportunities, 
    selectedOpportunity, 
    selectOpportunity, 
    isSelecting, 
    loading, 
    discoverOpportunities
  } = useStore();
  
  const [selectedToCompare, setSelectedToCompare] = React.useState<string[]>([]);
  const [isComparing, setIsComparing] = React.useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <AIThinkingPanel 
          title="Scanning Market Signals..."
          stages={[
            { id: '1', label: 'Analyzing industry trends', status: 'completed' },
            { id: '2', label: 'Matching founder advantages', status: 'active' },
            { id: '3', label: 'Evaluating competitive gaps', status: 'pending' },
          ]}
        />
      </div>
    );
  }

  if (!opportunities || opportunities.length === 0) {
    return (
      <div className="p-6 md:p-10 max-w-4xl mx-auto mt-20">
        <EmptyState
          icon={Radar}
          title="No Opportunities Scanned Yet"
          description="Creator Engine can scan the market and find high-potential opportunities based on your founder profile."
          actionLabel="Scan Market Opportunities"
          onAction={() => currentProject && discoverOpportunities(currentProject.id)}
          isLoading={loading}
        />
      </div>
    );
  }

  const handleSelect = async (opportunityId: string) => {
    if (!currentProject) return;
    try {
      await selectOpportunity(currentProject.id, opportunityId);
    } catch (err) {
      console.error('Failed to select opportunity:', err);
    }
  };

  const toggleCompare = (id: string) => {
    setSelectedToCompare(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  // Google Discover style cards
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <PageHeader 
        title="Market Opportunities" 
        description="AI-generated business ideas matched to your founder profile."
      >
        <Button 
          variant="outline" 
          onClick={() => setIsComparing(!isComparing)}
          disabled={selectedToCompare.length < 2}
        >
          Compare {selectedToCompare.length > 0 ? `(${selectedToCompare.length})` : ''}
        </Button>
        <Button 
          onClick={() => currentProject && discoverOpportunities(currentProject.id)}
          isLoading={loading}
        >
          <Search className="w-4 h-4 mr-2" />
          Rescan Market
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {opportunities.map((opp, index) => (
            <motion.div
              key={opp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Card 
                hoverable
                className={`h-full flex flex-col relative transition-all ${selectedOpportunity?.opportunityId === opp.id ? 'ring-2 ring-[#1A73E8] bg-blue-50/10' : ''}`}
              >
                {selectedOpportunity?.opportunityId === opp.id && (
                  <div className="absolute top-4 right-4 z-10 text-[#1A73E8]">
                    <CheckCircle2 className="w-6 h-6 fill-blue-100" />
                  </div>
                )}
                
                <CardHeader className="pb-2 relative z-0">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Checkbox 
                        checked={selectedToCompare.includes(opp.id)}
                        onCheckedChange={() => toggleCompare(opp.id)}
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-gray-900 leading-tight pr-6">{opp.title}</h3>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-gray-600 mb-6 flex-1 line-clamp-3">
                    {opp.description}
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase">
                        <Trophy className="w-3.5 h-3.5" />
                        Opportunity Score
                      </div>
                      <span className="font-bold text-[#1A73E8] bg-blue-50 px-2 py-0.5 rounded-md">{opp.score}/100</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase">
                        <Zap className="w-3.5 h-3.5" />
                        AI Advantage
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">{opp.aiAdvantageScore}/100</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Market Demand
                      </div>
                      <span className="font-semibold text-gray-900 text-sm capitalize">{opp.marketDemand}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant={selectedOpportunity?.opportunityId === opp.id ? 'secondary' : 'primary'}
                    fullWidth
                    onClick={() => handleSelect(opp.id)}
                    isLoading={isSelecting && selectedOpportunity?.opportunityId !== opp.id}
                  >
                    {selectedOpportunity?.opportunityId === opp.id ? 'Selected Strategy' : 'Select Strategy'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
