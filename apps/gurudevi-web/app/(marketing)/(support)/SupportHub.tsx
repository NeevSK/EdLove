'use client';

import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  Copy,
  Cpu,
  Database,
  ExternalLink,
  Flame,
  Globe2,
  Heart,
  HelpCircle,
  Layers,
  LifeBuoy,
  Mail,
  RefreshCw,
  School,
  Search,
  ShieldCheck,
  Sparkles,
  Wifi,
  WifiOff,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../../../lib/i18n';
import {
  FeaturedFlow,
  PUBLIC_SUPPORT_CONFIG,
  SurfaceSupportConfig,
} from '../../../lib/support/supportConfig';
import { IssueType, SupportForm } from './SupportForm';
import {
  CONTRIBUTION_TRACKS,
  FUNCTIONALITY_GUIDES,
  GuideItem,
  SUPPORT_CONTACT_CHANNELS,
  SUPPORT_FAQS,
  SURFACE_COMPARISON,
  SurfaceFilter,
} from './supportData';

type ActiveTab = 'guides' | 'contact' | 'contribute' | 'faq' | 'diagnostics';

type Props = {
  supportEmail: string;
  institutionalEmail: string;
  gratitudeEmail: string;
  formAction?: string;
  config?: SurfaceSupportConfig;
};

interface DiagnosticState {
  currentHost: string;
  detectedSurface: 'explore' | 'sanctuary' | 'public' | 'local';
  isOnline: boolean;
  localStorageAvailable: boolean;
  indexedDbAvailable: boolean;
  storageQuotaMb: number | null;
  serviceWorkerSupported: boolean;
  timestamp: string;
}

