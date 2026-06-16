'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, Archive, Trash2, AlertTriangle } from 'lucide-react';

export default function ProjectSettingsModal({ onClose }: { onClose: () => void }) {
  const { currentProject, archiveProject, restoreProject, deleteProject } = useStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!currentProject) return null;

  const isArchived = currentProject.status === 'archived';

  const handleArchiveToggle = async () => {
    setIsProcessing(true);
    if (isArchived) {
      await restoreProject(currentProject.id);
    } else {
      await archiveProject(currentProject.id);
    }
    setIsProcessing(false);
    onClose();
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    await deleteProject(currentProject.id);
    setIsProcessing(false);
    onClose();
  };

  if (showDeleteConfirm) {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
          <div className="p-8">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-6">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Delete Project</h3>
            <p className="text-red-600 font-bold mb-4">This action cannot be undone.</p>
            
            <p className="text-slate-600 mb-4 font-medium">The following will be deleted:</p>
            <ul className="list-disc list-inside text-sm text-slate-500 mb-8 space-y-1">
              <li>Founder Profile</li>
              <li>Opportunities</li>
              <li>Selected Opportunity</li>
              <li>Business Plan</li>
              <li>Financial Forecast</li>
              <li>Branding Assets</li>
              <li>Marketing Plans</li>
              <li>Pitch Decks</li>
              <li>Roadmaps</li>
              <li>Uploaded Documents</li>
              <li>Knowledge Vectors</li>
            </ul>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isProcessing}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={isProcessing}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                {isProcessing ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Project Settings</h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-sm font-bold text-slate-900 mb-1">Project Name</h4>
            <p className="text-slate-600">{currentProject.name}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleArchiveToggle}
              disabled={isProcessing}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all group disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isArchived ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                  <Archive className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-900">{isArchived ? 'Restore Project' : 'Archive Project'}</div>
                  <div className="text-xs text-slate-500">
                    {isArchived ? 'Make this project active again' : 'Hide from active workspace'}
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-red-100 hover:border-red-200 hover:bg-red-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-red-600">Delete Project</div>
                  <div className="text-xs text-red-500">Permanently remove all data</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
