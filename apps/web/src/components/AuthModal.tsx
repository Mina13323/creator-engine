'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, Mail, Lock, User as UserIcon } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export default function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen, setAuth, loadProjects } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login' ? { email, password } : { email, password, name };
      
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        setAuth(data.user, data.token);
        setAuthModalOpen(false);
        loadProjects(); // Reload projects after auth
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await fetch(`http://localhost:5000/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      const data = await res.json();
      if (res.ok) {
        setAuth(data.user, data.token);
        setAuthModalOpen(false);
        loadProjects(); // Reload projects after auth
      } else {
        setError(data.error || 'Google Auth failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy_client_id_for_ui_rendering';

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl relative">
        <button onClick={() => setAuthModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-semibold mb-6 text-slate-900">
          {mode === 'login' ? 'Welcome back' : 'Create an account'}
        </h2>
        {error && <div className="mb-4 text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900" placeholder="John Doe" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900" placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900" placeholder="••••••••" minLength={6} />
            </div>
          </div>
          <button disabled={loading} className="w-full bg-[#1a2535] text-white font-medium py-2.5 rounded-lg hover:bg-slate-800 transition-colors">
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-slate-500">Or continue with</span></div>
          </div>
          <div className="mt-6 flex justify-center">
            <GoogleOAuthProvider clientId={clientId}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Failed')}
                theme="outline"
                shape="rectangular"
                width="100%"
              />
            </GoogleOAuthProvider>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-slate-600">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="font-semibold text-emerald-600 hover:text-emerald-700">
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
