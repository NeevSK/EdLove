import { supabase } from './supabase';
import type { AcademicCycle } from '../types';
import { APIError } from '../types/API';

/**
 * Academic Cycles API
 *
 * Manages school terms, semesters, and cycles.
 */
export const academicCyclesAPI = {
  /**
   * Get all academic cycles for a school
   */
  async getAll(schoolId: string): Promise<AcademicCycle[]> {
    const { data, error } = await supabase
      .from('academic_cycles')
      .select('*')
      .eq('school_id', schoolId)
      .order('start_date', { ascending: false });

    if (error) {
      throw new APIError('Failed to fetch academic cycles', error.code, error);
    }

    return data || [];
  },

  /**
   * Get the currently active academic cycle
   */
  async getCurrent(schoolId: string): Promise<AcademicCycle | null> {
    const { data, error } = await supabase
      .from('academic_cycles')
      .select('*')
      .eq('school_id', schoolId)
      .eq('is_current', true)
      .maybeSingle();

    if (error) {
      throw new APIError('Failed to fetch current academic cycle', error.code, error);
    }

    return data;
  },

  /**
   * Create a new academic cycle
   */
  async create(data: Omit<AcademicCycle, 'id' | 'created_at'>): Promise<AcademicCycle> {
    // If this is set to current, unset others first (optional but safer)
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

    if (error) {
      throw new APIError('Failed to create academic cycle', error.code, error);
    }

    return newCycle;
  },

  /**
   * Update an academic cycle
   */
  async update(id: string, schoolId: string, data: Partial<AcademicCycle>): Promise<AcademicCycle> {
    // If setting this to current, unset all others for this school
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

    if (error) {
      throw new APIError('Failed to update academic cycle', error.code, error);
    }

    return updatedCycle;
  },

  /**
   * Delete an academic cycle
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('academic_cycles').delete().eq('id', id);

    if (error) {
      throw new APIError('Failed to delete academic cycle', error.code, error);
    }
  },
};
