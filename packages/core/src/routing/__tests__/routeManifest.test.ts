import { describe, expect, it } from 'vitest';
import {
  APP_ROUTES,
  isValidAppRoutePath,
  resolveRouteMetabolicProfile,
} from '../routeManifest';

describe('routeManifest & Metabolic Routing Architecture', () => {
  describe('APP_ROUTES definitions', () => {
    it('defines canonical sanctuary routes with valid access tiers and metabolic profiles', () => {
      expect(APP_ROUTES.SELF.path).toBe('/self');
      expect(APP_ROUTES.SELF.access).toBe('authenticated');
      expect(APP_ROUTES.SELF.metabolic).toBeDefined();
      expect(APP_ROUTES.SELF.metabolic?.intensity).toBe('heavy');

      expect(APP_ROUTES.WORKSPACE.path).toBe('/workspace');
      expect(APP_ROUTES.WORKSPACE.access).toBe('authenticated');
      expect(APP_ROUTES.WORKSPACE.metabolic?.intensity).toBe('heavy');

      expect(APP_ROUTES.AUTH.path).toBe('/auth');
      expect(APP_ROUTES.AUTH.access).toBe('public');

      expect(APP_ROUTES.SIGN_IN.path).toBe('/sign-in');
      expect(APP_ROUTES.SIGN_IN.metabolic?.intensity).toBe('nominal');
    });

    it('identifies exact and sub-path internal routes accurately', () => {
      expect(isValidAppRoutePath('/self')).toBe(true);
      expect(isValidAppRoutePath('/workspace/class-123')).toBe(true);
      expect(isValidAppRoutePath('/auth/callback?code=xyz')).toBe(true);
      expect(isValidAppRoutePath('/unknown-invalid-route')).toBe(false);
    });
  });

  describe('resolveRouteMetabolicProfile dynamic resolution', () => {
    it('resolves heavy canvas-mount profile for heavy GPU / visual routes', () => {
      const profile = resolveRouteMetabolicProfile('/self');
      expect(profile).toBeDefined();
      expect(['heavy', 'intensive']).toContain(profile.intensity);
      expect(profile.transitionDwellMs).toBeGreaterThanOrEqual(400);
    });

    it('resolves parameterized route profiles matching wildcard segments', () => {
      const profile = resolveRouteMetabolicProfile('/workspace/commercial/batch-xyz');
      expect(profile).toBeDefined();
      expect(['heavy', 'intensive']).toContain(profile.intensity);
    });

    it('strips query parameters and hashes before matching', () => {
      const profileClean = resolveRouteMetabolicProfile('/self');
      const profileWithParams = resolveRouteMetabolicProfile('/self?tab=wisdom#section-1');
      expect(profileWithParams).toEqual(profileClean);
    });

    it('handles trailing slashes gracefully', () => {
      const profileSlash = resolveRouteMetabolicProfile('/workspace/');
      const profileClean = resolveRouteMetabolicProfile('/workspace');
      expect(profileSlash).toEqual(profileClean);
    });

    it('falls back to nominal default for unknown routes', () => {
      const fallback = resolveRouteMetabolicProfile('/completely/unknown/route/not/in/manifest');
      expect(fallback).toEqual({
        intensity: 'nominal',
        transitionDwellMs: 200,
      });
    });

    it('resolves root route profile', () => {
      const rootProfile = resolveRouteMetabolicProfile('/');
      expect(rootProfile).toBeDefined();
      expect(['heavy', 'intensive', 'nominal']).toContain(rootProfile.intensity);
    });
  });
});
