'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Send, Sparkles, User, Brain, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../lib/motion-presets';

export default function CofounderChat() {
  const { chatMessages, sendChatMessage, chatLoading, currentProject } = useStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  if (!currentProject) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatLoading) return;
    const msg = input;
    setInput('');
    await sendChatMessage(msg);
  };

  return (
    <div className="h-full flex flex-col justify-between bg-slate-950/40 border-l border-white/5 relative">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/10 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500"></span>
            <Brain className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-none">CEO Copilot</h3>
            <span className="text-[9px] text-slate-400 font-medium mt-1 block">Context-aware RAG active</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <motion.div 
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center p-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <h4 className="text-xs font-bold text-slate-200">Start Brainstorming</h4>
            <p className="text-[10px] text-slate-500 max-w-[200px] leading-relaxed mt-1">
              Ask about Egypt market sizing, custom pricing tiers, or request drafts for cold outreach emails.
            </p>
          </div>
          ) : (
          chatMessages.map((msg) => {
            if (!msg) return null;
            const isUser = msg.sender === 'user';
            return (
              <motion.div 
                variants={fadeInUp}
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs border ${
                  isUser 
                    ? 'border-blue-500/30 bg-blue-600/10 text-blue-400' 
                    : 'border-emerald-500/30 bg-emerald-600/10 text-emerald-400'
                }`}>
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Brain className="w-3.5 h-3.5" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-1.5">
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    isUser 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-slate-900 border border-white/5 text-slate-100 rounded-tl-none'
                  }`}>
                    {msg.message}
                  </div>

                  {/* RAG Sources Citations */}
                  {!isUser && msg.ragSources && msg.ragSources.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-[9px] text-slate-500 mr-1">RAG citation:</span>
                      {msg.ragSources.map((source, sIdx) => (
                        <span key={sIdx} className="text-[9px] text-blue-400 border border-blue-500/10 bg-blue-500/5 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-medium">
                          {source} <ExternalLink className="w-2 h-2" />
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}

        {/* Loading Indicator */}
        {chatLoading && (
          <motion.div variants={fadeInUp} className={`flex gap-2.5 max-w-[85%]`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs border border-emerald-500/30 bg-emerald-600/10 text-emerald-400`}>
              <Brain className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-white/5 text-xs text-slate-400 rounded-tl-none flex items-center gap-1.5">
              <span>Cofounder typing</span>
              <span className="flex gap-0.5 items-center">
                <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </motion.div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-white/5 bg-slate-900/10 backdrop-blur-md sticky bottom-0">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={chatLoading}
            placeholder="Discuss launch strategy..."
            className="w-full pl-3 pr-10 py-2.5 glass-input text-xs"
          />
          <button
            type="submit"
            disabled={!input.trim() || chatLoading}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white flex items-center justify-center transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
