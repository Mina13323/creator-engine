'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ChevronDown, Check, Archive, Plus, Settings } from 'lucide-react';
import ProjectSettingsModal from './ProjectSettingsModal';
import NewProjectModal from './NewProjectModal';

export default function ProjectSwitcher() {
  const { projects, currentProject, selectProject } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);

  const activeProjects = projects.filter(p => p.status !== 'archived');
  const archivedProjects = projects.filter(p => p.status === 'archived');

  return (
    <div className="relative mb-6">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer group border border-transparent hover:border-slate-200 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
            {currentProject ? currentProject.name.charAt(0).toUpperCase() : '?'}
          </div>
          <span className="text-sm font-semibold text-slate-700 truncate max-w-[120px]">
            {currentProject ? currentProject.name : 'Select Project'}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-2 max-h-[300px] overflow-y-auto">
          <div className="px-3 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Active Projects</div>
          {activeProjects.map(p => (
            <div 
              key={p.id}
              className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm"
              onClick={() => {
                selectProject(p.id);
                setIsOpen(false);
              }}
            >
              <div className="flex items-center gap-2 text-slate-700">
                <span className="truncate">{p.name}</span>
              </div>
              {currentProject?.id === p.id && <Check className="w-4 h-4 text-emerald-500" />}
            </div>
          ))}

          {archivedProjects.length > 0 && (
            <>
              <div className="px-3 pt-3 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100 mt-2">Archived Projects</div>
              {archivedProjects.map(p => (
                <div 
                  key={p.id}
                  className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-500"
                  onClick={() => {
                    selectProject(p.id);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Archive className="w-3 h-3" />
                    <span className="truncate">{p.name}</span>
                  </div>
                  {currentProject?.id === p.id && <Check className="w-4 h-4 text-emerald-500" />}
                </div>
              ))}
            </>
          )}

          <div className="border-t border-slate-100 mt-2 pt-2">
            {currentProject && (
              <div 
                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-600"
                onClick={() => {
                  setShowSettings(true);
                  setIsOpen(false);
                }}
              >
                <Settings className="w-4 h-4" />
                <span>Project Settings</span>
              </div>
            )}
            <div 
              className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm text-emerald-600 font-medium"
              onClick={() => {
                setShowNewProject(true);
                setIsOpen(false);
              }}
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </div>
          </div>
        </div>
      )}

      {showSettings && <ProjectSettingsModal onClose={() => setShowSettings(false)} />}
      {showNewProject && <NewProjectModal onClose={() => setShowNewProject(false)} />}
    </div>
  );
}
