import { orpcClient } from '@repo/core/api/orpcClient';

export const journalEntriesAPI = {
  async list(options: { limit?: number; view_date?: string } = {}) {
    return orpcClient.journalEntries.list({
      query: {
        limit: options.limit ?? 50,
        view_date: options.view_date,
      },
    });
  },

  async create(content: string) {
    return orpcClient.journalEntries.create({ body: { content } });
  },
};
