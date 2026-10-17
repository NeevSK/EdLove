import { describe, expect, it } from 'vitest';
import {
  getQueryClient,
  makeQueryClient,
  resetBrowserQueryClient,
} from '../../../lib/query/getQueryClient';

describe('getQueryClient', () => {
  it('instantiates QueryClient with production defaults', () => {
    const client = makeQueryClient();
    const defaultQueries = client.getDefaultOptions().queries;
    const defaultMutations = client.getDefaultOptions().mutations;

    expect(defaultQueries?.staleTime).toBe(5 * 60 * 1000);
    expect(defaultQueries?.gcTime).toBe(10 * 60 * 1000);
    expect(defaultQueries?.retry).toBe(2);
    expect(defaultQueries?.networkMode).toBe('offlineFirst');
    expect(defaultMutations?.networkMode).toBe('offlineFirst');
  });

  it('provides persistent singleton in browser environment', () => {
    resetBrowserQueryClient();
    const clientA = getQueryClient();
    const clientB = getQueryClient();

    expect(clientA).toBe(clientB);
  });

  it('resets browser singleton when explicitly cleared', () => {
    resetBrowserQueryClient();
    const clientA = getQueryClient();
    resetBrowserQueryClient();
    const clientB = getQueryClient();

    expect(clientA).not.toBe(clientB);
  });
});
