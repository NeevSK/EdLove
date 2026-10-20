export type SanctuaryNavId =
  | 'self'
  | 'workspace'
  | 'community'
  | 'library'
  | 'profile'
  | 'notifications'
  | 'settings';

export type SanctuaryNavItem = Readonly<{
  id: SanctuaryNavId;
  href: string;
  label: string;
  symbol: string;
}>;

function matchesPath(href: string) {
  return (pathname: string) => pathname === href || pathname.startsWith(`${href}/`);
}

export const primaryNavigation = [
  { id: 'self', href: '/self', label: 'Self', symbol: '💗' },
  { id: 'workspace', href: '/workspace', label: 'Workspace', symbol: '🏫' },
  { id: 'community', href: '/community', label: 'Community', symbol: '🤝' },
  { id: 'library', href: '/library', label: 'Library', symbol: '📚' },
] as const satisfies readonly SanctuaryNavItem[];

export const accountNavigation = [
  { id: 'profile', href: '/profile', label: 'Profile', symbol: '◉' },
  { id: 'notifications', href: '/notifications', label: 'Notifications', symbol: '♢' },
  { id: 'settings', href: '/settings', label: 'Settings', symbol: '⚙' },
] as const satisfies readonly SanctuaryNavItem[];

export const workspaceNavigation = [
  { id: 'attendance', href: '/workspace', label: 'Attendance', symbol: '◷' },
  { id: 'submissions', href: '/workspace/submissions', label: 'Submissions', symbol: '📥' },
  { id: 'climate', href: '/workspace/climate', label: 'Climate Sensing', symbol: '⛅' },
  { id: 'tuition', href: '/workspace/tuition', label: 'Tuition & Fees', symbol: '💳' },
  { id: 'kiosk', href: '/workspace/kiosk', label: 'Doorway Kiosk', symbol: '⛶' },
  { id: 'badges', href: '/workspace/badges', label: 'ID Badges', symbol: '📇' },
  { id: 'claim', href: '/workspace/claim', label: 'Claim Spot', symbol: '🎓' },
  { id: 'school', href: '/workspace/school', label: 'School Profile', symbol: '🏛' },
  { id: 'editorial', href: '/workspace/editorial', label: 'Editorial Commons', symbol: '✒' },
  { id: 'plan', href: '/workspace/plan', label: 'Plan & Notices', symbol: '✉' },
  { id: 'notices', href: '/workspace/notices', label: 'Circulars', symbol: '📢' },
  { id: 'events', href: '/workspace/events', label: 'Events ERP', symbol: '◈' },
  { id: 'timetable', href: '/workspace/timetable', label: 'Timetable', symbol: '▦' },
  { id: 'gradebook', href: '/workspace/gradebook', label: 'Gradebook', symbol: '▥' },
] as const;

export const advancedTools = ['Agent Lab', 'Editorial', 'UI Showcase', 'Icon Lab'] as const;

export const quickAccessDestinations = [
  { id: 'my-attendance', href: '/self/attendance', label: 'My attendance', symbol: '🗓️', explore: true },
  { id: 'breathing', href: '/self?practice=breath', label: 'Mindful breathing', symbol: '🌬️', explore: true },
  { id: 'fire-journal', href: '/self?practice=journal', label: 'Fire Journal', symbol: '🔥', explore: true },
  { id: 'submissions', href: '/workspace/submissions', label: 'Submissions', symbol: '📥', explore: false },
  { id: 'timetable', href: '/workspace/timetable', label: 'Timetable', symbol: '🕒', explore: false },
  { id: 'gradebook', href: '/workspace/gradebook', label: 'Gradebook', symbol: '📊', explore: false },
  { id: 'community-forest', href: '/community/forest', label: 'Community circles', symbol: '🌿', explore: false },
  { id: 'library-map', href: '/library/map', label: 'Library map', symbol: '🗺️', explore: false },
] as const;

export type QuickAccessId = (typeof quickAccessDestinations)[number]['id'];

export function withSanctuaryRoutePrefix(
  items: readonly SanctuaryNavItem[],
  routePrefix: string,
): SanctuaryNavItem[] {
  const normalizedPrefix = routePrefix.replace(/\/+$/, '');
  if (!normalizedPrefix) return [...items];
  if (!normalizedPrefix.startsWith('/')) {
    throw new Error('Sanctuary navigation routes must use an absolute prefix.');
  }
  return items.map((item) => ({ ...item, href: `${normalizedPrefix}${item.href}` }));
}

export function isSanctuaryNavActive(pathname: string, href: string) {
  return matchesPath(href)(pathname);
}

export function getSanctuaryPageTitle(pathname: string) {
  return [...primaryNavigation, ...accountNavigation].find((item) =>
    isSanctuaryNavActive(pathname, item.href),
  )?.label;
}
