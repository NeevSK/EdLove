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
  surface: NavigationSurface;
  isActive: (pathname: string) => boolean;
};

function matchesPath(href: string) {
  return (pathname: string) => pathname === href || pathname.startsWith(`${href}/`);
}

export const appNavigation: readonly AppNavigationItem[] = [
  {
    id: 'self',
    href: '/self',
    title: 'Self',
    iconKey: 'heart',
    surface: 'tab',
    isActive: matchesPath('/self'),
  },
  {
    id: 'editorial',
    href: '/workspace/editorial',
    title: 'Editorial',
    iconKey: 'file-text',
    surface: 'utility',
    isActive: matchesPath('/workspace/editorial'),
  },
  {
    id: 'workspace',
    href: '/workspace',
    title: 'Workspace',
    iconKey: 'school',
    surface: 'tab',
    isActive: matchesPath('/workspace'),
  },
  {
    id: 'community',
    href: '/community',
    title: 'Community',
    iconKey: 'users',
    surface: 'tab',
    isActive: matchesPath('/community'),
  },
  {
    id: 'library',
    href: '/library',
    title: 'Library',
    iconKey: 'library',
    surface: 'tab',
    isActive: matchesPath('/library'),
  },
  {
    id: 'profile',
    href: '/profile',
    title: 'Profile',
    iconKey: 'user',
    surface: 'tab',
    isActive: matchesPath('/profile'),
  },
  {
    id: 'agent-lab',
    href: '/durable-agents',
    title: 'Agent Lab',
    iconKey: 'sparkles',
    surface: 'utility',
    isActive: matchesPath('/durable-agents'),
  },
  {
    id: 'notifications',
    href: '/notifications',
    title: 'Notifications',
    iconKey: 'bell',
    surface: 'utility',
    isActive: matchesPath('/notifications'),
  },
  {
    id: 'settings',
    href: '/settings',
    title: 'Settings',
    iconKey: 'settings',
    surface: 'utility',
    isActive: matchesPath('/settings'),
  },
] as const;

export function getNavigationTitle(pathname: string) {
  return appNavigation.find((item) => item.isActive(pathname))?.title ?? 'Self';
}

export function isNavigationRouteActive(pathname: string, href: string) {
  return appNavigation.find((item) => item.href === href)?.isActive(pathname) ?? false;
}
