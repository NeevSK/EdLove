import { useFeatureStore, useMutationAuditLog } from '@repo/core';

export interface AdminFeatureGateChange {
  key: string;
  value: string | boolean;
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
  changes: AdminFeatureGateChange[];
  affectedScope: string;
  reversible: boolean;
  createdAt: string;
}

export interface AdminAuditEntry {
  id: string;
  name: string;
  scope: string;
  status: 'queued' | 'success' | 'failed' | 'retrying';
  summary: string;
  createdAt: string;
  updatedAt: string;
  lastError?: string;
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function logAdminMutation(name: string, scope: string, status: 'queued' | 'success' | 'failed' | 'retrying', summary: string, lastError?: string) {
  const id = makeId('admin-mutation');
  useMutationAuditLog.getState().logEntry({
    id,
    idempotencyKey: `${scope}:${name}`,
    scope,
    name,
    status,
    attempts: status === 'retrying' ? 1 : 0,
    queuedAt: Date.now(),
    lastError,
  });

  return id;
}

export function getAdminFeatureSnapshot() {
  const { flags, globalConfigs } = useFeatureStore.getState();
  return {
    flags,
    globalConfigs,
    activeFlagCount: Object.values(flags).filter(Boolean).length,
    maintenanceMode: flags.isUnderMaintenance,
  };
}

export function stageFeatureGateChanges(changes: AdminFeatureGateChange[], affectedScope = 'platform'): AdminMutationPreview {
  logAdminMutation('stage-feature-gate-changes', affectedScope, 'queued', 'Prepared a feature-gate preview for review.');
  return {
    id: makeId('feature-preview'),
    title: 'Feature gate change preview',
    summary: 'Stage global config updates without mutating live operator state until the preview is approved.',
    changes,
    affectedScope,
    reversible: true,
    createdAt: new Date().toISOString(),
  };
}

export function commitFeatureGateChanges(changes: AdminFeatureGateChange[]) {
  const current = useFeatureStore.getState().globalConfigs;
  const next = changes.reduce<Record<string, string | boolean>>((acc, change) => {
    acc[change.key] = change.value;
    return acc;
  }, { ...current });

  useFeatureStore.getState().setGlobalConfigs(next);
  logAdminMutation('commit-feature-gate-changes', 'platform', 'success', `Applied ${changes.length} feature gate change(s).`);

  return {
    applied: true,
    appliedAt: new Date().toISOString(),
    changedKeys: changes.map((change) => change.key),
  };
}

export function stageGuardedRepair(plan: GuardedRepairPlan): AdminMutationPreview {
  logAdminMutation(`stage-${plan.kind}-repair`, plan.scope, 'queued', `Prepared a ${plan.kind} repair preview for review.`);
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
  logAdminMutation(`commit-${plan.kind}-repair`, plan.scope, 'success', `Committed a guarded ${plan.kind} repair.`);
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
      summary: entry.lastError ?? `Queued at ${new Date(entry.queuedAt).toLocaleString()}`,
      createdAt: new Date(entry.queuedAt).toISOString(),
      updatedAt: new Date(entry.updatedAt).toISOString(),
      lastError: entry.lastError,
    }));
}
