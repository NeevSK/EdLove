import { KnowledgeTopologySchema } from '../logic/schemas/dashboard.schema';
import type { KnowledgeTopology } from '../types/topology';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from './supabase';

export interface MappingTopology extends KnowledgeTopology {
  id: string;
  owner_id: string;
  name: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  share_token?: string;
}

export const mappingAPI = {
  /**
   * Fetch a topology by ID (subject to RLS)
   */
  async getById(id: string): Promise<MappingTopology | null> {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('mapping_topologies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[MappingAPI] Fetch error:', error);
      return null;
    }

    try {
      // Validate the core topology part
      KnowledgeTopologySchema.parse(data);
      return data as MappingTopology;
    } catch (e) {
      console.error('[MappingAPI] Validation error for topology:', e);
      return data as MappingTopology; // Fallback but logged
    }
  },

  /**
   * Fetch the "School Pulse" for a principal or authorized staff
   */
  async getSchoolPulse(schoolId: string, viewDate?: string): Promise<KnowledgeTopology | null> {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.rpc('get_school_mapping_pulse', {
      p_school_id: schoolId,
      p_view_date: viewDate || new Date().toISOString().split('T')[0],
    });

    if (error) {
      console.error('[MappingAPI] School Pulse error:', error);
      return null;
    }

    try {
      return KnowledgeTopologySchema.parse(data) as KnowledgeTopology;
    } catch (e) {
      console.error('[MappingAPI] Pulse validation error:', e);
      return data as KnowledgeTopology;
    }
  },

  /**
   * Create or update a topology
   */
  async upsert(topology: Partial<MappingTopology>): Promise<MappingTopology> {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('mapping_topologies')
      .upsert(topology)
      .select()
      .single();

    if (error) throw error;
    return data as MappingTopology;
  },

  /**
   * Generate a signed share link for a topology
   */
  async createShareLink(id: string, expiresDays: number = 7): Promise<string> {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.rpc('generate_mapping_share_token', {
      p_topology_id: id,
      p_expires_days: expiresDays,
    });

    if (error) throw error;
    return data as string;
  },
};
