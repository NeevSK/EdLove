import { describe, expect, it } from 'vitest';
import { createCacheFileName, isSafeCacheFileName, parseCacheIndex } from './useMediaDownloader';

describe('parseCacheIndex', () => {
  it('drops malformed, negative, and non-finite cache entries', () => {
    expect(
      parseCacheIndex(
        JSON.stringify({
          'gurudevi_good.pdf': { lastAccess: 10, size: 20 },
          negative: { lastAccess: 10, size: -1 },
          missing: { lastAccess: 10 },
          invalid: 'not-an-entry',
        }),
      ),
    ).toEqual({ 'gurudevi_good.pdf': { lastAccess: 10, size: 20 } });
  });

  it('recovers with an empty index for corrupted metadata', () => {
    expect(parseCacheIndex('{broken')).toEqual({});
  });

  it('rejects path traversal and absolute cache entries', () => {
    expect(isSafeCacheFileName('gurudevi_resource.pdf')).toBe(true);
    expect(isSafeCacheFileName('gurudevi_..%2Fsecret.pdf')).toBe(false);
    expect(isSafeCacheFileName('..\\secret.pdf')).toBe(false);
    expect(isSafeCacheFileName('C:\\secret.pdf')).toBe(false);
    expect(isSafeCacheFileName('gurudevi_cache_index.json')).toBe(false);
    expect(
      parseCacheIndex(
        JSON.stringify({
          'gurudevi_resource.pdf': { lastAccess: 10, size: 20 },
          '../outside.pdf': { lastAccess: 10, size: 20 },
        }),
      ),
    ).toEqual({ 'gurudevi_resource.pdf': { lastAccess: 10, size: 20 } });
  });

  it('creates safe cache names from hostile resource ids and URLs', () => {
    const fileName = createCacheFileName(
      '../outside\\file',
      'https://example.test/report.pdf?path=../secret',
    );

    expect(fileName).toBe('gurudevi____outside_file.pdf');
    expect(isSafeCacheFileName(fileName)).toBe(true);
  });
});
