'use client';

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Heart,
  HelpCircle,
  Home,
  ShieldCheck,
  Sparkles,
  Users,
  WifiOff,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

type UserRole = 'teacher' | 'principal' | 'student';

interface Chapter {
  id: string;
  stepNumber: string;
  title: string;
  eyebrow: string;
  tuttiSays: string;
  mascotCutout: string;
  keyPoints: { icon: typeof WifiOff; label: string; detail: string }[];
  interactiveDemo?: 'offline' | 'roles' | 'worlds' | 'finish';
}

const CHAPTERS: Chapter[] = [
  {
    id: 'what-is-it',
    stepNumber: '01',
    eyebrow: 'First Things First',
    title: 'What is Gurudevi?',
    tuttiSays:
      'Hey, I am Tutti! In short: Gurudevi is a web and mobile app for schools. It brings your daily classroom work—attendance, marks, schedules, and student notes—into one clean place that is actually easy to use.',
    mascotCutout: '/mascot/firefly-guide-welcome-light-cutout-v2.webp',
    keyPoints: [
      {
        icon: BookOpen,
        label: 'Daily Classroom Work',
        detail:
          'Take attendance in seconds, manage grades, and keep quick notes without piles of paperwork.',
      },
      {
        icon: Users,
        label: 'Built for Everyone in School',
        detail:
          'Teachers, school heads, students, and parents all get what they need without cluttered screens.',
      },
      {
        icon: Heart,
        label: 'Calm & Simple',
        detail:
          'No overwhelming dashboards or complicated menus. Just clear, fast tools for real school days.',
      },
    ],
  },
  {
    id: 'why-created',
    stepNumber: '02',
    eyebrow: 'The Purpose',
    title: 'Why did we build this?',
    tuttiSays:
      'Teachers and school staff spend way too many hours every week on redundant paperwork and administrative data entry. We built this to make daily tasks fast and effortless so you can focus on teaching and guiding students.',
    mascotCutout: '/mascot/firefly-guide-explore-light-cutout-v2.webp',
    keyPoints: [
      {
        icon: Clock,
        label: 'Save Hours Every Week',
        detail:
          'Quick 1-tap roll calls and instant reports mean leaving on time instead of staying late for forms.',
      },
      {
        icon: ShieldCheck,
        label: 'Your Data Stays Yours',
        detail:
          'Encrypted and private. Your school and personal reflections belong to you, not an advertising network.',
      },
      {
        icon: Sparkles,
        label: 'Dignity Over Drudgery',
        detail:
          'Technology should respect your time and lift routine burdens, not add new surveillance.',
      },
    ],
  },
  {
    id: 'how-offline-works',
    stepNumber: '03',
    eyebrow: 'Zero Lockout',
    title: 'How does it work offline?',
    tuttiSays:
      'Here is the best part: it works completely offline. Whether a monsoon storm takes out the Wi-Fi or the power cuts mid-morning, your app never stops working. Everything saves to your device first, then syncs quietly when internet returns.',
    mascotCutout: '/mascot/firefly-guide-offline-light-cutout-v2.webp',
    keyPoints: [
      {
        icon: WifiOff,
        label: 'Works Without Internet',
        detail: 'Mark attendance and write notes anytime. No spinning wheels, no error banners.',
      },
      {
        icon: CheckCircle2,
        label: 'Local-First Vault',
        detail:
          'All records are saved directly in your browser or phone memory before touching the cloud.',
      },
      {
        icon: ShieldCheck,
        label: 'Automatic Background Sync',
        detail:
          'The moment your connection returns, changes sync seamlessly without losing a single edit.',
      },
    ],
    interactiveDemo: 'offline',
  },
  {
    id: 'your-tools',
    stepNumber: '04',
    eyebrow: 'Personalized For You',
    title: 'What does your role get?',
    tuttiSays:
      'Nobody comes to school as a generic user. Pick your role below to see the exact everyday tools designed for what you do.',
    mascotCutout: '/mascot/firefly-guide-pro-light-cutout-v2.webp',
    keyPoints: [],
    interactiveDemo: 'roles',
  },
  {
    id: 'ready-to-fly',
    stepNumber: '05',
    eyebrow: 'Ready To Start',
    title: 'Where do you want to step next?',
    tuttiSays:
      'That is the whole story in a nutshell. You are ready to explore! Pick wherever you want to go next, or check back with me whenever you need help.',
    mascotCutout: '/mascot/firefly-guide-coming-soon-light-cutout-v2.webp',
    keyPoints: [],
    interactiveDemo: 'finish',
  },
];

