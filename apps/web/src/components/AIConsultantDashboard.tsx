'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  Send, Sparkles, User, Brain, ExternalLink, Lightbulb, 
  History as HistoryIcon, FileText, Megaphone, CheckCircle2, ChevronRight,
  ArrowUp, CornerDownLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Button, Card, CardContent } from './design-system';

export default function AIConsultantDashboard() {
  const { chatMessages, sendChatMessage, clearChat, chatLoading, currentProject, conversations, setActiveConversation, loadConversations, activeConversationId } = useStore();
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (currentProject) {
      loadConversations(currentProject.id);
    }
  }, [currentProject, loadConversations]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 bg-[#F8FAFD]">
        Please select a project to consult the AI.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatLoading) return;
    const msg = input;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await sendChatMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleActionClick = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  const formatTime = (date?: string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-[calc(100vh-64px)] md:h-screen flex bg-white font-sans text-gray-900">
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header — refined with subtle depth */}
        <div className="px-6 py-3.5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1A73E8] to-[#4f9cf7] flex items-center justify-center shadow-sm shadow-blue-200/50">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-[15px] font-semibold text-gray-900 tracking-tight leading-tight">AI Strategy Consultant</h1>
              <span className="text-[11px] text-gray-400 font-medium">{currentProject.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium bg-gray-50 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Gemini 1.5 Pro
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-16 lg:px-28 xl:px-36 py-8 space-y-6 custom-scrollbar">
          {chatMessages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center max-w-2xl mx-auto py-12">
              {/* Welcome icon */}
              <div className="relative mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1A73E8] to-[#7c3aed] flex items-center justify-center shadow-lg shadow-blue-200/40">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center tracking-tight">
                How can I help you today?
              </h2>
              <p className="text-sm text-gray-400 mb-10 text-center max-w-md">
                I have full context of <span className="font-medium text-gray-600">{currentProject.name}</span> — including your business plan, financials, and market research.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl">
                {[
                  { icon: FileText, title: "Review Business Plan", desc: "Analyze strategy and find gaps", prompt: "Review my current business plan and suggest improvements." },
                  { icon: Megaphone, title: "Marketing Strategy", desc: "Identify highest ROI channels", prompt: "What are the best marketing channels for my startup?" },
                  { icon: Send, title: "Draft Investor Email", desc: "Write compelling cold outreach", prompt: "Draft a cold outreach email to potential investors." },
                  { icon: Lightbulb, title: "Brainstorm Features", desc: "Find new product opportunities", prompt: "Brainstorm 3 new product features for my target audience." }
                ].map((action, i) => (
                  <button 
                    key={i}
                    onClick={() => handleActionClick(action.prompt)} 
                    className="p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200 text-left flex items-start gap-3.5 group"
                  >
                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-100/60 transition-colors flex-shrink-0">
                      <action.icon className="w-4 h-4 text-gray-500 group-hover:text-[#1A73E8] transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-gray-900">{action.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{action.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            chatMessages.map((msg) => {
              if (!msg) return null;
              const isUser = msg.sender === 'user';
              
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* AI Avatar */}
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1A73E8] to-[#7c3aed] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}

                  <div className={`space-y-1 max-w-[80%] min-w-0`}>
                    {/* Message content */}
                    {isUser ? (
                      <div className="bg-[#1A73E8] text-white px-5 py-3.5 rounded-2xl rounded-br-md text-[15px] leading-relaxed font-normal whitespace-pre-wrap shadow-sm shadow-blue-200/30">
                        {msg.message}
                      </div>
                    ) : (
                      <div className="bg-gray-50/80 border border-gray-100 px-5 py-4 rounded-2xl rounded-tl-md">
                        <div className="prose prose-sm prose-slate max-w-none text-gray-800 leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5 [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_code]:text-xs [&_code]:bg-gray-200/60 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_strong]:text-gray-900">
                          <ReactMarkdown>{msg.message}</ReactMarkdown>
                        </div>
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className={`flex items-center gap-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      {(msg as any).createdAt && (
                        <span className="text-[10px] text-gray-300 font-medium">{formatTime((msg as any).createdAt)}</span>
                      )}
                    </div>

                    {/* RAG Sources */}
                    {!isUser && msg.ragSources && msg.ragSources.length > 0 && (
                      <div className="mt-2 pt-3 border-t border-gray-100 flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Retrieved Context
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.ragSources.map((source, sIdx) => (
                            <span key={sIdx} className="text-[11px] text-gray-500 bg-white border border-gray-100 px-2 py-1 rounded-md font-medium hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 cursor-pointer transition-all flex items-center gap-1">
                              {source} <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5 text-white">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </motion.div>
              );
            })
          )}

          {/* Loading state */}
          {chatLoading && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1A73E8] to-[#7c3aed] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
              </div>
              <div className="bg-gray-50/80 border border-gray-100 rounded-2xl rounded-tl-md px-5 py-4 max-w-xs">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                  <span className="text-sm font-medium text-gray-600">Analyzing context...</span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200/80 rounded-full animate-pulse w-full"></div>
                  <div className="h-2 bg-gray-200/80 rounded-full animate-pulse w-4/5"></div>
                  <div className="h-2 bg-gray-200/80 rounded-full animate-pulse w-3/5"></div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input Area — elevated, premium feel */}
        <div className="px-4 md:px-16 lg:px-28 xl:px-36 pb-5 pt-2 bg-gradient-to-t from-white via-white/95 to-transparent">
          <form onSubmit={handleSubmit} className="relative">
            <div className={`relative flex items-end bg-white border rounded-2xl shadow-sm transition-all duration-200 ${
              isFocused 
                ? 'border-blue-300 shadow-[0_0_0_3px_rgba(26,115,232,0.08)] ring-0' 
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                disabled={chatLoading}
                rows={1}
                placeholder="Ask the Consultant anything..."
                className="w-full bg-transparent px-5 py-4 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-50 resize-none leading-relaxed max-h-40"
              />
              <div className="flex items-center gap-1.5 px-3 pb-3 flex-shrink-0">
                <div className="hidden sm:flex items-center gap-1 text-[10px] text-gray-300 font-medium mr-1">
                  <CornerDownLeft className="w-3 h-3" /> Enter
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || chatLoading}
                  className="w-9 h-9 rounded-xl bg-[#1A73E8] hover:bg-[#1567d3] text-white disabled:opacity-30 disabled:bg-gray-300 flex items-center justify-center transition-all duration-150 shadow-sm"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
          <div className="text-center mt-2.5">
             <span className="text-[11px] text-gray-300">AI may generate inaccurate responses. Verify important information.</span>
          </div>
        </div>
      </div>

      {/* Memory Side-panel */}
      <div className="w-72 bg-gray-50/50 border-l border-gray-100 flex flex-col hidden lg:flex">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-700 font-semibold">
            <HistoryIcon className="w-4 h-4 text-gray-400" />
            Memory
          </div>
          <Button variant="outline" size="sm" onClick={() => clearChat()} className="text-[11px] h-7 px-2.5 border-gray-200 rounded-lg font-medium">
            New Chat
          </Button>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto space-y-5">
          {/* Project Context */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Project</h3>
            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
              <div className="font-semibold text-sm text-gray-900">{currentProject.name}</div>
              <div className="text-[11px] text-gray-400 mt-1 capitalize">{currentProject.industry} Industry</div>
            </div>
          </div>
          
          {/* Reasoning Engine Status */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Engine Status</h3>
            <div className="bg-emerald-50 p-3 rounded-xl flex items-start gap-2 border border-emerald-100">
              <Brain className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">
                Memory synced with Business Plan and Financial Engine outputs.
              </p>
            </div>
          </div>
          
          {/* Conversation History */}
          <div className="space-y-2 pt-3 border-t border-gray-100">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">History</h3>
            {conversations.length === 0 ? (
              <p className="text-[11px] text-gray-300 italic">No previous chats.</p>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv: any, idx: number) => (
                  <button
                    key={conv.id || `conv-${idx}`}
                    onClick={() => setActiveConversation(conv.id)}
                    className={`w-full text-left text-[13px] p-2.5 rounded-lg transition-all duration-150 group flex items-center justify-between ${
                      activeConversationId === conv.id 
                        ? 'bg-blue-50 text-[#1A73E8] font-medium border border-blue-100' 
                        : 'text-gray-500 hover:bg-white hover:text-gray-700 hover:shadow-sm'
                    }`}
                  >
                    <div className="line-clamp-1 flex-1 pr-2">{conv.title || 'Conversation...'}</div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-gray-300 transition-opacity flex-shrink-0" />
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
