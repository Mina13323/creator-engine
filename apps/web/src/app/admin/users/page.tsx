'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/authClient';
import { AuthUser } from '@creator/types';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleBan = async (userId: string, currentBanStatus: boolean) => {
    try {
      await authClient.post(`/admin/users/${userId}/ban`, { ban: !currentBanStatus });
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  return (
    <div className="space-y-6">
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
                <td className="px-6 py-4 text-slate-400 capitalize">{u.role || 'user'}</td>
                <td className="px-6 py-4">
                  {u.isBanned ? (
                    <span className="text-rose-500 bg-rose-500/10 px-2 py-1 rounded-full text-xs font-medium">Banned</span>
                  ) : (
                    <span className="text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full text-xs font-medium">Active</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`h-8 text-xs ${u.isBanned ? 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10' : 'border-rose-500/30 text-rose-500 hover:bg-rose-500/10'}`}
                    onClick={() => toggleBan(u.id, !!u.isBanned)}
                  >
                    {u.isBanned ? 'Unban' : 'Ban'}
                  </Button>
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
    </div>
  );
}
