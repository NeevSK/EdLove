import type { TabType } from '@repo/ui/types/fab';

const FAB_TAB_BY_DOMAIN: Readonly<Record<string, TabType>> = {
  self: 'self',
  library: 'library',
  workspace: 'classroom',
  classroom: 'classroom',
  community: 'community',
  profile: 'profile',
};

/**
 * The tab whose main action may show, from the route's segments. Expo Router paths leave out
 * groups, so `/workspace` and `/(tabs)/workspace` are the same. Only a tab's home screen (and a
 * classroom's dashboard) shows it: screens kept mounted beneath a pushed screen keep their
 * registration, so deeper screens would show an action that is not theirs.
 */
export function getCurrentFabTab(pathname: string): TabType | null {
  const segments = pathname.split('/').filter((segment) => segment && !segment.startsWith('('));
  const tab = segments[0] ? FAB_TAB_BY_DOMAIN[segments[0]] : undefined;
  if (!tab) return null;
  if (segments.length === 1) return tab;
  const classroomDashboard =
    segments[0] === 'workspace' && segments[1] === 'classroom' && segments.length === 3;
  return classroomDashboard ? tab : null;
}
