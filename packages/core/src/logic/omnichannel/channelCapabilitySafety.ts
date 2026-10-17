import type { ChannelEndpointKind, ChannelTransport } from './channelAuthority';

export type SanctuaryChannel = ChannelTransport;

/** Authority state used only while deciding channel capability safety. */
export type ChannelCapabilityIdentityState = 'anonymous' | 'channel_verified' | 'linked';

export type ChannelCapabilitySafetyClass =
  | 'public_read'
  | 'linked_read'
  | 'draft'
  | 'human_confirmed_write'
  | 'delegated_write';

export type ChannelCapabilitySafetyReason =
  | 'permitted'
  | 'operationally_disabled'
  | 'identity_link_required'
  | 'channel_verification_required'
  | 'private_endpoint_required'
  | 'current_scope_required'
  | 'consent_required'
  | 'human_confirmation_required'
  | 'delegation_required'
  | 'delegation_capability_denied';

export type ChannelCapabilitySafetyDecision =
  | { permitted: true; reason: 'permitted' }
  | { permitted: false; reason: Exclude<ChannelCapabilitySafetyReason, 'permitted'> };

export interface ChannelCapabilitySafetyInput {
  channel: SanctuaryChannel;
  endpointKind: ChannelEndpointKind;
  identityState: ChannelCapabilityIdentityState;
  safetyClass: ChannelCapabilitySafetyClass;
  operationallyEnabled: boolean;
  hasCurrentScope: boolean;
  hasConsent: boolean;
  hasHumanConfirmation: boolean;
  hasActiveDelegation: boolean;
  delegationAllowsCapability: boolean;
}

function requiresPrivateEndpoint(input: ChannelCapabilitySafetyInput): boolean {
  return (
    input.safetyClass !== 'public_read' &&
    (input.endpointKind === 'group' || input.endpointKind === 'channel')
  );
}

/**
 * Resolves the minimum channel authority required before a transport adapter
 * may request a Sanctuary capability. It does not grant domain authorization:
 * the API must still derive account scope and evaluate its normal policy path.
 */
export function resolveChannelCapabilitySafety(
  input: ChannelCapabilitySafetyInput,
): ChannelCapabilitySafetyDecision {
  if (!input.operationallyEnabled) {
    return { permitted: false, reason: 'operationally_disabled' };
  }

  if (requiresPrivateEndpoint(input)) {
    return { permitted: false, reason: 'private_endpoint_required' };
  }

  if (input.safetyClass === 'public_read') {
    return { permitted: true, reason: 'permitted' };
  }

  if (input.safetyClass === 'draft') {
    if (input.identityState === 'anonymous') {
      return { permitted: false, reason: 'channel_verification_required' };
    }
    return { permitted: true, reason: 'permitted' };
  }

  if (input.identityState !== 'linked') {
    return { permitted: false, reason: 'identity_link_required' };
  }

  if (!input.hasCurrentScope) {
    return { permitted: false, reason: 'current_scope_required' };
  }

  if (!input.hasConsent) {
    return { permitted: false, reason: 'consent_required' };
  }

  if (input.safetyClass === 'linked_read') {
    return { permitted: true, reason: 'permitted' };
  }

  if (input.safetyClass === 'human_confirmed_write') {
    return input.hasHumanConfirmation
      ? { permitted: true, reason: 'permitted' }
      : { permitted: false, reason: 'human_confirmation_required' };
  }

  if (!input.hasActiveDelegation) {
    return { permitted: false, reason: 'delegation_required' };
  }

  return input.delegationAllowsCapability
    ? { permitted: true, reason: 'permitted' }
    : { permitted: false, reason: 'delegation_capability_denied' };
}
