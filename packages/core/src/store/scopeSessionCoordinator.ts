import { sovereignBus } from '@repo/core/lib/sync/eventBus';
import { scopeStorageKey } from '@repo/core/lib/accountScope';
import { storage } from '@repo/core/lib/storage';
import {
  createScopeSessionSnapshot,
  PERSONAL_SCOPE_PERSPECTIVE,
  type ScopeSessionSnapshot,
  useScopeSessionStore,
} from '@repo/core/store/scopeSession';
import { useCedarDecisionStore } from '@repo/core/store/useCedarDecisionStore';
import type { Bond } from '@repo/core/types/Identity';
import type { SanctuaryPerspective } from '@repo/core/types/Perspective';

export interface ScopeSessionTransitionInput {
  readonly principalId: string | null;
  readonly activePerspective: SanctuaryPerspective;
  readonly availablePerspectives: readonly SanctuaryPerspective[];
  readonly availableBonds: readonly Bond[];
  readonly selectedBond?: Bond | null;
}

let scopeTransitionGeneration = 0;

interface ScopeAvailabilityHint {
  readonly version: 1;
  readonly principalId: string;
  readonly perspectives: readonly SanctuaryPerspective[];
}

function availabilityHintKey(principalId: string): string {
  return scopeStorageKey('scope-availability-v1', principalId);
}

async function persistAvailabilityHint(snapshot: ScopeSessionSnapshot): Promise<void> {
  if (!snapshot.principalId) return;
  const hint: ScopeAvailabilityHint = {
    version: 1,
    principalId: snapshot.principalId,
    perspectives: snapshot.availablePerspectives,
  };
  await storage.setAsync(availabilityHintKey(snapshot.principalId), JSON.stringify(hint));
}

