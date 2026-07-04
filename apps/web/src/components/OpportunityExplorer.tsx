'use client';

import { AILoadingOverlay } from './ui/AILoadingOverlay';
import React from 'react';
import { useStore } from '../store/useStore';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Radar, Trophy, Users, Zap, TrendingUp, CheckCircle, Loader2, SplitSquareHorizontal, ArrowLeft, ChevronRight } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, cardReveal, fadeInUp, fadeIn, modalTransition } from '../lib/motion-presets';
import { useI18n } from '../lib/i18n/I18nContext';

export default function OpportunityExplorer() {
  const { t, dir } = useI18n();
  const { 
    currentProject, 
    opportunities, 
    selectedOpportunity, 
    selectOpportunity, 
    isSelecting, 
    setActiveTab, 
    loading, 
    loadingMessage,
    discoverOpportunities
  } = useStore();
  
  const [selectedToCompare, setSelectedToCompare] = React.useState<string[]>([]);
  const [isComparing, setIsComparing] = React.useState(false);
  const [confirmingOppId, setConfirmingOppId] = React.useState<string | null>(null);

  if (loading) {
    return <AILoadingOverlay message={loadingMessage || "Discovering Opportunities..."} />;
  }

  if (!opportunities || opportunities.length === 0) {
    return (
      <div className="p-6 md:p-10 max-w-[800px] mx-auto text-center space-y-8 animate-in fade-in">
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Radar className="w-12 h-12 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">{t('opportunities.emptyTitle')}</h1>
        <p className="text-lg text-slate-600">
          {t('opportunities.emptySubtitle')}
        </p>
        <div className="pt-8">
          <Button 
            onClick={() => currentProject && discoverOpportunities(currentProject.id)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 py-6 text-lg font-semibold shadow-md"
          >
            <CheckCircle className={`w-5 h-5 ${dir === 'rtl' ? 'ml-3' : 'mr-3'}`} />
            {t('opportunities.discoverBtn')}
          </Button>
        </div>
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

  const handleSelectClick = (oppId: string) => {
    // If we already have a selected opportunity, and it's different from this one, show confirmation
    if (selectedOpportunity && selectedOpportunity.opportunityId !== oppId) {
      setConfirmingOppId(oppId);
    } else {
      handleSelect(oppId);
    }
  };

  const confirmSelection = async () => {
    if (confirmingOppId) {
      await handleSelect(confirmingOppId);
      setConfirmingOppId(null);
    }
  };

  const toggleCompare = (id: string) => {
    setSelectedToCompare(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  if (isComparing) {
    const comparingOpps = opportunities.filter(o => selectedToCompare.includes(o.id));
    return (
      <motion.div 
        variants={fadeIn}
        initial="initial"
        animate="animate"
        exit="exit"
        className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8"
      >
        <div>
          <Button variant="ghost" onClick={() => setIsComparing(false)} className={`mb-4 text-slate-500 hover:text-slate-800 ${dir === 'rtl' ? '-mr-4' : '-ml-4'}`}>
            <ArrowLeft className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2 rotate-180' : 'mr-2'}`} /> {t('opportunities.backToList')}
          </Button>
          <h1 className="text-2xl font-medium text-slate-800 tracking-tight flex items-center gap-2">
            <SplitSquareHorizontal className="text-emerald-500" />
            {t('opportunities.compareTitle')}
          </h1>
        </div>
        
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {comparingOpps.map((opp) => {
            const isSelected = selectedOpportunity?.opportunityId === opp.id;
            return (
              <motion.div variants={cardReveal} key={opp.id}>
                <Card className={`p-6 border-slate-200 shadow-sm rounded-2xl bg-white flex flex-col h-full hover:shadow-lg transition-all duration-300 ${isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'hover:-translate-y-1'}`}>
                  <div className="flex-1 space-y-4 mb-6">
                  <h2 className="text-xl font-bold text-slate-900">{opp.title}</h2>
                  <p className="text-slate-600 text-sm">{opp.description}</p>
                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    <div className="flex justify-between text-sm"><span className="text-slate-500">{t('opportunities.startupCost')}</span><span className="font-medium text-slate-900">{opp.startupCost}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">{t('opportunities.estRevenue')}</span><span className="font-medium text-emerald-600">{opp.estimatedRevenue}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">{t('opportunities.difficulty')}</span><span className="font-medium text-slate-900">{opp.difficulty}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">{t('opportunities.timeToMvp')}</span><span className="font-medium text-slate-900">{opp.timeToMVP}</span></div>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    <div className="flex justify-between text-sm"><span className="text-slate-500 flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-amber-500"/> {t('opportunities.oppScore')}</span><span className="font-bold text-slate-900">{opp.opportunityScore}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-blue-500"/> {t('opportunities.founderFit')}</span><span className="font-bold text-slate-900">{opp.founderFitScore}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-emerald-500"/> {t('opportunities.marketDemand')}</span><span className="font-bold text-slate-900">{opp.marketDemandScore}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-purple-500"/> {t('opportunities.aiAdvantage')}</span><span className="font-bold text-slate-900">{opp.aiAdvantageScore}</span></div>
                  </div>
                </div>
                <Button 
                  onClick={() => handleSelectClick(opp.id)} 
                  disabled={isSelected || isSelecting}
                  className={`w-full font-semibold mt-auto ${isSelected ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 cursor-default' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle className={`w-4 h-4 text-emerald-600 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                      {t('opportunities.activeConcept')}
                    </>
                  ) : (
                    <>
                      <CheckCircle className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                      {t('opportunities.selectIdea')}
                    </>
                  )}
                </Button>
              </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={fadeIn}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8"
    >
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-medium text-slate-800 tracking-tight flex items-center gap-2">
            <Radar className="text-emerald-500" />
            {t('opportunities.title')}
          </h1>
          <p className="text-slate-500 mt-1">{t('opportunities.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          {selectedToCompare.length > 1 && (
            <Button onClick={() => setIsComparing(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
              <SplitSquareHorizontal className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
              {t('opportunities.compare')} {selectedToCompare.length}
            </Button>
          )}
          {selectedOpportunity && (
              <Button 
              onClick={() => setActiveTab('business-plan')} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-2"
            >
              {t('opportunities.goToPlan')}
              <ChevronRight className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
            </Button>
          )}
        </div>
      </div>

      {/* Main List */}
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        {opportunities.map((opp) => {
          const isSelected = selectedOpportunity?.opportunityId === opp.id;
          return (
            <motion.div variants={fadeInUp} key={opp.id}>
            <Card className={`p-6 md:p-8 border-slate-200 shadow-sm rounded-2xl bg-white transition-all duration-300 hover:shadow-lg ${isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'hover:-translate-y-1'}`}>
              <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Left Column: Core Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start gap-4">
                    <Checkbox 
                      checked={selectedToCompare.includes(opp.id)} 
                      onCheckedChange={() => toggleCompare(opp.id)} 
                      className="mt-1.5 h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                    />
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-xl font-bold text-slate-900">{opp.title}</h2>
                        {isSelected && (
                          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> {t('opportunities.activeConcept')}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 mt-2">{opp.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold">{t('opportunities.startupCost')}</p>
                      <p className="font-medium text-slate-800">{opp.startupCost}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold">{t('opportunities.estRevenue')}</p>
                      <p className="font-medium text-slate-800 text-emerald-600">{opp.estimatedRevenue}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold">{t('opportunities.difficulty')}</p>
                      <p className="font-medium text-slate-800">{opp.difficulty}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold">{t('opportunities.timeToMvp')}</p>
                      <p className="font-medium text-slate-800">{opp.timeToMVP}</p>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-64 flex flex-col justify-between space-y-4 bg-slate-50 p-4 rounded-xl">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-1.5 text-slate-600 font-medium"><Trophy className="w-4 h-4 text-amber-500"/> {t('opportunities.oppScore')}</span>
                      <span className="font-bold text-slate-900">{opp.opportunityScore}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-1.5 text-slate-600 font-medium"><Users className="w-4 h-4 text-blue-500"/> {t('opportunities.founderFit')}</span>
                      <span className="font-bold text-slate-900">{opp.founderFitScore}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-1.5 text-slate-600 font-medium"><TrendingUp className="w-4 h-4 text-emerald-500"/> {t('opportunities.marketDemand')}</span>
                      <span className="font-bold text-slate-900">{opp.marketDemandScore}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-1.5 text-slate-600 font-medium"><Zap className="w-4 h-4 text-purple-500"/> {t('opportunities.aiAdvantage')}</span>
                      <span className="font-bold text-slate-900">{opp.aiAdvantageScore}</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleSelectClick(opp.id)}
                    disabled={isSelected || isSelecting}
                    className={`w-full font-semibold transition-colors ${isSelected ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 cursor-default' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle className={`w-4 h-4 text-emerald-600 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                        {t('opportunities.activeConcept')}
                      </>
                    ) : (
                      <>
                        <CheckCircle className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                        {t('opportunities.selectIdea')}
                      </>
                    )}
                  </Button>
                </div>

              </div>
            </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {selectedOpportunity && (
        <div className="flex justify-center pt-8 border-t border-slate-100">
          <Button 
            onClick={() => setActiveTab('business-plan')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-10 py-6 text-base font-semibold shadow-md flex items-center gap-2 group transition-all"
          >
            {t('opportunities.goToPlan')}
            <ChevronRight className={`w-4 h-4 transition-transform ${dir === 'rtl' ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
          </Button>
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
      {confirmingOppId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            variants={modalTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            className="max-w-md w-full"
          >
            <Card className="p-6 bg-white space-y-6 shadow-xl border-slate-200 rounded-2xl">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t('opportunities.modalTitle')}</h2>
              <p className="text-sm text-slate-500 mt-2">
                {t('opportunities.modalSubtitle')}
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" className="rounded-xl" onClick={() => setConfirmingOppId(null)}>{t('opportunities.modalCancel')}</Button>
              <Button onClick={confirmSelection} disabled={isSelecting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl px-5">
                {isSelecting ? t('opportunities.modalSelecting') : t('opportunities.modalConfirm')}
              </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}
