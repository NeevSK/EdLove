import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import { APIError } from '@repo/core/types/API';

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

export const journalEntriesAPI = {
  async list(options: { limit?: number; view_date?: string } = {}) {
    const res = await (client.api as any).journalEntries.list.$post({
      json: {
        limit: options.limit ?? 50,
        view_date: options.view_date,
      },
    });
    if (!res.ok) throw new APIError('Failed to fetch journal entries', res.status.toString());
    return await res.json();
  },

  async create(content: string) {
    const res = await (client.api as any).journalEntries.create.$post({ json: { content } });
    if (!res.ok) throw new APIError('Failed to create journal entry', res.status.toString());
    return await res.json();
  },
};
