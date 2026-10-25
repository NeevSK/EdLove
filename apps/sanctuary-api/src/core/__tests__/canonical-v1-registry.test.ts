import { describe, expect, it } from 'vitest';
import { ATTENDANCE_BATCH_RECORD_CAPABILITY } from '@repo/core/logic/domains/attendanceCommand/contract';
import {
  assertUniqueCanonicalV1Registrations,
  canonicalV1Capabilities,
} from '../canonicalV1Registry';

describe('canonical v1 capability registry', () => {
  it('admits every capability exactly once', () => {
    const ids = canonicalV1Capabilities.map((capability) => capability.id);

    expect(ids).toEqual([ATTENDANCE_BATCH_RECORD_CAPABILITY]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('rejects duplicate router keys before composing the canonical router', () => {
    const descriptor = canonicalV1Capabilities[0];

    expect(() =>
      assertUniqueCanonicalV1Registrations([
        { key: 'attendance', descriptor },
        { key: 'attendance', descriptor: { ...descriptor, id: 'another.capability' } },
      ]),
    ).toThrow('duplicate key');
  });

  it('requires a durable commit boundary for committed capabilities', () => {
    for (const capability of canonicalV1Capabilities) {
      if (capability.lifecycle !== 'commit') continue;
      expect(capability.idempotency).toBe('required');
      expect(capability.receipt).toBe('required');
      expect(capability.audit).not.toBe('none');
    }
  });
});
