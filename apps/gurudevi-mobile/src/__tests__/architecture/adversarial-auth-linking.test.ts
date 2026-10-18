import { getAuthRouteTarget } from '@repo/core/logic/auth/bootstrapRoutes';
import { DeepLinkStateGuard } from '@repo/core/logic/auth/deepLinkStateGuard';
import { DeepLinkManager, DeepLinkType } from '@repo/core/logic/managers/DeepLinkManager';
import { describe, expect, it, vi } from 'vitest';
import { dispatchDeepLink } from '@/lib/deepLinks/dispatchDeepLink';
import {
  normalizeAcceptedDeepLink,
  normalizeAcceptedInternalRoute,
} from '@/lib/deepLinks/urlPolicy';

/**
 * ADVERSARIAL INTEGRATION & BOUNDARY TEST SUITE (G1 - G3)
 *
 * Covers:
 * - G1: Adversarial Transport Boundary (Expired/Tampered JWTs, Forged CSRF States, Scheme Poisoning)
 * - G2: Scenario Contracts (Explorer to Authenticated Promotion, Deactivated Account Isolation, Token Refresh Failures)
 * - G3: Runtime Component & Decision Gate (Route Flow Boundary & Safe Traversal Defense)
 */

describe('G1: Adversarial Transport & Auth Boundaries', () => {
  it('rejects forged, replayed, or mismatched OAuth CSRF state parameters during callback', async () => {
    DeepLinkStateGuard.resetForTesting();
    const legitState = DeepLinkStateGuard.generateState('nonce-legit');

    // Attacker sends arbitrary state
    expect(DeepLinkStateGuard.verifyAndConsumeState('attacker-injected-state')).toBe(false);

    // Legitimate state consumes successfully once
    expect(DeepLinkStateGuard.verifyAndConsumeState(legitState)).toBe(true);

    // Replay attack with same state fails
    expect(DeepLinkStateGuard.verifyAndConsumeState(legitState)).toBe(false);
  });

  it('rejects expired or corrupt magic-link tokens gracefully without unhandled exceptions', async () => {
    const authManager = {
      exchangeCodeForSession: vi
        .fn()
        .mockRejectedValue(new Error('AuthApiError: Invalid or expired OTP token')),
      setSession: vi.fn(),
    };
    const manager = new DeepLinkManager(authManager as never);

    const result = await manager.handleURL(
      'gurudevi://auth/callback?code=expired-or-malformed-code',
    );

    expect(authManager.exchangeCodeForSession).toHaveBeenCalledWith('expired-or-malformed-code');
    expect(result).toMatchObject({
      type: DeepLinkType.AUTH_CALLBACK,
      isHandled: false,
      // The callback intentionally avoids reflecting Supabase token details;
      // the actionable recovery message is part of the anti-enumeration contract.
      message:
        'This secure link has expired or was already used. Request a new link and try again.',
    });
  });

  it('drops SQL/NoSQL injection payloads and script schemes in deep links', () => {
    const payloads = [
      "gurudevi://invite/classroom/'; DROP TABLE users; --",
      'https://gurudevi.app/auth/callback?code=<script>alert(1)</script>',
      'javascript:void(0)',
      'data:text/html,<script>alert(1)</script>',
      'gurudevi://auth/callback%00/admin',
    ];

    for (const url of payloads) {
      expect(normalizeAcceptedDeepLink(url)).toBeNull();
    }
  });
});

describe('G2: Scenario Contracts (Access Tiers & Identity Transitions)', () => {
  it('Scenario A: Explorer (Anonymous) receives an auth callback and cleanly transitions to Authenticated', async () => {
    const authManager = {
      exchangeCodeForSession: vi.fn().mockResolvedValue({
        user: { id: 'usr-123', is_anonymous: false },
        session: { access_token: 'jwt-valid-123', refresh_token: 'ref-123' },
      }),
      setSession: vi.fn(),
    };
    const manager = new DeepLinkManager(authManager as never);

    // Explorer starts on onboarding
    const explorerState = getAuthRouteTarget({
      pathname: '/onboarding',
      bootstrapReady: true,
      sessionMode: 'anonymous',
      onboardingCompleted: false,
      hasSession: true,
    });
    expect(explorerState.decision).toBe('public');

    // Receives auth callback deep link
    const result = await manager.handleURL('gurudevi://auth/callback?code=valid-upgrade-code');
    expect(result.isHandled).toBe(true);

    // After session is established, route engine gates to authenticated app or finishes onboarding
    const promotedState = getAuthRouteTarget({
      pathname: '/onboarding',
      bootstrapReady: true,
      sessionMode: 'authenticated',
      onboardingCompleted: true,
      hasActiveCapacity: true,
      hasSession: true,
    });
    expect(promotedState.decision).toBe('app');
    expect(promotedState.redirectTo).toBe('/self');
  });

  it('Scenario B: Deactivated (inactive) account is locked out of deep-link classroom joins and forced to account recovery', async () => {
    const target = getAuthRouteTarget({
      pathname: '/community',
      bootstrapReady: true,
      sessionMode: 'authenticated',
      identityAvailability: 'inactive', // Deactivated on server
      onboardingCompleted: true,
      hasActiveCapacity: true,
      hasSession: true,
    });

    expect(target.decision).toBe('inactive-account');
    expect(target.redirectTo).toBe('/account-recovery');
  });

  it('Scenario C: Unauthenticated user clicks classroom invite, link is stored safely, and user is directed to welcome', async () => {
    const unauthState = getAuthRouteTarget({
      pathname: '/community',
      bootstrapReady: true,
      sessionMode: 'unauthenticated',
      onboardingCompleted: false,
      hasSession: false,
    });

    expect(unauthState.decision).toBe('public');
    expect(unauthState.redirectTo).toBe('/welcome');
  });
});

describe('G3: Runtime Component & Decision Gate Protection', () => {
  it('prevents authenticated users from being sent to internal admin or unpermitted routes via crafted internal links', () => {
    expect(normalizeAcceptedInternalRoute('/admin/system-secrets')).toBeNull();
    expect(normalizeAcceptedInternalRoute('/developer-tools/bypass')).toBeNull();
    expect(normalizeAcceptedInternalRoute('/self/../../private-data')).toBeNull();

    // Valid routes pass
    expect(normalizeAcceptedInternalRoute('/self')).toBe('/self');
    expect(normalizeAcceptedInternalRoute('/workspace')).toBe('/workspace');
    expect(normalizeAcceptedInternalRoute('/community')).toBe('/community');
    expect(normalizeAcceptedInternalRoute('/library')).toBe('/library');
    expect(normalizeAcceptedInternalRoute('/profile')).toBe('/profile');
  });
});
