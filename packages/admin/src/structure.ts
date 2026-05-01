import { SchoolGrade, Section } from '@repo/core/types';
import { supabase } from '@repo/core/api';;

export interface StructureOverview {
  sections: Section[];
  grades: SchoolGrade[];
}

export const structureAPI = {
  async createSection(schoolId: string, name: string): Promise<Section> {
    const { data, error } = await supabase
      .from('sections')
      .insert([{ school_id: schoolId, name }])
      .select('*')
      .single();

    if (error) throw error;
    return data as Section;
  },

  async listSections(schoolId: string): Promise<Section[]> {
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data ?? []) as Section[];
  },

  async listGrades(sectionId: string): Promise<SchoolGrade[]> {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('section_id', sectionId)
      .order('number', { ascending: true });

    if (error) throw error;
    return (data ?? []) as SchoolGrade[];
  },

  async createGrade(sectionId: string, number: number): Promise<SchoolGrade> {
    if (number < 1 || number > 13) {
      throw new Error('Grade number must be between 1 and 13');
    }

    const { data, error } = await supabase
      .from('grades')
      .insert([{ section_id: sectionId, number }])
      .select('*')
      .single();

    if (error) throw error;
    return data as SchoolGrade;
  },

  async getOverview(schoolId: string): Promise<StructureOverview> {
    const sections = await this.listSections(schoolId);
    const gradeGroups = await Promise.all(sections.map((section) => this.listGrades(section.id)));

    return {
      sections,
      grades: gradeGroups.flat(),
    };
  },
};
