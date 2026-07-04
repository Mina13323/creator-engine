'use client';

import React from 'react';
import { useStore } from '../store/useStore';
import { X, Rocket } from 'lucide-react';

export default function NewProjectModal({ onClose }: { onClose: () => void }) {
  const { resetProjectState } = useStore();

  const handleCreate = () => {
    resetProjectState();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
            <Rocket className="w-6 h-6" />
          </div>

          <h3 className="text-2xl font-bold text-slate-900 mb-2">Create New Venture</h3>
          <p className="text-slate-600 mb-6 leading-relaxed">
            You are about to start a new venture. Your current venture data will remain saved and accessible in your workspace.
          </p>

          <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 mb-8">
            <p className="text-sm text-slate-700 font-medium">Would you like to create a new project?</p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreate}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
            >
              Create Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
