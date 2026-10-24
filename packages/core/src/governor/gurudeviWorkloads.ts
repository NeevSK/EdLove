import type { WorkloadSpec } from '@repo/verger-core';

/**
 * Gurudevi's demand registry: what the app's work is, which class it is in, which accounts it is
 * believed to spend, and the levers that set its quality. From the design's first pass
 * (docs/engineering/runtime-performance/verger/vision-feasibility-and-plan.md, "Demand
 * registry"); the accounts are suspected until measured cost vectors replace them.
 *
 * Open (do not settle here): whether the breathing guide's animation, or only its timing, is
 * critical; whether uploading an attendance save, or only the local write, is critical.
 */
export const GURUDEVI_WORKLOADS: readonly WorkloadSpec[] = [
  { id: 'touch-response', class: 'critical', spends: ['cpu'], source: 'whole app' },
  { id: 'breathing-timer', class: 'critical', spends: ['cpu', 'gpu'], source: 'src/somatic/' },
  {
    id: 'attendance-save',
    class: 'critical',
    spends: ['storage', 'cpu'],
    source: 'app/attendance.tsx, PowerSync',
  },
  {
    id: 'visible-screen',
    class: 'committed',
    spends: ['cpu', 'gpu', 'memory'],
    levers: ['list-window'],
    source: 'each route',
  },
  {
    id: 'navigation',
    class: 'committed',
    spends: ['gpu', 'cpu'],
    levers: ['transitions', 'global-motion'],
    source: 'expo-router',
  },
  {
    id: 'images-on-screen',
    class: 'committed',
    spends: ['memory', 'cpu', 'network'],
    levers: ['image-decode', 'image-cache'],
    source: 'expo-image',
  },
  {
    id: 'display',
    class: 'committed',
    spends: ['gpu', 'cpu', 'energy'],
    levers: ['refresh-rate'],
    source: 'the window (verger built-in)',
  },
  {
    id: 'sync',
    class: 'deferrable',
    spends: ['network', 'energy', 'cpu', 'storage'],
    source: 'PowerSyncProvider, backgroundSyncTask',
  },
  {
    id: 'storage-eviction',
    class: 'deferrable',
    spends: ['storage', 'cpu'],
    source: 'storageEvictionTask, retention-scheduler',
  },
  {
    id: 'optional-startup',
    class: 'deferrable',
    spends: ['cpu', 'memory', 'network'],
    source: 'OptionalStartupServices',
  },
  {
    id: 'prefetch',
    class: 'deferrable',
    spends: ['network', 'memory'],
    levers: ['prefetch'],
    source: 'various',
  },
  {
    id: 'telemetry-flush',
    class: 'deferrable',
    spends: ['network', 'energy'],
    source: 'PostHog, Sentry, Observe',
  },
  {
    id: 'sound-and-haptics',
    class: 'ornamental',
    spends: ['energy', 'cpu'],
    source: 'soundFeedback, expo-haptics',
  },
  {
    id: 'ambient-motion',
    class: 'ornamental',
    spends: ['gpu', 'energy'],
    levers: ['ambient-motion'],
    source: 'SanctuaryPulseOverlay, SkiaGlowAura, WorkspaceWallpaper, HeroBanner',
  },
  {
    id: 'mascots',
    class: 'ornamental',
    spends: ['gpu', 'cpu'],
    levers: ['ambient-motion'],
    source: 'LivingFirefly, FireflyMascot',
  },
  {
    id: 'glass-and-blur',
    class: 'ornamental',
    spends: ['gpu'],
    levers: ['blur', 'glass-material'],
    source: 'glass surfaces, SanctuaryNudge',
  },
  {
    id: 'celebration',
    class: 'ornamental',
    spends: ['gpu', 'cpu'],
    levers: ['particles'],
    source: 'CelebrationOverlay',
  },
  {
    id: 'loading-shimmer',
    class: 'ornamental',
    spends: ['gpu'],
    levers: ['loading-shimmer'],
    source: 'SkeletonLoader',
  },
  {
    id: 'brand-loops',
    class: 'ornamental',
    spends: ['gpu', 'energy'],
    levers: ['ambient-motion'],
    source: 'BrandPulse, LotusPetalFAB',
  },
  {
    id: 'splash',
    class: 'ornamental',
    spends: ['cpu', 'gpu', 'memory'],
    source: 'LottieSplashScreen',
  },
];

/** The registry as a host with only `levers` can carry it: references to absent levers dropped. */
export function workloadsFor(levers: readonly { readonly id: string }[]): WorkloadSpec[] {
  const present = new Set(levers.map((lever) => lever.id));
  return GURUDEVI_WORKLOADS.map((workload) =>
    workload.levers
      ? { ...workload, levers: workload.levers.filter((id) => present.has(id)) }
      : workload,
  );
}
