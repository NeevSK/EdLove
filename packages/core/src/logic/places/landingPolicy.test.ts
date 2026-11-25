import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LANDING_POLICY,
  primaryPlaceFromPathname,
  resolveAppLandingRoute,
} from './landingPolicy';

describe('landingPolicy / G1', () => {
  const NOW = 1_700_000_000_000;

  it('extracts only primary Place floors and ignores modals/auth/settings', () => {
    expect(primaryPlaceFromPathname('/self')).toBe('self');
    expect(primaryPlaceFromPathname('/(tabs)/workspace/attendance')).toBe('workspace');
    expect(primaryPlaceFromPathname('/community')).toBe('community');
    expect(primaryPlaceFromPathname('/library/book/123')).toBe('library');
    expect(primaryPlaceFromPathname('/profile')).toBe('profile');
    expect(primaryPlaceFromPathname('/(modal)/create-form')).toBeNull();
    expect(primaryPlaceFromPathname('/settings')).toBeNull();
    expect(primaryPlaceFromPathname('/auth')).toBeNull();
    expect(primaryPlaceFromPathname('/')).toBeNull();
  });

  it('honors pinnedPlace over lastVisited and contextual rules', () => {
    const result = resolveAppLandingRoute({
      activeCapacity: 'teacher',
      bondId: 'bond-1',
      pinnedPlace: 'library',
      lastVisited: { place: 'community', bondId: 'bond-1', visitedAt: NOW - 60_000 },
      now: NOW,
    });
    expect(result).toEqual({ place: 'library', route: '/library', reason: 'pinned' });
  });

  it('resumes lastVisited Place within the configurable lastPlaceMaxAgeMs window', () => {
    const result = resolveAppLandingRoute(
      {
        activeCapacity: 'teacher',
        bondId: 'bond-1',
        lastVisited: { place: 'community', bondId: 'bond-1', visitedAt: NOW - 30 * 60 * 1000 },
        now: NOW,
      },
      { ...DEFAULT_LANDING_POLICY, lastPlaceMaxAgeMs: 2 * 60 * 60 * 1000 },
    );
    expect(result).toEqual({ place: 'community', route: '/community', reason: 'last-place' });
  });

  it('ignores stale lastVisited Place beyond lastPlaceMaxAgeMs or from another bond', () => {
    const stale = resolveAppLandingRoute(
      {
        activeCapacity: 'teacher',
        bondId: 'bond-1',
        lastVisited: { place: 'community', bondId: 'bond-1', visitedAt: NOW - 5 * 60 * 60 * 1000 },
        now: NOW,
      },
      { ...DEFAULT_LANDING_POLICY, lastPlaceMaxAgeMs: 4 * 60 * 60 * 1000 },
    );
    expect(stale).toEqual({ place: 'workspace', route: '/workspace', reason: 'policy-default' });

    const differentBond = resolveAppLandingRoute({
      activeCapacity: 'student',
      bondId: 'bond-2',
      lastVisited: { place: 'community', bondId: 'bond-1', visitedAt: NOW - 10_000 },
      now: NOW,
    });
    expect(differentBond).toEqual({
      place: 'workspace',
      route: '/workspace',
      reason: 'policy-default',
    });
  });

  it('evaluates pluggable contextualRules when lastVisited is absent or stale', () => {
    const result = resolveAppLandingRoute(
      {
        activeCapacity: 'teacher',
        bondId: 'bond-1',
        lastVisited: null,
        now: NOW,
      },
      {
        ...DEFAULT_LANDING_POLICY,
        contextualRules: [({ activeCapacity }) => (activeCapacity === 'teacher' ? 'self' : null)],
      },
    );
    expect(result).toEqual({ place: 'self', route: '/self', reason: 'context-rule' });
  });
});
