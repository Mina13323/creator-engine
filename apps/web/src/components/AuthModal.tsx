'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, Mail, Lock, User as UserIcon, Loader2, ArrowRight } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { authClient } from '../lib/authClient';

export default function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen, setAuth, loadProjects } = useStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError('');
    setLoading(true);
    try {
      const res = await authClient.checkEmail(email);
      setMode(res.exists ? 'login' : 'register');
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to verify email');
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = mode === 'login'
        ? await authClient.login({ email, password })
        : await authClient.signup({ email, password, name });
      
      setAuth(data.user);
      setAuthModalOpen(false);
      loadProjects();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setLoading(true);
    try {
      const data = await authClient.googleLogin(credentialResponse.credential);
      setAuth(data.user);
      setAuthModalOpen(false);
      loadProjects();
    } catch (err: any) {
      setError(err.message || 'Google Auth failed');
    }
    setLoading(false);
  };

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy_client_id_for_ui_rendering';

  const resetStep = () => {
    setStep(1);
    setPassword('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button onClick={() => { setAuthModalOpen(false); resetStep(); }} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="h-5 w-5" />
        </button>
        
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-900">
            {step === 1 ? 'Sign in or create an account' : (mode === 'login' ? 'Welcome back' : 'Create your account')}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {step === 1 ? 'Enter your email to continue' : (mode === 'login' ? 'Enter your password to sign in' : 'Complete your profile to get started')}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={step === 1 ? handleCheckEmail : handleSubmit} className="space-y-4">
          
          {step === 1 ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 transition-all bg-slate-50 focus:bg-white"
                  placeholder="you@example.com"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-200 p-2 rounded-lg text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{email}</span>
                </div>
                <button type="button" onClick={resetStep} className="text-xs text-emerald-600 font-semibold hover:text-emerald-700">
                  Edit
                </button>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 transition-all bg-slate-50 focus:bg-white"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 transition-all bg-slate-50 focus:bg-white"
                    placeholder="••••••••"
                    minLength={6}
                    autoFocus
                  />
                </div>
                {mode === 'register' && (
                  <p className="text-xs text-slate-400 mt-1">Must be at least 6 characters</p>
                )}
              </div>
            </>
          )}

          <button
            disabled={loading}
            className="w-full bg-[#1a2535] text-white font-medium py-2.5 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : step === 1 ? (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            ) : mode === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Divider & Social */}
        {step === 1 && (
          <div className="mt-6 animate-in fade-in duration-300">
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
        )}
      </div>
    </div>
  );
}