export function SupportHub({
  supportEmail,
  institutionalEmail,
  gratitudeEmail,
  formAction,
  config = PUBLIC_SUPPORT_CONFIG,
}: Props) {
  const { t, locale } = useTranslation();
  const [activeTab, setActiveTab] = useState<ActiveTab>('guides');
  const [surfaceFilter, setSurfaceFilter] = useState<SurfaceFilter>(config.guideSurfaceFilter);
  const [faqCategory, setFaqCategory] = useState<string>('all');
  const [faqQuery, setFaqQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IssueType>(
    config.defaultContactCategory,
  );
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const [diagnostics, setDiagnostics] = useState<DiagnosticState | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const runDiagnostics = useCallback(async () => {
    setIsDiagnosing(true);
    const host = typeof window !== 'undefined' ? window.location.hostname : 'unknown';
    let surface: 'explore' | 'sanctuary' | 'public' | 'local' = 'public';

    if (host.includes('explore.')) {
      surface = 'explore';
    } else if (host.includes('sanctuary.')) {
      surface = 'sanctuary';
    } else if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost')) {
      surface = 'local';
    }

    let lsOk = false;
    try {
      localStorage.setItem('__gurudevi_diag__', 'ok');
      lsOk = localStorage.getItem('__gurudevi_diag__') === 'ok';
      localStorage.removeItem('__gurudevi_diag__');
    } catch {
      lsOk = false;
    }

    const idbOk = typeof window !== 'undefined' && 'indexedDB' in window;
    let quotaMb: number | null = null;
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        if (estimate.quota) {
          quotaMb = Math.round(estimate.quota / (1024 * 1024));
        }
      } catch {
        quotaMb = null;
      }
    }

    const swOk = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;

    setDiagnostics({
      currentHost: host,
      detectedSurface: surface,
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      localStorageAvailable: lsOk,
      indexedDbAvailable: idbOk,
      storageQuotaMb: quotaMb,
      serviceWorkerSupported: swOk,
      timestamp: new Date().toLocaleTimeString(),
    });
    setIsDiagnosing(false);
  }, []);

  useEffect(() => {
    void runDiagnostics();

    const handleOnline = () => setDiagnostics((prev) => (prev ? { ...prev, isOnline: true } : null));
    const handleOffline = () => setDiagnostics((prev) => (prev ? { ...prev, isOnline: false } : null));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [runDiagnostics]);

  const copyToClipboard = (email: string) => {
    void navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  const filteredGuides = useMemo(() => {
    if (surfaceFilter === 'all') return FUNCTIONALITY_GUIDES;
    return FUNCTIONALITY_GUIDES.filter(
      (guide) => guide.surface === surfaceFilter || guide.surface === 'both',
    );
  }, [surfaceFilter]);

  const filteredFaqs = useMemo(() => {
    return SUPPORT_FAQS.filter((faq) => {
      const matchesCategory = faqCategory === 'all' || faq.category === faqCategory;
      const matchesQuery =
        !faqQuery.trim() ||
        faq.question.toLowerCase().includes(faqQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(faqQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [faqCategory, faqQuery]);

  const noticeStyle = useMemo(() => {
    switch (config.bannerNotice.type) {
      case 'sandboxed':
        return {
          bg: 'bg-purple-50/60 border-purple-200/70',
          badgeBg: 'bg-purple-100 text-purple-900',
          dot: 'bg-purple-500',
          title: 'text-purple-950',
          text: 'text-purple-900/80',
        };
      case 'authenticated':
        return {
          bg: 'bg-emerald-50/60 border-emerald-200/70',
          badgeBg: 'bg-emerald-100 text-emerald-900',
          dot: 'bg-emerald-500',
          title: 'text-emerald-950',
          text: 'text-emerald-900/80',
        };
      case 'info':
      default:
        return {
          bg: 'bg-amber-50/60 border-amber-200/70',
          badgeBg: 'bg-amber-100 text-amber-900',
          dot: 'bg-amber-500',
          title: 'text-amber-950',
          text: 'text-amber-900/80',
        };
    }
  }, [config.bannerNotice.type]);

  return (
    <div className="space-y-16">
      {/* Surface-Specific Operational Notice */}
      <div className={`rounded-3xl border p-6 shadow-xs sm:p-8 ${noticeStyle.bg}`}>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${noticeStyle.dot}`} />
                <span className={`relative inline-flex rounded-full h-3 w-3 ${noticeStyle.dot}`} />
              </span>
              <span className={`rounded-full px-3 py-1 font-sans text-xs font-bold uppercase tracking-wider ${noticeStyle.badgeBg}`}>
                {config.badge}
              </span>
            </div>
            <h2 className={`text-2xl font-medium tracking-tight sm:text-3xl ${noticeStyle.title}`}>
              {config.bannerNotice.heading}
            </h2>
            <p className={`max-w-3xl text-sm leading-relaxed sm:text-base ${noticeStyle.text}`}>
              {config.bannerNotice.text}
            </p>
          </div>

          {config.bannerNotice.actionHref && (
            <div className="shrink-0">
              <a
                href={config.bannerNotice.actionHref}
                target={config.bannerNotice.isExternal ? '_blank' : undefined}
                rel={config.bannerNotice.isExternal ? 'noopener noreferrer' : undefined}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-6 py-2.5 font-sans text-xs font-bold text-paper-light hover:bg-lotus transition-colors"
              >
                {config.bannerNotice.actionLabel ?? 'Open Surface ↗'}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Surface Featured Flows / Steps */}
      {config.featuredFlows.length > 0 && (
        <section aria-labelledby="surface-flows-title" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">
                Dedicated Subdomain Guidance
              </p>
              <h3 id="surface-flows-title" className="mt-1 text-2xl font-medium tracking-tight">
                Key Workflows for this Surface
              </h3>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {config.featuredFlows.map((flow: FeaturedFlow) => (
              <div
                key={flow.id}
                className="flex flex-col justify-between rounded-3xl border border-line bg-white p-6 shadow-xs hover:border-lotus/40 hover:shadow-md transition-all"
              >
                <div>
                  <span className="font-mono text-2xl font-bold text-lotus/80">
                    {flow.stepNumber}
                  </span>
                  <h4 className="mt-3 text-lg font-medium tracking-tight text-ink">
                    {flow.title}
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                    {flow.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-line/60 pt-4">
                  <a
                    href={flow.actionHref}
                    target={flow.isExternal ? '_blank' : undefined}
                    rel={flow.isExternal ? 'noopener noreferrer' : undefined}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-ink hover:text-lotus transition-colors"
                  >
                    <span>{flow.actionLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Tab Navigation */}
      <nav
        aria-label="Support sections"
        className="flex flex-wrap gap-2 border-b border-line pb-4"
      >
        <button
          type="button"
          onClick={() => setActiveTab('guides')}
          className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-sans text-sm font-bold transition-all ${
            activeTab === 'guides'
              ? 'bg-ink text-paper-light shadow-sm'
              : 'bg-paper-light text-ink hover:bg-white border border-transparent hover:border-line'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>{t('support.tabs.guides')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-sans text-sm font-bold transition-all ${
            activeTab === 'contact'
              ? 'bg-ink text-paper-light shadow-sm'
              : 'bg-paper-light text-ink hover:bg-white border border-transparent hover:border-line'
          }`}
        >
          <Mail className="h-4 w-4" />
          <span>{t('support.tabs.contact')}</span>
        </button>

        {config.showContribution && (
          <button
            type="button"
            onClick={() => setActiveTab('contribute')}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-sans text-sm font-bold transition-all ${
              activeTab === 'contribute'
                ? 'bg-ink text-paper-light shadow-sm'
                : 'bg-paper-light text-ink hover:bg-white border border-transparent hover:border-line'
            }`}
          >
            <Heart className="h-4 w-4" />
            <span>{t('support.tabs.contribute')}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('faq')}
          className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-sans text-sm font-bold transition-all ${
            activeTab === 'faq'
              ? 'bg-ink text-paper-light shadow-sm'
              : 'bg-paper-light text-ink hover:bg-white border border-transparent hover:border-line'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          <span>{t('support.tabs.faq')}</span>
        </button>

        {config.showDiagnostics && (
          <button
            type="button"
            onClick={() => setActiveTab('diagnostics')}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-sans text-sm font-bold transition-all ${
              activeTab === 'diagnostics'
                ? 'bg-ink text-paper-light shadow-sm'
                : 'bg-paper-light text-ink hover:bg-white border border-transparent hover:border-line'
            }`}
          >
            <Cpu className="h-4 w-4" />
            <span>{t('support.tabs.diagnostics')}</span>
          </button>
        )}
      </nav>

      {/* TAB 1: FUNCTIONALITY GUIDES */}
      {activeTab === 'guides' && (
        <section className="space-y-12">
          {/* Surface Filter and Comparison */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-3xl font-medium tracking-tight">Ecology Feature Guides</h3>
              <p className="mt-2 text-ink-soft">
                Learn how the components operate, how data is safeguarded, and how offline sync works.
              </p>
            </div>

            {config.showAllGuidesToggle && (
              <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl border border-line bg-paper-light">
                <button
                  type="button"
                  onClick={() => setSurfaceFilter('all')}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                    surfaceFilter === 'all'
                      ? 'bg-ink text-paper-light'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  {t('support.surfaceFilter.all')} ({FUNCTIONALITY_GUIDES.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSurfaceFilter('explore')}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                    surfaceFilter === 'explore'
                      ? 'bg-ink text-paper-light'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  {t('support.surfaceFilter.explore')}
                </button>
                <button
                  type="button"
                  onClick={() => setSurfaceFilter('sanctuary')}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                    surfaceFilter === 'sanctuary'
                      ? 'bg-ink text-paper-light'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  {t('support.surfaceFilter.sanctuary')}
                </button>
              </div>
            )}
          </div>

          {/* Explore vs Sanctuary Comparison Matrix */}
          {config.showComparison && (
            <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-xs">
              <div className="border-b border-line bg-paper-light p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <Layers className="h-5 w-5 text-lotus" />
                  <h4 className="text-xl font-medium tracking-tight">
                    Understanding Explore vs Sanctuary Surfaces
                  </h4>
                </div>
                <p className="mt-2 text-sm text-ink-soft">
                  Gurudevi separates guest previewing from living institutional workspaces to ensure
                  teachers and schools can evaluate features freely before undertaking school-wide setup.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line bg-stone-50/50">
                      <th className="p-4 font-semibold text-ink sm:p-5">Capability / Dimension</th>
                      <th className="p-4 font-semibold text-lotus sm:p-5">
                        Explore Web (explore.gurudevi.app)
                      </th>
                      <th className="p-4 font-semibold text-emerald-800 sm:p-5">
                        Sanctuary Web (sanctuary.gurudevi.app)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {SURFACE_COMPARISON.map((row) => (
                      <tr key={row.feature} className="hover:bg-paper-light/50 transition-colors">
                        <td className="p-4 font-medium text-ink sm:p-5">{row.feature}</td>
                        <td className="p-4 text-ink-soft sm:p-5">{row.explore}</td>
                        <td className="p-4 text-ink-soft sm:p-5">{row.sanctuary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Guide Cards Grid */}
          <div className="grid gap-8 md:grid-cols-2">
            {filteredGuides.map((guide) => (
              <article
                key={guide.id}
                className="flex flex-col justify-between rounded-3xl border border-line bg-white p-6 shadow-xs hover:border-lotus/40 hover:shadow-md transition-all sm:p-8"
              >
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">
                      {guide.eyebrow}
                    </span>
                    <span className="rounded-full border border-line bg-paper-light px-3 py-1 font-sans text-xs font-bold text-ink-soft">
                      {guide.badge}
                    </span>
                  </div>

                  <h4 className="mt-4 text-2xl font-medium tracking-tight text-ink">
                    {guide.title}
                  </h4>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">{guide.summary}</p>

                  <ul className="mt-6 space-y-2.5 border-t border-line/60 pt-6">
                    {guide.keyFeatures.map((feat) => (
                      <li key={feat} className="flex items-start gap-3 text-sm text-ink-soft">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-lotus" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 border-t border-line/60 pt-6">
                  {guide.offlineNote && (
                    <p className="mb-4 text-xs font-medium text-emerald-800 bg-emerald-50 rounded-xl p-3 border border-emerald-200/60">
                      ⚡ <strong>Offline Resilience:</strong> {guide.offlineNote}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={guide.primaryAction.href}
                      target={guide.primaryAction.isExternal ? '_blank' : undefined}
                      rel={guide.primaryAction.isExternal ? 'noopener noreferrer' : undefined}
                      className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-6 py-2.5 font-sans text-xs font-bold text-paper-light hover:bg-lotus transition-colors"
                    >
                      {guide.primaryAction.label}
                    </a>
                    {guide.secondaryAction && (
                      <a
                        href={guide.secondaryAction.href}
                        target={guide.secondaryAction.isExternal ? '_blank' : undefined}
                        rel={guide.secondaryAction.isExternal ? 'noopener noreferrer' : undefined}
                        className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-paper-light px-5 py-2.5 font-sans text-xs font-bold text-ink hover:bg-white transition-colors"
                      >
                        {guide.secondaryAction.label}
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* TAB 2: CONTACT US */}
      {activeTab === 'contact' && (
        <section className="space-y-12">
          <div>
            <h3 className="text-3xl font-medium tracking-tight">Direct Channels &amp; Inquiry</h3>
            <p className="mt-2 text-ink-soft max-w-3xl">
              We operate human-first support with respect for the time and energy of educators,
              principals, and community contributors. Select an inquiry channel below or submit the
              structured dispatch form.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {SUPPORT_CONTACT_CHANNELS.map((channel) => (
              <div
                key={channel.name}
                className="flex flex-col justify-between rounded-3xl border border-line bg-white p-6 shadow-xs hover:border-lotus/40 transition-colors sm:p-7"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">
                      {channel.leadTime}
                    </span>
                    <Mail className="h-4 w-4 text-ink-soft" />
                  </div>

                  <h4 className="mt-3 text-xl font-medium tracking-tight text-ink">
                    {channel.name}
                  </h4>
                  <p className="mt-3 text-sm text-ink-soft leading-relaxed">{channel.purpose}</p>

                  <div className="mt-5 rounded-2xl bg-paper-light p-3.5 border border-line/60">
                    <p className="text-xs text-ink-soft">
                      <strong>Best for:</strong> {channel.recommendedFor}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3 border-t border-line/60 pt-5">
                  <a
                    href={`mailto:${channel.email}`}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-ink hover:text-lotus transition-colors"
                  >
                    <span>{channel.email}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(channel.email)}
                    className="rounded-xl border border-line p-2 text-ink-soft hover:bg-paper-light hover:text-ink transition-colors"
                    title="Copy email address"
                    aria-label={`Copy ${channel.email}`}
                  >
                    {copiedEmail === channel.email ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Form Context Pre-selectors */}
          <div className="rounded-3xl border border-line bg-paper-light p-6 sm:p-8">
            <h4 className="text-xl font-medium tracking-tight">Need a structured dispatch?</h4>
            <p className="mt-1 text-sm text-ink-soft">
              Choose your context below to pre-configure your inquiry:
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory('explore')}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                  selectedCategory === 'explore'
                    ? 'bg-ink text-paper-light'
                    : 'border border-line bg-white hover:border-lotus'
                }`}
              >
                🧭 Explore Guest House Question
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('sanctuary')}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                  selectedCategory === 'sanctuary'
                    ? 'bg-ink text-paper-light'
                    : 'border border-line bg-white hover:border-lotus'
                }`}
              >
                🏫 Sanctuary School &amp; Sync Issue
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('institutional')}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                  selectedCategory === 'institutional'
                    ? 'bg-ink text-paper-light'
                    : 'border border-line bg-white hover:border-lotus'
                }`}
              >
                🤝 School Onboarding &amp; Pilot Request
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('contribute')}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                  selectedCategory === 'contribute'
                    ? 'bg-ink text-paper-light'
                    : 'border border-line bg-white hover:border-lotus'
                }`}
              >
                ✨ Contribution / Volunteer Inquiry
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('bug')}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                  selectedCategory === 'bug'
                    ? 'bg-ink text-paper-light'
                    : 'border border-line bg-white hover:border-lotus'
                }`}
              >
                🐞 Bug or Defect Report
              </button>
            </div>

            <div className="mt-8">
              <SupportForm
                supportEmail={supportEmail}
                formAction={formAction}
                initialCategory={selectedCategory}
              />
            </div>
          </div>
        </section>
      )}

      {/* TAB 3: CONTRIBUTE */}
      {config.showContribution && activeTab === 'contribute' && (
        <section className="space-y-12">
          <div>
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-lotus" />
              <span className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">
                Community Stewardship
              </span>
            </div>
            <h3 className="mt-2 text-3xl font-medium tracking-tight">
              Co-Creating Gurudevi for Sri Lanka
            </h3>
            <p className="mt-3 text-ink-soft max-w-3xl leading-relaxed">
              Gurudevi is built on sovereign open principles. We welcome developers, educators,
              linguists, alumni, and community foundations to contribute time, wisdom, curriculum,
              and code.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {CONTRIBUTION_TRACKS.map((track) => (
              <div
                key={track.id}
                className="flex flex-col justify-between rounded-3xl border border-line bg-white p-6 shadow-xs sm:p-8 hover:border-lotus/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">
                      {track.eyebrow}
                    </span>
                    <span className="rounded-full bg-paper-light border border-line px-3 py-1 text-xs font-bold text-ink-soft">
                      {track.tag}
                    </span>
                  </div>

                  <h4 className="mt-4 text-2xl font-medium tracking-tight text-ink">
                    {track.title}
                  </h4>
                  <p className="mt-3 text-sm text-ink-soft leading-relaxed">{track.description}</p>

                  <div className="mt-6 border-t border-line/60 pt-6">
                    <h5 className="font-sans text-xs font-bold uppercase tracking-[0.1em] text-ink">
                      How to get involved:
                    </h5>
                    <ol className="mt-3 space-y-2 text-sm text-ink-soft list-decimal list-inside">
                      {track.steps.map((step) => (
                        <li key={step} className="leading-relaxed">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="mt-8 border-t border-line/60 pt-6">
                  <a
                    href={track.ctaHref}
                    target={track.isExternal ? '_blank' : undefined}
                    rel={track.isExternal ? 'noopener noreferrer' : undefined}
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-6 py-2.5 font-sans text-xs font-bold text-paper-light hover:bg-lotus transition-colors"
                  >
                    {track.ctaLabel}
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Anti-Slop & Quality Pledge */}
          <div className="rounded-3xl border border-line bg-paper-light p-6 sm:p-8">
            <h4 className="text-xl font-medium tracking-tight">Our Quality &amp; Care Standard</h4>
            <p className="mt-2 text-sm text-ink-soft leading-relaxed max-w-3xl">
              Software built for schools must be exceptionally respectful of attention. We reject
              notification spam, gamification tricks, tracking cookies, and administrative slop.
              Every pull request, curriculum asset, and localization proposal is reviewed against
              the Convivial Software Standard: technology exists to lift human drudgery, never to
              enclose life.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold">
              <span className="inline-flex items-center gap-2 rounded-xl bg-white border border-line px-3 py-2">
                ✓ No Commercial Advertising
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl bg-white border border-line px-3 py-2">
                ✓ Zero Algorithmic Surveillance
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl bg-white border border-line px-3 py-2">
                ✓ Local-First Data Sovereignty
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl bg-white border border-line px-3 py-2">
                ✓ WCAG &amp; APCA Accessibility
              </span>
            </div>
          </div>
        </section>
      )}

      {/* TAB 4: FAQ */}
      {activeTab === 'faq' && (
        <section className="space-y-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-3xl font-medium tracking-tight">Frequently Asked Questions</h3>
              <p className="mt-2 text-ink-soft max-w-2xl">
                Clear architectural and practical answers regarding Explore guest sandboxes,
                Sanctuary workspaces, privacy safeguards, and offline operation.
              </p>
            </div>

            <div className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft" />
              <input
                type="text"
                placeholder={t('support.searchFaqPlaceholder')}
                value={faqQuery}
                onChange={(e) => setFaqQuery(e.target.value)}
                className="w-full rounded-2xl border border-line bg-white pl-11 pr-4 py-3 text-sm focus:outline-3 focus:outline-offset-2 focus:outline-water"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Topics' },
              { id: 'explore', label: 'Explore Web' },
              { id: 'sanctuary', label: 'Sanctuary Workspace' },
              { id: 'privacy', label: 'Privacy & Sovereignty' },
              { id: 'technical', label: 'Offline & Technical' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFaqCategory(cat.id)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                  faqCategory === cat.id
                    ? 'bg-ink text-paper-light'
                    : 'border border-line bg-white text-ink-soft hover:text-ink'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Accordion List */}
          <div className="space-y-4">
            {filteredFaqs.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-line bg-paper-light p-12 text-center">
                <HelpCircle className="mx-auto h-8 w-8 text-ink-soft/60" />
                <h4 className="mt-3 text-lg font-medium">No matching questions found</h4>
                <p className="mt-1 text-sm text-ink-soft">
                  Try adjusting your search terms or send us a direct message.
                </p>
              </div>
            ) : (
              filteredFaqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-3xl border border-line bg-white p-6 shadow-xs transition-all open:bg-paper-light/40"
                >
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-sans text-base font-medium text-ink focus:outline-none">
                    <span className="flex items-center gap-3">
                      <span className="flex h-2 w-2 rounded-full bg-lotus shrink-0" />
                      <span>{faq.question}</span>
                    </span>
                    <span className="text-xl text-ink-soft group-open:rotate-45 transition-transform shrink-0">
                      +
                    </span>
                  </summary>
                  <div className="mt-4 border-t border-line/60 pt-4 text-sm leading-relaxed text-ink-soft">
                    {faq.answer}
                  </div>
                </details>
              ))
            )}
          </div>
        </section>
      )}

      {/* TAB 5: DIAGNOSTICS */}
      {config.showDiagnostics && activeTab === 'diagnostics' && (
        <section className="space-y-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-3xl font-medium tracking-tight">Live Browser Diagnostics</h3>
              <p className="mt-2 text-ink-soft max-w-2xl">
                Inspect your active client environment, network connectivity, and offline storage
                readiness directly from this tab.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void runDiagnostics()}
              disabled={isDiagnosing}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 font-sans text-xs font-bold text-paper-light hover:bg-lotus transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isDiagnosing ? 'animate-spin' : ''}`} />
              <span>Run Diagnostic Probe</span>
            </button>
          </div>

          {diagnostics && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Host & Surface */}
              <div className="rounded-3xl border border-line bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">
                    Origin &amp; Host
                  </span>
                  <Globe2 className="h-4 w-4 text-ink-soft" />
                </div>
                <h4 className="mt-3 text-lg font-medium text-ink">{diagnostics.currentHost}</h4>
                <div className="mt-4 flex items-center gap-2">
                  <span className="rounded-full bg-paper-light border border-line px-3 py-1 text-xs font-bold">
                    Surface: {diagnostics.detectedSurface.toUpperCase()}
                  </span>
                </div>
                <p className="mt-3 text-xs text-ink-soft">
                  Determines whether routing serves public marketing, guest explore, or authenticated
                  sanctuary surfaces.
                </p>
              </div>

              {/* Network Connectivity */}
              <div className="rounded-3xl border border-line bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">
                    Connectivity
                  </span>
                  {diagnostics.isOnline ? (
                    <Wifi className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-amber-600" />
                  )}
                </div>
                <h4 className="mt-3 text-lg font-medium text-ink">
                  {diagnostics.isOnline ? 'Network Online' : 'Operating Offline'}
                </h4>
                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      diagnostics.isOnline
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {diagnostics.isOnline ? 'Online Synced' : 'Offline Cache Active'}
                  </span>
                </div>
                <p className="mt-3 text-xs text-ink-soft">
                  Gurudevi automatically persists edits locally when offline, then replays changes
                  upon reconnection.
                </p>
              </div>

              {/* Local Storage Engine */}
              <div className="rounded-3xl border border-line bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-lotus">
                    Storage Engine
                  </span>
                  <Database className="h-4 w-4 text-ink-soft" />
                </div>
                <h4 className="mt-3 text-lg font-medium text-ink">
                  {diagnostics.localStorageAvailable && diagnostics.indexedDbAvailable
                    ? 'Storage Verified'
                    : 'Storage Degraded'}
                </h4>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-paper-light border border-line px-3 py-1 font-semibold">
                    LocalStorage: {diagnostics.localStorageAvailable ? 'Available' : 'Unavailable'}
                  </span>
                  <span className="rounded-full bg-paper-light border border-line px-3 py-1 font-semibold">
                    IndexedDB: {diagnostics.indexedDbAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <p className="mt-3 text-xs text-ink-soft">
                  {diagnostics.storageQuotaMb
                    ? `Estimated browser quota: ~${diagnostics.storageQuotaMb} MB`
                    : 'Storage quota dynamic based on device capacity.'}
                </p>
              </div>
            </div>
          )}

          {/* Link to Full Live Status Telemetry */}
          <div className="flex flex-col gap-6 rounded-3xl border border-line bg-paper-light p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-lotus" />
                <h4 className="text-xl font-medium tracking-tight">Need deep server telemetry?</h4>
              </div>
              <p className="mt-1 text-sm text-ink-soft">
                View real-time API latency probes, database health, and policy engine operational status.
              </p>
            </div>
            <Link
              href="/status"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-6 py-2.5 font-sans text-xs font-bold text-paper-light hover:bg-lotus transition-colors"
            >
              Open Live Status Page ↗
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
