'use client';

import { useEffect, useState } from 'react';
import { authClient } from '@/lib/authClient';
import { useStore } from '@/store/useStore';
import { useI18n } from '@/lib/i18n/I18nContext';
import {
  User,
  Mail,
  Calendar,
  Briefcase,
  Shield,
  Star,
  FolderKanban,
  Hash,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface AccountProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: string;
  isBanned: boolean;
  plan: string;
  projectCount: number;
  joinedAt: string;
}

function InfoRow({
  icon: Icon,
  label,
  value,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | number | null;
  badge?: { text: string; color: string };
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3 text-slate-500">
        <Icon className="w-4 h-4 shrink-0" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {badge ? (
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full border ${badge.color}`}
        >
          {badge.text}
        </span>
      ) : (
        <span className="text-sm font-semibold text-slate-800">
          {value ?? '—'}
        </span>
      )}
    </div>
  );
}

export default function AccountDetails() {
  const { t } = useI18n();
  const { projects } = useStore();
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    authClient
      .get<AccountProfile>('/account')
      .then((data) => setProfile(data))
      .catch(() => setError('Failed to load account details. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const userInitial =
    profile?.name?.charAt(0)?.toUpperCase() ||
    profile?.email?.charAt(0)?.toUpperCase() ||
    '?';

  const roleBadge =
    profile?.role === 'admin'
      ? {
          text: t('account.roleAdmin'),
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        }
      : { text: t('account.roleUser'), color: 'text-slate-600 bg-slate-50 border-slate-200' };

  const planBadge =
    profile?.plan === 'Admin'
      ? {
          text: t('account.planAdmin'),
          color: 'text-amber-700 bg-amber-50 border-amber-200',
        }
      : { text: t('account.planFree'), color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('account.title')}</h1>
        <p className="text-slate-500 text-sm mt-1">
          {t('account.subtitle')}
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-slate-500 py-12 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">{t('account.loading')}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {profile && (
        <>
          {/* Avatar + Name hero */}
          <div className="bg-gradient-to-br from-indigo-50 via-white to-emerald-50 border border-slate-200 rounded-2xl p-6 flex items-center gap-5 shadow-sm">
            {profile.avatar && !imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar}
                alt={profile.name || profile.email}
                onError={() => setImgError(true)}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl font-bold ring-2 ring-indigo-200">
                {userInitial}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-slate-900 truncate">
                {profile.name || t('account.unnamed')}
              </h2>
              <p className="text-sm text-slate-500 truncate">{profile.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${roleBadge.color}`}
                >
                  {roleBadge.text}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${planBadge.color}`}
                >
                  {planBadge.text}
                </span>
              </div>
            </div>
          </div>

          {/* Info rows */}
          <div className="bg-white border border-slate-200 rounded-2xl px-6 py-2 shadow-sm divide-y divide-slate-100">
            <InfoRow icon={User} label={t('account.fullName')} value={profile.name || t('account.notSet')} />
            <InfoRow icon={Mail} label={t('account.email')} value={profile.email} />
            <InfoRow icon={Hash} label={t('account.userId')} value={profile.id} />
            <InfoRow
              icon={Calendar}
              label={t('account.dateJoined')}
              value={formatDate(profile.joinedAt)}
            />
            <InfoRow icon={Shield} label={t('account.role')} badge={roleBadge} />
            <InfoRow icon={Star} label={t('account.plan')} badge={planBadge} />
            <InfoRow
              icon={FolderKanban}
              label={t('account.projectsCreated')}
              value={profile.projectCount}
            />
          </div>

          {/* Projects list */}
          {projects.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-400" />
                {t('account.yourProjects')}
              </h3>
              <ul className="space-y-2">
                {projects.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 truncate max-w-[200px]">
                          {p.name}
                        </p>
                        <p className="text-xs text-slate-400 capitalize">
                          {!p.industry || p.industry.toLowerCase() === 'unknown' ? t('account.unknownIndustry') : p.industry}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${
                        p.status === 'active'
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : 'text-slate-500 bg-slate-50 border-slate-200'
                      }`}
                    >
                      {p.status === 'active' ? t('account.statusActive') : p.status === 'draft' ? t('account.statusDraft') : p.status === 'archived' ? t('account.statusArchived') : p.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {profile.isBanned && (
            <div className="flex items-center gap-3 text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">
                This account has been banned by an administrator.
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
