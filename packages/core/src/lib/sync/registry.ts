import { api } from '../../api';
import { deviceTrustAPI } from '../../api/deviceTrust';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '../../api/supabase';

/**
 * Mutation Registry
 *
 * Maps serializable string keys (e.g. 'createPost') to actual async functions.
 * Born in the apps/gurudevi-mobile, now healed and moved to @repo/core.
 */

type MutationFunction = (variables: any) => Promise<any>;

export const MUTATION_REGISTRY: Record<string, MutationFunction> = {
  // Community
  createPost: async (vars) => {
    // Core API doesn't have community directly, it's injected
    // In this resonant version, we assume 'api' has been unified.
    // If community is a separate package, this handler serves as the bridge.
    return (api as any).community.createPost(vars, vars.author_id, vars.capacity, vars.school_id);
  },

  // Inventory
  createInventoryRequest: async (vars) => {
    return api['inventory'].createRequest(vars);
  },

  // Resources
  createResource: async (vars) => {
    return api['resources'].create(vars);
  },
  toggleResourcePin: async (vars) => {
    return api['resources'].togglePin(vars.id, vars.isPinned);
  },
  deleteResource: async (vars) => {
    return api['resources'].delete(vars);
  },

  // Self/Wellbeing (Direct Supabase access)
  saveJournalEntry: async (vars) => {
    const { error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.from('journal_entries').insert(vars);
    if (error) throw error;
    return true;
  },
  saveDecision: async (vars) => {
    const { error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.from('decision_journals').insert(vars);
    if (error) throw error;
    return true;
  },

  // Classroom (Upstreamed from mobile)
  createStudent: async (vars) => {
    return api['students'].create(vars);
  },
  updateAttendance: async (vars) => {
    return api['attendance'].record(vars.classroomId, vars.studentId, vars.status, vars.date);
  },
  updateStudent: async (vars) => {
    return api['students'].update(vars.id, vars.updates);
  },

  // Device security
  logDeviceAuditEvent: async (vars) => {
    return deviceTrustAPI.performLogAuditEventIntent(vars);
  },
  unlinkDevice: async (vars) => {
    return deviceTrustAPI.performUnlinkMyDeviceIntent(vars);
  },
  revokeSecuritySession: async (vars) => {
    return deviceTrustAPI.performRevokeMySecuritySessionIntent(vars);
  },
  revokeOtherSecuritySessions: async (vars) => {
    return deviceTrustAPI.performRevokeMyOtherSecuritySessionsIntent(vars);
  },
  revokeCurrentInstallSecuritySessions: async (vars) => {
    return deviceTrustAPI.performRevokeMyInstallSecuritySessionsIntent(vars);
  },
};
