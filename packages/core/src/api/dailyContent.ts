import { APIError } from '@repo/core/types/API';
import { createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import type { DailyContent } from '@repo/core/api/dailyContent.contract';
import { readLocalFirst } from '@repo/core/api/dataGateway';

const client = createSovereignClient(SOVEREIGN_API_URL);

export const dailyContentAPI = {
  async getTodaysContent(): Promise<{
    motivation: DailyContent | null;
    didYouKnow: DailyContent | null;
  }> {
    const result = await readLocalFirst({
      key: 'daily_content_today',
      ttl: 24 * 60 * 60 * 1000,
      fetchRemote: async () => {
        const res = await (client.api as any)['daily-content'].today.$get();
        if (!res.ok) {
          throw new APIError('Failed to fetch daily content', res.status.toString());
        }
        return (await res.json()) as {
          motivation: DailyContent | null;
          didYouKnow: DailyContent | null;
        };
      },
    });
    return (
      result ?? {
        motivation: null,
        didYouKnow: null,
      }
    );
  },

  async getContentForDate(date: string): Promise<DailyContent[]> {
    return readLocalFirst({
      key: `daily_content:${date}`,
      ttl: 24 * 60 * 60 * 1000,
      fetchRemote: async () => {
        const res = await (client.api as any)['daily-content'][':date'].$get({
          param: { date },
        });
        if (!res.ok) {
          throw new APIError('Failed to fetch content for date', res.status.toString());
        }
        return (await res.json()) as DailyContent[];
      },
    }).then((data) => data ?? []);
  },

  async getRecentContent(days: number = 7): Promise<DailyContent[]> {
    return readLocalFirst({
      key: `daily_content:recent:${days}`,
      ttl: 24 * 60 * 60 * 1000,
      fetchRemote: async () => {
        const res = await (client.api as any)['daily-content'].recent[':days'].$get({
          param: { days: String(days) },
        });
        if (!res.ok) {
          throw new APIError('Failed to fetch recent content', res.status.toString());
        }
        return (await res.json()) as DailyContent[];
      },
    }).then((data) => data ?? []);
  },
};
