import { afterEach, describe, expect, it, vi } from 'vitest';
import { assertSecureApiUrl, secureApiFetch } from './transportSecurity';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('assertSecureApiUrl', () => {
  it('accepts HTTPS in every environment', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(() => assertSecureApiUrl('https://api.example.test/v1')).not.toThrow();
  });

  it('rejects HTTPS when TLS certificate verification is disabled', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NODE_TLS_REJECT_UNAUTHORIZED', '0');
    const fetch = vi.fn(async () => new Response('{}'));
    vi.stubGlobal('fetch', fetch);

    expect(() => assertSecureApiUrl('https://api.example.test/v1')).toThrow(
      'TLS certificate verification must remain enabled.',
    );
    await expect(secureApiFetch('https://api.example.test/v1')).rejects.toThrow(
      'TLS certificate verification must remain enabled.',
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(['http://localhost:3000', 'http://127.0.0.1:3000', 'http://[::1]:3000'])(
    'permits loopback HTTP in development for %s',
    (url) => {
      vi.stubEnv('NODE_ENV', 'development');
      expect(() => assertSecureApiUrl(url)).not.toThrow();
    },
  );

  it.each(['http://10.0.2.2:3000', 'http://192.168.1.40:3000', 'http://172.20.1.8:3000'])(
    'permits private IPv4 HTTP in test for %s',
    (url) => {
      vi.stubEnv('NODE_ENV', 'test');
      expect(() => assertSecureApiUrl(url)).not.toThrow();
    },
  );

  it.each([
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://10.0.2.2:3000',
    'http://192.168.1.40:3000',
  ])('rejects local HTTP in production for %s', (url) => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(() => assertSecureApiUrl(url)).toThrow(/HTTPS/);
  });

  it.each([
    'http://api.example.test',
    'http://localhost.example.test',
    'https://user:secret@api.example.test',
    'https://api.example.test/#fragment',
    '/api',
    'file:///tmp/api',
  ])('rejects unsafe URLs in development: %s', (url) => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(() => assertSecureApiUrl(url)).toThrow();
  });

  it('validates Request URLs and forces redirect errors despite caller options', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const fetch = vi.fn(async () => new Response('{}'));
    vi.stubGlobal('fetch', fetch);
    const request = new Request('https://api.example.test/v1');

    await secureApiFetch(request, { redirect: 'follow' });

    expect(fetch).toHaveBeenCalledWith(request, { redirect: 'error' });
  });

  it('rejects an unsafe Request URL without dispatching it', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const fetch = vi.fn(async () => new Response('{}'));
    vi.stubGlobal('fetch', fetch);
    const request = new Request('http://api.example.test/v1');

    await expect(secureApiFetch(request)).rejects.toThrow(/HTTPS/);
    expect(fetch).not.toHaveBeenCalled();
  });
});