export function IntroClient() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<UserRole>('teacher');
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);

  const chapter = CHAPTERS[currentStep] ?? CHAPTERS[0]!;
  const isFirst = currentStep === 0;
  const isLast = currentStep === CHAPTERS.length - 1;

  const roleDetails = useMemo(() => {
    switch (selectedRole) {
      case 'teacher':
        return {
          title: 'For Educators & Teachers',
          description:
            'Quick attendance roll call, grade entry, class lists, and offline lesson reflections.',
          primaryAction: { label: 'Open Teacher Workspace Demo', href: '/workspace/attendance' },
          features: [
            '1-tap roll call (Present, Absent, Excused)',
            'Offline gradebook with automatic averaging',
            'Quiet 2-minute breathing chime between periods',
          ],
        };
      case 'principal':
        return {
          title: 'For School Leaders & Principals',
          description:
            'High-level overview of school sync, staff rosters, academic terms, and governance.',
          primaryAction: { label: 'Open Principal Hub Demo', href: '/admin/principal' },
          features: [
            'Real-time view of teacher sync and class records',
            'Term schedule and curriculum pacing monitor',
            'Safe invitation codes for faculty onboarding',
          ],
        };
      case 'student':
        return {
          title: 'For Students & Learners',
          description:
            'Daily study goals, timetable check, quiet reflection space, and learning notes.',
          primaryAction: { label: 'Open Student Sanctuary', href: '/self' },
          features: [
            'Today’s study checklist and homework notes',
            'Daily mood lotus and breathing timer',
            'Private journal that stays on your device',
          ],
        };
    }
  }, [selectedRole]);

  return (
    <main className="min-h-screen bg-stone-50 text-slate-900 px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Navigation / Header Bar */}
        <header className="flex items-center justify-between border-b border-stone-200 pb-4">
          <Link
            href="/support"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Support</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Chapter {currentStep + 1} of {CHAPTERS.length}
            </span>
            <div className="flex gap-1">
              {CHAPTERS.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentStep
                      ? 'w-6 bg-amber-500'
                      : idx < currentStep
                        ? 'w-2 bg-stone-400'
                        : 'w-2 bg-stone-200'
                  }`}
                  aria-label={`Jump to chapter ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </header>

        {/* Tutti Dialogue Card */}
        <section className="relative overflow-hidden rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 mx-auto sm:mx-0">
              <Image
                src={chapter.mascotCutout}
                alt="Tutti the Firefly Guide"
                width={96}
                height={96}
                className="object-contain drop-shadow-md"
                priority
              />
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                  {chapter.eyebrow}
                </span>
                <span className="text-stone-300">•</span>
                <span className="text-xs font-mono font-bold text-stone-400">
                  Step {chapter.stepNumber}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {chapter.title}
              </h1>

              <p className="text-base sm:text-lg leading-relaxed text-slate-700">
                &ldquo;{chapter.tuttiSays}&rdquo;
              </p>
            </div>
          </div>

          {/* Interactive Demos depending on Chapter */}
          {chapter.interactiveDemo === 'offline' && (
            <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isSimulatedOffline ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                      }`}
                    />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      {isSimulatedOffline
                        ? 'Simulating: No Internet (Offline)'
                        : 'Status: Connected'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">
                    Try switching off the signal to see how Gurudevi continues working.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                    isSimulatedOffline
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-stone-800 hover:bg-slate-900 text-white'
                  }`}
                >
                  {isSimulatedOffline ? 'Reconnect Signal' : 'Simulate Offline Drop'}
                </button>
              </div>

              <div className="rounded-xl border border-stone-200 bg-white p-3 text-xs text-stone-700 flex items-center justify-between">
                <span>Local Classroom Vault:</span>
                <span className="font-semibold text-emerald-700">
                  {isSimulatedOffline
                    ? 'Saving Locally (Queued for auto-sync)'
                    : 'Live & Synchronized'}
                </span>
              </div>
            </div>
          )}

          {chapter.interactiveDemo === 'roles' && (
            <div className="mt-8 space-y-4">
              <div className="flex flex-wrap gap-2">
                {(['teacher', 'principal', 'student'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition ${
                      selectedRole === role
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {role === 'teacher'
                      ? '👩‍🏫 Teacher'
                      : role === 'principal'
                        ? '🏫 School Principal'
                        : '🎒 Student'}
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{roleDetails.title}</h3>
                  <p className="text-xs text-stone-600 mt-1">{roleDetails.description}</p>
                </div>

                <ul className="space-y-2">
                  {roleDetails.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-xs text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2 border-t border-stone-200">
                  <Link
                    href={roleDetails.primaryAction.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800"
                  >
                    <span>{roleDetails.primaryAction.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {chapter.interactiveDemo === 'finish' && (
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Link
                href="/workspace/attendance"
                className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-stone-50 p-5 hover:border-amber-400 hover:bg-amber-50/40 transition group"
              >
                <div className="space-y-2">
                  <span className="text-2xl">👩‍🏫</span>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-900">
                    Try Attendance Demo
                  </h4>
                  <p className="text-xs text-stone-600">
                    Experience taking roll call and test the 10-second flow.
                  </p>
                </div>
                <span className="mt-4 text-xs font-bold text-amber-700 inline-flex items-center gap-1">
                  Enter Classroom →
                </span>
              </Link>

              <Link
                href="/support"
                className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-stone-50 p-5 hover:border-stone-400 hover:bg-white transition group"
              >
                <div className="space-y-2">
                  <span className="text-2xl">💬</span>
                  <h4 className="text-sm font-bold text-slate-900">Support Desk</h4>
                  <p className="text-xs text-stone-600">
                    Common questions, answers, and contact info for our team.
                  </p>
                </div>
                <span className="mt-4 text-xs font-bold text-slate-800 inline-flex items-center gap-1">
                  Open Support →
                </span>
              </Link>

              <Link
                href="/"
                className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-stone-50 p-5 hover:border-stone-400 hover:bg-white transition group"
              >
                <div className="space-y-2">
                  <span className="text-2xl">🏡</span>
                  <h4 className="text-sm font-bold text-slate-900">Home & Explore</h4>
                  <p className="text-xs text-stone-600">
                    Return to the main portal and browse school foundations.
                  </p>
                </div>
                <span className="mt-4 text-xs font-bold text-slate-800 inline-flex items-center gap-1">
                  Back to Home →
                </span>
              </Link>
            </div>
          )}

          {/* Key Points list if present */}
          {chapter.keyPoints.length > 0 && (
            <div className="mt-8 grid gap-4 sm:grid-cols-3 pt-6 border-t border-stone-100">
              {chapter.keyPoints.map((pt) => {
                const Icon = pt.icon;
                return (
                  <div key={pt.label} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-stone-100 text-stone-700">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{pt.label}</h4>
                    </div>
                    <p className="text-xs leading-relaxed text-stone-600">{pt.detail}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Footer Navigation Buttons */}
        <footer className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={isFirst}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition ${
              isFirst
                ? 'opacity-30 cursor-not-allowed text-stone-400'
                : 'text-stone-700 hover:bg-stone-200 bg-stone-100'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-3">
            <Link
              href="/support"
              className="text-xs font-semibold text-stone-500 hover:text-stone-800 px-3 py-2"
            >
              Skip Tour
            </Link>

            {!isLast ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(CHAPTERS.length - 1, prev + 1))}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-sm"
              >
                <span>Next Chapter</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                href="/support"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm"
              >
                <span>Finish & Go to Support</span>
                <CheckCircle2 className="w-4 h-4" />
              </Link>
            )}
          </div>
        </footer>
      </div>
    </main>
  );
}
