'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/authClient';
import { AuthUser } from '@creator/types';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export const dynamic = 'force-dynamic';

export default function UsersPage() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingUser, setDeletingUser] = useState<AuthUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await authClient.get<AuthUser[]>('/admin/users');
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleBan = async (userId: string, currentBanStatus: boolean) => {
    try {
      await authClient.post(`/admin/users/${userId}/ban`, { ban: !currentBanStatus });
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string, currentRole: string) => {
    if (newRole === currentRole) return;
    const actionText = newRole === 'admin' ? 'Elevate to Administrator' : 'Demote to regular User';
    const confirmed = window.confirm(`Are you sure you want to ${actionText}?`);
    if (!confirmed) { fetchUsers(); return; }
    try {
      await authClient.post(`/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (e) {
      console.error(e);
      fetchUsers();
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    try {
      await authClient.delete(`/admin/users/${deletingUser.id}`);
      toast.success(`User "${deletingUser.name || deletingUser.email}" deleted.`, {
        style: { background: '#0f172a', color: '#f1f5f9', border: '1px solid #1e293b' }
      });
      setDeletingUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold">User Management</h1>

      <div className="bg-[#0c1222] border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-[#0c1222] border-b border-slate-800">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-200">{u.name || 'Unnamed'}</td>
                <td className="px-6 py-4 text-slate-400">{u.email}</td>
                <td className="px-6 py-4">
                  <select
                    value={u.role || 'user'}
                    onChange={(e) => handleRoleChange(u.id, e.target.value, u.role || 'user')}
                    className={`bg-slate-950 border text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer ${
                      u.role === 'admin'
                        ? 'text-indigo-400 border-indigo-500/30'
                        : 'text-slate-400 border-slate-800'
                    }`}
                  >
                    <option value="user" className="bg-[#0c1222] text-slate-300">User</option>
                    <option value="admin" className="bg-[#0c1222] text-indigo-400">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  {u.isBanned ? (
                    <span className="text-rose-500 bg-rose-500/10 px-2 py-1 rounded-full text-xs font-medium">Banned</span>
                  ) : (
                    <span className="text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full text-xs font-medium">Active</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-8 text-xs ${u.isBanned ? 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10' : 'border-rose-500/30 text-rose-500 hover:bg-rose-500/10'}`}
                      onClick={() => toggleBan(u.id, !!u.isBanned)}
                    >
                      {u.isBanned ? 'Unban' : 'Ban'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 border-slate-700 text-slate-500 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 transition-all"
                      onClick={() => setDeletingUser(u)}
                      title="Delete user permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1222] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-1">Delete User?</h3>
              <p className="text-sm text-slate-400 mb-1 mt-2">
                Permanently delete <span className="font-semibold text-slate-200">{deletingUser.name || deletingUser.email}</span>?
              </p>
              <p className="text-xs text-rose-400/80 mb-6">
                This also removes all their projects and subscriptions. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingUser(null)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
