const fs = require('fs');

// --- 1. Patch useStore.ts ---
let storeCode = fs.readFileSync('apps/web/src/store/useStore.ts', 'utf8');

const interfaceAppend = `
  generateRoadmap: (projectId: string) => Promise<void>;
  updateTaskStatus: (projectId: string, taskId: string, status: string) => Promise<void>;
`;

storeCode = storeCode.replace('selectOpportunity: (projectId: string, opportunityId: string) => Promise<void>;', 'selectOpportunity: (projectId: string, opportunityId: string) => Promise<void>;' + interfaceAppend);

const generateRoadmapImpl = `
  generateRoadmap: async (projectId: string) => {
    const { user, currentProject } = get();
    if (!user || !currentProject) return;

    set({ loading: true, loadingMessage: 'Generating your custom execution roadmap...' });
    try {
      const res = await fetch(\`http://localhost:5000/api/execution/generate\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${user.token}\`
        },
        body: JSON.stringify({ projectId })
      });

      if (!res.ok) throw new Error('Failed to generate roadmap');
      
      const data = await res.json();
      
      if (data.roadmap) {
        set((state) => ({
          currentOutputs: {
            ...state.currentOutputs,
            roadmap: data.roadmap
          }
        }));
        
        // Refresh credit balance
        get().refreshUser();
      }
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateTaskStatus: async (projectId: string, taskId: string, status: string) => {
    const { user } = get();
    if (!user) return;
    
    // Optimistic UI update
    set((state) => {
      if (!state.currentOutputs?.roadmap) return state;
      
      const newRoadmap = { ...state.currentOutputs.roadmap };
      if (newRoadmap.phases) {
        newRoadmap.phases = newRoadmap.phases.map((p: any) => ({
          ...p,
          tasks: p.tasks.map((t: any) => t.id === taskId ? { ...t, status } : t)
        }));
      }
      return { currentOutputs: { ...state.currentOutputs, roadmap: newRoadmap } };
    });

    try {
      const res = await fetch(\`http://localhost:5000/api/execution/task/\${taskId}\`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${user.token}\`
        },
        body: JSON.stringify({ projectId, status })
      });

      if (!res.ok) throw new Error('Failed to update task');
      const data = await res.json();
      
      if (data.roadmap) {
         set((state) => ({
           currentOutputs: {
             ...state.currentOutputs,
             roadmap: data.roadmap
           }
         }));
      }
    } catch (error) {
      console.error(error);
    }
  },
`;

storeCode = storeCode.replace('selectOpportunity: async (projectId: string, opportunityId: string) => {', generateRoadmapImpl + '\n  selectOpportunity: async (projectId: string, opportunityId: string) => {');

fs.writeFileSync('apps/web/src/store/useStore.ts', storeCode);


// --- 2. Patch RoadmapPanel.tsx ---
let rpCode = fs.readFileSync('apps/web/src/components/RoadmapPanel.tsx', 'utf8');

const emptyStateRender = `
    return (
      <div className="flex flex-col items-center justify-center p-12 max-w-lg mx-auto text-center mt-20 border border-slate-200 rounded-3xl bg-white shadow-sm">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
          <Compass className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">No Roadmap Generated</h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          Your startup execution roadmap hasn't been created yet. Generate a prioritized 90-day execution plan tailored specifically to your chosen business model and the Egyptian market.
        </p>
        <button 
          onClick={() => {
            const state = useStore.getState();
            if (state.currentProject) {
              state.generateRoadmap(state.currentProject.id);
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-md active:scale-95"
        >
          Generate Execution Roadmap
        </button>
      </div>
    );
`;

rpCode = rpCode.replace('return <div className="text-slate-400 text-sm p-6 md:p-10 max-w-[1200px] mx-auto">No execution roadmap loaded.</div>;', emptyStateRender);

// Update ExecutionDashboard call to use updateTaskStatus
rpCode = rpCode.replace(
  'onUpdateTask={(id, status) => console.log(\'Task updated:\', id, status)}',
  'onUpdateTask={(id, status) => {\n            const state = useStore.getState();\n            if (state.currentProject) state.updateTaskStatus(state.currentProject.id, id, status);\n          }}'
);

fs.writeFileSync('apps/web/src/components/RoadmapPanel.tsx', rpCode);
console.log('Patched store and RoadmapPanel');
