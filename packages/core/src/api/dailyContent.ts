import { withResilience } from '../offline/resilience';
import { APIError } from '../types/API';
import { supabase } from './supabase';

// ============================================================================
// DAILY CONTENT API (Motivation & "Did You Know?")
// ============================================================================

export interface DailyContent {
  id: string;
  type: 'motivation' | 'did_you_know';
  content: string;
  author?: string;
  date: string;
  active: boolean;
  created_at: string;
}

export const dailyContentAPI = {
  /**
   * Get daily content for today
   * Returns the most recent motivation quote and "did you know" fact
   */
  async getTodaysContent(): Promise<{
    motivation: DailyContent | null;
    didYouKnow: DailyContent | null;
  }> {
    return withResilience(
      async () => {
        // Fetch motivation quote
        const { data: motivationData, error: motivationError } = await supabase
          .rpc('get_daily_content_for_today', { content_type: 'motivation' })
          .single();

        if (motivationError && motivationError.code !== 'PGRST116') {
          console.warn('Failed to fetch motivation:', motivationError);
        }

        // Fetch "did you know" fact
        const { data: didYouKnowData, error: didYouKnowError } = await supabase
          .rpc('get_daily_content_for_today', { content_type: 'did_you_know' })
          .single();

        if (didYouKnowError && didYouKnowError.code !== 'PGRST116') {
          console.warn('Failed to fetch did you know:', didYouKnowError);
        }

        return {
          motivation: (motivationData as DailyContent) || null,
          didYouKnow: (didYouKnowData as DailyContent) || null,
        };
      },
      {
        key: 'daily_content_today',
        ttl: 24 * 60 * 60 * 1000, // Cache for 24 hours
      },
    ) as Promise<{
      motivation: DailyContent | null;
      didYouKnow: DailyContent | null;
    }>;
  },

  /**
   * Get content for a specific date
   */
  async getContentForDate(date: string): Promise<DailyContent[]> {
    const { data, error } = await supabase
      .from('daily_content')
      .select('*')
      .eq('date', date)
      .eq('active', true)
      .order('type');

    if (error) {
      throw new APIError('Failed to fetch content for date', error.code, error);
    }

    return data || [];
  },

  /**
   * Get recent content (last N days)
   */
  async getRecentContent(days: number = 7): Promise<DailyContent[]> {
    const { data, error } = await supabase
      .from('daily_content')
      .select('*')
      .eq('active', true)
      .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false })
      .order('type');

    if (error) {
      throw new APIError('Failed to fetch recent content', error.code, error);
    }

    return data || [];
  },
};
