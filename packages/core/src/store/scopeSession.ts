import type { Bond } from '@repo/core/types/Identity';
import type { SanctuaryPerspective } from '@repo/core/types/Perspective';
import { create } from 'zustand';

export const PERSONAL_SCOPE_PERSPECTIVE: SanctuaryPerspective = {
  id: 'personal',
  kind: 'personal',
  displayName: 'Personal Sanctuary',
};

export interface ScopeSessionSnapshot {
  readonly principalId: string | null;
  readonly activePerspective: SanctuaryPerspective;
  /** A workspace lens never implies authorization; only a validated Bond does. */
  readonly authorityKind: 'bond' | 'workspace';
  readonly availablePerspectives: readonly SanctuaryPerspective[];
  readonly availableBonds: readonly Bond[];
  readonly activeBond: Bond | null;
  readonly tenantId: string | null;
}

export interface ScopeSessionState {
  readonly snapshot: ScopeSessionSnapshot | null;
  readonly isTransitioning: boolean;
  beginTransition: () => void;
  commit: (snapshot: ScopeSessionSnapshot) => void;
  abortTransition: () => void;
  clear: () => void;
}

function isSamePerspective(
  candidate: SanctuaryPerspective,
  perspective: SanctuaryPerspective,
): boolean {
  return candidate.id === perspective.id;
}

function tenantIdFor(perspective: SanctuaryPerspective): string | null {
  if (perspective.kind === 'institutional') return perspective.schoolId;
  if (perspective.kind === 'commercial') return perspective.instituteId;
  return null;
}

function bondMatchesPerspective(bond: Bond, perspective: SanctuaryPerspective): boolean {
  if (perspective.kind !== 'institutional') return false;
  return (
    bond.id === perspective.id &&
    bond.entity_type === 'SCHOOL' &&
    bond.entity_id === perspective.schoolId &&
    bond.capacity === perspective.capacity
  );
}

/**
 * Creates the sole mutable scope snapshot. It deliberately accepts no fallback
 * selection: a requested perspective must be present in the supplied list.
 */
export function createScopeSessionSnapshot(input: {
  principalId: string | null;
  activePerspective: SanctuaryPerspective;
  availablePerspectives: readonly SanctuaryPerspective[];
  availableBonds: readonly Bond[];
  selectedBond?: Bond | null;
}): ScopeSessionSnapshot {
  const principalId = input.principalId?.trim() || null;
  if (input.availablePerspectives.length === 0) {
    throw new Error('Scope session requires an explicit available-perspectives list.');
  }
  if (principalId === null && input.activePerspective.kind !== 'personal') {
    throw new Error('A non-personal scope requires an authenticated principal.');
  }
  if (
    !input.availablePerspectives.some((candidate) =>
      isSamePerspective(candidate, input.activePerspective),
    )
  ) {
    throw new Error('Scope session cannot commit a perspective outside the available list.');
  }
  if (
    principalId === null &&
    input.availablePerspectives.some((perspective) => perspective.kind !== 'personal')
  ) {
    throw new Error('An anonymous scope cannot include shared workspace perspectives.');
  }
  if (input.activePerspective.kind === 'institutional') {
    const schoolBond = input.availableBonds.find(
      (bond) => bond.id === input.activePerspective.id,
    );
    if (
      !schoolBond ||
      schoolBond.entity_type !== 'SCHOOL' ||
      schoolBond.entity_id !== input.activePerspective.schoolId ||
      schoolBond.capacity !== input.activePerspective.capacity
    ) {
      throw new Error('Institutional perspective must match an account-owned school bond.');
    }
  }
  for (const perspective of input.availablePerspectives) {
    if (perspective.kind !== 'institutional') continue;
    const schoolBond = input.availableBonds.find(
      (bond) => bond.id === perspective.id,
    );
    if (
      !schoolBond ||
      schoolBond.entity_type !== 'SCHOOL' ||
      schoolBond.entity_id !== perspective.schoolId ||
      schoolBond.capacity !== perspective.capacity
    ) {
      throw new Error('Institutional availability must match an account-owned school bond.');
    }
  }
  if (principalId !== null && input.availableBonds.some((bond) => bond.user_id !== principalId)) {
    throw new Error('Scope session cannot include bonds owned by another principal.');
  }
  if (principalId === null && input.availableBonds.length > 0) {
    throw new Error('An anonymous scope cannot include bonds.');
  }

  const selectedBond =
    input.selectedBond === undefined
      ? null
      : (input.availableBonds.find((bond) => bond.id === input.selectedBond?.id) ?? null);
  if (input.selectedBond && selectedBond === null) {
    throw new Error('Scope session cannot commit an active bond outside the available list.');
  }
  if (
    selectedBond &&
    input.activePerspective.kind !== 'personal' &&
    !bondMatchesPerspective(selectedBond, input.activePerspective)
  ) {
    throw new Error('Scope session cannot pair an active bond with a different perspective.');
  }
  if (
    selectedBond &&
    input.activePerspective.kind === 'personal' &&
    selectedBond.entity_type !== 'PERSONAL' &&
    selectedBond.entity_type !== 'PERSONAL_CLASSROOM'
  ) {
    throw new Error('Personal Sanctuary cannot activate a non-personal bond.');
  }
  const activeBond = selectedBond;
  if (input.activePerspective.kind === 'institutional' && activeBond === null) {
    throw new Error('Scope session cannot commit an institutional perspective without its bond.');
  }

  return {
    principalId,
    activePerspective: input.activePerspective,
    authorityKind: activeBond === null ? 'workspace' : 'bond',
    availablePerspectives: [...input.availablePerspectives],
    availableBonds: [...input.availableBonds],
    activeBond,
    tenantId: tenantIdFor(input.activePerspective),
  };
}

export const useScopeSessionStore = create<ScopeSessionState>()((set) => ({
  snapshot: null,
  isTransitioning: false,
  beginTransition: () => set({ isTransitioning: true }),
  commit: (snapshot) => set({ snapshot, isTransitioning: false }),
  abortTransition: () => set({ isTransitioning: false }),
  clear: () => set({ snapshot: null, isTransitioning: false }),
}));

