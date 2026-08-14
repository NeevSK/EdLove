import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import { APIError } from '@repo/core/types/API';

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

export const decisionJournalAPI = {
  async list(options: { limit?: number; view_date?: string } = {}) {
    const res = await (client.api as any).decisionJournal.logs.$get({
      query: {
        limit: String(options.limit ?? 20),
        view_date: options.view_date,
      },
    });
    if (!res.ok) throw new APIError('Failed to fetch decision journal', res.status.toString());
    return await res.json();
  },

  async create(input: {
    decision_text: string;
    context?: string | null;
    idempotency_key?: string;
  }) {
    const res = await (client.api as any).decisionJournal.logs.$post({
      json: input,
    });
    if (!res.ok)
      throw new APIError('Failed to create decision journal entry', res.status.toString());
    return await res.json();
  },
};
