import { orpcClient } from '@repo/core/api/orpcClient';

export const decisionJournalAPI = {
  async list(options: { limit?: number; view_date?: string } = {}) {
    return orpcClient.decisionJournal.list({
      query: {
        limit: options.limit ?? 20,
        view_date: options.view_date,
      },
    });
  },

  async create(input: {
    decision_text: string;
    context?: string | null;
    idempotency_key?: string;
  }) {
    return orpcClient.decisionJournal.create({
      body: input,
    });
  },

  async markReviewed(id: string, isReviewed: boolean) {
    return orpcClient.decisionJournal.markReviewed({
      params: { id },
      body: { is_reviewed: isReviewed },
    });
  },
};
