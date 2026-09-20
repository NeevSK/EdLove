import {
  ALLOWED_INTERNAL_ROUTE_PATHS,
  APP_ROUTES,
  isValidAppRoutePath,
} from '@repo/core/routing/routeManifest';
import { Effect } from 'effect';
import { describe, expect, it } from 'vitest';
import {
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
      expect(isQRDeepLink('gurudevi://qr?v=1&action=join_class')).toBe(true);
      expect(isQRDeepLink('https://gurudevi.app/qr?v=1&action=join_school')).toBe(true);
      expect(isQRDeepLink('gurudevi://auth/callback')).toBe(false);
      expect(isQRDeepLink('https://evil.com/qr')).toBe(false);
    });

    it('normalizes accepted internal routes strictly against route manifest', () => {
      expect(normalizeAcceptedInternalRoute('/self')).toBe('/self');
      expect(normalizeAcceptedInternalRoute('/workspace/class-1')).toBe('/workspace/class-1');
      expect(normalizeAcceptedInternalRoute('/evil/route')).toBeNull();
      expect(normalizeAcceptedInternalRoute('//evil.com')).toBeNull();
      expect(normalizeAcceptedInternalRoute('/self/../admin')).toBeNull();
    });
  });
});
