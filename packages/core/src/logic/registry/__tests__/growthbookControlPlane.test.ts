import { describe, expect, it } from 'vitest';
import {
  extractFeatureKeys,
  validateEndpoint,
  validateTimeout,
} from '../../../../../../scripts/audit-growthbook-features.mjs';

describe('GrowthBook control-plane inventory contract', () => {
  it('accepts supported response shapes and applies scope filtering', () => {
    expect(
      extractFeatureKeys(
        {
          features: {
            'mobile.ai': { archived: false },
            'web.ai': { archived: false },
            'mobile.old': { archived: true },
          },
        },
        'mobile.',
      ),
    ).toEqual([
      { key: 'mobile.ai', archived: false },
      { key: 'mobile.old', archived: true },
    ]);
  });

  it('rejects malformed and duplicate inventories', () => {
    expect(() => extractFeatureKeys({ data: [] })).toThrow(/must be an array/);
    expect(() => extractFeatureKeys([{ key: 'mobile.ai' }, { key: 'mobile.ai' }])).toThrow(
      /duplicate feature keys/,
    );
  });

  it('requires secure endpoints except for local development', () => {
    expect(validateEndpoint('https://growthbook.example/api/features').protocol).toBe('https:');
    expect(validateEndpoint('http://127.0.0.1:3000/api/features').hostname).toBe('127.0.0.1');
    expect(() => validateEndpoint('http://growthbook.example/api/features')).toThrow(/HTTPS/);
  });

  it('bounds the control-plane request timeout', () => {
    expect(validateTimeout(1000)).toBe(1000);
    expect(validateTimeout(120000)).toBe(120000);
    expect(() => validateTimeout(999)).toThrow(/between 1000 and 120000/);
    expect(() => validateTimeout(120001)).toThrow(/between 1000 and 120000/);
  });
});
