import { beforeEach, describe, expect, it } from 'vitest';
import {
  createScopeSessionSnapshot,
  PERSONAL_SCOPE_PERSPECTIVE,
  useScopeSessionStore,
} from './scopeSession';

const institutionalPerspective = {
  id: 'bond:school-1:teacher',
  kind: 'institutional' as const,
  displayName: 'School One',
  schoolId: 'school-1',
  schoolName: 'School One',
  capacity: 'teacher' as const,
  roles: ['teacher' as const],
};

const bond = {
  id: 'bond:school-1:teacher',
  user_id: 'principal-1',
  entity_id: 'school-1',
  entity_type: 'SCHOOL' as const,
  capacity: 'teacher' as const,
  status: 'active' as const,
};

const otherSchoolBond = {
  ...bond,
  id: 'bond:school-2:teacher',
  entity_id: 'school-2',
};

const commercialPerspective = {
  id: 'batch-1',
  kind: 'commercial' as const,
  displayName: 'Physics Revision',
  instituteId: 'independent',
  instituteName: 'Independent Studio',
  subjectId: 'physics',
  subjectName: 'Physics',
  grade: 'A/L',
  medium: 'english' as const,
  batchId: 'batch-1',
  batchName: 'Sunday',
  role: 'lead_tutor' as const,
  displayTitle: 'Physics Revision',
};

describe('scope session', () => {
  beforeEach(() => useScopeSessionStore.getState().clear());

  it('commits one validated snapshot with its derived tenant and bond', () => {
    const snapshot = createScopeSessionSnapshot({
      principalId: 'principal-1',
      activePerspective: institutionalPerspective,
      availablePerspectives: [PERSONAL_SCOPE_PERSPECTIVE, institutionalPerspective],
      availableBonds: [bond],
      selectedBond: bond,
    });
    useScopeSessionStore.getState().beginTransition();
    useScopeSessionStore.getState().commit(snapshot);

    expect(useScopeSessionStore.getState()).toMatchObject({
      isTransitioning: false,
      snapshot: { principalId: 'principal-1', tenantId: 'school-1', activeBond: bond },
    });
  });

  it('rejects unknown, unauthenticated, and bondless institutional scopes', () => {
    expect(() =>
      createScopeSessionSnapshot({
        principalId: 'principal-1',
        activePerspective: institutionalPerspective,
        availablePerspectives: [PERSONAL_SCOPE_PERSPECTIVE],
        availableBonds: [bond],
      }),
    ).toThrow('outside the available list');
    expect(() =>
      createScopeSessionSnapshot({
        principalId: null,
        activePerspective: institutionalPerspective,
        availablePerspectives: [PERSONAL_SCOPE_PERSPECTIVE, institutionalPerspective],
        availableBonds: [bond],
      }),
    ).toThrow('requires an authenticated principal');
    expect(() =>
      createScopeSessionSnapshot({
        principalId: 'principal-1',
        activePerspective: institutionalPerspective,
        availablePerspectives: [PERSONAL_SCOPE_PERSPECTIVE, institutionalPerspective],
        availableBonds: [],
      }),
    ).toThrow('account-owned school bond');
  });

  it('rejects a bond owned by a different principal before it can shape scope', () => {
    expect(() =>
      createScopeSessionSnapshot({
        principalId: 'principal-2',
        activePerspective: institutionalPerspective,
        availablePerspectives: [PERSONAL_SCOPE_PERSPECTIVE, institutionalPerspective],
        availableBonds: [bond],
      }),
    ).toThrow('owned by another principal');
  });

  it('rejects a same-principal bond for a different active perspective', () => {
    expect(() =>
      createScopeSessionSnapshot({
        principalId: 'principal-1',
        activePerspective: institutionalPerspective,
        availablePerspectives: [PERSONAL_SCOPE_PERSPECTIVE, institutionalPerspective],
        availableBonds: [bond, otherSchoolBond],
        selectedBond: otherSchoolBond,
      }),
    ).toThrow('different perspective');
  });

  it('rejects forged institutional membership and a school bond selected under Personal', () => {
    expect(() =>
      createScopeSessionSnapshot({
        principalId: 'principal-1',
        activePerspective: {
          ...institutionalPerspective,
          capacity: 'admin',
        },
        availablePerspectives: [PERSONAL_SCOPE_PERSPECTIVE, institutionalPerspective],
        availableBonds: [bond],
      }),
    ).toThrow('account-owned school bond');

    expect(() =>
      createScopeSessionSnapshot({
        principalId: 'principal-1',
        activePerspective: PERSONAL_SCOPE_PERSPECTIVE,
        availablePerspectives: [PERSONAL_SCOPE_PERSPECTIVE, institutionalPerspective],
        availableBonds: [bond],
        selectedBond: bond,
      }),
    ).toThrow('non-personal bond');
  });

  it('keeps a commercial workspace lens distinct from bond authority', () => {
    const snapshot = createScopeSessionSnapshot({
      principalId: 'principal-1',
      activePerspective: commercialPerspective,
      availablePerspectives: [PERSONAL_SCOPE_PERSPECTIVE, commercialPerspective],
      availableBonds: [],
    });

    expect(snapshot).toMatchObject({
      activePerspective: commercialPerspective,
      activeBond: null,
      authorityKind: 'workspace',
      tenantId: 'independent',
    });
  });
});
