'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  Send, Sparkles, User, Brain, ExternalLink, Lightbulb, 
  History as HistoryIcon, FileText, Megaphone, CheckCircle2, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Button, Card, CardContent } from './design-system';

export default function AIConsultantDashboard() {
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
    await sendChatMessage(msg);
  };

  const handleActionClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="h-[calc(100vh-64px)] md:h-screen flex bg-white font-sans text-gray-900">
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[rgba(60,64,67,0.12)] flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E8F0FE] flex items-center justify-center text-[#1A73E8]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-lg font-medium text-gray-900 tracking-tight">AI Strategy Consultant</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#34A853]"></span>
            Gemini 1.5 Pro
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-20 lg:px-40 py-8 space-y-8 custom-scrollbar">
          {chatMessages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center max-w-2xl mx-auto py-12">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1A73E8] to-[#c5221f] p-[2px] mb-8">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-[#1A73E8]" />
                </div>
              </div>
              <h2 className="text-3xl font-normal text-gray-900 mb-8 text-center tracking-tight">
                Hello. How can I help you grow <span className="font-semibold">{currentProject.name}</span> today?
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                {[
                  { icon: FileText, title: "Review Business Plan", desc: "Analyze current strategy and find gaps", prompt: "Review my current business plan and suggest improvements." },
                  { icon: Megaphone, title: "Marketing Strategy", desc: "Identify the highest ROI channels", prompt: "What are the best marketing channels for my startup?" },
                  { icon: Send, title: "Draft Investor Email", desc: "Write a compelling cold outreach", prompt: "Draft a cold outreach email to potential investors." },
                  { icon: Lightbulb, title: "Brainstorm Features", desc: "Find new product opportunities", prompt: "Brainstorm 3 new product features for my target audience." }
                ].map((action, i) => (
                  <button 
                    key={i}
                    onClick={() => handleActionClick(action.prompt)} 
                    className="p-4 rounded-2xl border border-[rgba(60,64,67,0.12)] hover:bg-[#F8FAFD] transition-colors text-left flex items-start gap-4 group"
                  >
                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                      <action.icon className="w-5 h-5 text-gray-600 group-hover:text-[#1A73E8]" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{action.title}</div>
                      <div className="text-sm text-gray-500 mt-0.5">{action.desc}</div>
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A73E8] to-[#A142F4] flex items-center justify-center flex-shrink-0 mt-1">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className={`space-y-3 max-w-[85%] ${isUser ? 'bg-[#F0F4F9] px-6 py-4 rounded-3xl rounded-tr-sm' : ''}`}>
                    {isUser ? (
                      <div className="whitespace-pre-wrap text-[15px] text-gray-900 font-medium">{msg.message}</div>
                    ) : (
                      <div className="prose prose-sm md:prose-base prose-slate max-w-none text-gray-800 leading-relaxed font-normal">
                        <ReactMarkdown>{msg.message}</ReactMarkdown>
                      </div>
                    )}

                    {!isUser && msg.ragSources && msg.ragSources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Retrieved Context
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {msg.ragSources.map((source, sIdx) => (
                            <span key={sIdx} className="text-xs text-gray-600 bg-gray-50 border border-[rgba(60,64,67,0.12)] px-2.5 py-1 rounded-md font-medium hover:bg-gray-100 cursor-pointer transition-colors flex items-center gap-1">
                              {source} <ExternalLink className="w-3 h-3" />
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}

          {chatLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A73E8] to-[#A142F4] flex items-center justify-center flex-shrink-0 mt-1">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div className="flex flex-col gap-3">
                {/* Gemini-style reasoning block */}
                <div className="bg-[#F8FAFD] border border-[rgba(60,64,67,0.12)] rounded-2xl p-4 w-64">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-[#1A73E8] animate-spin-slow" />
                    <span className="text-sm font-medium text-gray-700">Synthesizing strategy...</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-blue-100 rounded animate-pulse w-full"></div>
                    <div className="h-2 bg-blue-100 rounded animate-pulse w-3/4"></div>
                    <div className="h-2 bg-blue-100 rounded animate-pulse w-5/6"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="px-4 md:px-20 lg:px-40 pb-6 pt-2 bg-gradient-to-t from-white via-white to-transparent">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-center bg-[#F0F4F9] rounded-[32px] px-2 py-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={chatLoading}
                placeholder="Ask the Consultant anything..."
                className="w-full bg-transparent px-4 py-3 text-[15px] text-gray-900 placeholder-gray-500 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || chatLoading}
                className="flex-shrink-0 w-12 h-12 rounded-full bg-white text-gray-400 disabled:opacity-50 flex items-center justify-center transition-colors shadow-sm border border-gray-100 hover:text-[#1A73E8] hover:bg-blue-50"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </div>
          </form>
          <div className="text-center mt-3">
             <span className="text-xs text-gray-400">Gemini may display inaccurate info, including about people, so double-check its responses.</span>
          </div>
        </div>
      </div>

      {/* Memory Side-panel */}
      <div className="w-80 bg-white border-l border-[rgba(60,64,67,0.12)] flex flex-col hidden lg:flex">
        <div className="p-4 border-b border-[rgba(60,64,67,0.12)] flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900 font-medium">
            <HistoryIcon className="w-4 h-4 text-gray-500" />
            Project Memory
          </div>
          <Button variant="outline" size="sm" onClick={() => clearChat()} className="text-xs h-7 px-2 border-gray-200">
            New Chat
          </Button>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto space-y-6">
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Context</h3>
            <div className="bg-[#F8FAFD] p-3 rounded-xl border border-[rgba(60,64,67,0.12)]">
              <div className="font-semibold text-sm text-gray-900">{currentProject.name}</div>
              <div className="text-xs text-gray-500 mt-1 capitalize">{currentProject.industry} Industry</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Reasoning Engine</h3>
            <div className="space-y-2">
              <div className="bg-[#e6f4ea] p-3 rounded-xl flex items-start gap-2 border border-[#ceead6]">
                <Brain className="w-4 h-4 text-[#137333] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[#137333] font-medium leading-relaxed">
                  Memory synchronized with Business Plan and Financial Engine outputs.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 pt-2 border-t border-[rgba(60,64,67,0.12)]">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Recent Activity</h3>
            {conversations.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No previous chats.</p>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv, idx) => (
                  <button
                    key={conv.id || `conv-${idx}`}
                    onClick={() => setActiveConversation(conv.id)}
                    className={`w-full text-left text-sm p-3 rounded-xl transition-colors group flex items-center justify-between ${
                      activeConversationId === conv.id 
                        ? 'bg-[#E8F0FE] text-[#1A73E8] font-medium' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="line-clamp-1 flex-1 pr-2">{conv.title || 'Conversation...'}</div>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity" />
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
