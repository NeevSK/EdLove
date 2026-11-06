import { describe, expect, it } from 'vitest';
import { operationFingerprint } from './store';

describe('operation semantic fingerprint', () => {
  it('normalizes nested object ordering while retaining array order', async () => {
    const base = { scope: 'school:a', capability: 'fixture.mutate.v1' };
    const first = await operationFingerprint({
      ...base,
      payload: { b: [{ y: 2, x: 1 }], a: null },
    });
    expect(await operationFingerprint({ ...base, payload: { a: null, b: [{ x: 1, y: 2 }] } })).toBe(
      first,
    );
    expect(
      await operationFingerprint({ ...base, payload: { a: null, b: [{ x: 1, y: 3 }] } }),
    ).not.toBe(first);
    expect(
      await operationFingerprint({
        ...base,
        scope: 'school:b',
        payload: { b: [{ y: 2, x: 1 }], a: null },
      }),
    ).not.toBe(first);
    expect(
      await operationFingerprint({
        ...base,
        capability: 'fixture.mutate.v2',
        payload: { b: [{ y: 2, x: 1 }], a: null },
      }),
    ).not.toBe(first);
  });

  it('rejects non-JSON semantics rather than hashing lossy serialization', async () => {
    await expect(
      operationFingerprint({ scope: 'school:a', capability: 'fixture', payload: NaN }),
    ).rejects.toThrow();
    await expect(
      operationFingerprint({ scope: '', capability: 'fixture', payload: {} }),
    ).rejects.toThrow();
  });

  it('retains prototype-sensitive own keys in the shared canonicalizer', async () => {
    const input = { scope: 'school:a', capability: 'fixture' };
    const payload = JSON.parse('{"__proto__":{"value":1},"constructor":"x"}');
    expect(await operationFingerprint({ ...input, payload })).not.toBe(
      await operationFingerprint({ ...input, payload: { constructor: 'x' } }),
    );
  });
});
