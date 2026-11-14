import {
  type ChannelCapabilitySafetyInput,
  resolveChannelCapabilitySafety,
} from '@repo/core/logic/omnichannel/channelCapabilitySafety';
import { describe, expect, it } from 'vitest';

const input: ChannelCapabilitySafetyInput = {
  channel: 'whatsapp',
  endpointKind: 'private',
  identityState: 'linked',
  safetyClass: 'human_confirmed_write',
  operationallyEnabled: true,
  hasCurrentScope: true,
  hasConsent: true,
  hasHumanConfirmation: true,
  hasActiveDelegation: false,
  delegationAllowsCapability: false,
};

describe('resolveChannelCapabilitySafety', () => {
  it('permits a public read from an unlinked group without treating it as authority', () => {
    expect(
      resolveChannelCapabilitySafety({
        ...input,
        endpointKind: 'group',
        identityState: 'anonymous',
        safetyClass: 'public_read',
      }),
    ).toEqual({ permitted: true, reason: 'permitted' });
  });

  it('allows a verified channel identity to create a private uncommitted draft', () => {
    expect(
      resolveChannelCapabilitySafety({
        ...input,
        identityState: 'channel_verified',
        safetyClass: 'draft',
        hasCurrentScope: false,
        hasConsent: false,
        hasHumanConfirmation: false,
      }),
    ).toEqual({ permitted: true, reason: 'permitted' });
  });

  it('requires channel verification before accepting a draft', () => {
    expect(
      resolveChannelCapabilitySafety({
        ...input,
        identityState: 'anonymous',
        safetyClass: 'draft',
      }),
    ).toEqual({ permitted: false, reason: 'channel_verification_required' });
  });

  it.each([
    ['unlinked identity', { identityState: 'channel_verified' as const }, 'identity_link_required'],
    ['missing scope', { hasCurrentScope: false }, 'current_scope_required'],
    ['missing consent', { hasConsent: false }, 'consent_required'],
    ['missing confirmation', { hasHumanConfirmation: false }, 'human_confirmation_required'],
  ])('denies a protected write for %s', (_label, overrides, reason) => {
    expect(resolveChannelCapabilitySafety({ ...input, ...overrides })).toEqual({
      permitted: false,
      reason,
    });
  });

  it('never permits protected work from a group or channel endpoint', () => {
    for (const endpointKind of ['group', 'channel'] as const) {
      expect(resolveChannelCapabilitySafety({ ...input, endpointKind })).toEqual({
        permitted: false,
        reason: 'private_endpoint_required',
      });
    }
  });

  it('requires a live, capability-scoped delegation for delegated writes', () => {
    const delegated = {
      ...input,
      channel: 'agent' as const,
      safetyClass: 'delegated_write' as const,
    };

    expect(resolveChannelCapabilitySafety(delegated)).toEqual({
      permitted: false,
      reason: 'delegation_required',
    });
    expect(resolveChannelCapabilitySafety({ ...delegated, hasActiveDelegation: true })).toEqual({
      permitted: false,
      reason: 'delegation_capability_denied',
    });
    expect(
      resolveChannelCapabilitySafety({
        ...delegated,
        hasActiveDelegation: true,
        delegationAllowsCapability: true,
      }),
    ).toEqual({ permitted: true, reason: 'permitted' });
  });

  it('honors the operational emergency stop before any other grant', () => {
    expect(
      resolveChannelCapabilitySafety({
        ...input,
        operationallyEnabled: false,
        safetyClass: 'public_read',
        endpointKind: 'group',
        identityState: 'anonymous',
      }),
    ).toEqual({ permitted: false, reason: 'operationally_disabled' });
  });
});
