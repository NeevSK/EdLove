import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { FounderRepository } from '../../logic/domains/founder/ports';
import { type Classroom, ClassroomSchema } from '../../logic/schemas/classroom.schema';
import { type CommunityGroup, CommunityGroupSchema } from '../../logic/schemas/community.schema';
import {
  type EcosystemPulse,
  EcosystemPulseSchema,
  type EcosystemStats,
  EcosystemStatsSchema,
  type GlobalUser,
  GlobalUserSchema,
  type SentinelAuditLog,
  SentinelAuditLogSchema,
} from '../../logic/schemas/founder.schema';
import { SchoolSchema, type SchoolZod } from '../../logic/schemas/school.schema';
import { APIError } from '../../types/API';

export const createSupabaseFounderRepository = (
  supabase: SupabaseClient,
): FounderRepository => ({
  async getEcosystemStats() {
    const { data, error } = await supabase.rpc('get_ecosystem_stats');
    if (error) throw new APIError('Failed to fetch ecosystem stats', error.code, error);
    return EcosystemStatsSchema.parse(data) as EcosystemStats;
  },
  async getAllSchools() {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw new APIError('Failed to fetch all schools', error.code, error);
    return z.array(SchoolSchema).parse(data || []) as SchoolZod[];
  },
  async createSchool(data) {
    const { data: newSchool, error } = await supabase
      .from('schools')
      .insert([{ ...data, is_sample: false }])
      .select()
      .single();
    if (error) throw new APIError('Founder failed to create school', error.code, error);
    return SchoolSchema.parse(newSchool) as SchoolZod;
  },
  async createClassroom(data) {
    const { data: newClass, error } = await supabase
      .from('classrooms')
      .insert([data])
      .select()
      .single();
    if (error) throw new APIError('Founder failed to create classroom', error.code, error);
    return ClassroomSchema.parse(newClass) as Classroom;
  },
  async createGroup(data) {
    const payload = {
      ...data,
      creator_id: data.school_id,
      type: 'general',
      visibility: 'public',
      join_policy: 'open',
      is_public: true,
    };
    const { data: newGroup, error } = await supabase
      .from('communities')
      .insert([payload])
      .select()
      .single();
    if (error) throw new APIError('Founder failed to create group', error.code, error);
    return CommunityGroupSchema.parse(newGroup) as CommunityGroup;
  },
  async listAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*, schools(name)')
      .order('created_at', { ascending: false });
    if (error) throw new APIError('Failed to list all users', error.code, error);
    return z.array(GlobalUserSchema).parse(data || []) as GlobalUser[];
  },
  async updateSchoolMetadata(schoolId, metadata) {
    const { data, error } = await supabase
      .from('schools')
      .update({ metadata })
      .eq('id', schoolId)
      .select()
      .single();
    if (error) throw new APIError('Failed to update school metadata', error.code, error);
    return SchoolSchema.parse(data) as SchoolZod;
  },
  async getEcosystemPulse() {
    const { data: schools, error: schoolError } = await supabase.from('schools').select('id, name');
    if (schoolError)
      throw new APIError('Failed to fetch schools for pulse', schoolError.code, schoolError);

    const pulses = await Promise.all(
      (schools || []).map(async (school) => {
        const { data } = await supabase.rpc('get_school_pulse_weather', { p_school_id: school.id });
        return {
          school_id: school.id,
          school_name: school.name,
          weather: data?.weather || 'steady',
          health: data?.health_index || 0,
        };
      }),
    );

    const radiantCount = pulses.filter((pulse) => pulse.weather === 'radiant').length;
    const total = pulses.length || 1;
    let ecosystemWeather: 'radiant' | 'lush' | 'steady' | 'resting' | 'quiet' = 'steady';

    if (radiantCount / total > 0.6) ecosystemWeather = 'radiant';
    else if (radiantCount / total > 0.3) ecosystemWeather = 'lush';

    return EcosystemPulseSchema.parse({
      weather: ecosystemWeather,
      pulses,
      computed_at: new Date().toISOString(),
    }) as EcosystemPulse;
  },
  async getSentinelGovernance() {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error && error.code === 'PGRST116') return [];
    if (error) throw new APIError('Failed to fetch sentinel logs', error.code, error);
    return z.array(SentinelAuditLogSchema).parse(data || []) as SentinelAuditLog[];
  },
});
