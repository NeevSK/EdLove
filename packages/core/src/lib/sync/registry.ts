import { api } from '@/api';
import { createSovereignClient, SOVEREIGN_API_URL } from '@/api/base';
import { deviceTrustAPI } from '@/api/deviceTrust';

const client = createSovereignClient(SOVEREIGN_API_URL);

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
    return api.inventory.createRequest(vars);
  },

  // Resources
  createResource: async (vars) => {
    return api.resources.create(vars);
  },
  toggleResourcePin: async (vars) => {
    return api.resources.togglePin(vars.id, vars.isPinned);
  },
  deleteResource: async (vars) => {
    return api.resources.delete(vars);
  },

  // Self/Wellbeing (Outbox mutations routed securely via Hono Gateway)
  saveJournalEntry: async (vars) => {
    // Encapsulate and route legacy outbox write securely through our PowerSync endpoint
    const res = await (client.api as any).powersync.upload.$post({
      json: {
        crud: [
          {
            id: vars.id || (typeof crypto !== 'undefined' ? crypto.randomUUID() : 'temp-id'),
            op: 'PUT',
            table: 'fire_journal',
            opData: vars,
          },
        ],
      },
    });
    if (!res.ok) {
      const err = (await res.json()) as any;
      throw new Error(err.message || 'Failed to sync outbox journal entry');
    }
    return true;
  },
  saveDecision: async (vars) => {
    // Encapsulate and route legacy outbox write securely through our PowerSync endpoint
    const res = await (client.api as any).powersync.upload.$post({
      json: {
        crud: [
          {
            id: vars.id || (typeof crypto !== 'undefined' ? crypto.randomUUID() : 'temp-id'),
            op: 'PUT',
            table: 'mood_logs',
            opData: vars,
          },
        ],
      },
    });
    if (!res.ok) {
      const err = (await res.json()) as any;
      throw new Error(err.message || 'Failed to sync outbox decision journal');
    }
    return true;
  },

  logMood: async (vars) => {
    const res = await (client.api as any).self.mood.$post({
      json: {
        user_id: vars.user_id,
        mood_score: vars.mood_score,
        mood: vars.mood,
        note: vars.note,
      },
    });
    if (!res.ok) {
      const error = (await res.json()) as any;
      throw new Error(error.message || 'Failed to sync mood log');
    }
    return true;
  },
  burnJournal: async (vars) => {
    const res = await (client.api as any).self.journal.burn.$post({
      json: { content: vars.content },
    });
    if (!res.ok) {
      const error = (await res.json()) as any;
      throw new Error(error.message || 'Failed to sync burned journal entry');
    }
    return true;
  },

  // Classroom (Upstreamed from mobile)
  createStudent: async (vars) => {
    return api.students.create(vars);
  },
  updateAttendance: async (vars) => {
    return api.attendance.record(vars.classroomId, vars.studentId, vars.status, vars.date);
  },
  updateStudent: async (vars) => {
    return api.students.update(vars.id, vars.updates);
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
