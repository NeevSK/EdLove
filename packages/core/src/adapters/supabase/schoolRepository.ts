import type { SupabaseClient } from '@supabase/supabase-js';
import { APIError } from '@/types/API';

export const createSupabaseSchoolRepository = (supabase: SupabaseClient) => ({
  async createSchool(name: string, type: string, createdBy: string) {
    const { data, error } = await supabase
      .from('schools')
      .insert({
        name,
        type,
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) {
      throw new APIError('Failed to create school', error.code, error);
    }

    return data;
  },

  async getSchool(schoolId: string) {
    const { data, error } = await supabase.from('schools').select('*').eq('id', schoolId).single();

    if (error) {
      throw new APIError('Failed to fetch school', error.code, error);
    }

    return data;
  },
});
