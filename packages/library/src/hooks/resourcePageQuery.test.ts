import { describe, expect, it, vi } from 'vitest';
import { fetchResourcePage, type ResourcePageClient } from './resourcePageQuery';

function createClient(): ResourcePageClient {
  return {
    getResources: vi.fn(),
    searchLibrary: vi.fn(),
  };
}

describe('fetchResourcePage', () => {
  it('keeps a real empty search result distinct from a rejected search request', async () => {
    const client = createClient();
    client.searchLibrary = vi.fn().mockResolvedValue([]);

    await expect(fetchResourcePage(client, { search: 'firefly' }, 0)).resolves.toEqual([]);

    client.searchLibrary = vi.fn().mockRejectedValue(new Error('Network unavailable'));

    await expect(fetchResourcePage(client, { search: 'firefly' }, 0)).rejects.toThrow(
      'Network unavailable',
    );
  });

  it('keeps a browse request failure observable instead of turning it into an empty page', async () => {
    const client = createClient();
    client.getResources = vi.fn().mockRejectedValue(new Error('Browse unavailable'));

    await expect(fetchResourcePage(client, { sort_by: 'recent' }, 20)).rejects.toThrow(
      'Browse unavailable',
    );
    expect(client.getResources).toHaveBeenCalledWith({
      sort_by: 'recent',
      limit: 10,
      offset: 20,
    });
  });

  it('keeps an actual browse empty result as the only empty-page outcome', async () => {
    const client = createClient();
    client.getResources = vi.fn().mockResolvedValue([]);

    await expect(fetchResourcePage(client, {}, 0)).resolves.toEqual([]);
    expect(client.searchLibrary).not.toHaveBeenCalled();
  });
});
