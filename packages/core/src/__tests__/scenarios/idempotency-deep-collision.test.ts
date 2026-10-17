import {
  generateIdempotencyKey,
  getConsistentIdempotencyKey,
} from '@repo/core/lib/sync/idempotency';
import { describe, expect, it } from 'vitest';

describe('Disaster Suite 2: Deeply Nested Key Sorting & Deterministic Idempotency Hardening', () => {
  it('generates identical SHA-256 hash regardless of object key order at deep nesting levels', async () => {
    // Object A with randomized deep key order
    const objA = {
      z_field: 'end',
      nested: {
        gamma: [1, 2, 3],
        alpha: {
          b: 200,
          a: 100,
        },
      },
      a_field: 'start',
    };

    // Object B with inverted deep key order
    const objB = {
      a_field: 'start',
      nested: {
        alpha: {
          a: 100,
          b: 200,
        },
        gamma: [1, 2, 3],
      },
      z_field: 'end',
    };

    const hashA = await generateIdempotencyKey('community', 'POST_COMMENT', objA, 'user_123');
    const hashB = await generateIdempotencyKey('community', 'POST_COMMENT', objB, 'user_123');

    expect(hashA).toBe(hashB);
    expect(hashA).toMatch(/^[0-9a-f]{64}$/); // Standard SHA-256 64-char hex
  });

  it('guarantees consistent idempotency key for arrays of nested objects with mixed property ordering', async () => {
    const listA = [
      { id: 'item_1', metadata: { y: 'val_y', x: 'val_x' } },
      { id: 'item_2', metadata: { b: 2, a: 1 } },
    ];

    const listB = [
      { metadata: { x: 'val_x', y: 'val_y' }, id: 'item_1' },
      { metadata: { a: 1, b: 2 }, id: 'item_2' },
    ];

    const keyA = await getConsistentIdempotencyKey(listA, 'batch_mutations');
    const keyB = await getConsistentIdempotencyKey(listB, 'batch_mutations');

    expect(keyA).toBe(keyB);
  });
});
