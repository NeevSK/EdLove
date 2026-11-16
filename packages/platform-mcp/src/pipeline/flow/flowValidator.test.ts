import { describe, it, expect } from 'vitest';
import { validateFlow } from './flowValidator.js';
import { chatMessagingFlow } from './chatJourney.flow.js';
import type { FlowDefinition } from './types.js';

describe('4-Layer Declarative Flow Engine & Validator', () => {
  it('validates the production ChatMessagingFlow reference with 0 errors', () => {
    const receipt = validateFlow(chatMessagingFlow);

    expect(receipt.valid).toBe(true);
    expect(receipt.errors).toHaveLength(0);
    expect(receipt.totalStates).toBe(8);
    expect(receipt.totalTerminals).toBe(2);
    expect(receipt.journeyId).toBe('journey:chat.send_message');
    expect(receipt.version).toBe('2.1.0');
  });

  it('rejects flows with invalid SemVer version metadata', () => {
    const brokenFlow: FlowDefinition = {
      ...chatMessagingFlow,
      metadata: {
        ...chatMessagingFlow.metadata,
        version: 'v2-beta' as any,
      },
    };

    const receipt = validateFlow(brokenFlow);
    expect(receipt.valid).toBe(false);
    expect(receipt.errors.some((e) => e.includes('invalid SemVer version'))).toBe(true);
  });

  it('detects unmapped target states in transitions', () => {
    const brokenFlow: FlowDefinition = {
      ...chatMessagingFlow,
      states: {
        ...chatMessagingFlow.states,
        composer_idle: {
          ...chatMessagingFlow.states.composer_idle!,
          onEvents: {
            TAP_SEND: {
              targetState: 'non_existent_state_xyz',
            },
          },
        },
      },
    };

    const receipt = validateFlow(brokenFlow);
    expect(receipt.valid).toBe(false);
    expect(receipt.errors.some((e) => e.includes('unknown target state "non_existent_state_xyz"'))).toBe(true);
  });

  it('enforces required InvariantEnvelope fields (RLS & Soft Delete)', () => {
    const brokenFlow: FlowDefinition = {
      ...chatMessagingFlow,
      invariants: {
        ...chatMessagingFlow.invariants,
        rlsPolicy: '',
      },
    };

    const receipt = validateFlow(brokenFlow);
    expect(receipt.valid).toBe(false);
    expect(receipt.errors.some((e) => e.includes('missing required "rlsPolicy"'))).toBe(true);
  });
});
