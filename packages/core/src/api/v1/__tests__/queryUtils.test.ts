import { describe, expect, it } from 'vitest';
import { createV1Client, createV1QueryUtils } from '../client';

const v1 = createV1QueryUtils(createV1Client({ origin: 'https://api.example.test' }));

describe('G1 createV1QueryUtils: options derived from the v1 contract', () => {
  it('prefixes every key with the API version', () => {
    expect(v1.identity.session.queryKey()).toEqual(['v1', ['identity', 'session'], { type: 'query' }]);
    expect(v1.identity.createInitialBond.mutationKey()).toEqual([
      'v1',
      ['identity', 'createInitialBond'],
      { type: 'mutation' },
    ]);
  });

  it('gives a whole router a key for invalidation', () => {
    expect(v1.identity.key()).toEqual(['v1', ['identity'], {}]);
  });

  it('returns ready-made mutation options', () => {
    const options = v1.identity.createInitialBond.mutationOptions();
    expect(typeof options.mutationFn).toBe('function');
    expect(options.mutationKey).toEqual(v1.identity.createInitialBond.mutationKey());
  });
});
