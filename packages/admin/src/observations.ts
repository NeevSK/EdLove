import { supabase } from '@repo/core';

export interface PrincipalObservation {
  id: string;
  school_id: string;
  principal_id: string;
  type: string;
  content: string;
  created_at: string;
}

export const observationsAPI = {
  async listRecent(principalId: string, limit = 5): Promise<PrincipalObservation[]> {
    const { data, error } = await supabase
      .from('principal_observations')
      .select('*')
      .eq('principal_id', principalId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as PrincipalObservation[];
  },

  async listByDate(principalId: string, viewDate: string, limit = 10): Promise<PrincipalObservation[]> {
    const { data, error } = await supabase
      .from('principal_observations')
      .select('*')
      .eq('principal_id', principalId)
      .lte('created_at', `${viewDate}T23:59:59.999Z`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as PrincipalObservation[];
  },

  async create(input: {
    schoolId: string;
    principalId: string;
    type: string;
    content: string;
  }): Promise<PrincipalObservation> {
    const { data, error } = await supabase
      .from('principal_observations')
      .insert({
        school_id: input.schoolId,
        principal_id: input.principalId,
        type: input.type,
        content: input.content,
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as PrincipalObservation;
  },
};

