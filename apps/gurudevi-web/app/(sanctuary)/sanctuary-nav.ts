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
  { id: 'self', href: '/self', label: 'Self', symbol: '♥' },
  { id: 'workspace', href: '/workspace', label: 'Workspace', symbol: '◇' },
  { id: 'community', href: '/community', label: 'Community', symbol: '○' },
  { id: 'library', href: '/library', label: 'Library', symbol: '▤' },
] as const satisfies readonly SanctuaryNavItem[];

export const accountNavigation = [
  { id: 'profile', href: '/profile', label: 'Profile', symbol: '◉' },
  { id: 'notifications', href: '/notifications', label: 'Notifications', symbol: '♢' },
  { id: 'settings', href: '/settings', label: 'Settings', symbol: '⚙' },
] as const satisfies readonly SanctuaryNavItem[];

export const workspaceNavigation = [
  { id: 'attendance', href: '/workspace', label: 'Attendance', symbol: '◷' },
  { id: 'plan', href: '/workspace/plan', label: 'Plan & Notices', symbol: '✉' },
  { id: 'notices', href: '/workspace/notices', label: 'Circulars', symbol: '📢' },
  { id: 'events', href: '/workspace/events', label: 'Events ERP', symbol: '◈' },
  { id: 'timetable', href: '/workspace/timetable', label: 'Timetable', symbol: '▦' },
  { id: 'gradebook', href: '/workspace/gradebook', label: 'Gradebook', symbol: '▥' },
] as const;

export const advancedTools = ['Agent Lab', 'Editorial', 'UI Showcase', 'Icon Lab'] as const;

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
