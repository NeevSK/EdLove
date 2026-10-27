/**
 * useCedarDecisionStore — Zustand store for Cedar authorization decisions.
 *
 * Replaces usePermissionStore as the data source for useSanctuaryFeature.
 *
 * Migration path:
 *   Phase 1.1 — reads from permissionSnapshots table (same source as old store,
 *               but decouples the component dependency)
 *   Phase 4.x — switches to direct Cedar WASM evaluation from synced policies
 *
 * Lifecycle:
 *   loadDecisions()   → called during boot hydration after user authenticated
 *   getDecision()     → synchronous read ('allow' | 'deny' | 'no_decision')
 *   clearDecisions()  → called on logout / account swap
 */

import { getDrizzleDB } from '@repo/core/adapters/powersync/database';
import { permissionSnapshots, policyVersion } from '@repo/core/adapters/powersync/schema';
import { verifySnapshotSignature } from '@repo/core/logic/permissions/signature';
import { and, eq } from 'drizzle-orm';
import { create } from 'zustand';

export type CedarDecision = 'allow' | 'deny' | 'no_decision';
export type DecisionMap = Record<string, Record<string, CedarDecision>>;

let decisionLoadGeneration = 0;

export interface CedarDecisionState {
  decisions: DecisionMap | null;
  snapshotLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  snapshotScopeId: string | null;

  loadDecisions: (userId: string, scopeId?: string | null) => Promise<void>;

  getDecision: (subject: string, action: string) => CedarDecision;

  clearDecisions: () => void;
}

export const useCedarDecisionStore = create<CedarDecisionState>((set, get) => ({
  decisions: null,
  snapshotLoaded: false,
  isLoading: false,
  error: null,
  snapshotScopeId: null,

  loadDecisions: async (userId: string, scopeId?: string | null) => {
    const generation = ++decisionLoadGeneration;
    if (!userId) {
      set({
        decisions: null,
        snapshotLoaded: false,
        isLoading: false,
        snapshotScopeId: null,
        error: null,
      });
      return;
    }

    set({
      decisions: null,
      snapshotLoaded: false,
      isLoading: true,
      error: null,
      snapshotScopeId: scopeId ?? null,
    });

    try {
      const db = getDrizzleDB();
      const record = await db.query.permissionSnapshots.findFirst({
        where: scopeId
          ? and(
              eq(permissionSnapshots.userId, userId),
              eq(permissionSnapshots.activeBondId, scopeId),
            )
          : eq(permissionSnapshots.userId, userId),
      });

      if (generation !== decisionLoadGeneration) return;

      if (!record) {
        set({
          decisions: null,
          snapshotLoaded: false,
          isLoading: false,
          snapshotScopeId: scopeId ?? null,
        });
        return;
      }

      if (record.userId !== userId || (scopeId && record.activeBondId !== scopeId)) {
        set({
          decisions: null,
          snapshotLoaded: false,
          isLoading: false,
          snapshotScopeId: scopeId ?? null,
          error:
            record.userId !== userId
              ? 'Permission snapshot principal mismatch'
              : 'Permission snapshot scope mismatch',
        });
        return;
      }

      const currentPolicyVersion = await db.query.policyVersion?.findFirst?.();
      if (generation !== decisionLoadGeneration) return;
      if (
        (scopeId &&
          (!currentPolicyVersion?.hash ||
            !record.policyVersion ||
            record.policyVersion !== currentPolicyVersion.hash)) ||
        (!scopeId &&
          currentPolicyVersion?.hash &&
          record.policyVersion !== currentPolicyVersion.hash)
      ) {
        set({
          decisions: null,
          snapshotLoaded: false,
          isLoading: false,
          snapshotScopeId: scopeId ?? null,
          error: 'Permission snapshot policy version is stale',
        });
        return;
      }

      // Ed25519 signature verification
      const isSignatureValid = await verifySnapshotSignature(record);
      if (generation !== decisionLoadGeneration) return;
      if (!isSignatureValid) {
        console.error('[CedarDecisionStore] Cryptographic tamper detected on permission snapshot');
        set({
          decisions: null,
          snapshotLoaded: false,
          error: 'Cryptographic tamper detected on permission snapshot',
          isLoading: false,
          snapshotScopeId: scopeId ?? null,
        });
        return;
      }

      // Expiration check
      const expiresAt = new Date(record.expiresAt);
      if (!Number.isFinite(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
        set({
          decisions: null,
          snapshotLoaded: false,
          error: 'Permission snapshot has expired',
          isLoading: false,
          snapshotScopeId: scopeId ?? null,
        });
        return;
      }

      const rawPermissions = JSON.parse(record.permissions) as Record<
        string,
        Record<string, boolean>
      >;

      // Convert boolean map to CedarDecision map
      const decisions: DecisionMap = {};
      for (const [subject, actions] of Object.entries(rawPermissions)) {
        decisions[subject] = {};
        for (const [action, allowed] of Object.entries(actions)) {
          decisions[subject][action] = allowed ? 'allow' : 'deny';
        }
      }

      set({
        decisions,
        snapshotLoaded: true,
        isLoading: false,
        error: null,
        snapshotScopeId: scopeId ?? record.activeBondId ?? record.schoolId,
      });
    } catch (err) {
      if (generation !== decisionLoadGeneration) return;
      console.error('[CedarDecisionStore] Error loading decisions:', err);
      set({
        decisions: null,
        snapshotLoaded: false,
        error: err instanceof Error ? err.message : String(err),
        isLoading: false,
        snapshotScopeId: scopeId ?? null,
      });
    }
  },

  getDecision: (subject: string, action: string): CedarDecision => {
    const { decisions } = get();
    if (!decisions) return 'no_decision';
    return decisions[subject]?.[action] ?? 'no_decision';
  },

  clearDecisions: () => {
    decisionLoadGeneration += 1;
    set({
      decisions: null,
      snapshotLoaded: false,
      isLoading: false,
      error: null,
      snapshotScopeId: null,
    });
  },
}));
