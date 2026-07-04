'use client';

/* eslint-disable @next/next/no-img-element */

import React, { ReactNode, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useI18n } from '../lib/i18n/I18nContext';
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
  isAuthenticated?: boolean;
};

const logoMarks = ['Next.js', 'Node.js', 'Express', 'MongoDB', 'FAISS', 'Pinecone'];

const formationItems = [
  ['outputs.sheets.ideaGen', Bot],
  ['outputs.sheets.valScore', ShieldCheck],
  ['outputs.sheets.leanCanvas', BriefcaseBusiness],
  ['outputs.sheets.brandIdentity', Globe2],
  ['outputs.sheets.marketingAssets', Store],
  ['outputs.sheets.roadmap', CalendarCheck], // Not strictly in dictionary, will leave as key or translate, wait, I'll use outputs.sheets.valScore
  ['outputs.sheets.database', Database] // Just to keep icon match
] as const;
// Wait, I should just move the string definition inside the component or just translate directly

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

function ProductMockup({ t }: { t: any }) {
  return (
    <div className="relative h-[330px] overflow-hidden rounded-[20px] bg-[#f8f8f8]">
      <motion.div
        className="absolute left-[24%] top-[20%] h-[190px] w-[42%] rounded-xl bg-gradient-to-br from-[#007f61] to-[#0aa879] p-5 text-white shadow-sm ltr:left-[24%] rtl:right-[24%]"
        initial={{ y: 22, rotate: -2 }}
        whileInView={{ y: 0, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="mt-24 text-[10px] font-semibold opacity-80">Creator Engine</p>
        <p className="mt-2 text-xl font-medium">{t('egyptMena.ideaValidation')}</p>
      </motion.div>
      <motion.div
        className="absolute right-[-8%] top-[21%] h-[190px] w-[36%] rounded-xl bg-white p-5 shadow-sm rtl:left-[-8%] rtl:right-auto"
        initial={{ x: 34, opacity: 0.35 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="mb-7 text-sm font-medium">{t('egyptMena.marketFeasibility')}</p>
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

function RevenueCard({ t }: { t: any }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <p className="text-base text-[#1b1b1b]">{t('egyptMena.growthPotential')}</p>
      <div className="mt-10 flex items-end justify-between gap-8">
        <div>
          <span className="text-3xl font-medium">{t('egyptMena.high')}</span>
          <span className="mx-2 text-sm text-emerald-500">{t('egyptMena.validated')}</span>
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
        {title.includes('Growth') || title.includes('إمكانات') ? <MiniBars /> : title.includes('Market') || title.includes('السوق') ? <Donut /> : <p className="text-lg font-medium text-[#111]">{title}</p>}
      </div>
    </div>
  );
}

export default function LandingPage({ onGetStarted, onLogin, isAuthenticated }: LandingPageProps) {
  const { t, locale, setLocale, dir } = useI18n();

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });
  const heroImageY = useTransform(scrollYProgress, [0, 1], [0, 82]);
  const heroCardsY = useTransform(scrollYProgress, [0, 1], [0, -48]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, 34]);
  const heroFade = useTransform(scrollYProgress, [0, 0.86], [1, 0.72]);

  const navItems = [
    { key: 'nav.aiTrinity' },
    { key: 'nav.multiAgent' },
    { key: 'nav.forEgypt' }
  ];

  const formationItemsLocal = [
    [t('outputs.sheets.ideaGen'), Bot],
    [t('outputs.sheets.valScore'), ShieldCheck],
    [t('outputs.sheets.leanCanvas'), BriefcaseBusiness],
    [t('outputs.sheets.brandIdentity'), Globe2],
  ];

  const faqKeys = [
    'faq.q1',
    'faq.q2',
    'faq.q3',
    'faq.q4',
    'faq.q5',
    'faq.q6',
    'faq.q7'
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-[#050505]">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-24 max-w-[1520px] items-center justify-between px-6 md:px-12 lg:px-20">
          <div className="flex items-center gap-12">
            <Logo />
            <nav className="hidden items-center gap-9 text-lg font-medium md:flex">
              {navItems.map(item => (
                <button key={item.key} className="flex items-center gap-1 transition-colors hover:text-[#007f61]">
                  {t(item.key)}
                  <ChevronDown className="h-4 w-4" />
                </button>
              ))}
            </nav>
          </div>
          <div className="hidden items-center gap-10 md:flex">
            {!isAuthenticated && (
              <button onClick={onLogin} className="text-lg font-medium transition-colors hover:text-[#007f61]">
                {t('nav.login')}
              </button>
            )}
            <button
              onClick={onGetStarted}
              className="premium-button rounded-full bg-[#1a2535] px-9 py-3.5 text-lg font-semibold text-white"
            >
              {isAuthenticated ? t('nav.dashboard') : t('nav.getStarted')}
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
              {t('hero.badge')}
            </motion.p>
            <motion.h1
              className="text-[56px] font-medium leading-[0.98] tracking-[-0.055em] text-[#121212] md:text-[76px] lg:text-[82px]"
              initial={{ opacity: 0, y: 34, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.85, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              {t('hero.title')}
            </motion.h1>
            <motion.p
              className="mt-14 max-w-[710px] text-2xl leading-snug tracking-[-0.02em]"
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {t('hero.subtitle')}
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
                placeholder={t('hero.inputPlaceholder')}
              />
              <button
                onClick={onGetStarted}
                className="premium-button flex items-center gap-2 rounded-full bg-[#1a2535] px-6 py-3 text-lg font-semibold text-white"
              >
                {isAuthenticated ? t('nav.dashboard') : t('hero.startBuilding')}
                {dir === 'rtl' ? <ArrowRight className="h-5 w-5 rotate-180" /> : <ArrowRight className="h-5 w-5" />}
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
            <motion.div className="absolute left-8 top-32 w-52 rounded-lg bg-white/95 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.12)] backdrop-blur rtl:right-8 rtl:left-auto" style={{ y: heroCardsY }}>
              <div className="flex items-center gap-3 text-[#007f61] mb-2">
                <BrainCircuit className="h-5 w-5" />
                <span className="font-semibold text-sm">{t('hero.ideaAgent')}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{t('hero.ideaAgentDesc')}</p>
            </motion.div>
            <motion.div className="absolute left-8 top-[420px] w-[355px] rounded-xl bg-white/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.14)] backdrop-blur rtl:right-8 rtl:left-auto" style={{ y: heroCardsY }}>
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <Database className="h-5 w-5" />
                <span className="font-semibold">{t('hero.ragBase')}</span>
              </div>
              <p className="text-sm text-slate-600">{t('hero.ragBaseDesc')}</p>
            </motion.div>
            <motion.div className="absolute bottom-[-18px] left-8 w-72 rounded-xl bg-white/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.12)] backdrop-blur rtl:right-8 rtl:left-auto" style={{ y: heroCardsY }}>
              <p className="text-lg font-medium">{t('hero.businessValidated')}</p>
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
          <p className="text-center text-sm font-medium text-slate-400 mb-6 uppercase tracking-widest">{t('hero.poweredBy')}</p>
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
              {t('features.title')}
            </h2>
          </Reveal>
          <motion.div className="mt-16 grid gap-8 lg:grid-cols-3" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-90px' }}>
            <PremiumCard>
              <ProductMockup t={t} />
              <h3 className="mt-8 text-2xl font-medium">{t('features.intelligence')}</h3>
              <p className="mt-5 max-w-[380px] text-base leading-relaxed text-[#4c5661]">
                {t('features.intelligenceDesc')}
              </p>
            </PremiumCard>
            <PremiumCard>
              <div className="flex h-[330px] items-center justify-center rounded-[20px] bg-[#f8f8f8]">
                <div className="w-[295px] rounded-xl bg-white p-8 shadow-sm">
                  <div className="space-y-6">
                    {formationItemsLocal.map(([label, Icon], index) => (
                      <div key={index} className="flex items-center gap-4">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-full bg-[#e4f3ee] text-[#008465]`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="text-sm font-medium">{label as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <h3 className="mt-8 text-2xl font-medium">{t('features.action')}</h3>
              <p className="mt-5 max-w-[380px] text-base leading-relaxed text-[#4c5661]">
                {t('features.actionDesc')}
              </p>
            </PremiumCard>
            <PremiumCard>
              <div className="flex h-[330px] items-center justify-center rounded-[20px] bg-[#f8f8f8]">
                <div className="w-[310px] rounded-xl bg-white p-6 shadow-sm border-l-4 border-emerald-500 rtl:border-l-0 rtl:border-r-4">
                  <p className="font-medium text-slate-800">{t('features.egyptInsights')}</p>
                  <div className="mt-4 space-y-3">
                    <div className="h-2 w-full bg-slate-100 rounded"></div>
                    <div className="h-2 w-5/6 bg-slate-100 rounded"></div>
                    <div className="h-2 w-4/6 bg-slate-100 rounded"></div>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-xs text-emerald-600 font-medium bg-emerald-50 p-2 rounded">
                    <Database className="w-4 h-4" /> {t('features.vectorDb')}
                  </div>
                </div>
              </div>
              <h3 className="mt-8 text-2xl font-medium">{t('features.knowledge')}</h3>
              <p className="mt-5 max-w-[380px] text-base leading-relaxed text-[#4c5661]">
                {t('features.knowledgeDesc')}
              </p>
            </PremiumCard>
          </motion.div>
        </section>

        <section className="mx-auto max-w-[1520px] px-6 py-20 md:px-12 lg:px-20">
          <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <h2 className="max-w-[740px] text-4xl font-normal leading-tight tracking-[-0.035em]">
              {t('outputs.title')}
            </h2>
            <button onClick={onGetStarted} className="flex items-center gap-2 text-base font-medium">
              {t('outputs.startBuilding')} {dir === 'rtl' ? <ChevronRight className="h-4 w-4 rotate-180" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </Reveal>
          <Reveal className="mt-10 rounded-[20px] bg-[#f8f8f8] px-8 py-12">
            <motion.div className="grid gap-7 md:grid-cols-2 lg:grid-cols-5" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <PlanSheet title={t('outputs.sheets.ideaGen')} />
              <PlanSheet title={t('outputs.sheets.valScore')} />
              <PlanSheet title={t('outputs.sheets.leanCanvas')} />
              <PlanSheet title={t('outputs.sheets.brandIdentity')} />
              <PlanSheet title={t('outputs.sheets.marketingAssets')} />
            </motion.div>
            <div className="mt-12 grid gap-8 border-t border-[#e9e9e9] pt-8 text-center md:grid-cols-4">
              {[
                [t('outputs.stats.s1Value'), t('outputs.stats.s1Label')],
                [t('outputs.stats.s2Value'), t('outputs.stats.s2Label')],
                [t('outputs.stats.s3Value'), t('outputs.stats.s3Label')],
                [t('outputs.stats.s4Value'), t('outputs.stats.s4Label')]
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
              {t('egyptMena.title')}
            </h2>
            <p className="mt-10 max-w-[560px] text-base leading-relaxed text-slate-600">
              {t('egyptMena.desc')}
            </p>
            <button onClick={onGetStarted} className="mt-8 rounded-lg bg-[#f4f4f4] hover:bg-[#e5e5e5] transition-colors px-5 py-3 text-sm font-medium">
              {t('egyptMena.seeHowItWorks')} {dir === 'rtl' ? <ChevronRight className="mx-1 inline h-4 w-4 rotate-180" /> : <ChevronRight className="mx-1 inline h-4 w-4" />}
            </button>
          </Reveal>
          <Reveal className="rounded-[20px] bg-[#f8f8f8] p-12">
            <RevenueCard t={t} />
            <div className="mt-8 rounded-xl bg-white p-8 shadow-sm">
              <div className="flex items-center gap-10">
                <Donut />
                <div className="space-y-4 text-sm">
                  {[t('egyptMena.list.demand'), t('egyptMena.list.competitor'), t('egyptMena.list.pricing')].map((item, index) => (
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
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-[#e7fff6]/10 blur-3xl rtl:left-0 rtl:right-auto" />
          <Reveal className="relative mx-auto max-w-[1520px] px-6 md:px-12 lg:px-20">
            <p className="text-sm font-semibold text-emerald-400">{t('problem.badge')}</p>
            <h2 className="mt-8 max-w-[850px] text-4xl font-semibold leading-tight tracking-[-0.035em]">
              {t('problem.title')}
            </h2>
            <div className="mt-12 pt-12 border-t border-white/10 grid max-w-[900px] gap-8 md:grid-cols-3">
              {[
                [t('team.minaW'), t('problem.teamRole')],
                [t('team.omar'), t('problem.teamRole')],
                [t('team.samy'), t('problem.teamRole')],
                [t('team.amgd'), t('problem.teamRole')],
                [t('team.minaN'), t('problem.teamRole')]
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
          <h2 className="text-4xl font-normal leading-tight tracking-[-0.035em]">{t('faq.title')}</h2>
          <div>
            {faqKeys.map(key => (
              <button key={key} className="group flex w-full items-center justify-between border-b border-[#dadada] py-5 text-left text-base font-medium transition-colors hover:text-[#008465]">
                {t(key)}
                <ChevronDown className="h-4 w-4 text-[#77808a] transition-transform group-hover:rotate-[-90deg] rtl:group-hover:rotate-[90deg]" />
              </button>
            ))}
          </div>
        </Reveal>
      </main>

      <footer className="mx-auto grid max-w-[1520px] gap-12 px-6 pb-16 pt-10 md:px-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:px-20 border-t border-slate-100 mt-10">
        <div>
          <Logo />
          <p className="mt-6 max-w-[210px] text-sm leading-relaxed text-slate-500">{t('footer.desc')}</p>
          <button 
            onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')} 
            className="mt-10 flex w-44 items-center justify-between rounded-lg bg-[#f8f8f8] px-4 py-3 text-sm hover:bg-[#eaeaea] transition-colors"
          >
            {t('footer.languageToggle')} <ChevronDown className="h-4 w-4" />
          </button>
          <p className="mt-16 text-sm text-[#777]">{t('footer.copyright')}</p>
        </div>
        {[
          [t('footer.col1Title'), t('footer.col1.i1'), t('footer.col1.i2'), t('footer.col1.i3'), t('footer.col1.i4'), t('footer.col1.i5')],
          [t('footer.col2Title'), t('footer.col2.i1'), t('footer.col2.i2'), t('footer.col2.i3'), t('footer.col2.i4'), t('footer.col2.i5')],
          [t('footer.col3Title'), t('footer.col3.i1'), t('footer.col3.i2'), t('footer.col3.i3'), t('footer.col3.i4')]
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
