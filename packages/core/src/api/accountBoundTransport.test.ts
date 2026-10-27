import { setActiveAccountId } from '@repo/core/lib/accountScope';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  authenticatedSovereignFetch,
  registerActiveBondIdResolver,
  registerTokenResolver,
} from './clientRuntime';
import { orpcClient } from './orpcClient';

describe('account-bound dispatch (network substituted)', () => {
  const owner = '123e4567-e89b-12d3-a456-426614174000';
  const fetch = vi.fn();
  beforeEach(() => {
    vi.stubGlobal('fetch', fetch);
    fetch.mockReset();
    fetch.mockResolvedValue(new Response('{}'));
    setActiveAccountId(owner);
    registerTokenResolver(async () => 'synthetic-token');
    registerActiveBondIdResolver(async () => null);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    setActiveAccountId(null);
    registerTokenResolver(async () => null);
    registerActiveBondIdResolver(async () => null);
  });

  it('preserves session headers on an owning-account request', async () => {
    await authenticatedSovereignFetch('https://example.test/api', {}, owner);
    const headers = new Headers(fetch.mock.calls[0]?.[1]?.headers);
    expect(headers.get('Authorization')).toBe('Bearer synthetic-token');
  });

  it.each(['other-token', null])(
    'rejects captured-session requests when current token is %s',
    async (token) => {
      registerTokenResolver(async () => token);
      await expect(
        authenticatedSovereignFetch('https://example.test/api', {}, undefined, {
          accessToken: 'synthetic-token',
          subject: 'subject-a',
        }),
      ).rejects.toMatchObject({ status: 401 });
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  it('sends the captured subject as an assertion with the matching bearer', async () => {
    await authenticatedSovereignFetch('https://example.test/api', {}, undefined, {
      accessToken: 'synthetic-token',
      subject: 'subject-a',
    });
    const headers = new Headers(fetch.mock.calls[0]?.[1]?.headers);
    expect(headers.get('Authorization')).toBe('Bearer synthetic-token');
    expect(headers.get('X-Expected-Auth-Subject')).toBe('subject-a');
    expect(String(fetch.mock.calls[0]?.[0])).not.toContain('synthetic-token');
  });

  it.each([undefined, 'force-cache'] as const)(
    'retains captured session through actual RPC plugins with cache %s',
    async (cache) => {
      registerTokenResolver(async () => 'changed-token');
      await expect(
        orpcClient.identity.identifyActiveCitizen(
          {},
          {
            context: {
              expectedSession: { accessToken: 'synthetic-token', subject: 'subject-a' },
              ...(cache ? { cache } : {}),
              retry: 0,
            },
          },
        ),
      ).rejects.toMatchObject({ status: 401 });
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  it('rejects an insecure endpoint before session resolution or network dispatch', async () => {
    const resolver = vi.fn(async () => 'sensitive-token');
    registerTokenResolver(resolver);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    await expect(
      authenticatedSovereignFetch('http://api.example.test/path?key=secret', {}),
    ).rejects.toThrow(/HTTPS/);

    expect(resolver).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('rejects when TLS verification is disabled before session resolution or dispatch', async () => {
    vi.stubEnv('NODE_TLS_REJECT_UNAUTHORIZED', '0');
    const resolver = vi.fn(async () => 'sensitive-token');
    registerTokenResolver(resolver);

    await expect(authenticatedSovereignFetch('https://example.test/api', {})).rejects.toThrow(
      'TLS certificate verification must remain enabled.',
    );

    expect(resolver).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('forces redirects to error even when the caller requests follow', async () => {
    await authenticatedSovereignFetch('https://example.test/api', { redirect: 'follow' });

    expect(fetch.mock.calls[0]?.[1]?.redirect).toBe('error');
  });

  it('refuses dispatch if token resolution changes the active account', async () => {
    registerTokenResolver(async () => {
      setActiveAccountId('other-account');
      return 'other-token';
    });
    await expect(
      authenticatedSovereignFetch('https://example.test/api', {}, owner),
    ).rejects.toMatchObject({ status: 401 });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('refuses dispatch if active-bond resolution changes the active account', async () => {
    registerActiveBondIdResolver(async () => {
      setActiveAccountId(null);
      return null;
    });
    await expect(
      authenticatedSovereignFetch('https://example.test/api', {}, owner),
    ).rejects.toMatchObject({ status: 401 });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('carries owner binding through the actual RPC link without a batch context rewrite', async () => {
    registerTokenResolver(async () => {
      setActiveAccountId('other-account');
      return 'other-token';
    });
    await expect(
      orpcClient.educational.submitAssignment(
        {
          params: { assignmentId: owner },
          body: {
            idempotencyKey: owner,
          },
        },
        { context: { expectedAccountId: owner, retry: 0 } },
      ),
    ).rejects.toMatchObject({ status: 401 });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('retains owner binding through the GET dedupe plugin before batching', async () => {
    registerTokenResolver(async () => {
      setActiveAccountId('other-account');
      return 'other-token';
    });
    await expect(
      orpcClient.identity.identifyActiveCitizen(
        {},
        { context: { expectedAccountId: owner, cache: 'force-cache', retry: 0 } },
      ),
    ).rejects.toMatchObject({ status: 401 });
    expect(fetch).not.toHaveBeenCalled();
  });
});
