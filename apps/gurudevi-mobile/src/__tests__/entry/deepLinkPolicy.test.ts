import { DeepLinkType } from '@repo/core/logic';
import { describe, expect, it, vi } from 'vitest';

import { dispatchDeepLink } from '@/lib/deepLinks/dispatchDeepLink';
import {
  isQRDeepLink,
  normalizeAcceptedDeepLink,
  normalizeAcceptedInternalRoute,
} from '@/lib/deepLinks/urlPolicy';

describe('deep-link URL policy', () => {
  it('accepts supported schemes and rejects malformed or untrusted schemes', () => {
    expect(normalizeAcceptedDeepLink('gurudevi://auth/callback')).toBe('gurudevi://auth/callback');
    expect(
      normalizeAcceptedDeepLink('https://platform.gurudevi.edlove.org/auth/callback'),
    ).not.toBeNull();
    expect(normalizeAcceptedDeepLink('https://untrusted.example/auth/callback')).toBeNull();
    expect(normalizeAcceptedDeepLink('edlove://auth/callback')).toBeNull();
    expect(normalizeAcceptedDeepLink('javascript:alert(1)')).toBeNull();
    expect(normalizeAcceptedDeepLink('not a url')).toBeNull();
  });

  it('recognizes QR links before generic dispatch', () => {
    expect(isQRDeepLink('gurudevi://qr?token=one')).toBe(true);
    expect(isQRDeepLink('https://platform.gurudevi.edlove.org/qr?v=1')).toBe(true);
    expect(isQRDeepLink('gurudevi://auth/callback')).toBe(false);
  });

  it('allows only known internal route families for notifications', () => {
    expect(normalizeAcceptedInternalRoute('/community')).toBe('/community');
    expect(normalizeAcceptedInternalRoute('/library/resource/resource-1')).toBe(
      '/library/resource/resource-1',
    );
    expect(normalizeAcceptedInternalRoute('//evil.example')).toBeNull();
    expect(normalizeAcceptedInternalRoute('/unknown-route')).toBeNull();
  });
});

describe('deep-link dispatcher', () => {
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
});
