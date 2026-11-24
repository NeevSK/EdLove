import { linkOptions } from '@tanstack/react-router';

export type SanctuaryNavId =
  | 'self'
  | 'workspace'
  | 'community'
  | 'library'
  | 'profile'
  | 'notifications'
  | 'settings';

export const primaryNavigation = [
  { id: 'self', to: '/self', label: 'Self', symbol: '💗' },
  { id: 'workspace', to: '/workspace', label: 'Workspace', symbol: '🏫' },
  { id: 'community', to: '/community', label: 'Community', symbol: '🤝' },
  { id: 'library', to: '/library', label: 'Library', symbol: '📚' },
] as const satisfies readonly NavigationEntry[];

export const accountNavigation = [
  { id: 'profile', to: '/profile', label: 'Profile', symbol: '◉' },
  { id: 'notifications', to: '/notifications', label: 'Notifications', symbol: '♢' },
  { id: 'settings', to: '/settings', label: 'Settings', symbol: '⚙' },
] as const satisfies readonly NavigationEntry[];

type NavigationEntry = Readonly<{ id: SanctuaryNavId; to: string; label: string; symbol: string }>;
export type SanctuaryNavItem = (typeof primaryNavigation)[number] | (typeof accountNavigation)[number];

export const advancedTools = ['Agent Lab', 'Editorial', 'UI Showcase', 'Icon Lab'] as const;

/** Shortcuts a person can pin. `link` is checked against the routes; `explore` says whether Explore offers it. */
export const quickAccessDestinations = [
  { id: 'tutii-dm', link: linkOptions({ to: '/community', search: { pillar: 'messages', dm: 'tutii' } }), label: 'Tutii Companion', symbol: '✦', explore: true },
  { id: 'ai-workspace', link: linkOptions({ to: '/community', search: { pillar: 'messages' } }), label: 'AI Workspace', symbol: '⚡', explore: true },
  { id: 'my-attendance', link: linkOptions({ to: '/workspace/attendance' }), label: 'My attendance', symbol: '🗓️', explore: true },
  { id: 'breathing', link: linkOptions({ to: '/self', search: { practice: 'breath' } }), label: 'Mindful breathing', symbol: '🌬️', explore: true },
  { id: 'fire-journal', link: linkOptions({ to: '/self', search: { practice: 'journal' } }), label: 'Fire Journal', symbol: '🔥', explore: true },
  { id: 'submissions', link: linkOptions({ to: '/workspace/submissions' }), label: 'Submissions', symbol: '📥', explore: true },
  { id: 'timetable', link: linkOptions({ to: '/workspace/timetable' }), label: 'Timetable', symbol: '🕒', explore: true },
  { id: 'gradebook', link: linkOptions({ to: '/workspace/gradebook' }), label: 'Gradebook', symbol: '📊', explore: true },
  { id: 'community-forest', link: linkOptions({ to: '/community/forest' }), label: 'Community circles', symbol: '🌿', explore: true },
  { id: 'library-map', link: linkOptions({ to: '/library/map' }), label: 'Library map', symbol: '🗺️', explore: true },
  { id: 'library-tools', link: linkOptions({ to: '/library/tools' }), label: 'Knowledge tools', symbol: '📐', explore: true },
  { id: 'library-curator', link: linkOptions({ to: '/library/curator' }), label: 'Curator studio', symbol: '✨', explore: true },
  { id: 'curriculum-plan', link: linkOptions({ to: '/workspace/plan' }), label: 'Curriculum plan', symbol: '📝', explore: true },
  { id: 'school-events', link: linkOptions({ to: '/workspace/events' }), label: 'School events', symbol: '🎪', explore: true },
  { id: 'class-climate', link: linkOptions({ to: '/workspace/climate' }), label: 'Class climate', symbol: '🌱', explore: true },
  { id: 'mood-lotus', link: linkOptions({ to: '/self', search: { practice: 'mood' } }), label: 'Mood Lotus', symbol: '🪷', explore: true },
  { id: 'daily-pulse', link: linkOptions({ to: '/self', search: { practice: 'pulse' } }), label: 'Daily Pulse', symbol: '⚡', explore: true },
  { id: 'sleep-tracker', link: linkOptions({ to: '/self', search: { practice: 'sleep' } }), label: 'Sleep Tracker', symbol: '🌙', explore: true },
  { id: 'principal-center', link: linkOptions({ to: '/admin/principal' }), label: 'Principal center', symbol: '🏛️', explore: true },
  { id: 'guardian-portal', link: linkOptions({ to: '/workspace/guardian' }), label: 'Guardian portal', symbol: '👨‍👩‍👧', explore: true },
  { id: 'screen-atlas', link: linkOptions({ to: '/atlas' }), label: 'Screen Atlas', symbol: '🧭', explore: true },
] as const;

export type QuickAccessDestination = (typeof quickAccessDestinations)[number];
export type QuickAccessId = QuickAccessDestination['id'];

export function isSanctuaryNavActive(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function getSanctuaryPageTitle(pathname: string) {
  return [...primaryNavigation, ...accountNavigation].find((item) =>
    isSanctuaryNavActive(pathname, item.to),
  )?.label;
}
