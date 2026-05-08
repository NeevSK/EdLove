import { IGrowthPort } from '../../logic/ports/growth.port';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '../../api/supabase';
import { APIError } from '../../types/API';

export class SupabaseGrowthAdapter implements IGrowthPort {
  private get client() {
    return __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__;
  }

  async recordEvent(params: {
    user_id: string;
    dimension: string;
    event_type: string;
    event_metadata: Record<string, any>;
  }) {
    const { error } = await this.client.from('growth_events').insert(params);
    if (error) throw new APIError('Failed to record growth event', error.code, error);
  }

  async getExperiencedMomentKeys(userId: string, candidateKeys: string[]): Promise<string[]> {
    const { data } = await this.client
      .from('whispered_moments')
      .select('moment_key')
      .eq('user_id', userId)
      .in('moment_key', candidateKeys);
    
    return (data ?? []).map(r => r.moment_key);
  }

  async awardMoments(userId: string, moments: Array<{ key: string; name_si: string; name_en: string }>) {
    const { error } = await this.client.from('whispered_moments').upsert(
      moments.map(m => ({
        user_id: userId,
        moment_key: m.key,
        moment_name_si: m.name_si,
        moment_name_en: m.name_en,
      })),
      { onConflict: 'user_id,moment_key', ignoreDuplicates: true }
    );
    
    if (error) throw new APIError('Failed to award whispered moments', error.code, error);
  }

  async countEvents(userId: string, eventTypes: string[], options?: { since?: string }) {
    let query = this.client
      .from('growth_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('event_type', eventTypes);
    
    if (options?.since) {
      query = query.gte('created_at', options.since);
    }
    
    const { count, error } = await query;
    if (error) throw new APIError('Failed to count growth events', error.code, error);
    return count ?? 0;
  }

  async getEventMetadata(userId: string, eventType: string): Promise<Array<Record<string, any>>> {
    const { data, error } = await this.client
      .from('growth_events')
      .select('event_metadata')
      .eq('user_id', userId)
      .eq('event_type', eventType);
    
    if (error) throw new APIError('Failed to get event metadata', error.code, error);
    return (data ?? []).map(r => r.event_metadata as Record<string, any>);
  }
}
