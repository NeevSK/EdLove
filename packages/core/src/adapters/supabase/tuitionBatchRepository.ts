import { APIError } from '@repo/core/types/API';
import type { CommercialPerspective, MediumOfInstruction } from '@repo/core/types/Perspective';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface CreateTuitionBatchInput {
  instituteId?: string;
  subjectName: string;
  gradeLevel: string;
  medium: MediumOfInstruction;
  schedule: string;
  monthlyFee?: string;
  customAlias?: string;
  role?: 'founder' | 'lead_tutor' | 'assistant_tutor' | 'paper_marker';
}

export interface TuitionBatchRepository {
  getMyBatches(tutorUserId: string): Promise<CommercialPerspective[]>;
  getBatchById(batchId: string): Promise<CommercialPerspective | null>;
  createBatch(tutorUserId: string, input: CreateTuitionBatchInput): Promise<CommercialPerspective>;
  updateBatch(batchId: string, updates: Partial<CreateTuitionBatchInput>): Promise<CommercialPerspective>;
  deleteBatch(batchId: string): Promise<void>;
}

export const createSupabaseTuitionBatchRepository = (
  supabase: SupabaseClient,
): TuitionBatchRepository => ({
  async getMyBatches(tutorUserId: string): Promise<CommercialPerspective[]> {
    const { data, error } = await supabase
      .from('tuition_batches')
      .select('*, tuition_institutes(name)')
      .eq('tutor_user_id', tutorUserId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw new APIError('Failed to fetch tuition batches', error.code, error);
    if (!data) return [];

    return data.map((row: any) => ({
      id: row.id,
      kind: 'commercial' as const,
      displayName: row.custom_alias || `${row.subject_name} (${row.grade_level})`,
      instituteId: row.institute_id || 'independent',
      instituteName: row.tuition_institutes?.name || 'Independent Studio',
      subjectId: row.subject_name.toLowerCase().replace(/\s+/g, '_'),
      subjectName: row.subject_name,
      grade: row.grade_level,
      medium: row.medium,
      batchId: row.id,
      batchName: row.schedule,
      role: row.role || 'lead_tutor',
      customAlias: row.custom_alias,
      displayTitle: row.custom_alias || `${row.subject_name} - ${row.grade_level}`,
    }));
  },

  async getBatchById(batchId: string): Promise<CommercialPerspective | null> {
    const { data, error } = await supabase
      .from('tuition_batches')
      .select('*, tuition_institutes(name)')
      .eq('id', batchId)
      .maybeSingle();

    if (error) throw new APIError('Failed to fetch tuition batch', error.code, error);
    if (!data) return null;

    return {
      id: data.id,
      kind: 'commercial' as const,
      displayName: data.custom_alias || `${data.subject_name} (${data.grade_level})`,
      instituteId: data.institute_id || 'independent',
      instituteName: data.tuition_institutes?.name || 'Independent Studio',
      subjectId: data.subject_name.toLowerCase().replace(/\s+/g, '_'),
      subjectName: data.subject_name,
      grade: data.grade_level,
      medium: data.medium,
      batchId: data.id,
      batchName: data.schedule,
      role: data.role || 'lead_tutor',
      customAlias: data.custom_alias,
      displayTitle: data.custom_alias || `${data.subject_name} - ${data.grade_level}`,
    };
  },

  async createBatch(
    tutorUserId: string,
    input: CreateTuitionBatchInput,
  ): Promise<CommercialPerspective> {
    const payload = {
      tutor_user_id: tutorUserId,
      institute_id: input.instituteId || null,
      subject_name: input.subjectName,
      grade_level: input.gradeLevel,
      medium: input.medium,
      schedule: input.schedule,
      monthly_fee: input.monthlyFee ? parseFloat(input.monthlyFee) : null,
      custom_alias: input.customAlias || null,
      role: input.role || 'lead_tutor',
      is_active: true,
    };

    const { data, error } = await supabase
      .from('tuition_batches')
      .insert(payload)
      .select('*, tuition_institutes(name)')
      .single();

    if (error) throw new APIError('Failed to create tuition batch', error.code, error);

    return {
      id: data.id,
      kind: 'commercial' as const,
      displayName: data.custom_alias || `${data.subject_name} (${data.grade_level})`,
      instituteId: data.institute_id || 'independent',
      instituteName: data.tuition_institutes?.name || 'Independent Studio',
      subjectId: data.subject_name.toLowerCase().replace(/\s+/g, '_'),
      subjectName: data.subject_name,
      grade: data.grade_level,
      medium: data.medium,
      batchId: data.id,
      batchName: data.schedule,
      role: data.role || 'lead_tutor',
      customAlias: data.custom_alias,
      displayTitle: data.custom_alias || `${data.subject_name} - ${data.grade_level}`,
    };
  },

  async updateBatch(
    batchId: string,
    updates: Partial<CreateTuitionBatchInput>,
  ): Promise<CommercialPerspective> {
    const payload: any = {
      updated_at: new Date().toISOString(),
    };
    if (updates.subjectName !== undefined) payload.subject_name = updates.subjectName;
    if (updates.gradeLevel !== undefined) payload.grade_level = updates.gradeLevel;
    if (updates.medium !== undefined) payload.medium = updates.medium;
    if (updates.schedule !== undefined) payload.schedule = updates.schedule;
    if (updates.customAlias !== undefined) payload.custom_alias = updates.customAlias;
    if (updates.role !== undefined) payload.role = updates.role;
    if (updates.monthlyFee !== undefined) {
      payload.monthly_fee = updates.monthlyFee ? parseFloat(updates.monthlyFee) : null;
    }

    const { data, error } = await supabase
      .from('tuition_batches')
      .update(payload)
      .eq('id', batchId)
      .select('*, tuition_institutes(name)')
      .single();

    if (error) throw new APIError('Failed to update tuition batch', error.code, error);

    return {
      id: data.id,
      kind: 'commercial' as const,
      displayName: data.custom_alias || `${data.subject_name} (${data.grade_level})`,
      instituteId: data.institute_id || 'independent',
      instituteName: data.tuition_institutes?.name || 'Independent Studio',
      subjectId: data.subject_name.toLowerCase().replace(/\s+/g, '_'),
      subjectName: data.subject_name,
      grade: data.grade_level,
      medium: data.medium,
      batchId: data.id,
      batchName: data.schedule,
      role: data.role || 'lead_tutor',
      customAlias: data.custom_alias,
      displayTitle: data.custom_alias || `${data.subject_name} - ${data.grade_level}`,
    };
  },

  async deleteBatch(batchId: string): Promise<void> {
    const { error } = await supabase
      .from('tuition_batches')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', batchId);

    if (error) throw new APIError('Failed to archive tuition batch', error.code, error);
  },
});
