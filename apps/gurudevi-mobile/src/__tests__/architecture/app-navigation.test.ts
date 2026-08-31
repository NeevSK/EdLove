import { describe, expect, it } from 'vitest';
import {
  appNavigation,
  getNavigationTitle,
  isNavigationRouteActive,
} from '@/lib/navigation/appNavigation';

describe('app navigation metadata', () => {
  it('owns the five native primary routes and web utility routes', () => {
    expect(appNavigation.filter((item) => item.surface === 'tab').map((item) => item.id)).toEqual([
      'self',
      'workspace',
      'community',
      'library',
      'profile',
    ]);
    expect(
      appNavigation.filter((item) => item.surface === 'utility').map((item) => item.id),
    ).toEqual(['editorial', 'agent-lab', 'notifications', 'settings']);
  });

  it('prefers the specific editorial route over its workspace parent', () => {
    expect(getNavigationTitle('/workspace/editorial/drafts')).toBe('Editorial');
    expect(getNavigationTitle('/workspace/classroom')).toBe('Workspace');
    expect(isNavigationRouteActive('/workspace/editorial/drafts', '/workspace/editorial')).toBe(
      true,
    );
  });
});
