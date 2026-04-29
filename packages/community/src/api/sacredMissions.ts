import { supabase } from '@repo/core/api';;

import type { ManifestoStatus, ManifestoVibe, SanctuaryManifesto } from '../types';

export type { ManifestoStatus, ManifestoVibe, SanctuaryManifesto };

export const sacredMissionsAPI = {
  /**
   * Fetch manifestos for a school
   */
  async getManifestos(schoolId: string, userId?: string) {
    const { data, error } = await supabase
      .from('sanctuary_manifestos')
      .select(`
        *,
        manifesto_endorsements(count)
      `)
      .eq('school_id', schoolId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // If userId provided, check if user has endorsed
    let userEndorsements: string[] = [];
    if (userId) {
      const { data: endData } = await supabase
        .from('manifesto_endorsements')
        .select('manifesto_id')
        .eq('user_id', userId);

      if (endData) {
        userEndorsements = endData.map((e) => e.manifesto_id);
      }
    }

    return data.map((m) => ({
      ...m,
      endorsement_count: m.manifesto_endorsements?.[0]?.count || 0,
      has_endorsed: userEndorsements.includes(m.id),
    })) as SanctuaryManifesto[];
  },

  /**
   * Create a new manifesto (Principals/Admins only)
   */
  async createManifesto(input: {
    school_id: string;
    creator_id: string;
    title: string;
    content: string;
    vibe: ManifestoVibe;
    target_date?: string;
  }) {
    const { data, error } = await supabase
      .from('sanctuary_manifestos')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data as SanctuaryManifesto;
  },

  /**
   * Endorse a manifesto
   */
  async endorseManifesto(manifestoId: string, userId: string, commitmentText?: string) {
    const { error } = await supabase.from('manifesto_endorsements').upsert({
      manifesto_id: manifestoId,
      user_id: userId,
      commitment_text: commitmentText,
    });

    if (error) throw error;
    return true;
  },

  /**
   * Remove endorsement
   */
  async unendorseManifesto(manifestoId: string, userId: string) {
    const { error } = await supabase
      .from('manifesto_endorsements')
      .delete()
      .eq('manifesto_id', manifestoId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },
};