async function readAvailabilityHint(principalId: string): Promise<readonly SanctuaryPerspective[]> {
  try {
    const raw = await storage.getStringAsync(availabilityHintKey(principalId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('version' in parsed) ||
      parsed.version !== 1 ||
      !('principalId' in parsed) ||
      parsed.principalId !== principalId ||
      !('perspectives' in parsed) ||
      !Array.isArray(parsed.perspectives)
    ) {
      return [];
    }
    return parsed.perspectives.filter(isRestorableWorkspacePerspective);
  } catch (error) {
    console.warn('[ScopeSessionCoordinator] Availability hint could not be restored.', error);
    return [];
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isRestorableWorkspacePerspective(value: unknown): value is SanctuaryPerspective {
  if (!isRecord(value) || typeof value.id !== 'string' || !value.id) return false;
  if (value.kind === 'guardian') {
    return (
      typeof value.displayName === 'string' &&
      typeof value.wardUserId === 'string' &&
      typeof value.wardName === 'string'
    );
  }
  if (value.kind === 'commercial') {
    return (
      typeof value.displayName === 'string' &&
      typeof value.instituteId === 'string' &&
      typeof value.instituteName === 'string' &&
      typeof value.subjectId === 'string' &&
      typeof value.subjectName === 'string' &&
      typeof value.grade === 'string' &&
      (value.medium === 'sinhala' || value.medium === 'english' || value.medium === 'tamil') &&
      typeof value.batchId === 'string' &&
      typeof value.batchName === 'string' &&
      (value.role === 'founder' ||
        value.role === 'lead_tutor' ||
        value.role === 'assistant_tutor' ||
        value.role === 'paper_marker') &&
      typeof value.displayTitle === 'string'
    );
  }
  return false;
}

function permissionScopeId(snapshot: ScopeSessionSnapshot): string {
  return snapshot.activePerspective.kind === 'institutional'
    ? snapshot.activePerspective.schoolId
    : snapshot.activePerspective.id;
}

/**
 * Commits one validated scope snapshot and refreshes its matching local policy.
 */
export async function transitionScopeSession(
  input: ScopeSessionTransitionInput,
): Promise<ScopeSessionSnapshot> {
  const next = createScopeSessionSnapshot(input);
  const generation = ++scopeTransitionGeneration;
  let committed = false;
  const previousScope = useScopeSessionStore.getState().snapshot;
  useScopeSessionStore.getState().beginTransition();

  try {
    useCedarDecisionStore.getState().clearDecisions();
    sovereignBus.emit('perspective:transition_started', {
      from: previousScope?.activePerspective ?? PERSONAL_SCOPE_PERSPECTIVE,
      to: next.activePerspective,
    });
    if (generation !== scopeTransitionGeneration) throw new Error('Scope transition superseded');

    useScopeSessionStore.getState().commit(next);
    committed = true;

    if (next.principalId && next.activeBond) {
      await useCedarDecisionStore
        .getState()
        .loadDecisions(next.principalId, permissionScopeId(next));
    }
    if (
      generation !== scopeTransitionGeneration ||
      useScopeSessionStore.getState().snapshot !== next
    )
      throw new Error('Scope transition superseded');
    try {
      await persistAvailabilityHint(next);
    } catch (error) {
      console.warn('[ScopeSessionCoordinator] Availability hint could not be saved.', error);
    }
    sovereignBus.emit('perspective:transition_completed', {
      activePerspective: next.activePerspective,
    });
    return next;
  } catch (error) {
    if (
      generation !== scopeTransitionGeneration ||
      (committed && useScopeSessionStore.getState().snapshot !== next)
    )
      throw error;
    // An incomplete scope is less safe than a temporary denial. Restore every
    // mirror and leave Cedar empty rather than retaining a prior-scope grant.
    if (previousScope) {
      useScopeSessionStore.getState().commit(previousScope);
    } else {
      useScopeSessionStore.getState().clear();
    }
    useCedarDecisionStore.getState().clearDecisions();
    throw error;
  }
}

/**
 * Applies an explicit availability change without list-order selection. If the
 * active perspective disappears, callers must supply Personal Sanctuary; that
 * is the only safe automatic fallback.
 */
export async function replaceScopeSessionPerspectives(input: {
  readonly principalId: string | null;
  readonly currentPerspective: SanctuaryPerspective;
  readonly availablePerspectives: readonly SanctuaryPerspective[];
  readonly availableBonds: readonly Bond[];
  readonly selectedBond?: Bond | null;
}): Promise<ScopeSessionSnapshot> {
  const activePerspective =
    input.availablePerspectives.find(
      (perspective) => perspective.id === input.currentPerspective.id,
    ) ??
    input.availablePerspectives.find(
      (perspective) => perspective.id === PERSONAL_SCOPE_PERSPECTIVE.id,
    );
  if (!activePerspective) {
    throw new Error(
      'Scope availability cannot remove the active perspective without Personal Sanctuary.',
    );
  }
  return transitionScopeSession({ ...input, activePerspective });
}

/** Projects only an explicit server-selected SCHOOL bond into Sanctuary UI scope. */
export async function commitIdentityScopeSession(input: {
  readonly principalId: string;
  readonly availableBonds: readonly Bond[];
  readonly selectedBond: Bond | null | undefined;
  readonly schoolType?: string | null;
}): Promise<ScopeSessionSnapshot> {
  const selectedBond = input.selectedBond ?? null;
  const savedAvailability = await readAvailabilityHint(input.principalId);
  const institutionalPerspectives = input.availableBonds
    .filter((bond) => bond.entity_type === 'SCHOOL')
    .map((bond) => ({
      id: bond.id,
      kind: 'institutional' as const,
      displayName: `School ${bond.entity_id}`,
      schoolId: bond.entity_id,
      schoolName: `School ${bond.entity_id}`,
      schoolType: input.schoolType ?? null,
      capacity: bond.capacity,
      roles: input.availableBonds
        .filter(
          (candidate) =>
            candidate.entity_type === 'SCHOOL' && candidate.entity_id === bond.entity_id,
        )
        .map((candidate) => candidate.capacity)
        .filter((capacity, index, capacities) => capacities.indexOf(capacity) === index),
    }));
  const activePerspective =
    institutionalPerspectives.find((perspective) => perspective.id === selectedBond?.id) ??
    PERSONAL_SCOPE_PERSPECTIVE;
  const bondIds = new Set(input.availableBonds.map((bond) => bond.id));
  const restoredWorkspaceHints = savedAvailability.filter(
    (perspective) =>
      perspective.kind !== 'personal' &&
      perspective.kind !== 'institutional' &&
      perspective.id.length > 0 &&
      !bondIds.has(perspective.id),
  );
  const availablePerspectives = [
    PERSONAL_SCOPE_PERSPECTIVE,
    ...institutionalPerspectives,
    ...restoredWorkspaceHints,
  ];
  const selectedScopeBond =
    activePerspective.kind === 'institutional' ||
    selectedBond?.entity_type === 'PERSONAL' ||
    selectedBond?.entity_type === 'PERSONAL_CLASSROOM'
      ? selectedBond
      : null;
  return transitionScopeSession({
    principalId: input.principalId,
    activePerspective,
    availablePerspectives,
    availableBonds: input.availableBonds,
    selectedBond: selectedScopeBond,
  });
}

/**
 * Clears only derived scope state for sign-out and cross-account hand-off.
 * Device preferences and durable commands have separate owners and are never
 * disposed from this boundary.
 */
export function clearScopeSessionCompatibility(): void {
  scopeTransitionGeneration += 1;
  useScopeSessionStore.getState().clear();
  useCedarDecisionStore.getState().clearDecisions();
}
