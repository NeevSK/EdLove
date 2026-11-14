import { describe, expect, it } from 'vitest';
import { capabilityIsAvailable, parseCapabilityBootstrapPayload } from './capabilities';

describe('shared capability envelope', () => {
  it('parses the same server projection for browser and native clients', () => {
    const capabilities = parseCapabilityBootstrapPayload({
      features: [
        {
          id: 'self',
          status: 'available',
          allowedOperations: ['read'],
          accessClass: 'account-required',
        },
        { id: 'workspace', status: 'locked', allowedOperations: ['read', 'create'] },
        { id: 'malformed', status: 'available', allowedOperations: ['delete'] },
      ],
    });

    expect(capabilityIsAvailable(capabilities, 'self')).toBe(true);
    expect(capabilityIsAvailable(capabilities, 'workspace')).toBe(false);
    expect(capabilities).toHaveLength(2);
  });
});
