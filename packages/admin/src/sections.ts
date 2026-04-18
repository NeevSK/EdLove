import { supabase } from '@repo/core';

export interface SchoolSectionRow {
  id: string;
  school_id: string;
  name: string;
  grade?: string | null;
  created_at: string;
}

export const sectionsAPI = { 
  async listSchoolSections(schoolId: string): Promise<SchoolSectionRow[]> {
    const { data, error } = await supabase
      .from('school_sections')
      .select('*')
      .eq('school_id', schoolId)
      .order('grade', { ascending: true });

    if (error) throw error;
    return (data ?? []) as SchoolSectionRow[];
  },

  async createSchoolSection(input: {
    schoolId: string;
    name: string;
    grade?: string | null;
  }): Promise<SchoolSectionRow> {
    const { data, error } = await supabase
      .from('school_sections')
      .insert({
        school_id: input.schoolId,
        name: input.name.trim(),
        grade: input.grade?.trim() || null})
      .select('*')
      .single();

    if (error) throw error;
    return data as SchoolSectionRow;
  }
};

