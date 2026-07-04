// @ts-nocheck
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Send, Sparkles, User, Brain, ExternalLink, Lightbulb, History, HistoryIcon, FileText, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, fadeIn, staggerContainer } from '../lib/motion-presets';
import ReactMarkdown from 'react-markdown';
import { SpeakButton } from './ui/SpeakButton';
import { useI18n } from '../lib/i18n/I18nContext';

export default function AIConsultantDashboard() {
  const { t } = useI18n();
  const { chatMessages, sendChatMessage, clearChat, chatLoading, currentProject, conversations, setActiveConversation, loadConversations, activeConversationId } = useStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentProject) {
      loadConversations(currentProject.id);
    }
  }, [currentProject, loadConversations]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        Please select a project to consult the AI.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatLoading) return;
    const msg = input;
    setInput('');
    await sendChatMessage(msg);
  };

  const handleActionClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="h-[calc(100vh-64px)] md:h-screen flex bg-[#FDFDFD]">
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200">
        <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">{t('projectMemory.ceoCopilot')}</h1>
              <p className="text-sm text-slate-500">{t('projectMemory.ceoCopilotDesc')}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <motion.div 
          className="flex-1 overflow-y-auto p-6 space-y-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {chatMessages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full text-center space-y-6">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center transform -rotate-6">
              <Sparkles className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-800">{t('consultant.greeting')}</h2>
              <p className="text-slate-500 max-w-lg">
                {t('consultant.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 w-full gap-3 mt-8">
              <button 
                onClick={() => setInput('Review my business plan and suggest improvements.')}
                className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all text-left flex items-start gap-4 group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{t('consultant.reviewPlan')}</h3>
                  <p className="text-sm text-slate-500">{t('consultant.reviewPlanDesc')}</p>
                </div>
              </button>

              <button 
                onClick={() => setInput('What are the best marketing channels for my business?')}
                className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all text-left flex items-start gap-4 group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{t('consultant.marketingStrategy')}</h3>
                  <p className="text-sm text-slate-500">{t('consultant.marketingStrategyDesc')}</p>
                </div>
              </button>

              <button 
                onClick={() => setInput('Draft a cold outreach email to a potential investor.')}
                className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all text-left flex items-start gap-4 group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{t('consultant.draftEmail')}</h3>
                  <p className="text-sm text-slate-500">{t('consultant.draftEmailDesc')}</p>
                </div>
              </button>
            </div>
          </div>
          ) : (
            chatMessages.map((msg) => {
              if (!msg) return null;
              const isUser = msg.sender === 'user';
              return (
                <motion.div 
                  variants={fadeInUp}
                  key={msg.id}
                  className={`flex gap-4 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${
                    isUser 
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-600' 
                      : 'border-emerald-200 bg-emerald-50 text-emerald-600'
                  }`}>
                    {isUser ? <User className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
                  </div>

                  <div className="space-y-2 max-w-full">
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      isUser 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                    }`}>
                      {isUser ? (
                        <div className="whitespace-pre-wrap">{msg.message}</div>
                      ) : (
                        <div className="prose prose-sm max-w-none text-slate-700">
                          <ReactMarkdown>{msg.message}</ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {!isUser && (
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <SpeakButton text={msg.message} size="sm" label="Listen" />
                        
                        {msg.ragSources && msg.ragSources.length > 0 && (
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" /> Sources:
                            </span>
                            {msg.ragSources.map((source, sIdx) => (
                              <span key={sIdx} className="text-xs text-emerald-600 border border-emerald-200 bg-emerald-50 px-2 py-1 rounded-md font-medium">
                                {source}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}

          {chatLoading && (
            <motion.div variants={fadeInUp} className="flex gap-4 max-w-[85%]">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border border-emerald-200 bg-emerald-50 text-emerald-600 flex-shrink-0">
                <Brain className="w-5 h-5 animate-pulse" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm rounded-tl-none flex items-center gap-2">
                <span className="text-sm text-slate-500">Co-founder is thinking</span>
                <span className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </motion.div>

        {/* Input Form */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={chatLoading}
              placeholder={t('projectMemory.askCopilot')}
              className="w-full pl-5 pr-14 py-4 rounded-full border border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-slate-700 placeholder-slate-400 shadow-sm transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || chatLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center justify-center transition-colors shadow-sm"
            >
              <Send className="w-5 h-5 -ml-0.5" />
            </button>
          </form>
          <div className="text-center mt-2">
             <span className="text-xs text-slate-400">{t('projectMemory.fullContext')}</span>
          </div>
        </div>
      </div>

      {/* Memory Side-panel */}
      <div className="w-80 bg-slate-50 flex flex-col hidden lg:flex">
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <HistoryIcon className="w-5 h-5 text-indigo-500" />
            {t('projectMemory.title')}
          </div>
          <p className="text-xs text-slate-500 mt-1">{t('projectMemory.contextActivelyUsed')}</p>
        </div>
        
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('projectMemory.currentVenture')}</h3>
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <div className="font-semibold text-sm text-slate-700">{currentProject.name}</div>
              <div className="text-xs text-slate-500 mt-1 capitalize">{currentProject.industry || t('projectMemory.unknownIndustry')}</div>
            </div>
          </div>
          
          <div className="space-y-2 mt-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('projectMemory.keyInsights')}</h3>
            <div className="space-y-2">
              <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-indigo-900">
                  {t('projectMemory.insight1')}
                </p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg flex items-start gap-2">
                <Brain className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-emerald-900">
                  {t('projectMemory.insight2')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mt-4 flex-1 overflow-y-auto">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('projectMemory.recentConversations')}</h3>
            <button
              onClick={() => clearChat()}
              className="w-full py-2 px-3 mb-3 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              {t('projectMemory.startNewSession')}
            </button>
            
            {conversations.length === 0 ? (
              <p className="text-xs text-slate-500 italic">{t('projectMemory.noPreviousChats')}</p>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv, idx) => (
                  <button
                    key={conv.id || `conv-${idx}`}
                    onClick={() => setActiveConversation(conv.id)}
                    className={`w-full text-left text-xs p-3 rounded-lg border shadow-sm transition-colors ${
                      activeConversationId === conv.id 
                        ? 'bg-indigo-600 text-white border-indigo-700' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-indigo-300'
                    }`}
                  >
                    <div className="line-clamp-2">{conv.title || 'Conversation...'}</div>
                    <div className={`mt-1 text-[10px] ${activeConversationId === conv.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
