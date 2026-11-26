import { checkInternalHref } from '@repo/core/routing/internalHref';
import { describe, expect, it } from 'vitest';
import { resolveWorkspaceSwitcherTargets } from '../workspace/workspaceSwitcher';
import { isPlace, PLACE_ROUTES, PLACES } from './placeRoutes';

describe('place routes / G1, real route catalogues', () => {
  it.each(PLACES)('%s lands on a screen on mobile and on the web', (place) => {
    expect(checkInternalHref(PLACE_ROUTES.mobile[place], 'mobile')).toMatchObject({ ok: true });
    expect(checkInternalHref(PLACE_ROUTES.web[place], 'web')).toMatchObject({ ok: true });
  });

  it('knows a place by name and nothing else', () => {
    expect(isPlace('workspace')).toBe(true);
    expect(isPlace('FounderDashboard')).toBe(false);
    expect(isPlace('constructor')).toBe(false);
  });

  it('sends every workspace switcher target to a place, never a screen name', () => {
    const targets = resolveWorkspaceSwitcherTargets({
      canManageFounderDashboard: true,
      canManageAdminDashboard: true,
      canManagePrincipalDashboard: true,
      canManageTeacherDashboard: true,
      canManageStudentDashboard: true,
      canManageGuardianDashboard: true,
      hasPrimaryInstitution: true,
      hasMountedGuardianWorkspace: true,
    });
    expect(targets.length).toBeGreaterThan(4);
    for (const target of targets) {
      if (target.destination) expect(isPlace(target.destination.place)).toBe(true);
    }
  });
});
