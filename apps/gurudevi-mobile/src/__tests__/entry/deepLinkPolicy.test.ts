import { DeepLinkType } from '@repo/core/logic';
import { describe, expect, it, vi } from 'vitest';

import { dispatchDeepLink } from '@/lib/deepLinks/dispatchDeepLink';
import {
  isQRDeepLink,
  MAX_DEEP_LINK_LENGTH,
  normalizeAcceptedDeepLink,
  normalizeAcceptedInternalRoute,
} from '@/lib/deepLinks/urlPolicy';

describe('deep-link URL policy (G1 Boundary & Threat Defenses)', () => {
  it('accepts supported schemes and rejects malformed or untrusted schemes', () => {
    expect(normalizeAcceptedDeepLink('gurudevi://auth/callback')).toBe('gurudevi://auth/callback');
    expect(normalizeAcceptedDeepLink('https://gurudevi.app/auth/callback')).not.toBeNull();
    expect(
      normalizeAcceptedDeepLink('https://sanctuary.gurudevi.app/auth/callback'),
    ).not.toBeNull();
    expect(normalizeAcceptedDeepLink('https://untrusted.example/auth/callback')).toBeNull();
    expect(normalizeAcceptedDeepLink('https://gurudevi.app/p/library/resource/1')).toBeNull();
    expect(normalizeAcceptedDeepLink('edlove://auth/callback')).toBeNull();
    expect(normalizeAcceptedDeepLink('javascript:alert(1)')).toBeNull();
    expect(normalizeAcceptedDeepLink('not a url')).toBeNull();
    expect(
      normalizeAcceptedDeepLink(`https://gurudevi.app/qr?x=${'a'.repeat(MAX_DEEP_LINK_LENGTH)}`),
    ).toBeNull();
  });

  it('recognizes QR links before generic dispatch', () => {
    expect(isQRDeepLink('gurudevi://qr?token=one')).toBe(true);
    expect(isQRDeepLink('https://gurudevi.app/qr?v=1')).toBe(true);
    expect(isQRDeepLink('https://sanctuary.gurudevi.app/qr?v=1')).toBe(true);
    expect(isQRDeepLink('gurudevi://auth/callback')).toBe(false);
  });

  it('allows only known internal route families for notifications', () => {
    expect(normalizeAcceptedInternalRoute('/community')).toBe('/community');
    expect(normalizeAcceptedInternalRoute('/library/resource/resource-1')).toBe(
      '/library/resource/resource-1',
    );
    expect(normalizeAcceptedInternalRoute('//evil.example')).toBeNull();
    expect(normalizeAcceptedInternalRoute('/unknown-route')).toBeNull();
    expect(
      normalizeAcceptedInternalRoute(`/community?x=${'a'.repeat(MAX_DEEP_LINK_LENGTH)}`),
    ).toBeNull();
  });

  it.each([
    'https://gurudevi.app/../auth/callback',
    'https://gurudevi.app/%2f%2fevil.example',
    'https://gurudevi.app/qr\r\nLocation:%20https://evil.example',
    'https://gurudevi.app/qr%00.evil.example',
    'https://gurudevi.app/admin',
    'https://gurudevi.app/unknown-internal-page',
    'edlove://invite/classroom/code',
    'http://attacker.com/auth/callback',
  ])('keeps adversarial or unsupported link shape out of native dispatch: %s', (url) => {
    const accepted = normalizeAcceptedDeepLink(url);
    expect(accepted).toBeNull();
  });
});

describe('deep-link dispatcher (G2 Scenario Tests)', () => {
  it('tracks one accepted invite and navigates with its code', async () => {
    const handleURL = vi.fn().mockResolvedValue({
      isHandled: false,
      params: { inviteCode: 'invite-1' },
      type: DeepLinkType.CLASSROOM_INVITE,
    });
    const navigateToClassroomInvite = vi.fn();
    const track = vi.fn();

    await expect(
      dispatchDeepLink('gurudevi://invite/classroom/invite-1', {
        handleURL,
        navigateToClassroomInvite,
        track,
      }),
    ).resolves.toBe(true);

    expect(handleURL).toHaveBeenCalledOnce();
    expect(track).toHaveBeenCalledOnce();
    expect(navigateToClassroomInvite).toHaveBeenCalledWith('invite-1');
  });

  it('drops unaccepted URLs without executing side effects or tracking', async () => {
    const handleURL = vi.fn();
    const navigateToClassroomInvite = vi.fn();
    const track = vi.fn();

    const result = await dispatchDeepLink('https://evil.attacker.com/auth/callback', {
      handleURL,
      navigateToClassroomInvite,
      track,
    });

    expect(result).toBe(false);
    expect(handleURL).not.toHaveBeenCalled();
    expect(track).not.toHaveBeenCalled();
    expect(navigateToClassroomInvite).not.toHaveBeenCalled();
  });

  it('handles auth callback with handled outcome and emits telemetry', async () => {
    const handleURL = vi.fn().mockResolvedValue({
      isHandled: true,
      params: { access_token: 'tok-123', code: 'code-456' },
      type: DeepLinkType.AUTH_CALLBACK,
    });
    const navigateToClassroomInvite = vi.fn();
    const track = vi.fn();

    const result = await dispatchDeepLink('gurudevi://auth/callback?code=code-456', {
      handleURL,
      navigateToClassroomInvite,
      track,
    });

    expect(result).toBe(true);
    expect(handleURL).toHaveBeenCalledWith('gurudevi://auth/callback?code=code-456');
    expect(track).toHaveBeenCalledWith(
      'gurudevi://auth/callback?code=code-456',
      DeepLinkType.AUTH_CALLBACK,
      {
        access_token: 'tok-123',
        code: 'code-456',
      },
    );
    expect(navigateToClassroomInvite).not.toHaveBeenCalled();
  });
});
