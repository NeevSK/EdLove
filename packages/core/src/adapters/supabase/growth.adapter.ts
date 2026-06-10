import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '../../api/supabase';
import type { IGrowthPort } from '../../logic/ports/growth.port';
import { APIError } from '../../types/API';
import type {
  Challenge,
  ChallengeMetric,
  CrystalDiscovery,
  ImpactRipple,
  PersonalCompass,
  SanctuaryManifesto,
  UserGrowthState,
} from '../../types/Growth';

const WARM_MESSAGES: Record<string, { en: string; si: string; ta: string }> = {
  resource_saved: {
    en: 'A teacher in your school kept your resource close.',
    si: '\u0D94\u0DB6\u0DDA \u0DB4\u0DCF\u0DC3\u0DBD\u0DDA \u0D9C\u0DD4\u0DBB\u0DD4 \u0DC4\u0DD2\u0DAD\u0DD9\u0D9A\u0DD4 \u0D94\u0DB6\u0DDA \u0DAF\u0DD9\u0DBA \u0DC5\u0D9F \u0DBB\u0DD0\u0D9A\u0DD2 \u0D9C\u0DAD\u0DCA \u0DBA.',
    ta: '\u0B89\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0BAA\u0BB3\u0BCD\u0BB3\u0BBF\u0BAF\u0BBF\u0BB2\u0BC1\u0BB3\u0BCD\u0BB3 \u0B92\u0BB0\u0BC1 \u0B86\u0B9A\u0BBF\u0BB0\u0BBF\u0BAF\u0BB0\u0BCD \u0B89\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0B86\u0BA4\u0BBE\u0BB0\u0BA4\u0BCD\u0BA4\u0BC8 \u0BA8\u0BC6\u0BB0\u0BC1\u0B99\u0BCD\u0B95\u0BBF \u0BB5\u0BC8\u0BA4\u0BCD\u0BA4\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95\u0BBF\u0BB1\u0BBE\u0BB0\u0BCD.',
  },
  resource_read: {
    en: 'Five people in your school have learned from what you shared.',
    si: '\u0D94\u0DB6\u0DDA \u0DB4\u0DCF\u0DC3\u0DBD\u0DDA \u0DA2\u0DB1\u0DBA\u0DCF 5 \u0DAF\u0DD9\u0DB1\u0DD9\u0D9A\u0DD4 \u0D94\u0DB6 \u0DB6\u0DD9\u0DAF\u0DCF\u0D9C\u0DAD\u0DCA \u0DAF\u0DD9\u0DBA\u0DD9\u0DB1\u0DCA \u0D89\u0D9C\u0DD9\u0DB1 \u0D9C\u0DAD\u0DCA\u0DC4.',
    ta: '\u0B89\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0BAA\u0BB3\u0BCD\u0BB3\u0BBF\u0BAF\u0BBF\u0BB2\u0BC1\u0BB3\u0BCD\u0BB3 \u0B90\u0BA8\u0BCD\u0BA4\u0BC1 \u0BAA\u0BC7\u0BB0\u0BCD \u0BA8\u0BC0\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0BAA\u0B95\u0BBF\u0BB0\u0BCD\u0BA8\u0BCD\u0BA4\u0BA4\u0BBF\u0BB2\u0BBF\u0BB0\u0BC1\u0BA8\u0BCD\u0BA4\u0BC1 \u0B95\u0BB1\u0BCD\u0BB1\u0BC1\u0B95\u0BCD\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BA9\u0BB0\u0BCD.',
  },
  post_sparked: {
    en: 'Your reflection opened a conversation.',
    si: '\u0D94\u0DB6\u0DDA \u0DC3\u0DD2\u0DAD\u0DD4\u0DC0\u0DD2\u0DBD\u0DCA\u0DBD \u0D9A\u0DAD\u0DCF\u0DC0\u0D9A\u0DA7 \u0DAF\u0DDC\u0DBB \u0DC4\u0DD0\u0DBB\u0DD2\u0DBA\u0DCF.',
    ta: '\u0B89\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0B9A\u0BBF\u0BA8\u0BCD\u0BA4\u0BA9\u0BC8 \u0B92\u0BB0\u0BC1 \u0B89\u0BB0\u0BC8\u0BAF\u0BBE\u0B9F\u0BB2\u0BC8\u0BA4\u0BCD \u0BA4\u0BBF\u0BB1\u0BA8\u0BCD\u0BA4\u0BA4\u0BC1.',
  },
  lesson_accessed: {
    en: 'A student is learning from what you prepared.',
    si: '\u0D94\u0DB6 \u0DC3\u0DD6\u0DAF\u0DCF\u0DB1\u0DCA \u0D9A\u0DC5 \u0DAF\u0DD9\u0DBA \u0DAF\u0DBB\u0DD4\u0DC0\u0D9A\u0DD4 \u0D89\u0D9C\u0DD9\u0DB1 \u0D9C\u0DB1\u0DD3.',
    ta: '\u0BA8\u0BC0\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0BA4\u0BAF\u0BBE\u0BB0\u0BBF\u0BA4\u0BCD\u0BA4\u0BA4\u0BBF\u0BB2\u0BBF\u0BB0\u0BC1\u0BA8\u0BCD\u0BA4\u0BC1 \u0B92\u0BB0\u0BC1 \u0BAE\u0BBE\u0BA3\u0BB5\u0BB0\u0BCD \u0B95\u0BB1\u0BCD\u0BB1\u0BC1\u0B95\u0BCD\u0B95\u0BCA\u0BB3\u0BCD\u0B95\u0BBF\u0BB1\u0BBE\u0BB0\u0BCD.',
  },
  feedback_given: {
    en: 'Your teacher thought carefully about your work.',
    si: '\u0D94\u0DB6\u0DDA \u0D9C\u0DD4\u0DBB\u0DD4\u0DAD\u0DD4\u0DB8\u0DCF \u0D94\u0DB6\u0DDA \u0D9A\u0DCF\u0DBB\u0DCA\u0DBA\u0DBA\u0DDA \u0D9C\u0DD0\u0DB9\u0DD4\u0DBB\u0DA7 \u0D9C\u0DD2\u0DBA \u0DBA.',
    ta: '\u0B89\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0B86\u0B9A\u0BBF\u0BB0\u0BBF\u0BAF\u0BB0\u0BCD \u0B89\u0B99\u0BCD\u0B95\u0BB3\u0BCD BB5\u0BC7\u0BB2\u0BC8\u0BAF\u0BC8\u0BAA\u0BCD \u0BAA\u0BB1\u0BCD\u0BB1\u0BBF \u0B95\u0BB5\u0BA9\u0BAE\u0BBE\u0B95 \u0B9A\u0BBF\u0BA8\u0BCD\u0BA4\u0BBF\u0BA4\u0BCD\u0BA4\u0BBE\u0BB0\u0BCD.',
  },
  manifesto_endorsed: {
    en: 'A fellow teacher endorsed your vision.',
    si: '\u0DC3\u0DC4 \u0D9C\u0DD4\u0DBB\u0DD4 \u0DC4\u0DD2\u0DAD\u0DD9\u0D9A\u0DD4 \u0D94\u0DB6\u0DDA \u0DAF\u0DD8\u0DC2\u0DCA\u0DA7\u0DD2\u0DBA \u0D85\u0DB1\u0DD4\u0DB8\u0DAD \u0D9A\u0DC5 \u0DBA.',
    ta: '\u0B92\u0BB0\u0BC1 \u0B9A\u0B95 \u0B86\u0B9A\u0BBF\u0BB0\u0BBF\u0BAF\u0BB0\u0BCD \u0B89\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0BA4\u0BCA\u0BB2\u0BC8\u0BA8\u0BCB\u0B95\u0BCD\u0B95\u0BC8 \u0B86\u0BA4\u0BB0\u0BBF\u0BA4\u0BCD\u0BA4\u0BBE\u0BB0\u0BCD.',
  },
  circle_joined: {
    en: 'A colleague joined the circle you started.',
    si: '\u0D94\u0DB6 \u0D86\u0DBB\u0DB8\u0DCA\u0DB7 \u0D9A\u0DC5 \u0D9A\u0DC0\u0DD2\u0DBA\u0DA7 \u0DC3\u0DC4\u0DBA\u0DDD\u0D9C\u0DD3\u0D9A\u0DBA\u0DD9\u0D9A\u0DD4 \u0D91\u0D9A\u0DCA \u0DC0\u0DD2\u0DBA.',
    ta: '\u0BA8\u0BC0\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0BA4\u0BCA\u0B9F\u0B99\u0BCD\u0B95\u0BBF\u0BAF \u0BB5\u0B9F\u0BCD\u0B9F\u0BA4\u0BCD\u0BA4\u0BBF\u0BB2\u0BCD \u0B92\u0BB0\u0BC1 \u0B9A\u0B95 \u0B8A\u0BB4\u0BBF\u0BAF\u0BB0\u0BCD \u0B9A\u0BC7\u0BB0\u0BCD\u0BA8\u0BCD\u0BA4\u0BBE\u0BB0\u0BCD.',
  },
  principal_recognition: {
    en: 'Your principal sent you a gift of light today.',
    si: '\u0D94\u0DB6\u0DDA \u0DC0\u0DD2\u0DAF\u0DD4\u0DC4\u0DBD\u0DCA\u0DB4\u0DAD\u0DD2 \u0D94\u0DB6\u0DA7 \u0D86\u0DBD\u0DDD\u0D9A\u0DBA\u0DDA \u0DAD\u0DD1\u0D9C\u0DCA\u0D9C\u0D9A\u0DCA \u0DBA\u0DD0\u0DC0\u0DCA\u0DC0\u0DCF.',
    ta: '\u0B87\u0BA9\u0BCD\u0BB1\u0BC1 \u0B89\u0B99\u0BCD\u0B95\u0BB3\u0BC1\u0B95\u0BCD\u0B95\u0BC1 \u0B85\u0BA4\u0BBF\u0BAA\u0BB0\u0BCD \u0B92\u0BB3\u0BBF\u0BAF\u0BBF\u0BA9\u0BCD \u0BAA\u0BB0\u0BBF\u0B9A\u0BC8 \u0B85\u0BA9\u0BC1\u0BAA\u0BCD\u0BAA\u0BBF\u0BA9\u0BBE\u0BB0\u0BCD.',
  },
};

