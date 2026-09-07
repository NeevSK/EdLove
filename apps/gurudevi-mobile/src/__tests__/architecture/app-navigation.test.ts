import { describe, expect, it } from 'vitest';
import {
  appNavigation,
  getNavigationItems,
  getNavigationTitle,
  isNavigationRouteActive,
} from '@/lib/navigation/appNavigation';

describe('app navigation metadata', () => {
  it('owns the five native primary routes and web utility routes', () => {
    expect(getNavigationItems('tab').map((item) => item.id)).toEqual([
      'library',
      'workspace',
      'self',
      'community',
      'profile',
    ]);
    expect(getNavigationItems('utility').map((item) => item.id)).toEqual([
      'editorial',
      'agent-lab',
      'notifications',
      'settings',
    ]);
  });

  it('keeps header-only routes out of the primary tab set', () => {
    expect(getNavigationItems('tab').map((item) => item.href)).not.toContain('/notifications');
    expect(getNavigationItems('tab').map((item) => item.href)).not.toContain('/settings');
  });

  it('prefers the specific editorial route over its workspace parent', () => {
    expect(getNavigationTitle('/workspace/editorial/drafts')).toBe('Editorial');
    expect(getNavigationTitle('/workspace/classroom')).toBe('Workspace');
    expect(isNavigationRouteActive('/workspace/editorial/drafts', '/workspace/editorial')).toBe(
      true,
    );
  });
});
