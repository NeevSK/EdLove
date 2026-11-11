/**
 * useCedarDecisionStore — Zustand store for Cedar authorization decisions.
 *
 * Replaces usePermissionStore as the data source for useSanctuaryFeature.
 *
 * The snapshot is read and checked (person, bond, policy version, signature, expiry) by
 * PermissionSnapshotPort, bound in effect/Layers.ts to the PowerSync adapter. This store keeps the
 * resulting decisions, drops stale loads, and withdraws them when the snapshot expires.
 *
 * Lifecycle:
 *   loadDecisions()   → called during boot hydration after user authenticated
 *   getDecision()     → synchronous read ('allow' | 'deny' | 'no_decision')
 *   clearDecisions()  → called on logout / account swap
 */

import { callPort } from '@repo/core/effect/AppRuntime';
import { sessionScope } from '@repo/core/effect/bindings';
import { PermissionSnapshotPort } from '@repo/core/logic/ports/permissionSnapshot.port';
import type { CedarDecision } from '@repo/core/types/authorization';
import { cedarActionFor } from '@repo/policies/authorizationRegistry';
import { create } from 'zustand';

export type DecisionMap = Record<string, Record<string, CedarDecision>>;

let decisionLoadGeneration = 0;
let snapshotExpiry: number | null = null;
let expiryTimer: ReturnType<typeof setTimeout> | null = null;

function cancelSnapshotExpiry(): void {
  if (expiryTimer !== null) clearTimeout(expiryTimer);
  expiryTimer = null;
  snapshotExpiry = null;
}

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
    cancelSnapshotExpiry();
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

    if (sessionScope.isLocalGuest(userId)) {
      set({
        decisions: null,
        snapshotLoaded: false,
        isLoading: false,
        error: null,
        snapshotScopeId: scopeId ?? null,
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
      const read = await callPort(PermissionSnapshotPort, (port) =>
        port.read(userId, scopeId ?? null),
      );
      if (generation !== decisionLoadGeneration) return;
      if (read.kind === 'missing') {
        set({
          decisions: null,
          snapshotLoaded: false,
          isLoading: false,
          snapshotScopeId: scopeId ?? null,
        });
        return;
      }
      if (read.kind === 'rejected') {
        set({
          decisions: null,
          snapshotLoaded: false,
          isLoading: false,
          snapshotScopeId: scopeId ?? null,
          error: read.reason,
        });
        return;
      }
      // Convert boolean map to CedarDecision map
      const decisions: DecisionMap = {};
      for (const [subject, actions] of Object.entries(read.permissions)) {
        decisions[subject] = {};
        for (const [action, allowed] of Object.entries(actions)) {
          decisions[subject][action] =
            typeof allowed === 'boolean' ? (allowed ? 'allow' : 'deny') : 'no_decision';
        }
      }
      const expiresAt = new Date(read.expiresAt);
      snapshotExpiry = expiresAt.getTime();
      const scheduleExpiry = () => {
        const remaining = expiresAt.getTime() - Date.now();
        if (generation !== decisionLoadGeneration) return;
        if (remaining <= 0) {
          cancelSnapshotExpiry();
          set({ decisions: null, snapshotLoaded: false, error: 'Permission snapshot has expired' });
          return;
        }
        expiryTimer = setTimeout(scheduleExpiry, Math.min(remaining, 2_147_483_647));
      };
      set({
        decisions,
        snapshotLoaded: true,
        isLoading: false,
        error: null,
        snapshotScopeId: read.scopeId,
      });
      scheduleExpiry();
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
    if (!decisions || snapshotExpiry === null || Date.now() >= snapshotExpiry) return 'no_decision';
    return (
      decisions[subject]?.[action] ??
      decisions[subject]?.[cedarActionFor(action, subject)] ??
      'no_decision'
    );
  },

  clearDecisions: () => {
    decisionLoadGeneration += 1;
    cancelSnapshotExpiry();
    set({
      decisions: null,
      snapshotLoaded: false,
      isLoading: false,
      error: null,
      snapshotScopeId: null,
    });
  },
}));
