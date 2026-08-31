import type { DailyContent } from '@repo/core/api/dailyContent.contract';
import { readLocalFirst } from '@repo/core/api/dataGateway';
import { orpcClient } from '@repo/core/api/orpcClient';

export const dailyContentAPI = {
  async getTodaysContent(): Promise<{
    motivation: DailyContent | null;
    didYouKnow: DailyContent | null;
  }> {
    const result = await readLocalFirst<{
      motivation: DailyContent | null;
      didYouKnow: DailyContent | null;
    }>({
      key: 'daily_content_today',
      ttl: 24 * 60 * 60 * 1000,
      fetchRemote: () => orpcClient.dailyContent.getToday(),
    });
    return (
      result ?? {
        motivation: null,
        didYouKnow: null,
      }
    );
  },

  async getContentForDate(date: string): Promise<DailyContent[]> {
    return (
      (await readLocalFirst<DailyContent[]>({
        key: `daily_content:${date}`,
        ttl: 24 * 60 * 60 * 1000,
        fetchRemote: () => orpcClient.dailyContent.getForDate({ params: { date } }),
      })) ?? []
    );
  },

  async getRecentContent(days: number = 7): Promise<DailyContent[]> {
    return (
      (await readLocalFirst<DailyContent[]>({
        key: `daily_content:recent:${days}`,
        ttl: 24 * 60 * 60 * 1000,
        fetchRemote: () => orpcClient.dailyContent.getRecent({ params: { days } }),
      })) ?? []
    );
  },
};
