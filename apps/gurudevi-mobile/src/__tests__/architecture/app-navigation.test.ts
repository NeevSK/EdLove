import { describe, expect, it } from 'vitest';
import {
  appNavigation,
  getNavigationItems,
  getNavigationTitle,
  isNavigationRouteActive,
} from '@/lib/navigation/appNavigation';

describe('app navigation metadata', () => {
  it('owns the remaining primary routes and app utility routes', () => {
    expect(getNavigationItems('tab').map((item) => item.id)).toEqual(['workspace', 'self']);
    expect(getNavigationItems('utility').map((item) => item.id)).toEqual([
      'notifications',
      'settings',
    ]);
    expect(appNavigation.some((item) => item.href === '/durable-agents')).toBe(false);
    expect(appNavigation.some((item) => item.href === '/workspace/editorial')).toBe(false);
    expect(getNavigationItems('tab').some((item) => item.href === '/profile')).toBe(false);
    expect(getNavigationItems('tab').some((item) => item.href === '/library')).toBe(false);
    expect(getNavigationItems('tab').some((item) => item.href === '/community')).toBe(false);
  });

  it('keeps header-only routes out of the primary tab set', () => {
    expect(getNavigationItems('tab').map((item) => item.href)).not.toContain('/notifications');
    expect(getNavigationItems('tab').map((item) => item.href)).not.toContain('/settings');
  });

  it('resolves nested workspace paths to their parent', () => {
    expect(getNavigationTitle('/workspace/events')).toBe('Workspace');
    expect(isNavigationRouteActive('/workspace/events', '/workspace')).toBe(true);
  });
});
