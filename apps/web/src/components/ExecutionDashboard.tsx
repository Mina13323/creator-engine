import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ExecutionTask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'doing' | 'done';
}

export interface ExecutionPhase {
  id: string;
  name: string;
  tasks: ExecutionTask[];
}

export interface ExecutionDashboardProps {
  roadmap: {
    progress: number;
    phases: ExecutionPhase[];
  };
  onUpdateTask: (taskId: string, status: string) => void;
  aiSuggestions?: string[];
}

export const ExecutionDashboard = ({ roadmap, onUpdateTask, aiSuggestions = [] }: ExecutionDashboardProps) => {
  const { progress, phases } = roadmap;
  
  // Find current phase based on first phase with incomplete tasks
  const currentPhase = phases.find(p => p.tasks.some(t => t.status !== 'done')) || phases[phases.length - 1];
  
  // Find today's focus (first doing/todo task in current phase)
  const todaysFocus = currentPhase?.tasks.find(t => t.status === 'doing') || currentPhase?.tasks.find(t => t.status === 'todo');

  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  
  const pendingTasks = currentPhase?.tasks.filter(t => t.status !== 'done') || [];
  const completedTasks = currentPhase?.tasks.filter(t => t.status === 'done') || [];

  const displayTasks = activeTab === 'pending' ? pendingTasks : completedTasks;

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
      
      {/* Top Section: Progress & Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Progress Card */}
        <div className="col-span-2 bg-[#1A1D24] border border-white/10 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
          <h2 className="text-xl font-medium text-white mb-2">Startup Progress</h2>
          <div className="flex items-end gap-4 mb-6">
            <span className="text-5xl font-bold text-white tracking-tight">{progress}%</span>
            <span className="text-gray-400 mb-1 font-medium tracking-wide uppercase text-sm">Completed</span>
          </div>
          
          <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden shadow-inner">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${progress}%` }} 
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-[#008465] via-[#00b37e] to-[#2e403d] rounded-full" 
            />
          </div>
          
          <div className="mt-6 flex justify-between items-center text-sm text-gray-400">
            <span>Current Phase: <strong className="text-white ml-1">{currentPhase?.name}</strong></span>
            <span>{phases.length} Phases Total</span>
          </div>
        </div>

        {/* AI Suggestions Card */}
        <div className="bg-gradient-to-br from-emerald-900/40 to-[#2e403d]/40 border border-emerald-500/20 rounded-3xl p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/20 rounded-xl">
              <span className="text-indigo-400 text-xl">✧</span>
            </div>
            <h3 className="text-white font-medium">AI Suggestions</h3>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            {aiSuggestions.length > 0 ? (
              <ul className="space-y-4">
                {aiSuggestions.map((sug, idx) => (
                  <motion.li 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    key={idx} 
                    className="text-indigo-100 text-sm flex gap-3"
                  >
                    <span className="text-indigo-400 mt-0.5">•</span>
                    <span className="leading-relaxed">{sug}</span>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-indigo-200/50 text-sm italic text-center">Your execution is on track. Keep going.</p>
            )}
          </div>
        </div>
      </div>

      {/* Today's Focus */}
      {todaysFocus && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-center justify-between shadow-lg shadow-emerald-500/5"
        >
          <div>
            <h4 className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">Today&apos;s Focus</h4>
            <h3 className="text-xl font-medium text-white">{todaysFocus.title}</h3>
          </div>
          <button 
            onClick={() => onUpdateTask(todaysFocus.id, 'done')}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-all active:scale-95"
          >
            Mark Complete
          </button>
        </motion.div>
      )}

      {/* Tasks Section */}
      <div className="bg-[#1A1D24] border border-white/10 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-medium text-white">Execution Tasks</h2>
          <div className="flex bg-black/40 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'pending' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-300'}`}
            >
              Pending ({pendingTasks.length})
            </button>
            <button 
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'completed' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-300'}`}
            >
              Completed ({completedTasks.length})
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {displayTasks.map((task) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                key={task.id} 
                className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all"
              >
                <button 
                  onClick={() => onUpdateTask(task.id, task.status === 'done' ? 'todo' : 'done')}
                  className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    task.status === 'done' 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-500 hover:border-gray-400'
                  }`}
                >
                  {task.status === 'done' && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className={`text-base font-medium ${task.status === 'done' ? 'text-gray-400 line-through' : 'text-white'}`}>
                      {task.title}
                    </h4>
                    {task.priority === 'high' && task.status !== 'done' && (
                      <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-wider rounded-md border border-red-500/20">High Priority</span>
                    )}
                  </div>
                  <p className={`text-sm ${task.status === 'done' ? 'text-gray-600' : 'text-gray-400'}`}>
                    {task.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {displayTasks.length === 0 && (
            <div className="py-12 text-center text-gray-500 italic">
              No tasks to display.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
