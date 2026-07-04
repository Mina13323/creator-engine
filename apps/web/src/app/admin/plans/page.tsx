'use client';

import { useEffect, useState } from 'react';
import { adminClient } from '@/lib/adminClient';
import { Button } from '@/components/ui/button';
import {
  Loader2, Plus, Edit2, Trash2, X,
  CreditCard, AlertTriangle, ToggleLeft, ToggleRight,
  Zap, Leaf, FlaskConical, Crown, Cpu, Sparkles
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface SubscriptionPlan {
  _id: string;
  name: string;
  slug: string;
  monthlyPriceEGP: number;
  monthlyCredits: number;
  maxProjects: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
}

// ─── Per-plan full UI schemes ────────────────────────────────────────────────
// Each scheme defines a completely distinct visual identity

interface PlanScheme {
  // Card shell
  cardBg: string;
  cardBorder: string;
  cardHover: string;
  cardShadow: string;
  // Decorative overlay element (rendered as absolute positioned div)
  decoration: string;
  // Header band at top of card
  headerBg: string;
  // Icon shown in header
  Icon: React.ElementType;
  iconClass: string;
  // Plan name label
  nameClass: string;
  // Status pill
  activePill: string;
  // Price block
  priceBg: string;
  priceText: string;
  priceUnit: string;
  // Stat blocks (projects / credits)
  statDivider: string;
  statLabel: string;
  statValue: string;
  // Feature bullets
  bulletClass: string;
  featureText: string;
  // Edit button
  editBtn: string;
  // Delete button
  deleteBtn: string;
}

const SCHEMES: Record<string, PlanScheme> = {
  // ── FREE: Raw brutalist / industrial ───────────────────────────────────────
  free: {
    cardBg: 'bg-[#111111]',
    cardBorder: 'border border-zinc-700',
    cardHover: 'hover:border-zinc-500',
    cardShadow: 'hover:shadow-zinc-900',
    decoration: 'absolute top-0 right-0 w-24 h-24 border-b border-l border-zinc-700 rounded-bl-3xl opacity-30 pointer-events-none',
    headerBg: 'bg-zinc-900 border-b border-zinc-800',
    Icon: Zap,
    iconClass: 'text-zinc-400',
    nameClass: 'text-white font-mono tracking-widest uppercase text-sm',
    activePill: 'bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono text-[9px]',
    priceBg: 'bg-transparent border-l-2 border-zinc-500 pl-3',
    priceText: 'text-white font-mono text-3xl font-bold tracking-tight',
    priceUnit: 'text-zinc-400 font-mono text-xs',
    statDivider: 'border-zinc-800',
    statLabel: 'text-zinc-500 font-mono uppercase tracking-widest text-[8px]',
    statValue: 'text-zinc-100 font-mono font-bold',
    bulletClass: 'w-1 h-1 bg-zinc-400 shrink-0 mt-2',
    featureText: 'text-zinc-200 font-mono text-[11px]',
    editBtn: 'flex-1 bg-transparent border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 font-mono text-xs h-9 rounded-none transition-colors',
    deleteBtn: 'bg-transparent border border-zinc-800 hover:border-red-900 hover:bg-red-950/20 text-zinc-600 hover:text-red-400 h-9 w-9 rounded-none transition-colors',
  },

  // ── STARTER: Organic / botanical teal ──────────────────────────────────────
  starter: {
    cardBg: 'bg-gradient-to-br from-[#061a1a] via-[#071f1c] to-[#060e14]',
    cardBorder: 'border border-teal-900/60',
    cardHover: 'hover:border-teal-600/70',
    cardShadow: 'hover:shadow-teal-950/50',
    decoration: 'absolute -top-6 -right-6 w-24 h-24 rounded-full bg-teal-500/8 blur-2xl pointer-events-none',
    headerBg: 'bg-gradient-to-r from-teal-950/80 to-transparent border-b border-teal-900/40',
    Icon: Leaf,
    iconClass: 'text-teal-400',
    nameClass: 'text-white font-semibold tracking-wide text-base',
    activePill: 'bg-teal-500/15 text-teal-300 border border-teal-500/30 text-[9px]',
    priceBg: 'bg-teal-950/40 border border-teal-700/40 rounded-2xl px-4 py-2.5',
    priceText: 'text-white text-2xl font-black',
    priceUnit: 'text-teal-400 text-xs',
    statDivider: 'border-teal-900/30',
    statLabel: 'text-teal-500 uppercase tracking-wider text-[9px] font-semibold',
    statValue: 'text-teal-100 font-bold',
    bulletClass: 'w-1.5 h-1.5 rounded-full bg-teal-300 shrink-0 mt-1.5',
    featureText: 'text-teal-100 text-xs',
    editBtn: 'flex-1 bg-teal-900/20 border border-teal-800/40 hover:bg-teal-800/30 hover:border-teal-600/50 text-teal-300 hover:text-teal-100 font-semibold text-xs h-9 rounded-xl transition-colors',
    deleteBtn: 'bg-transparent border border-teal-900/30 hover:bg-rose-950/30 hover:border-rose-800/40 text-teal-700 hover:text-rose-400 h-9 w-9 rounded-xl transition-colors',
  },

  // ── PRO: Electric neon noir ─────────────────────────────────────────────────
  pro: {
    cardBg: 'bg-gradient-to-b from-[#0a0518] via-[#0d0620] to-[#080412]',
    cardBorder: 'border border-indigo-700/40',
    cardHover: 'hover:border-indigo-500/70',
    cardShadow: 'hover:shadow-indigo-900/60',
    decoration: 'absolute inset-0 rounded-2xl overflow-hidden pointer-events-none before:absolute before:inset-0 before:bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(99,102,241,0.015)_3px,rgba(99,102,241,0.015)_4px)]',
    headerBg: 'bg-gradient-to-r from-indigo-950/90 to-purple-950/40 border-b border-indigo-800/30',
    Icon: FlaskConical,
    iconClass: 'text-indigo-400',
    nameClass: 'text-white font-bold tracking-wide text-base',
    activePill: 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/40 text-[9px] animate-pulse',
    priceBg: 'bg-indigo-950/50 border border-indigo-600/40 rounded-xl px-4 py-2.5 shadow-[0_0_20px_rgba(99,102,241,0.2)]',
    priceText: 'text-white text-2xl font-black tracking-tight',
    priceUnit: 'text-indigo-400 text-xs',
    statDivider: 'border-indigo-900/30',
    statLabel: 'text-indigo-400 uppercase tracking-widest text-[9px] font-semibold',
    statValue: 'text-indigo-100 font-bold',
    bulletClass: 'w-1.5 h-1.5 rounded-full bg-indigo-300 shrink-0 mt-1.5 shadow-[0_0_4px_rgba(99,102,241,0.9)]',
    featureText: 'text-indigo-100 text-xs',
    editBtn: 'flex-1 bg-indigo-600/10 border border-indigo-600/30 hover:bg-indigo-600/20 hover:border-indigo-500/50 text-indigo-300 hover:text-indigo-100 font-semibold text-xs h-9 rounded-xl transition-all shadow-[0_0_8px_rgba(99,102,241,0.1)] hover:shadow-[0_0_12px_rgba(99,102,241,0.2)]',
    deleteBtn: 'bg-transparent border border-indigo-900/30 hover:bg-rose-950/30 hover:border-rose-800/40 text-indigo-800 hover:text-rose-400 h-9 w-9 rounded-xl transition-colors',
  },

  // ── AGENCY: Gold luxury editorial ───────────────────────────────────────────
  agency: {
    cardBg: 'bg-gradient-to-b from-[#140d00] via-[#1a1100] to-[#0f0a00]',
    cardBorder: 'border border-amber-800/50',
    cardHover: 'hover:border-amber-600/60',
    cardShadow: 'hover:shadow-amber-950/60',
    decoration: 'absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent pointer-events-none',
    headerBg: 'bg-gradient-to-r from-amber-950/80 to-orange-950/40 border-b border-amber-800/30',
    Icon: Crown,
    iconClass: 'text-amber-400',
    nameClass: 'text-white font-bold tracking-wide text-base',
    activePill: 'bg-amber-500/15 text-amber-300 border border-amber-500/40 text-[9px]',
    priceBg: 'bg-amber-950/50 border border-amber-600/40 rounded-xl px-4 py-2.5',
    priceText: 'text-white text-2xl font-black tracking-tight',
    priceUnit: 'text-amber-400 text-xs',
    statDivider: 'border-amber-900/25',
    statLabel: 'text-amber-500 uppercase tracking-widest text-[9px] font-semibold',
    statValue: 'text-amber-100 font-bold',
    bulletClass: 'w-1.5 h-1.5 rounded-full bg-amber-300 shrink-0 mt-1.5',
    featureText: 'text-amber-100 text-xs',
    editBtn: 'flex-1 bg-amber-900/20 border border-amber-800/40 hover:bg-amber-800/30 hover:border-amber-600/50 text-amber-300 hover:text-amber-100 font-semibold text-xs h-9 rounded-xl transition-colors',
    deleteBtn: 'bg-transparent border border-amber-900/20 hover:bg-rose-950/30 hover:border-rose-800/40 text-amber-800 hover:text-rose-400 h-9 w-9 rounded-xl transition-colors',
  },

  // ── ENTERPRISE / BUSINESS: Cold steel aerospace ─────────────────────────────
  enterprise: {
    cardBg: 'bg-gradient-to-br from-[#0b0f14] via-[#0d1219] to-[#080c10]',
    cardBorder: 'border border-slate-600/40',
    cardHover: 'hover:border-slate-400/50',
    cardShadow: 'hover:shadow-slate-900/60',
    decoration: 'absolute top-3 right-3 w-16 h-16 border border-slate-700/40 rounded-full opacity-40 pointer-events-none',
    headerBg: 'bg-gradient-to-r from-slate-800/50 to-slate-900/20 border-b border-slate-700/30',
    Icon: Cpu,
    iconClass: 'text-slate-400',
    nameClass: 'text-white font-bold tracking-widest uppercase text-sm',
    activePill: 'bg-slate-600/40 text-slate-200 border border-slate-500/50 text-[9px] font-mono',
    priceBg: 'bg-slate-800/40 border border-slate-600/40 rounded-lg px-4 py-2.5',
    priceText: 'text-white text-2xl font-black tracking-tight font-mono',
    priceUnit: 'text-slate-400 text-xs font-mono',
    statDivider: 'border-slate-700/50',
    statLabel: 'text-slate-400 uppercase tracking-widest text-[9px] font-bold font-mono',
    statValue: 'text-slate-100 font-bold font-mono',
    bulletClass: 'w-1 h-3 bg-slate-300 shrink-0 mt-0.5 rounded-sm',
    featureText: 'text-slate-200 text-xs font-mono',
    editBtn: 'flex-1 bg-slate-800/30 border border-slate-700/40 hover:bg-slate-700/40 hover:border-slate-500/50 text-slate-300 hover:text-slate-100 font-bold text-xs h-9 rounded-lg font-mono uppercase tracking-wider transition-colors',
    deleteBtn: 'bg-transparent border border-slate-800/30 hover:bg-rose-950/30 hover:border-rose-800/40 text-slate-700 hover:text-rose-400 h-9 w-9 rounded-lg transition-colors',
  },

  // ── PREMIUM / ULTIMATE: Deep-space cosmic ───────────────────────────────────
  premium: {
    cardBg: 'bg-gradient-to-b from-[#0c0520] via-[#100828] to-[#080318]',
    cardBorder: 'border border-violet-700/40',
    cardHover: 'hover:border-violet-500/60',
    cardShadow: 'hover:shadow-violet-950/70',
    decoration: 'absolute -top-8 -right-8 w-32 h-32 rounded-full bg-violet-600/10 blur-3xl pointer-events-none',
    headerBg: 'bg-gradient-to-r from-violet-950/90 to-fuchsia-950/40 border-b border-violet-800/30',
    Icon: Sparkles,
    iconClass: 'text-violet-400',
    nameClass: 'text-white font-bold tracking-wide text-base',
    activePill: 'bg-violet-500/20 text-violet-200 border border-violet-500/40 text-[9px]',
    priceBg: 'bg-violet-950/50 border border-violet-600/40 rounded-2xl px-4 py-2.5 shadow-[0_0_24px_rgba(139,92,246,0.2)]',
    priceText: 'text-white text-2xl font-black tracking-tight',
    priceUnit: 'text-violet-400 text-xs',
    statDivider: 'border-violet-900/25',
    statLabel: 'text-violet-400 uppercase tracking-widest text-[9px] font-semibold',
    statValue: 'text-violet-100 font-bold',
    bulletClass: 'w-1.5 h-1.5 rounded-full bg-violet-300 shrink-0 mt-1.5 shadow-[0_0_4px_rgba(139,92,246,0.9)]',
    featureText: 'text-violet-100 text-xs',
    editBtn: 'flex-1 bg-violet-600/10 border border-violet-600/30 hover:bg-violet-600/20 hover:border-violet-500/50 text-violet-300 hover:text-violet-100 font-semibold text-xs h-9 rounded-xl transition-all',
    deleteBtn: 'bg-transparent border border-violet-900/25 hover:bg-rose-950/30 hover:border-rose-800/40 text-violet-900 hover:text-rose-400 h-9 w-9 rounded-xl transition-colors',
  },
};

const SLUG_SCHEME: Record<string, string> = {
  free: 'free',
  starter: 'starter', basic: 'starter',
  pro: 'pro', professional: 'pro',
  agency: 'agency', business: 'agency',
  enterprise: 'enterprise',
  premium: 'premium', ultimate: 'premium', gold: 'premium',
};

// Index-based fallback cycle
const SCHEME_CYCLE = ['free', 'starter', 'pro', 'agency', 'enterprise', 'premium'];

function getScheme(slug: string, index: number): PlanScheme {
  const key = SLUG_SCHEME[slug.toLowerCase()] ?? SCHEME_CYCLE[index % SCHEME_CYCLE.length];
  return SCHEMES[key] ?? SCHEMES.pro;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [credits, setCredits] = useState(0);
  const [maxProjects, setMaxProjects] = useState(0);
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchPlans = async () => {
    try {
      const data = await adminClient.get<SubscriptionPlan[]>('/plans');
      setPlans(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load plans list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const resetForm = () => { setName(''); setPrice(0); setCredits(0); setMaxProjects(0); setFeatures([]); setFeatureInput(''); setIsActive(true); };
  const handleAddFeature = () => { if (!featureInput.trim()) return; setFeatures([...features, featureInput.trim()]); setFeatureInput(''); };
  const handleRemoveFeature = (i: number) => setFeatures(features.filter((_, idx) => idx !== i));
  const openAddModal = () => { resetForm(); setIsAddModalOpen(true); };
  const openEditModal = (plan: SubscriptionPlan) => {
    setEditingPlan(plan); setName(plan.name); setPrice(plan.monthlyPriceEGP);
    setCredits(plan.monthlyCredits); setMaxProjects(plan.maxProjects);
    setFeatures(plan.features || []); setFeatureInput(''); setIsActive(plan.isActive);
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault(); setIsProcessing(true);
    try {
      await adminClient.post('/plans', { name, monthlyPriceEGP: Number(price), monthlyCredits: Number(credits), maxProjects: Number(maxProjects), features, isActive });
      toast.success('Plan created.'); setIsAddModalOpen(false); fetchPlans();
    } catch (err: any) { toast.error(err.message || 'Failed to create plan.'); }
    finally { setIsProcessing(false); }
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editingPlan) return; setIsProcessing(true);
    try {
      await adminClient.put(`/plans/${editingPlan._id}`, { name, monthlyPriceEGP: Number(price), monthlyCredits: Number(credits), maxProjects: Number(maxProjects), features, isActive });
      toast.success('Plan updated.'); setEditingPlan(null); fetchPlans();
    } catch (err: any) { toast.error(err.message || 'Failed to update plan.'); }
    finally { setIsProcessing(false); }
  };

  const handleDeletePlan = async () => {
    if (!deletingPlan) return; setIsProcessing(true);
    try {
      await adminClient.delete(`/plans/${deletingPlan._id}`);
      toast.success('Plan deleted.'); setDeletingPlan(null); fetchPlans();
    } catch (err: any) { toast.error(err.message || 'Failed to delete plan.', { duration: 5000 }); }
    finally { setIsProcessing(false); }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Toaster position="top-right" />

      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Subscription Plans</h1>
          <p className="text-slate-400 mt-2 text-sm">Each plan has its own identity. Manage credit allowances, limits &amp; features.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm px-4 py-2.5 rounded-xl shadow-lg transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> New Plan
        </button>
      </div>

      {/* Plans grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((p, idx) => {
          const s = getScheme(p.slug, idx);
          const PlanIcon = s.Icon;
          return (
            <div
              key={p._id}
              className={`relative flex flex-col rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 ${s.cardBg} ${s.cardBorder} ${s.cardHover} ${s.cardShadow} ${!p.isActive ? 'opacity-50 saturate-50' : ''}`}
            >
              {/* Decorative element */}
              <div className={s.decoration} aria-hidden />

              {/* Header band */}
              <div className={`flex items-center justify-between px-5 py-3.5 ${s.headerBg}`}>
                <div className="flex items-center gap-2.5">
                  <PlanIcon className={`w-4 h-4 ${s.iconClass}`} />
                  <span className={s.nameClass}>{p.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md font-semibold uppercase ${s.activePill}`}>
                    {p.isActive ? 'Live' : 'Draft'}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-col flex-grow p-5 space-y-4">

                {/* Price */}
                <div className={`flex items-baseline gap-1.5 w-fit ${s.priceBg}`}>
                  <span className={s.priceText}>EGP {p.monthlyPriceEGP}</span>
                  <span className={s.priceUnit}>/ mo</span>
                </div>

                {/* Stats row */}
                <div className={`grid grid-cols-2 gap-3 py-3.5 border-y ${s.statDivider}`}>
                  <div>
                    <span className={`block ${s.statLabel}`}>Projects</span>
                    <span className={`block mt-0.5 ${s.statValue}`}>{p.maxProjects}</span>
                  </div>
                  <div>
                    <span className={`block ${s.statLabel}`}>Credits / mo</span>
                    <span className={`block mt-0.5 ${s.statValue}`}>{p.monthlyCredits.toLocaleString()}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="flex-grow space-y-1.5">
                  {p.features.length === 0 ? (
                    <p className={`italic text-[11px] ${s.featureText} opacity-40`}>No features listed.</p>
                  ) : (
                    <ul className="space-y-2">
                      {p.features.map((f, fi) => (
                        <li key={fi} className="flex items-start gap-2">
                          <span className={s.bulletClass} />
                          <span className={s.featureText}>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Slug badge */}
                <div className="pt-1">
                  <span className="text-[9px] font-mono opacity-30 select-all">{p.slug}</span>
                </div>
              </div>

              {/* Action footer */}
              <div className="flex gap-2 px-5 py-3.5 border-t border-white/5">
                <button className={s.editBtn} onClick={() => openEditModal(p)}>
                  <Edit2 className="w-3 h-3 inline-block mr-1.5" />Edit
                </button>
                <button className={s.deleteBtn} onClick={() => setDeletingPlan(p)} title="Delete plan">
                  <Trash2 className="w-3.5 h-3.5 mx-auto" />
                </button>
              </div>
            </div>
          );
        })}

        {plans.length === 0 && (
          <div className="col-span-full bg-[#0c1222] border border-slate-800 p-12 text-center rounded-2xl">
            <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-slate-300">No plans configured</h3>
            <p className="text-slate-500 text-sm mt-1">Create a new subscription plan to monetize your platform.</p>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {(isAddModalOpen || editingPlan) && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1222] border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100">
                {editingPlan ? 'Edit Plan' : 'New Subscription Plan'}
              </h3>
              <button onClick={() => { setIsAddModalOpen(false); setEditingPlan(null); }} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingPlan ? handleUpdatePlan : handleCreatePlan} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Plan Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pro Plan" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors" />
              </div>

              <div className="grid gap-4 grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Price (EGP/mo)</label>
                  <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} min={0} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Monthly Credits</label>
                  <input type="number" value={credits} onChange={(e) => setCredits(Number(e.target.value))} min={0} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Max Projects</label>
                  <input type="number" value={maxProjects} onChange={(e) => setMaxProjects(Number(e.target.value))} min={0} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors" />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-slate-800/40">
                <button type="button" onClick={() => setIsActive(!isActive)} className="transition-colors">
                  {isActive ? <ToggleRight className="w-10 h-10 text-emerald-400" /> : <ToggleLeft className="w-10 h-10 text-slate-600" />}
                </button>
                <div>
                  <span className="block text-sm font-semibold text-slate-300">Set Plan Active</span>
                  <span className="block text-xs text-slate-500">Allow users to subscribe immediately.</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/40 space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Included Features</label>
                <div className="flex gap-2">
                  <input type="text" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} placeholder="e.g. Unlimited AI runs" className="flex-grow bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }} />
                  <Button type="button" onClick={handleAddFeature} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 rounded-xl h-9 shrink-0">Add</Button>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-[140px] overflow-y-auto space-y-1.5">
                  {features.map((f, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-slate-300 bg-[#0c1222] border border-slate-800 px-2.5 py-1.5 rounded-lg">
                      <span className="truncate pr-2">{f}</span>
                      <button type="button" onClick={() => handleRemoveFeature(i)} className="text-slate-500 hover:text-rose-400 p-0.5 transition-colors"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  {features.length === 0 && <p className="text-slate-500 text-[11px] italic py-2 text-center">No features added yet.</p>}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-800/80">
                <button type="button" onClick={() => { setIsAddModalOpen(false); setEditingPlan(null); }} disabled={isProcessing} className="flex-1 py-2.5 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={isProcessing} className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors text-sm flex items-center justify-center gap-1.5 disabled:opacity-50">
                  {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isProcessing ? 'Processing...' : editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deletingPlan && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1222] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">Delete Plan?</h3>
              <p className="text-sm text-slate-400 mb-6">
                Permanently delete <span className="font-semibold text-slate-200">&quot;{deletingPlan.name}&quot;</span>? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeletingPlan(null)} disabled={isProcessing} className="flex-1 py-2.5 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors text-sm">
                  Cancel
                </button>
                <button onClick={handleDeletePlan} disabled={isProcessing} className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors text-sm flex items-center justify-center gap-1.5 disabled:opacity-50">
                  {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isProcessing ? 'Deleting...' : 'Delete Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
