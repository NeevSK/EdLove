import {
  FEATURE_FLAG_MANIFEST,
  type FeatureFlagKey,
} from '@repo/core/logic/registry/featureLifecycleManifest';
import {
  type FeatureLifecycleAction,
  validateFeatureLifecycleAction,
} from '@repo/core/logic/registry/featureLifecyclePolicy';
import { type MutationOutcome, useMutationAuditLog } from '@repo/core/sync';

export interface AdminMutationChange {
  key: string;
  value: string | boolean;
}

export interface AdminFeatureGateChange extends AdminMutationChange {
  key: FeatureFlagKey;
}

export interface GuardedRepairPlan {
  kind: 'poa' | 'capability' | 'release' | 'maintenance';
  title: string;
  summary: string;
  scope: string;
  reversible: boolean;
}

export interface AdminMutationPreview {
  id: string;
  title: string;
  summary: string;
  changes: AdminMutationChange[];
  affectedScope: string;
  reversible: boolean;
  createdAt: string;
}

export interface AdminAuditEntry {
  id: string;
  name: string;
  scope: string;
  status: MutationOutcome;
  summary: string;
  createdAt: string;
  updatedAt: string;
  lastError?: string;
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function logAdminMutation(
  name: string,
  scope: string,
  status: MutationOutcome,
  summary: string,
  lastError?: string,
) {
  const id = makeId('admin-mutation');
  useMutationAuditLog.getState().logEntry({
    id,
    idempotencyKey: `${scope}:${name}`,
    scope,
    name,
    status,
    attempts: status === 'retrying' ? 1 : 0,
    queuedAt: Date.now(),
    summary,
    lastError,
  });

  return id;
}

function assertFeatureGateChanges(
  changes: AdminMutationChange[],
): asserts changes is AdminFeatureGateChange[] {
  const unknownKeys = changes.filter(
    (change) => !FEATURE_FLAG_MANIFEST[change.key as keyof typeof FEATURE_FLAG_MANIFEST],
  );
  if (unknownKeys.length > 0) {
    throw new Error(
      `Feature lifecycle: unknown GrowthBook key(s): ${unknownKeys.map((change) => change.key).join(', ')}`,
    );
  }
}

export function stageFeatureGateChanges(
  changes: AdminFeatureGateChange[],
  affectedScope = 'platform',
): AdminMutationPreview {
  assertFeatureGateChanges(changes);
  logAdminMutation(
    'stage-feature-gate-changes',
    affectedScope,
    'queued',
    'Prepared a feature-gate preview for review.',
  );
  return {
    id: makeId('feature-preview'),
    title: 'Feature gate change preview',
    summary:
      'Stage GrowthBook rollout updates without mutating live operator state until they are approved in the control plane.',
    changes,
    affectedScope,
    reversible: true,
    createdAt: new Date().toISOString(),
  };
}

export function commitFeatureGateChanges(changes: AdminMutationChange[]) {
  assertFeatureGateChanges(changes);
  logAdminMutation(
    'commit-feature-gate-changes',
    'platform',
    'queued',
    `Queued ${changes.length} feature gate change(s) for the GrowthBook control plane.`,
  );

  return {
    applied: false,
    requiresGrowthBookControlPlane: true,
    queuedAt: new Date().toISOString(),
    changedKeys: changes.map((change) => change.key),
  };
}

export function queueFeatureLifecycleAction(action: FeatureLifecycleAction) {
  const metadata = FEATURE_FLAG_MANIFEST[action.key as keyof typeof FEATURE_FLAG_MANIFEST];
  if (!metadata) {
    throw new Error(`Feature lifecycle: unknown manifest key "${action.key}".`);
  }

  validateFeatureLifecycleAction(metadata, action);
  const auditId = logAdminMutation(
    `feature-lifecycle-${action.kind}`,
    action.key,
    'queued',
    action.kind === 'archive-growthbook-flag'
      ? `Queued archival of ${action.key} for the GrowthBook control plane. Reason: ${action.reason}`
      : `Queued operational retention for ${action.key}. Justification: ${action.permanentJustification}`,
  );

  return {
    applied: false,
    requiresGrowthBookControlPlane: true,
    auditId,
    queuedAt: new Date().toISOString(),
    action,
  };
}

export function stageGuardedRepair(plan: GuardedRepairPlan): AdminMutationPreview {
  logAdminMutation(
    `stage-${plan.kind}-repair`,
    plan.scope,
    'queued',
    `Prepared a ${plan.kind} repair preview for review.`,
  );
  return {
    id: makeId('repair-preview'),
    title: plan.title,
    summary: plan.summary,
    changes: [
      { key: `${plan.kind}.scope`, value: plan.scope },
      { key: `${plan.kind}.reversible`, value: plan.reversible },
    ],
    affectedScope: plan.scope,
    reversible: plan.reversible,
    createdAt: new Date().toISOString(),
  };
}

export function commitGuardedRepair(plan: GuardedRepairPlan) {
  logAdminMutation(
    `commit-${plan.kind}-repair`,
    plan.scope,
    'success',
    `Committed a guarded ${plan.kind} repair.`,
  );
  return {
    applied: true,
    committedAt: new Date().toISOString(),
    plan,
  };
}

export function getAdminAuditEntries(): AdminAuditEntry[] {
  return useMutationAuditLog
    .getState()
    .entries.slice(0, 50)
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      scope: entry.scope,
      status: entry.status,
      summary:
        entry.lastError ??
        entry.summary ??
        `Queued at ${new Date(entry.queuedAt).toLocaleString()}`,
      createdAt: new Date(entry.queuedAt).toISOString(),
      updatedAt: new Date(entry.updatedAt).toISOString(),
      lastError: entry.lastError,
    }));
}