function getBatchWindow(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 9) return 'morning';
  if (hour >= 9 && hour < 15) return 'day';
  if (hour >= 15 && hour < 20) return 'evening';
  return 'night';
}

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

    return (data ?? []).map((r) => r.moment_key);
  }

  async awardMoments(
    userId: string,
    moments: Array<{ key: string; name_si: string; name_en: string }>,
  ) {
    const { error } = await this.client.from('whispered_moments').upsert(
      moments.map((m) => ({
        user_id: userId,
        moment_key: m.key,
        moment_name_si: m.name_si,
        moment_name_en: m.name_en,
      })),
      { onConflict: 'user_id,moment_key', ignoreDuplicates: true },
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
    return (data ?? []).map((r) => r.event_metadata as Record<string, any>);
  }

  async updateGrowthState(
    userId: string,
    updates: Partial<UserGrowthState>,
  ): Promise<UserGrowthState> {
    const { data, error } = await this.client
      .from('user_growth_state')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new APIError('Failed to update growth state', error.code, error);
    return data as UserGrowthState;
  }

  async getGrowthState(userId: string): Promise<UserGrowthState | null> {
    const { data, error } = await this.client
      .from('user_growth_state')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw new APIError('Failed to get growth state', error.code, error);
    return data as UserGrowthState | null;
  }

  async recordCrystalDiscovery(
    discovery: Omit<CrystalDiscovery, 'id' | 'created_at'>,
  ): Promise<void> {
    const { error } = await this.client.from('crystal_discoveries').insert(discovery);
    if (error) throw new APIError('Failed to record crystal discovery', error.code, error);
  }

  async getCrystalCollection(userId: string): Promise<CrystalDiscovery[]> {
    const { data, error } = await this.client
      .from('crystal_discoveries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new APIError('Failed to fetch crystal collection', error.code, error);
    return (data ?? []) as CrystalDiscovery[];
  }

  async incrementDimension(userId: string, column: string): Promise<UserGrowthState | null> {
    // Attempt RPC first for atomicity
    const { data, error } = await this.client
      .rpc('increment_growth_dimension', {
        p_user_id: userId,
        p_column: column,
      })
      .maybeSingle();

    if (error) {
      // Fallback logic could go here if needed, but in hexagonal we prefer the adapter to fail
      // if the specific storage mechanism (Supabase RPC) fails.
      throw new APIError('Failed to increment growth dimension via RPC', error.code, error);
    }

    return data as UserGrowthState | null;
  }

  async getChallenges(filters: {
    schoolId?: string;
    classroomId?: string;
    status?: string;
    type?: string;
  }): Promise<Challenge[]> {
    let query = this.client.from('contextual_challenges').select('*');

    if (filters.schoolId) query = query.eq('school_id', filters.schoolId);
    if (filters.classroomId) query = query.eq('classroom_id', filters.classroomId);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.type) query = query.eq('type', filters.type);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new APIError('Failed to get challenges', error.code, error);
    return data as Challenge[];
  }

  async createChallenge(
    challenge: Omit<Challenge, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<Challenge> {
    const { data, error } = await this.client
      .from('contextual_challenges')
      .insert({
        ...challenge,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new APIError('Failed to create challenge', error.code, error);
    return data as Challenge;
  }

  async updateChallenge(id: string, updates: Partial<Challenge>): Promise<void> {
    const { error } = await this.client
      .from('contextual_challenges')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw new APIError('Failed to update challenge', error.code, error);
  }

  async getPersonalCompasses(filters: {
    userId: string;
    status?: string;
  }): Promise<PersonalCompass[]> {
    let query = this.client.from('personal_compasses').select('*').eq('user_id', filters.userId);
    if (filters.status) query = query.eq('status', filters.status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new APIError('Failed to get personal compasses', error.code, error);
    return data as PersonalCompass[];
  }

  async createPersonalCompass(
    compass: Omit<PersonalCompass, 'id' | 'created_at'>,
  ): Promise<PersonalCompass> {
    const { data, error } = await this.client
      .from('personal_compasses')
      .insert({
        ...compass,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new APIError('Failed to create personal compass', error.code, error);
    return data as PersonalCompass;
  }

  async updatePersonalCompass(id: string, updates: Partial<PersonalCompass>): Promise<void> {
    const { error } = await this.client
      .from('personal_compasses')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw new APIError('Failed to update personal compass', error.code, error);
  }

  async recordContribution(
    userId: string,
    metric: ChallengeMetric,
    classroomId?: string,
    schoolId?: string,
  ): Promise<void> {
    const updates: Promise<void>[] = [];

    // Check class challenge
    if (classroomId) {
      updates.push(
        (async () => {
          const { data } = await this.client
            .from('contextual_challenges')
            .select('id, current_count, target_count')
            .eq('classroom_id', classroomId)
            .eq('metric', metric)
            .eq('status', 'active')
            .maybeSingle();

          if (!data) return;
          const newCount = (data.current_count ?? 0) + 1;
          const isComplete = newCount >= data.target_count;
          await this.client
            .from('contextual_challenges')
            .update({
              current_count: newCount,
              status: isComplete ? 'completed' : 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', data.id);
        })(),
      );
    }

    // Check school challenge
    if (schoolId) {
      updates.push(
        (async () => {
          const { data } = await this.client
            .from('contextual_challenges')
            .select('id, current_count, target_count')
            .eq('school_id', schoolId)
            .eq('type', 'school_season_challenge')
            .eq('metric', metric)
            .eq('status', 'active')
            .maybeSingle();

          if (!data) return;
          const newCount = (data.current_count ?? 0) + 1;
          const isComplete = newCount >= data.target_count;
          await this.client
            .from('contextual_challenges')
            .update({
              current_count: newCount,
              status: isComplete ? 'completed' : 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', data.id);
        })(),
      );
    }

    // Check personal compass
    updates.push(
      (async () => {
        const { data } = await this.client
          .from('personal_compasses')
          .select('id, current_count, target_count')
          .eq('user_id', userId)
          .eq('metric', metric)
          .eq('status', 'active')
          .maybeSingle();

        if (!data) return;
        const newCount = (data.current_count ?? 0) + 1;
        const isComplete = newCount >= data.target_count;
        await this.client
          .from('personal_compasses')
          .update({
            current_count: newCount,
            status: isComplete ? 'completed' : 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id);
      })(),
    );

    await Promise.allSettled(updates);
  }

  /**
   * Impact Ripples
   */
  async createRipple(ripple: any): Promise<void> {
    const messages = WARM_MESSAGES[ripple.ripple_type];
    if (!messages) return;

    const { error } = await this.client.from('impact_ripples').insert({
      ...ripple,
      warm_message_en: messages.en,
      warm_message_si: messages.si,
      warm_message_ta: messages.ta,
      batch_window: getBatchWindow(),
      delivered: false,
    });
    if (error) throw new APIError('Failed to create ripple', error.code, error);
  }

  async getPendingRipples(userId: string): Promise<ImpactRipple[]> {
    const { data, error } = await this.client
      .from('impact_ripples')
      .select('*')
      .eq('recipient_user_id', userId)
      .eq('delivered', false)
      .order('created_at', { ascending: false });

    if (error) throw new APIError('Failed to fetch pending ripples', error.code, error);
    return (data ?? []) as ImpactRipple[];
  }

  async markRippleDelivered(rippleId: string): Promise<void> {
    const { error } = await this.client
      .from('impact_ripples')
      .update({
        delivered: true,
        delivered_at: new Date().toISOString(),
      })
      .eq('id', rippleId);

    if (error) throw new APIError('Failed to mark ripple delivered', error.code, error);
  }

  async getDeliveredRipples(userId: string, since: string): Promise<ImpactRipple[]> {
    const { data, error } = await this.client
      .from('impact_ripples')
      .select('*')
      .eq('recipient_user_id', userId)
      .eq('delivered', true)
      .gte('delivered_at', since)
      .order('delivered_at', { ascending: false });

    if (error) throw new APIError('Failed to fetch delivered ripples', error.code, error);
    return (data ?? []) as ImpactRipple[];
  }

  /**
   * Sacred Missions (Manifestos)
   */
  async getManifestos(schoolId: string, userId?: string): Promise<SanctuaryManifesto[]> {
    const { data, error } = await this.client
      .from('sanctuary_manifestos')
      .select(`
        *,
        manifesto_endorsements(count)
      `)
      .eq('school_id', schoolId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw new APIError('Failed to fetch manifestos', error.code, error);

    let userEndorsements: string[] = [];
    if (userId) {
      const { data: endData } = await this.client
        .from('manifesto_endorsements')
        .select('manifesto_id')
        .eq('user_id', userId);

      if (endData) {
        userEndorsements = endData.map((e: any) => e.manifesto_id);
      }
    }

    return (data || []).map((m: any) => ({
      ...m,
      endorsement_count: m.manifesto_endorsements?.[0]?.count || 0,
      has_endorsed: userEndorsements.includes(m.id),
    })) as SanctuaryManifesto[];
  }

  async createManifesto(input: any): Promise<SanctuaryManifesto> {
    const { data, error } = await this.client
      .from('sanctuary_manifestos')
      .insert(input)
      .select()
      .single();

    if (error) throw new APIError('Failed to create manifesto', error.code, error);
    return data as SanctuaryManifesto;
  }

  async endorseManifesto(
    manifestoId: string,
    userId: string,
    commitmentText?: string,
  ): Promise<void> {
    const { error } = await this.client.from('manifesto_endorsements').upsert({
      manifesto_id: manifestoId,
      user_id: userId,
      commitment_text: commitmentText,
    });

    if (error) throw new APIError('Failed to endorse manifesto', error.code, error);
  }

  async unendorseManifesto(manifestoId: string, userId: string): Promise<void> {
    const { error } = await this.client
      .from('manifesto_endorsements')
      .delete()
      .eq('manifesto_id', manifestoId)
      .eq('user_id', userId);

    if (error) throw new APIError('Failed to unendorse manifesto', error.code, error);
  }
}
