import {
  SchoolJoinApprovalSchema,
  SchoolRegistryClaimApprovalSchema,
} from '@repo/core/logic/schemas/identity.schema';
import { APIError } from '@repo/core/types/API';
import type { SupabaseClient } from '@supabase/supabase-js';

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

    return newSchool;
  },

  async getSchool(id: string) {
    const { data, error } = await supabase.from('schools').select('*').eq('id', id).single();
    if (error) throw new APIError('Failed to fetch school', error.code, error);
    return data;
  },

  async approveSchoolRegistryClaim(claimId: string, reviewerId: string) {
    const { data, error } = await supabase.rpc('approve_school_registry_claim', {
      p_claim_id: claimId,
      p_reviewer_id: reviewerId,
    });
    if (error) throw new APIError('Failed to approve school registry claim', error.code, error);
    return SchoolRegistryClaimApprovalSchema.parse(data);
  },

  async approveSchoolJoinRequest(requestId: string, reviewerId: string) {
    const { data, error } = await supabase.rpc('approve_school_join_request', {
      p_request_id: requestId,
      p_reviewer_id: reviewerId,
    });
    if (error) throw new APIError('Failed to approve school join request', error.code, error);
    return SchoolJoinApprovalSchema.parse(data);
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

  async searchCanonicalSchools(query: string, limit = 20) {
    const boundedLimit = Math.max(1, Math.min(limit, 50));
    const normalizedQuery = query.trim();
    let request = supabase
      .from('edu_schools')
      .select(
        'id, census_no, name, gender, category, type_code, province_id, district_id, gn_division_id, postal_unit_id, zone_id, division_id, status, religion, website, socio_economic_tier, created_at, updated_at',
      )
      .order('name', { ascending: true })
      .limit(boundedLimit);

    if (normalizedQuery) request = request.ilike('name', `%${normalizedQuery}%`);

    const { data, error } = await request;
    if (error) throw new APIError('Failed to search canonical schools', error.code, error);
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
    const { data: section, error: sectionError } = await supabase
      .from('sections')
      .select('school_id')
      .eq('id', sectionId)
      .single();
    if (sectionError || !section?.school_id) {
      throw new APIError(
        'Failed to resolve section school',
        sectionError?.code ?? 'SECTION_SCHOOL_NOT_FOUND',
        sectionError,
      );
    }

    const { data, error } = await supabase
      .from('grades')
      .insert([{ section_id: sectionId, school_id: section.school_id, number }])
      .select()
      .single();
    if (error) throw new APIError('Failed to create grade', error.code, error);
    return data;
  },

  async getInviteCodes(schoolId: string) {
    const { data, error } = await supabase
      .from('invite_codes')
      .select('code, school_id, role, created_by, is_active, uses_count, max_uses, created_at')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });
    if (error) throw new APIError('Failed to fetch invite codes', error.code, error);
    return (data || []).map((row) => ({
      ...row,
      capacity: row.role,
      used: !row.is_active || Number(row.uses_count ?? 0) > 0,
    }));
  },

  async generateInviteCode(
    schoolId: string,
    capacity: string,
    createdBy: string,
    idempotencyKey?: string,
  ) {
    const { data, error } = await supabase.rpc('create_school_invite_code', {
      p_school_id: schoolId,
      p_role: capacity,
      p_created_by: createdBy,
      p_idempotency_key: idempotencyKey ?? null,
    });
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
