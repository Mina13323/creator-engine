'use client';

/* eslint-disable @next/next/no-img-element */

import React, { ReactNode, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Download,
  FileText,
  Globe2,
  Lock,
  Menu,
  MessageCircle,
  PieChart,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  UserRoundCheck,
  BrainCircuit,
  Database,
  Bot
} from 'lucide-react';

type LandingPageProps = {
  onGetStarted: () => void;
  onLogin: () => void;
};

const logoMarks = ['Next.js', 'Node.js', 'Express', 'MongoDB', 'FAISS', 'Pinecone'];

const formationItems = [
  ['Idea Generation', Bot],
  ['Validation & Feasibility', ShieldCheck],
  ['Business Model Strategy', BriefcaseBusiness],
  ['Branding & Identity', Globe2],
  ['Marketing Campaigns', Store],
  ['Execution Roadmap', CalendarCheck],
  ['Persistent Memory', Database]
] as const;

const faqItems = [
  'What is Creator Engine and how does it work?',
  'Is Creator Engine tailored for the Egyptian market?',
  'How does the Multi-Agent architecture work?',
  'Can I use Creator Engine if I only have a budget and skills, but no idea?',
  'What is the AI Trinity Strategy?',
  'How does this differ from just asking ChatGPT?',
  'Who is AI Foundry?'
];

const reveal = {
  hidden: { opacity: 0, y: 42, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] }
  }
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12
    }
  }
};

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-90px' }}
    >
      {children}
    </motion.div>
  );
}

function PremiumCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={`premium-card ${className}`}
      variants={reveal}
      whileHover={{ y: -8, scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
    >
      {children}
    </motion.div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative h-7 w-7">
        <span className="absolute left-0 top-2 h-2 w-5 -rotate-45 rounded-sm bg-[#009b72]" />
        <span className="absolute left-2 top-2 h-2 w-6 -rotate-45 rounded-sm bg-[#00b986]" />
        <span className="absolute left-4 top-2 h-2 w-5 -rotate-45 rounded-sm bg-[#007f61]" />
      </div>
      <span className="text-2xl font-semibold tracking-[-0.02em] text-[#151515]">Creator Engine</span>
    </div>
  );
}

