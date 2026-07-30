import type { SupabaseClient } from '@supabase/supabase-js';
import { APIError } from '@repo/core/types/API';

export const createSchoolRepository = (supabase: SupabaseClient) => ({
  async createSchool(data: {
    name: string;
    handle?: string | null;
    type: string;
    created_by: string;
  }) {
    const { data: newSchool, error } = await supabase
      .from('schools')
      .insert([
        {
          name: data.name,
          handle: data.handle ?? null,
          type: data.type,
          created_by: data.created_by,
          is_sample: false,
        },
      ])
      .select()
      .single();

    if (error) throw new APIError('Failed to create school', error.code, error);

    // Update user's school_id
    const { error: updateError } = await supabase
      .from('users')
      .update({ school_id: newSchool.id })
      .eq('id', data.created_by);

    if (updateError) console.warn('Failed to auto-assign principal to school:', updateError);

    return newSchool;
  },

  async getSchool(id: string) {
    const { data, error } = await supabase.from('schools').select('*').eq('id', id).single();
    if (error) throw new APIError('Failed to fetch school', error.code, error);
    return data;
  },

  async updateSchool(id: string, updates: any) {
    const { data, error } = await supabase
      .from('schools')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new APIError('Failed to update school', error.code, error);
    return data;
  },

  async searchSchools(query: string) {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(10);
    if (error) throw new APIError('Failed to search schools', error.code, error);
    return data || [];
  },

  async getSections(schoolId: string) {
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .eq('school_id', schoolId)
      .order('name', { ascending: true });
    if (error) throw new APIError('Failed to fetch school sections', error.code, error);
    return data || [];
  },

  async getGrades(sectionId: string) {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('section_id', sectionId)
      .order('number', { ascending: true });
    if (error) throw new APIError('Failed to fetch section grades', error.code, error);
    return data || [];
  },

  async createSection(schoolId: string, name: string) {
    const { data, error } = await supabase
      .from('sections')
      .insert([{ school_id: schoolId, name }])
      .select()
      .single();
    if (error) throw new APIError('Failed to create section', error.code, error);
    return data;
  },

  async createGrade(sectionId: string, number: number) {
    const { data, error } = await supabase
      .from('grades')
      .insert([{ section_id: sectionId, number }])
      .select()
      .single();
    if (error) throw new APIError('Failed to create grade', error.code, error);
    return data;
  },

  async getInviteCodes(schoolId: string) {
    const { data, error } = await supabase
      .from('invite_codes')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });
    if (error) throw new APIError('Failed to fetch invite codes', error.code, error);
    return data || [];
  },

  async generateInviteCode(schoolId: string, capacity: string, createdBy: string) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data, error } = await supabase
      .from('invite_codes')
      .insert([
        {
          school_id: schoolId,
          capacity,
          code,
          created_by: createdBy,
          used: false,
        },
      ])
      .select()
      .single();
    if (error) throw new APIError('Failed to generate invite code', error.code, error);
    return data;
  },

  async getAcademicCycles(schoolId: string) {
    const { data, error } = await supabase
      .from('academic_cycles')
      .select('*')
      .eq('school_id', schoolId)
      .order('start_date', { ascending: false });
    if (error) throw new APIError('Failed to fetch academic cycles', error.code, error);
    return data || [];
  },

  async getCurrentAcademicCycle(schoolId: string) {
    const { data, error } = await supabase
      .from('academic_cycles')
      .select('*')
      .eq('school_id', schoolId)
      .eq('is_current', true)
      .maybeSingle();
    if (error) throw new APIError('Failed to fetch current academic cycle', error.code, error);
    return data;
  },

  async createAcademicCycle(data: any) {
    if (data.is_current) {
      await supabase
        .from('academic_cycles')
        .update({ is_current: false })
        .eq('school_id', data.school_id);
    }
    const { data: newCycle, error } = await supabase
      .from('academic_cycles')
      .insert([data])
      .select()
      .single();
    if (error) throw new APIError('Failed to create academic cycle', error.code, error);
    return newCycle;
  },

  async updateAcademicCycle(id: string, schoolId: string, data: any) {
    if (data.is_current === true) {
      await supabase
        .from('academic_cycles')
        .update({ is_current: false })
        .eq('school_id', schoolId);
    }
    const { data: updatedCycle, error } = await supabase
      .from('academic_cycles')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new APIError('Failed to update academic cycle', error.code, error);
    return updatedCycle;
  },

  async deleteAcademicCycle(id: string) {
    const { error } = await supabase.from('academic_cycles').delete().eq('id', id);
    if (error) throw new APIError('Failed to delete academic cycle', error.code, error);
  },
});
