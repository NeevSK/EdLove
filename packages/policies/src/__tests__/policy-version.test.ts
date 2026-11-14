import { describe, expect, it } from 'vitest';
import { cedarPolicyVersion, reinitializeCedar } from '../engine/evaluator';

describe('Cedar policy version', () => {
  it('is a sha256 fingerprint that stays the same when the same policies reload', () => {
    const version = cedarPolicyVersion();
    expect(version).toMatch(/^sha256:[0-9a-f]{64}$/);
    reinitializeCedar();
    expect(cedarPolicyVersion()).toBe(version);
  });
});