function MiniBars() {
  return (
    <div className="flex h-24 items-end gap-3">
      {[62, 48, 76, 60, 90].map((height, index) => (
        <motion.div
          key={index}
          className="w-3 origin-bottom rounded-sm bg-[#008465]"
          initial={{ scaleY: 0.18, opacity: 0.4 }}
          whileInView={{ scaleY: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
          style={{ height }}
        />
      ))}
    </div>
  );
}

function Donut() {
  return (
    <motion.div
      className="h-16 w-16 rounded-full border-[8px] border-[#dce7e4] border-l-[#2e403d] border-t-[#008465]"
      initial={{ rotate: -80, opacity: 0.55 }}
      whileInView={{ rotate: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}

function ProductMockup() {
  return (
    <div className="relative h-[330px] overflow-hidden rounded-[20px] bg-[#f8f8f8]">
      <motion.div
        className="absolute left-[24%] top-[20%] h-[190px] w-[42%] rounded-xl bg-gradient-to-br from-[#007f61] to-[#0aa879] p-5 text-white shadow-sm"
        initial={{ y: 22, rotate: -2 }}
        whileInView={{ y: 0, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="mt-24 text-[10px] font-semibold opacity-80">Creator Engine</p>
        <p className="mt-2 text-xl font-medium">Idea Validation</p>
      </motion.div>
      <motion.div
        className="absolute right-[-8%] top-[21%] h-[190px] w-[36%] rounded-xl bg-white p-5 shadow-sm"
        initial={{ x: 34, opacity: 0.35 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="mb-7 text-sm font-medium">Market Feasibility</p>
        <Donut />
        <div className="mt-7 space-y-2">
          <span className="block h-2 w-20 rounded bg-[#d8dddd]" />
          <span className="block h-2 w-28 rounded bg-[#d8dddd]" />
          <span className="block h-2 w-24 rounded bg-[#d8dddd]" />
        </div>
      </motion.div>
    </div>
  );
}

function RevenueCard() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <p className="text-base text-[#1b1b1b]">Growth Potential</p>
      <div className="mt-10 flex items-end justify-between gap-8">
        <div>
          <span className="text-3xl font-medium">High</span>
          <span className="ml-2 text-sm text-emerald-500">Validated</span>
        </div>
        <MiniBars />
      </div>
    </div>
  );
}

function PlanSheet({ title }: { title: string }) {
  return (
    <div className="min-h-[190px] rounded-lg border border-[#ebebeb] bg-white p-5 shadow-sm">
      <p className="text-[10px] font-semibold text-[#777]">{title}</p>
      <div className="mt-5 space-y-2">
        <span className="block h-3 w-full rounded bg-[#ececec]" />
        <span className="block h-3 w-10/12 rounded bg-[#ececec]" />
        <span className="block h-3 w-8/12 rounded bg-[#ececec]" />
      </div>
      <div className="mt-8">
        {title.includes('Growth') ? <MiniBars /> : title.includes('Market') ? <Donut /> : <p className="text-lg font-medium text-[#111]">{title}</p>}
      </div>
    </div>
  );
}

export default function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });
  const heroImageY = useTransform(scrollYProgress, [0, 1], [0, 82]);
  const heroCardsY = useTransform(scrollYProgress, [0, 1], [0, -48]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, 34]);
  const heroFade = useTransform(scrollYProgress, [0, 0.86], [1, 0.72]);

  return (
    <div className="min-h-screen bg-white font-sans text-[#050505]">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-24 max-w-[1520px] items-center justify-between px-6 md:px-12 lg:px-20">
          <div className="flex items-center gap-12">
            <Logo />
            <nav className="hidden items-center gap-9 text-lg font-medium md:flex">
              {['AI Trinity Strategy', 'Multi-Agent Tech', 'For Egypt & MENA'].map(item => (
                <button key={item} className="flex items-center gap-1 transition-colors hover:text-[#007f61]">
                  {item}
                  <ChevronDown className="h-4 w-4" />
                </button>
              ))}
            </nav>
          </div>
          <div className="hidden items-center gap-10 md:flex">
            <button onClick={onLogin} className="text-lg font-medium transition-colors hover:text-[#007f61]">
              Login
            </button>
            <button
              onClick={onGetStarted}
              className="premium-button rounded-full bg-[#1a2535] px-9 py-3.5 text-lg font-semibold text-white"
            >
              Get started
            </button>
          </div>
          <button className="rounded-full border border-[#ddd] p-3 md:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main>
        <section ref={heroRef} className="relative mx-auto grid min-h-[760px] max-w-[1520px] items-center gap-14 overflow-hidden px-6 pb-16 pt-10 md:px-12 lg:grid-cols-[1fr_0.95fr] lg:px-20">
          <div className="pointer-events-none absolute left-1/2 top-14 h-72 w-72 -translate-x-1/2 rounded-full bg-[#dff7ed] opacity-40 blur-3xl" />
          <motion.div className="relative max-w-[720px]" style={{ y: heroTextY, opacity: heroFade }}>
            <motion.p
              className="mb-8 inline-flex rounded-full border border-[#d8ede5] bg-[#f5fffb] px-4 py-2 text-sm font-semibold text-[#007f61]"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              AI Venture Builder by AI Foundry
            </motion.p>
            <motion.h1
              className="text-[56px] font-medium leading-[0.98] tracking-[-0.055em] text-[#121212] md:text-[76px] lg:text-[82px]"
              initial={{ opacity: 0, y: 34, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.85, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              From zero idea to a launch-ready business in minutes.
            </motion.h1>
            <motion.p
              className="mt-14 max-w-[710px] text-2xl leading-snug tracking-[-0.02em]"
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              Transform your skills and budget into a complete, structured business. Let our AI act as your co-founder to generate, validate, and build your execution plan.
            </motion.p>
            <motion.div
              className="mt-16 flex max-w-[700px] items-center rounded-full border border-[#e5e5e5] bg-white/95 p-2 shadow-[0_18px_50px_rgba(16,24,40,0.09)] backdrop-blur"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ boxShadow: '0 24px 70px rgba(16,24,40,0.14)' }}
            >
              <input
                className="min-w-0 flex-1 bg-transparent px-5 text-lg text-[#202020] outline-none placeholder:text-[#8f959c]"
                placeholder="What skills or budget do you have?"
              />
              <button
                onClick={onGetStarted}
                className="premium-button flex items-center gap-2 rounded-full bg-[#1a2535] px-6 py-3 text-lg font-semibold text-white"
              >
                Start building
                <ArrowRight className="h-5 w-5" />
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            className="premium-card relative min-h-[620px] overflow-hidden rounded-[26px] bg-[#e1d4c4]"
            initial={{ opacity: 0, x: 42, rotate: 1.4 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 0.95, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=85"
              alt="Young entrepreneurs brainstorming"
              className="h-[620px] w-full object-cover object-center"
              style={{ y: heroImageY, scale: 1.06 }}
            />
            <motion.div className="absolute left-8 top-32 w-52 rounded-lg bg-white/95 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.12)] backdrop-blur" style={{ y: heroCardsY }}>
              <div className="flex items-center gap-3 text-[#007f61] mb-2">
                <BrainCircuit className="h-5 w-5" />
                <span className="font-semibold text-sm">Idea Agent</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">Generating hyper-localized business concepts for Egypt & MENA...</p>
            </motion.div>
            <motion.div className="absolute left-8 top-[420px] w-[355px] rounded-xl bg-white/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.14)] backdrop-blur" style={{ y: heroCardsY }}>
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <Database className="h-5 w-5" />
                <span className="font-semibold">RAG Knowledge Base</span>
              </div>
              <p className="text-sm text-slate-600">Retrieving Egyptian market insights, pricing, and consumer behavior...</p>
            </motion.div>
            <motion.div className="absolute bottom-[-18px] left-8 w-72 rounded-xl bg-white/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.12)] backdrop-blur" style={{ y: heroCardsY }}>
              <p className="text-lg font-medium">Business Validated</p>
              <div className="mt-4 flex items-center gap-5">
                <Donut />
                <div className="space-y-3">
                  <span className="block h-3 w-16 rounded bg-[#008465]" />
                  <span className="block h-3 w-28 rounded bg-[#d8dddd]" />
                  <span className="block h-3 w-24 rounded bg-[#d8dddd]" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        <Reveal className="mx-auto max-w-[1520px] px-6 py-10 md:px-12 lg:px-20">
          <p className="text-center text-sm font-medium text-slate-400 mb-6 uppercase tracking-widest">Powered by modern tech stack</p>
          <div className="flex flex-wrap items-center justify-center gap-12 border-y border-[#eeeeee] py-7 opacity-70">
            {logoMarks.map(mark => (
              <span key={mark} className="text-sm font-semibold uppercase tracking-[-0.02em] text-[#1f2926]">
                {mark}
              </span>
            ))}
          </div>
        </Reveal>

        <section className="mx-auto max-w-[1520px] px-6 py-20 md:px-12 lg:px-20">
          <Reveal>
            <h2 className="max-w-[880px] text-4xl font-normal leading-tight tracking-[-0.035em] md:text-5xl">
              Stop getting overwhelmed by scattered information. Let our AI Trinity Strategy build your execution plan.
            </h2>
          </Reveal>
          <motion.div className="mt-16 grid gap-8 lg:grid-cols-3" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-90px' }}>
            <PremiumCard>
              <ProductMockup />
              <h3 className="mt-8 text-2xl font-medium">Intelligence (LLM)</h3>
              <p className="mt-5 max-w-[380px] text-base leading-relaxed text-[#4c5661]">
                Our foundation model handles complex idea generation, business reasoning, and strategic decision-making to give you a clear direction.
              </p>
            </PremiumCard>
            <PremiumCard>
              <div className="flex h-[330px] items-center justify-center rounded-[20px] bg-[#f8f8f8]">
                <div className="w-[295px] rounded-xl bg-white p-8 shadow-sm">
                  <div className="space-y-6">
                    {formationItems.slice(0, 4).map(([label, Icon], index) => (
                      <div key={label as string} className="flex items-center gap-4">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-full bg-[#e4f3ee] text-[#008465]`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="text-sm font-medium">{label as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <h3 className="mt-8 text-2xl font-medium">Action (Agents)</h3>
              <p className="mt-5 max-w-[380px] text-base leading-relaxed text-[#4c5661]">
                A Multi-Agent architecture where dedicated Idea, Validation, Business, and Marketing agents autonomously structure your startup.
              </p>
            </PremiumCard>
            <PremiumCard>
              <div className="flex h-[330px] items-center justify-center rounded-[20px] bg-[#f8f8f8]">
                <div className="w-[310px] rounded-xl bg-white p-6 shadow-sm border-l-4 border-emerald-500">
                  <p className="font-medium text-slate-800">Egyptian Market Insights</p>
                  <div className="mt-4 space-y-3">
                    <div className="h-2 w-full bg-slate-100 rounded"></div>
                    <div className="h-2 w-5/6 bg-slate-100 rounded"></div>
                    <div className="h-2 w-4/6 bg-slate-100 rounded"></div>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-xs text-emerald-600 font-medium bg-emerald-50 p-2 rounded">
                    <Database className="w-4 h-4" /> Vector DB Context Loaded
                  </div>
                </div>
              </div>
              <h3 className="mt-8 text-2xl font-medium">Knowledge (RAG)</h3>
              <p className="mt-5 max-w-[380px] text-base leading-relaxed text-[#4c5661]">
                Retrieves real local insights, pricing trends, and business frameworks so your outputs are practical, not generic ChatGPT answers.
              </p>
            </PremiumCard>
          </motion.div>
        </section>

        <section className="mx-auto max-w-[1520px] px-6 py-20 md:px-12 lg:px-20">
          <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <h2 className="max-w-[740px] text-4xl font-normal leading-tight tracking-[-0.035em]">
              Structured outputs for your entire entrepreneurial journey.
            </h2>
            <button onClick={onGetStarted} className="flex items-center gap-2 text-base font-medium">
              Start building <ChevronRight className="h-4 w-4" />
            </button>
          </Reveal>
          <Reveal className="mt-10 rounded-[20px] bg-[#f8f8f8] px-8 py-12">
            <motion.div className="grid gap-7 md:grid-cols-2 lg:grid-cols-5" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <PlanSheet title="Idea Generation" />
              <PlanSheet title="Validation Score" />
              <PlanSheet title="Lean Canvas" />
              <PlanSheet title="Brand Identity" />
              <PlanSheet title="Marketing Assets" />
            </motion.div>
            <div className="mt-12 grid gap-8 border-t border-[#e9e9e9] pt-8 text-center md:grid-cols-4">
              {[
                ['0 to 1', 'in minutes'],
                ['4', 'Specialized AI Agents'],
                ['100%', 'Structured output'],
                ['1', 'Centralized dashboard']
              ].map(([value, label]) => (
                <div key={value}>
                  <p className="text-3xl font-medium">{value}</p>
                  <p className="mt-2 text-sm text-[#5b6570]">{label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        <section className="mx-auto grid max-w-[1520px] items-center gap-14 px-6 py-24 md:px-12 lg:grid-cols-2 lg:px-20">
          <Reveal>
            <h2 className="max-w-[520px] text-4xl font-normal leading-tight tracking-[-0.035em]">
              Designed specifically for the Egyptian & MENA market context
            </h2>
            <p className="mt-10 max-w-[560px] text-base leading-relaxed text-slate-600">
              Unlike generic AI tools, Creator Engine utilizes Retrieval-Augmented Generation (RAG) hooked into datasets of regional startup niches, local pricing models, and consumer behavior. This ensures your MVP strategies and execution plans actually work in the real world.
            </p>
            <button onClick={onGetStarted} className="mt-8 rounded-lg bg-[#f4f4f4] hover:bg-[#e5e5e5] transition-colors px-5 py-3 text-sm font-medium">
              See how it works <ChevronRight className="ml-1 inline h-4 w-4" />
            </button>
          </Reveal>
          <Reveal className="rounded-[20px] bg-[#f8f8f8] p-12">
            <RevenueCard />
            <div className="mt-8 rounded-xl bg-white p-8 shadow-sm">
              <div className="flex items-center gap-10">
                <Donut />
                <div className="space-y-4 text-sm">
                  {['Local demand analysis', 'Competitor mapping', 'Pricing strategy'].map((item, index) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className={`h-3 w-3 rounded-sm ${index === 0 ? 'bg-[#008465]' : index === 1 ? 'bg-[#9ccdc0]' : 'bg-[#2e403d]'}`} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="relative overflow-hidden bg-[#0b3b32] py-28 text-white">
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-[#e7fff6]/10 blur-3xl" />
          <Reveal className="relative mx-auto max-w-[1520px] px-6 md:px-12 lg:px-20">
            <p className="text-sm font-semibold text-emerald-400">The Problem We Solve</p>
            <h2 className="mt-8 max-w-[850px] text-4xl font-semibold leading-tight tracking-[-0.035em]">
              Many students and professionals in Egypt want to start a business or generate income online, but they get overwhelmed by scattered information. We turn that confusion into execution.
            </h2>
            <div className="mt-12 pt-12 border-t border-white/10 grid max-w-[900px] gap-8 md:grid-cols-3">
              {[
                ['Mina Wael Magdy', 'AI Foundry Team'],
                ['Omar Mohammed', 'AI Foundry Team'],
                ['Samy Barsoum', 'AI Foundry Team'],
                ['Amgd Magdy Labib', 'AI Foundry Team'],
                ['Mina Nabil Fayez', 'AI Foundry Team']
              ].map(([name, role]) => (
                <div key={name}>
                  <p className="text-lg font-medium text-[#fff3dd]">{name}</p>
                  <p className="mt-1 text-sm text-emerald-200/70">{role}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        <Reveal className="mx-auto grid max-w-[1520px] gap-12 px-6 py-20 md:px-12 lg:grid-cols-[360px_1fr] lg:px-20">
          <h2 className="text-4xl font-normal leading-tight tracking-[-0.035em]">Frequently asked questions</h2>
          <div>
            {faqItems.map(item => (
              <button key={item} className="group flex w-full items-center justify-between border-b border-[#dadada] py-5 text-left text-base font-medium transition-colors hover:text-[#008465]">
                {item}
                <ChevronDown className="h-4 w-4 text-[#77808a] transition-transform group-hover:rotate-[-90deg]" />
              </button>
            ))}
          </div>
        </Reveal>
      </main>

      <footer className="mx-auto grid max-w-[1520px] gap-12 px-6 pb-16 pt-10 md:px-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:px-20 border-t border-slate-100 mt-10">
        <div>
          <Logo />
          <p className="mt-6 max-w-[210px] text-sm leading-relaxed text-slate-500">Creator Engine by AI Foundry. GenAI / Entrepreneurship / SaaS.</p>
          <button className="mt-10 flex w-44 items-center justify-between rounded-lg bg-[#f8f8f8] px-4 py-3 text-sm">
            English <ChevronDown className="h-4 w-4" />
          </button>
          <p className="mt-16 text-sm text-[#777]">Copyright © AI Foundry.</p>
        </div>
        {[
          ['Platform', 'Idea Generator', 'Validation Agent', 'Business Builder', 'Marketing Engine', 'Dashboard'],
          ['Tech Stack', 'Next.js Frontend', 'Node.js Backend', 'MongoDB', 'FAISS Vector DB', 'LLM Agents'],
          ['AI Foundry', 'Team Members', 'Our Mission', 'Egypt Market Focus', 'Contact']
        ].map(column => (
          <div key={column[0]}>
            <h3 className="font-semibold">{column[0]}</h3>
            <div className="mt-5 space-y-3 text-sm text-[#555]">
              {column.slice(1).map(item => (
                <p key={item} className="hover:text-emerald-600 cursor-pointer transition-colors">{item}</p>
              ))}
            </div>
          </div>
        ))}
      </footer>
    </div>
  );
}
