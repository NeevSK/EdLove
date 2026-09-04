import { describe, expect, it } from 'vitest';
import {
  gatewayWebCapabilities,
  getGatewayWebCapability,
} from '@/lib/capabilities/webCapabilityRegistry';

describe('gateway web capability registry', () => {
  it('classifies the gateway runtime as supported, adapted, or unavailable', () => {
    expect(getGatewayWebCapability('browser-auth').status).toBe('supported');
    expect(getGatewayWebCapability('session-persistence').status).toBe('adapter');
    expect(getGatewayWebCapability('native-payment-sheet').status).toBe('unavailable');
  });

  it('gives every capability a route owner, concrete action, and truthful fallback', () => {
    for (const capability of gatewayWebCapabilities) {
      expect(capability.ownerRoute).toMatch(/^\//);
      expect(capability.action.length).toBeGreaterThan(0);
      expect(capability.failureMessage.length).toBeGreaterThan(0);
    }
  });

  it('marks the native Stripe sheet unavailable rather than treating its compatibility shim as checkout', () => {
    const payment = getGatewayWebCapability('native-payment-sheet');

    expect(payment.reason).toContain('compatibility stub');
    expect(payment.failureMessage).toContain('not available in the browser');
  });
});
