'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Send, Sparkles, User, Brain, ExternalLink, Lightbulb, History, HistoryIcon, FileText, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIConsultantDashboard() {
  const { chatMessages, sendChatMessage, clearChat, chatLoading, currentProject } = useStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
              <h1 className="text-xl font-bold text-slate-800">AI Co-Founder</h1>
              <p className="text-sm text-slate-500">Your dedicated startup mentor and strategist</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {chatMessages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-indigo-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">How can I help you today?</h2>
              <p className="text-slate-500 mb-8">
                I can help you review your business plan, brainstorm marketing strategies, or act as a sounding board for your ideas.
              </p>
              
              <div className="grid grid-cols-1 gap-3 w-full">
                <button onClick={() => handleActionClick("Review my current business plan and suggest improvements")} className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left flex items-start gap-3 group">
                  <FileText className="w-5 h-5 text-indigo-400 mt-0.5 group-hover:text-indigo-600" />
                  <div>
                    <div className="font-semibold text-slate-700">Review Business Plan</div>
                    <div className="text-sm text-slate-500">Analyze current strategy and find gaps</div>
                  </div>
                </button>
                <button onClick={() => handleActionClick("What are the best marketing channels for my startup?")} className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left flex items-start gap-3 group">
                  <Megaphone className="w-5 h-5 text-indigo-400 mt-0.5 group-hover:text-indigo-600" />
                  <div>
                    <div className="font-semibold text-slate-700">Marketing Strategy</div>
                    <div className="text-sm text-slate-500">Identify the highest ROI channels</div>
                  </div>
                </button>
                <button onClick={() => handleActionClick("Draft a cold outreach email to potential investors")} className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left flex items-start gap-3 group">
                  <Send className="w-5 h-5 text-indigo-400 mt-0.5 group-hover:text-indigo-600" />
                  <div>
                    <div className="font-semibold text-slate-700">Draft Investor Email</div>
                    <div className="text-sm text-slate-500">Write a compelling cold outreach message</div>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            chatMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div 
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
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed prose prose-sm max-w-none ${
                      isUser 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                    }`}>
                      {/* Simple rendering for now, could add markdown support later */}
                      <div className="whitespace-pre-wrap">{msg.message}</div>
                    </div>

                    {!isUser && msg.ragSources && msg.ragSources.length > 0 && (
                      <div className="flex flex-wrap gap-2 items-center mt-2">
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
                </div>
              );
            })
          )}

          {chatLoading && (
            <div className="flex gap-4 max-w-[85%]">
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
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={chatLoading}
              placeholder="Ask your AI Co-founder anything..."
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
             <span className="text-xs text-slate-400">AI Co-founder has full context of your venture and documents.</span>
          </div>
        </div>
      </div>

      {/* Memory Side-panel */}
      <div className="w-80 bg-slate-50 flex flex-col hidden lg:flex">
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <HistoryIcon className="w-5 h-5 text-indigo-500" />
            Project Memory
          </div>
          <p className="text-xs text-slate-500 mt-1">Context actively used by AI</p>
        </div>
        
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Venture</h3>
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <div className="font-semibold text-sm text-slate-700">{currentProject.name}</div>
              <div className="text-xs text-slate-500 mt-1 capitalize">{currentProject.industry} Industry</div>
            </div>
          </div>
          
          <div className="space-y-2 mt-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Insights</h3>
            <div className="space-y-2">
              <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-indigo-900">
                  AI is optimizing responses for a Bootstrapped go-to-market strategy based on your profile.
                </p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg flex items-start gap-2">
                <Brain className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-emerald-900">
                  Memory synchronized with latest Business Plan generation.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mt-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Conversations</h3>
            {chatMessages.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No previous chats.</p>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 shadow-sm line-clamp-3">
                  {chatMessages[chatMessages.length - 1].message}
                </div>
                <button
                  onClick={() => clearChat()}
                  className="w-full py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 hover:border-indigo-300 text-indigo-600 rounded-lg text-xs font-semibold transition-colors shadow-sm"
                >
                  Start New Session
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
