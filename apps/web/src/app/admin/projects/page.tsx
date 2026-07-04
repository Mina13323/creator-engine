'use client';

import { useEffect, useState } from 'react';
import { adminClient } from '@/lib/adminClient';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  AlertTriangle, 
  Flag,
  Calendar,
  Layers
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface CreatorInfo {
  id: string;
  name?: string;
  email: string;
}

interface ProjectWithCreator {
  id: string;
  userId: string;
  name: string;
  description: string;
  industry: string;
  status: 'draft' | 'idea' | 'validated' | 'branded' | 'marketing-ready' | 'active' | 'archived';
  selectedOpportunityId?: string;
  isFlagged?: boolean;
  flagReason?: string;
  createdAt: string;
  updatedAt: string;
  creator: CreatorInfo | null;
  plan: string;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [editingProject, setEditingProject] = useState<ProjectWithCreator | null>(null);
  const [deletingProject, setDeletingProject] = useState<ProjectWithCreator | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editIndustry, setEditIndustry] = useState('');
  const [editStatus, setEditStatus] = useState<ProjectWithCreator['status']>('draft');
  const [editIsFlagged, setEditIsFlagged] = useState(false);
  const [editFlagReason, setEditFlagReason] = useState('');

  const fetchProjects = async () => {
    try {
      const data = await adminClient.get<ProjectWithCreator[]>('/projects');
      setProjects(data);
    } catch (e) {
      console.error('Failed to fetch projects', e);
      toast.error('Failed to load projects list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openEditModal = (project: ProjectWithCreator) => {
    setEditingProject(project);
    setEditName(project.name);
    setEditDesc(project.description || '');
    setEditIndustry(project.industry || '');
    setEditStatus(project.status);
    setEditIsFlagged(!!project.isFlagged);
    setEditFlagReason(project.flagReason || '');
  };

  const closeEditModal = () => {
    setEditingProject(null);
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    setIsSaving(true);
    try {
      await adminClient.put(`/projects/${editingProject.id}`, {
        name: editName,
        description: editDesc,
        industry: editIndustry,
        status: editStatus,
        isFlagged: editIsFlagged,
        flagReason: editFlagReason
      });
      toast.success('Project updated successfully.');
      closeEditModal();
      fetchProjects();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update project.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!deletingProject) return;

    setIsDeleting(true);
    try {
      await adminClient.delete(`/projects/${deletingProject.id}`);
      toast.success('Project and related models deleted.');
      setDeletingProject(null);
      fetchProjects();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete project.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter projects by search query
  const filteredProjects = projects.filter(p => {
    const query = searchQuery.toLowerCase();
    const creatorName = p.creator?.name?.toLowerCase() || '';
    const creatorEmail = p.creator?.email?.toLowerCase() || '';
    const creatorId = p.userId.toLowerCase();
    const projectName = p.name.toLowerCase();
    const projectIndustry = p.industry.toLowerCase();
    const projectStatus = p.status.toLowerCase();
    const projectPlan = p.plan.toLowerCase();

    return (
      projectName.includes(query) ||
      projectIndustry.includes(query) ||
      projectStatus.includes(query) ||
      projectPlan.includes(query) ||
      creatorName.includes(query) ||
      creatorEmail.includes(query) ||
      creatorId.includes(query)
    );
  });

  const getStatusColor = (status: ProjectWithCreator['status']) => {
    switch (status) {
      case 'active':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'validated':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'branded':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'marketing-ready':
        return 'text-pink-400 bg-pink-500/10 border-pink-500/20';
      case 'idea':
        return 'text-violet-400 bg-violet-500/10 border-violet-500/20';
      case 'draft':
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
      case 'archived':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getPlanColor = (plan: string) => {
    const lowerPlan = plan.toLowerCase();
    if (lowerPlan.includes('pro')) {
      return 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20';
    }
    if (lowerPlan.includes('starter') || lowerPlan.includes('agency')) {
      return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    }
    return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toaster />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Project Management</h1>
          <p className="text-slate-400 mt-2">View, edit details, flag, or delete startup projects across the platform.</p>
        </div>
      </div>

      {/* Filter and search */}
      <div className="flex items-center bg-[#0c1222] border border-slate-800 rounded-xl px-4 py-3 max-w-md shadow-lg">
        <Search className="w-5 h-5 text-slate-500 mr-3 shrink-0" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by project name, creator, status, or plan..."
          className="bg-transparent border-0 outline-none text-slate-200 placeholder-slate-500 text-sm w-full"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="p-0.5 hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* Projects Table */}
      <div className="bg-[#0c1222] border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-[#0d1427] border-b border-slate-800/80">
              <tr>
                <th className="px-6 py-4 font-semibold">Project & Industry</th>
                <th className="px-6 py-4 font-semibold">Creator details</th>
                <th className="px-6 py-4 font-semibold">Created At</th>
                <th className="px-6 py-4 font-semibold">Subscription Plan</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Flag State</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredProjects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/20 transition-colors">
                  {/* Project Details */}
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-200 text-base">{p.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5 capitalize flex items-center gap-1.5">
                      <Layers className="w-3 h-3 text-slate-500" />
                      {p.industry || 'General'}
                    </div>
                  </td>
                  
                  {/* Creator details */}
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-300">{p.creator?.name || 'Unnamed Creator'}</div>
                    <div className="text-xs text-slate-400">{p.creator?.email}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5 select-all">UID: {p.userId}</div>
                  </td>

                  {/* Created At */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-slate-300 text-xs flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      {new Date(p.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 pl-5">
                      {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  
                  {/* Subscription Plan */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getPlanColor(p.plan)}`}>
                      {p.plan}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(p.status)}`}>
                      {p.status}
                    </span>
                  </td>

                  {/* Flag Status */}
                  <td className="px-6 py-4">
                    {p.isFlagged ? (
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400">
                          <Flag className="w-3.5 h-3.5 fill-rose-400/20" />
                          Flagged
                        </span>
                        {p.flagReason && (
                          <span className="text-[11px] text-slate-400 max-w-[180px] truncate" title={p.flagReason}>
                            Reason: {p.flagReason}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">Unflagged</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 rounded-lg hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 transition-colors"
                        onClick={() => openEditModal(p)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
                        onClick={() => {
                          setDeletingProject(p);
                          setDeleteConfirmName('');
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No projects found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal Overlay */}
      {editingProject && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1222] border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100">Edit Project details</h3>
              <button 
                onClick={closeEditModal}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProject} className="p-6 space-y-4">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Project Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Industry */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Industry</label>
                <input 
                  type="text" 
                  value={editIndustry}
                  onChange={(e) => setEditIndustry(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Description</label>
                <textarea 
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Workflow Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as ProjectWithCreator['status'])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors capitalize"
                >
                  <option value="draft">draft</option>
                  <option value="idea">idea</option>
                  <option value="validated">validated</option>
                  <option value="branded">branded</option>
                  <option value="marketing-ready">marketing-ready</option>
                  <option value="active">active</option>
                  <option value="archived">archived</option>
                </select>
              </div>

              {/* Flag Section */}
              <div className="pt-2 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isFlagged"
                    checked={editIsFlagged}
                    onChange={(e) => setEditIsFlagged(e.target.checked)}
                    className="w-4.5 h-4.5 rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                  />
                  <label htmlFor="isFlagged" className="text-sm font-semibold text-slate-300 cursor-pointer select-none">
                    Flag this project (Violations, spam or policy breach)
                  </label>
                </div>
                {editIsFlagged && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Reason for Flagging</label>
                    <input 
                      type="text" 
                      value={editFlagReason}
                      onChange={(e) => setEditFlagReason(e.target.value)}
                      placeholder="e.g. Inappropriate content, invalid industry tags"
                      required={editIsFlagged}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-800/80">
                <button 
                  type="button"
                  onClick={closeEditModal}
                  disabled={isSaving}
                  className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Overlay */}
      {deletingProject && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1222] border border-slate-850 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-100 mb-2">Delete Project?</h3>
              <p className="text-sm text-slate-400 mb-4">
                Are you sure you want to delete <span className="font-semibold text-slate-200">&quot;{deletingProject.name}&quot;</span>?
                This action is <span className="text-rose-500 font-bold uppercase">irreversible</span>.
              </p>
              
              <div className="p-3 bg-rose-950/10 border border-rose-900/30 rounded-xl text-left text-xs text-slate-400 mb-6 space-y-1">
                <div className="font-semibold text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  Warning: The following associated records will be deleted:
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-400 mt-1 pl-1 grid grid-cols-2">
                  <li>Business Ideas</li>
                  <li>Opportunities</li>
                  <li>Lean Canvas / Models</li>
                  <li>Business Plans</li>
                  <li>Brand Identities</li>
                  <li>Marketing Campaigns</li>
                  <li>Pitch Decks</li>
                  <li>Execution Roadmaps</li>
                  <li>Uploaded Documents</li>
                  <li>RAG Knowledge Vectors</li>
                </ul>
              </div>

              <div className="mb-6 text-left">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  To confirm deletion, type the project name <span className="font-bold text-slate-200">&quot;{deletingProject.name}&quot;</span> below:
                </label>
                <input
                  type="text"
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  placeholder="Type project name here"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setDeletingProject(null)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteProject}
                  disabled={isDeleting || deleteConfirmName !== deletingProject.name}
                  className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isDeleting ? 'Deleting...' : 'Delete Forever'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
