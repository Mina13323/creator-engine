import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { adminClient } from '@/lib/adminClient';
import { Search, Users, Folder, X, Eye, Loader2 } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all searchable items when palette opens
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setQuery('');
      Promise.all([
        adminClient.get('/users'),
        adminClient.get('/projects'),
      ])
        .then(([usersData, projectsData]) => {
          setUsers(usersData || []);
          setProjects(projectsData || []);
        })
        .catch((err) => console.error('Command palette failed to prefetch data:', err))
        .finally(() => {
          setLoading(false);
          // Autofocus input
          setTimeout(() => inputRef.current?.focus(), 50);
        });
    }
  }, [isOpen]);

  // ponytail: native dialog handles Escape and backdrop natively
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (isOpen) { el.showModal(); } else { el.close(); }
  }, [isOpen]);

  // Filter items
  const filteredUsers = query
    ? users.filter(
        (u) =>
          u.name?.toLowerCase().includes(query.toLowerCase()) ||
          u.email?.toLowerCase().includes(query.toLowerCase()) ||
          u.role?.toLowerCase().includes(query.toLowerCase())
      )
    : users.slice(0, 5);

  const filteredProjects = query
    ? projects.filter(
        (p) =>
          p.name?.toLowerCase().includes(query.toLowerCase()) ||
          p.industry?.toLowerCase().includes(query.toLowerCase()) ||
          p.status?.toLowerCase().includes(query.toLowerCase())
      )
    : projects.slice(0, 5);

  const handleSelectUser = (user: any) => {
    onClose();
    router.push(`/admin/users?email=${encodeURIComponent(user.email)}`);
  };

  const handleSelectProject = (project: any) => {
    onClose();
    router.push(`/admin/projects?id=${encodeURIComponent(project.id)}`);
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 m-auto mt-[15vh] p-0 bg-transparent border-0 backdrop:bg-slate-950/80 backdrop:backdrop-blur-md w-full max-w-2xl rounded-2xl shadow-2xl"
    >
      <div className="bg-[#0b0f19] border border-slate-850 w-full rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Search Input bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-850 bg-[#0c1222]">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search platform creators, email, role, projects, industry..."
            className="w-full bg-transparent border-0 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-0"
          />
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-500 shrink-0" />
          ) : (
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results layout */}
        <div className="max-h-[380px] overflow-y-auto p-4 space-y-5 custom-scrollbar">
          {query === '' && (
            <div className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider mb-2">
              Recent Activity Quick List
            </div>
          )}

          {/* Creators Section */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Creators ({filteredUsers.length})
            </div>
            
            <div className="space-y-1">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900/60 border border-transparent hover:border-slate-850/60 cursor-pointer group transition-all"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                      {user.name || 'Unnamed Creator'}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">{user.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                      user.role === 'admin'
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                    }`}>
                      {user.role}
                    </span>
                    {user.isBanned && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-450 border border-rose-500/20">
                        Banned
                      </span>
                    )}
                    <Eye className="w-3.5 h-3.5 text-slate-650 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-xs text-slate-500 italic p-1.5">No creators found matching request.</div>
              )}
            </div>
          </div>

          {/* Projects Section */}
          <div className="space-y-2 pt-2 border-t border-slate-900">
            <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5" />
              Projects ({filteredProjects.length})
            </div>

            <div className="space-y-1">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleSelectProject(project)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900/60 border border-transparent hover:border-slate-850/60 cursor-pointer group transition-all"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                      {project.name || 'Unnamed Venture'}
                    </span>
                    <span className="text-[10px] text-slate-500 block capitalize">{project.industry}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                      project.isFlagged
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {project.isFlagged ? 'Flagged' : project.status}
                    </span>
                    <Eye className="w-3.5 h-3.5 text-slate-650 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
              {filteredProjects.length === 0 && (
                <div className="text-xs text-slate-500 italic p-1.5">No projects found matching request.</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 border-t border-slate-900 bg-slate-950/60 flex items-center justify-between text-[9px] font-mono text-slate-500">
          <span>Search or navigate with keyboard</span>
          <div className="flex items-center gap-2">
            <span><kbd className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">ESC</kbd> to close</span>
            <span><kbd className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">⏎</kbd> to select</span>
          </div>
        </div>
      </div>
    </dialog>
  );
}
