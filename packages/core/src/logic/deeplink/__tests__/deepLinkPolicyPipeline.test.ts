import {
  ALLOWED_INTERNAL_ROUTE_PATHS,
  APP_ROUTES,
  isValidAppRoutePath,
} from '@repo/core/routing/routeManifest';
import { Effect } from 'effect';
import { describe, expect, it } from 'vitest';
import {
  classifyRouteIntent,
  decodeInstallReferrerEffect,
  formatClassroomDeepLink,
  formatClassroomShareUrl,
  isQRDeepLink,
  normalizeAcceptedDeepLink,
  normalizeAcceptedInternalRoute,
  validateDeepLinkEffect,
} from '../deepLinkPolicyPipeline';

describe('routeManifest & deepLinkPolicyPipeline (G0 Contract & Pure Logic Tests)', () => {
  describe('routeManifest invariants', () => {
    it('defines all required canonical sanctuary routes with valid access tiers', () => {
      expect(APP_ROUTES.SELF.path).toBe('/self');
      expect(APP_ROUTES.SELF.access).toBe('authenticated');
      expect(APP_ROUTES.WORKSPACE.path).toBe('/workspace');
      expect(APP_ROUTES.WORKSPACE.access).toBe('authenticated');
      expect(APP_ROUTES.AUTH.path).toBe('/auth');
      expect(APP_ROUTES.AUTH.access).toBe('public');
      expect(APP_ROUTES.QR.path).toBe('/qr');
      expect(APP_ROUTES.QR.access).toBe('public');
    });

    it('identifies exact and sub-path internal routes accurately', () => {
      expect(isValidAppRoutePath('/self')).toBe(true);
      expect(isValidAppRoutePath('/workspace/class-123')).toBe(true);
      expect(isValidAppRoutePath('/library/book-456')).toBe(true);
      expect(isValidAppRoutePath('/auth/callback?code=xyz')).toBe(true);
      expect(isValidAppRoutePath('/nonexistent-private-route')).toBe(false);
      expect(isValidAppRoutePath('/admin/secret')).toBe(false);
    });
  });

  describe('deepLinkPolicyPipeline (Effect v4-ready validation)', () => {
    it('succeeds for valid canonical mobile custom scheme deep links', async () => {
      const result = await Effect.runPromise(
        validateDeepLinkEffect('gurudevi://auth/callback?code=test-code&state=123'),
      );
      expect(result).toBe('gurudevi://auth/callback?code=test-code&state=123');
    });

    it('succeeds for valid canonical HTTPS universal links', async () => {
      const result = await Effect.runPromise(
        validateDeepLinkEffect('https://gurudevi.app/auth/callback?code=test-code'),
      );
      expect(result).toBe('https://gurudevi.app/auth/callback?code=test-code');
    });

    it('fails with DeepLinkLengthError on overlong URLs (> 8192 chars)', async () => {
      const longUrl = 'gurudevi://auth/callback?' + 'a'.repeat(8200);
      const exit = await Effect.runPromiseExit(validateDeepLinkEffect(longUrl));
      expect(exit._tag).toBe('Failure');
      if (exit._tag === 'Failure') {
        expect(exit.cause.toString()).toContain('DeepLinkLengthError');
      }
    });

    it('fails with DeepLinkForbiddenCharsError on adversarial characters and null bytes', async () => {
      const maliciousCases = [
        'gurudevi://auth/callback?param=<script>alert(1)</script>',
        "gurudevi://auth/callback?param=admin'--",
        'gurudevi://auth/callback?param=test\0evil',
        'gurudevi://auth/callback?param=test%00evil',
        'gurudevi://auth/callback?param=line1\r\nline2',
      ];

      for (const url of maliciousCases) {
        const exit = await Effect.runPromiseExit(validateDeepLinkEffect(url));
        expect(exit._tag).toBe('Failure');
        if (exit._tag === 'Failure') {
          expect(exit.cause.toString()).toContain('DeepLinkForbiddenCharsError');
        }
      }
    });

    it('fails with DeepLinkTraversalError on encoded or literal path traversals', async () => {
      const traversalCases = [
        'gurudevi://auth/callback/../../internal',
        'https://gurudevi.app/auth/callback/%2e%2e/%2e%2e/admin',
        'https://gurudevi.app/qr/../secret',
      ];

      for (const url of traversalCases) {
        const exit = await Effect.runPromiseExit(validateDeepLinkEffect(url));
        expect(exit._tag).toBe('Failure');
        if (exit._tag === 'Failure') {
          expect(exit.cause.toString()).toContain('DeepLinkTraversalError');
        }
      }
    });

    it('fails with DeepLinkHostOrSchemeError on unwhitelisted hosts or rogue protocols', async () => {
      const rogueCases = [
        'ftp://gurudevi.app/auth/callback',
        'https://evil-attacker.com/auth/callback',
        'gurudevi://unknown-host/path',
      ];

      for (const url of rogueCases) {
        const exit = await Effect.runPromiseExit(validateDeepLinkEffect(url));
        expect(exit._tag).toBe('Failure');
        if (exit._tag === 'Failure') {
          expect(exit.cause.toString()).toContain('DeepLinkHostOrSchemeError');
        }
      }
    });
  });

  describe('normalizeAcceptedDeepLink & isQRDeepLink synchronous helpers', () => {
    it('normalizes valid links and rejects malicious ones safely with null', () => {
      expect(normalizeAcceptedDeepLink('gurudevi://auth/callback?code=abc')).toBe(
        'gurudevi://auth/callback?code=abc',
      );
      expect(normalizeAcceptedDeepLink('https://evil.com/auth')).toBeNull();
      expect(normalizeAcceptedDeepLink('javascript:alert(1)')).toBeNull();
    });

    it('identifies canonical QR links correctly', () => {
      expect(
        isQRDeepLink('gurudevi://qr?v=1&action=join_class&classroom_id=class-1'),
      ).toBe(true);
      expect(
        isQRDeepLink(
          'https://gurudevi.app/qr?v=1&action=join_school&school_id=school-1&group_id=group-1',
        ),
      ).toBe(true);
      expect(isQRDeepLink('gurudevi://auth/callback')).toBe(false);
      expect(isQRDeepLink('https://evil.com/qr')).toBe(false);
      expect(isQRDeepLink('gurudevi://qrevil?v=1&action=join_class')).toBe(false);
    });

    it('normalizes accepted internal routes strictly against route manifest', () => {
      expect(normalizeAcceptedInternalRoute('/self')).toBe('/self');
      expect(normalizeAcceptedInternalRoute('/workspace/class-1')).toBe('/workspace/class-1');
      expect(normalizeAcceptedInternalRoute('/evil/route')).toBeNull();
      expect(normalizeAcceptedInternalRoute('//evil.com')).toBeNull();
      expect(normalizeAcceptedInternalRoute('/self/../admin')).toBeNull();
    });
  });

  describe('route intent classification', () => {
    it('classifies equivalent HTTPS and custom-scheme QR links to the same payload', () => {
      const customScheme = classifyRouteIntent(
        'gurudevi://qr?v=1&action=join_class&classroom_id=class-1',
      );
      const https = classifyRouteIntent(
        'https://gurudevi.app/qr?v=1&action=join_class&classroom_id=class-1',
      );

      expect(customScheme).toMatchObject({
        kind: 'qr',
        payload: { action: 'join_class', classroom_id: 'class-1', v: 1 },
      });
      expect(https).toMatchObject({
        kind: 'qr',
        payload: { action: 'join_class', classroom_id: 'class-1', v: 1 },
      });
    });

    it('classifies first-party vanity path /c/:code and custom scheme gurudevi://c/:code to classroomInvite', () => {
      const httpsResult = classifyRouteIntent('https://gurudevi.app/c/BIO-2026');
      expect(httpsResult).toEqual({
        kind: 'classroomInvite',
        inviteCode: 'BIO-2026',
        url: 'https://gurudevi.app/c/BIO-2026',
      });

      const nativeResult = classifyRouteIntent('gurudevi://c/BIO-2026');
      expect(nativeResult).toEqual({
        kind: 'classroomInvite',
        inviteCode: 'BIO-2026',
        url: 'gurudevi://c/BIO-2026',
      });
    });

    it('separates unsupported valid links from rejected hostile input', () => {
      expect(classifyRouteIntent('https://gurudevi.app/invite')).toEqual({
        kind: 'unsupported',
      });
      expect(classifyRouteIntent('https://evil.example/qr?v=1')).toEqual({
        kind: 'rejected',
        reason: 'DeepLinkHostOrSchemeError',
      });
    });
  });

  describe('decodeInstallReferrerEffect (Google Play Install Referrer pipeline)', () => {
    it('decodes a valid encoded referrer string into a structured intent', async () => {
      const raw = 'utm_source%3Dwhatsapp%26utm_campaign%3Dteacher_drive%26inviteCode%3DCHEM_2026';
      const exit = await Effect.runPromiseExit(decodeInstallReferrerEffect(raw));
      expect(exit._tag).toBe('Success');
      if (exit._tag === 'Success') {
        expect(exit.value).toEqual({
          inviteCode: 'CHEM_2026',
          utmSource: 'whatsapp',
          utmCampaign: 'teacher_drive',
          raw,
        });
      }
    });

    it('sanitizes inviteCode strictly rejecting malicious SQL or script characters', async () => {
      const raw = 'inviteCode%3DCHEM_2026%3Cscript%3E';
      const exit = await Effect.runPromiseExit(decodeInstallReferrerEffect(raw));
      expect(exit._tag).toBe('Success');
      if (exit._tag === 'Success') {
        // Must be undefined because it contains non-alphanumeric chars
        expect(exit.value.inviteCode).toBeUndefined();
      }
    });

    it('fails with ReferrerLengthError on excessive referrer strings (> 1024 chars)', async () => {
      const raw = 'a'.repeat(1025);
      const exit = await Effect.runPromiseExit(decodeInstallReferrerEffect(raw));
      expect(exit._tag).toBe('Failure');
      if (exit._tag === 'Failure') {
        expect(exit.cause.toString()).toContain('ReferrerLengthError');
      }
    });

    it('fails with ReferrerForbiddenCharsError on null bytes or CRLF', async () => {
      const raw = 'inviteCode=TEST\0EVIL';
      const exit = await Effect.runPromiseExit(decodeInstallReferrerEffect(raw));
      expect(exit._tag).toBe('Failure');
      if (exit._tag === 'Failure') {
        expect(exit.cause.toString()).toContain('ReferrerForbiddenCharsError');
      }
    });
  });

  describe('outbound link formatting', () => {
    it('formats canonical public share URLs and native deep links cleanly', () => {
      expect(formatClassroomShareUrl('MATH-2026')).toBe('https://gurudevi.app/c/MATH-2026');
      expect(formatClassroomDeepLink('MATH-2026')).toBe('gurudevi://c/MATH-2026');
    });

    it('safely encodes special characters in classroom invite codes', () => {
      expect(formatClassroomShareUrl('SCIENCE 101')).toBe('https://gurudevi.app/c/SCIENCE%20101');
      expect(formatClassroomDeepLink('SCIENCE 101')).toBe('gurudevi://c/SCIENCE%20101');
    });
  });
});
