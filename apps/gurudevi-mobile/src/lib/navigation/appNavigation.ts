export type NavigationIconKey =
  | 'heart'
  | 'school'
  | 'file-text'
  | 'users'
  | 'library'
  | 'user'
  | 'sparkles'
  | 'bell'
  | 'settings';

export type NavigationSurface = 'tab' | 'header' | 'utility';

export type AppNavigationItem = {
  id: string;
  href: string;
  title: string;
  iconKey: NavigationIconKey;
  emoji: string;
  surface: NavigationSurface;
  isActive: (pathname: string) => boolean;
};

function matchesPath(href: string) {
  return (pathname: string) => pathname === href || pathname.startsWith(`${href}/`);
}

export const appNavigation: readonly AppNavigationItem[] = [
  {
    id: 'library',
    href: '/library',
    title: 'Library',
    iconKey: 'library',
    emoji: '📚',
    surface: 'tab',
    isActive: matchesPath('/library'),
  },
  {
    id: 'workspace',
    href: '/workspace',
    title: 'Workspace',
    iconKey: 'school',
    emoji: '🏫',
    surface: 'tab',
    isActive: matchesPath('/workspace'),
  },
  {
    id: 'self',
    href: '/self',
    title: 'Self',
    iconKey: 'heart',
    emoji: '❤️',
    surface: 'tab',
    isActive: matchesPath('/self'),
  },
  {
    id: 'community',
    href: '/community',
    title: 'Community',
    iconKey: 'users',
    emoji: '🤝',
    surface: 'tab',
    isActive: matchesPath('/community'),
  },
  {
    id: 'editorial',
    href: '/workspace/editorial',
    title: 'Editorial',
    iconKey: 'file-text',
    emoji: '📜',
    surface: 'utility',
    isActive: matchesPath('/workspace/editorial'),
  },
  {
    id: 'agent-lab',
    href: '/durable-agents',
    title: 'Agent Lab',
    iconKey: 'sparkles',
    emoji: '🧪',
    surface: 'utility',
    isActive: matchesPath('/durable-agents'),
  },
  {
    id: 'notifications',
    href: '/notifications',
    title: 'Notifications',
    iconKey: 'bell',
    emoji: '🔔',
    surface: 'utility',
    isActive: matchesPath('/notifications'),
  },
  {
    id: 'settings',
    href: '/settings',
    title: 'Settings',
    iconKey: 'settings',
    emoji: '⚙️',
    surface: 'utility',
    isActive: matchesPath('/settings'),
  },
  {
    id: 'profile',
    href: '/profile',
    title: 'Profile',
    iconKey: 'user',
    emoji: '🪪',
    surface: 'tab',
    isActive: matchesPath('/profile'),
  },
] as const;

export function getNavigationItems(surface: NavigationSurface): readonly AppNavigationItem[] {
  return appNavigation.filter((item) => item.surface === surface);
}

export function getNavigationTitle(pathname: string) {
  // Check specific utility/nested routes before broad top-level tab routes
  const utilityMatch = appNavigation
    .filter((item) => item.surface === 'utility')
    .find((item) => item.isActive(pathname));
  if (utilityMatch) return utilityMatch.title;

  return appNavigation.find((item) => item.isActive(pathname))?.title ?? 'Self';
}

export function isNavigationRouteActive(pathname: string, href: string) {
  return appNavigation.find((item) => item.href === href)?.isActive(pathname) ?? false;
}
