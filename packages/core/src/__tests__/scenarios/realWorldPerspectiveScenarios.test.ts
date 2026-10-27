import { createPerspectiveStorageScope } from '@repo/core/lib/tenantStorage';
import { resolveBondScope } from '@repo/core/logic/permissions/bondScope';
import {
  CITIZENSHIP,
  type FeatureRequirement,
  type SanctuaryEvaluationContext,
  sanctuaryFeature,
} from '@repo/core/logic/permissions/sanctuaryFeature';
import { resolveWorkspaceSwitcherTargets } from '@repo/core/logic/workspace/workspaceSwitcher';
import { useScopeSessionStore } from '@repo/core/store/scopeSession';
import { resetScopedStores } from '@repo/core/store/resetScopedStores';
import { transitionScopeSession } from '@repo/core/store/scopeSessionCoordinator';
import type { Bond } from '@repo/core/types/Identity';
import type {
  GuardianBondPerspective,
  InstitutionalBondPerspective,
  PersonalPerspective,
  SanctuaryPerspective,
} from '@repo/core/types/Perspective';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Real-World Scenario Suite: Personal Sanctuary vs Institutional Bonds & Primary/Secondary Capacities', () => {
  // Scenario Context: Dr. Maya is a teacher & department head at Royal College,
  // an administrator at Oxford Academy, a guardian of her daughter Maya Jr at Central High,
  // and maintains her own Personal Sanctuary.
  const user = {
    id: 'user_maya_101',
    display_name: 'Dr. Maya',
    email: 'maya@example.edu',
  };

  const personalPerspective: PersonalPerspective = {
    id: 'personal',
    kind: 'personal',
    displayName: 'Personal Sanctuary',
  };

  const royalTeacherPerspective: InstitutionalBondPerspective = {
    id: 'bond:royal_college:teacher',
    kind: 'institutional',
    displayName: 'Royal College - Senior Teacher',
    schoolId: 'school_royal_college',
    schoolName: 'Royal College',
    capacity: 'teacher',
    roles: ['teacher', 'gradeHead'],
    academicCycleId: 'cycle_2026_term_1',
  };

  const oxfordAdminPerspective: InstitutionalBondPerspective = {
    id: 'bond:oxford_academy:admin',
    kind: 'institutional',
    displayName: 'Oxford Academy - Systems Admin',
    schoolId: 'school_oxford_academy',
    schoolName: 'Oxford Academy',
    capacity: 'admin',
    roles: ['admin'],
    academicCycleId: 'cycle_2026_oxford',
  };

  const guardianPerspective: GuardianBondPerspective = {
    id: 'bond:guardian:ward_maya_jr',
    kind: 'guardian',
    displayName: 'Guardian of Maya Jr.',
    wardUserId: 'ward_maya_jr',
    wardName: 'Maya Jr.',
    schoolId: 'school_central_high',
  };

  const bonds: Bond[] = [
    {
      id: 'bond:royal_college:teacher',
      user_id: user.id,
      entity_id: 'school_royal_college',
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      status: 'active',
    },
    {
      id: 'bond:oxford_academy:admin',
      user_id: user.id,
      entity_id: 'school_oxford_academy',
      entity_type: 'SCHOOL',
      capacity: 'admin',
      status: 'active',
    },
    {
      id: 'bond:guardian:ward_maya_jr',
      user_id: user.id,
      entity_id: 'school_central_high',
      entity_type: 'COMMUNITY',
      capacity: 'guardian',
      status: 'active',
    },
  ];

  beforeEach(async () => {
    resetScopedStores();
    await transitionScopeSession({
      principalId: user.id,
      activePerspective: personalPerspective,
      availablePerspectives: allPerspectives,
      availableBonds: bonds,
    });
  });

  it('Scenario 1: Personal Sanctuary Baseline Isolation (Second-Class Citizenship)', () => {
    // 1. Initial State: Must be personal sanctuary
    const state = useScopeSessionStore.getState().snapshot;
    if (!state) throw new Error('Expected canonical scope snapshot.');
    expect(state.activePerspective.kind).toBe('personal');
    expect(state.activePerspective.id).toBe('personal');

    // 2. Storage Partition Check: Personal keys must not have institutional prefixes
    const mockStorage = new Map<string, string>();
    const baseStorage = {
      set: (k: string, v: any) => mockStorage.set(k, String(v)),
      getString: (k: string) => mockStorage.get(k),
      getStringAsync: async (k: string) => mockStorage.get(k),
      getBoolean: (k: string) => mockStorage.get(k) === 'true',
      getNumber: (k: string) => Number(mockStorage.get(k)),
      delete: (k: string) => {
        mockStorage.delete(k);
      },
      clearAll: () => mockStorage.clear(),
      contains: (k: string) => mockStorage.has(k),
    };

    const personalScope = createPerspectiveStorageScope(user.id, 'personal', baseStorage);
    personalScope.set('private_journal', 'Reflections on Pedagogy');

    expect(mockStorage.has('sanctuary:user_maya_101:perspective:personal:private_journal')).toBe(
      true,
    );

    // 3. Permission Gate Check in Personal Sanctuary:
    // Personal user has Free plan, Citizenship Second Class
    const evalCtx: SanctuaryEvaluationContext = {
      cedarSnapshotLoaded: true,
      entitlementManifestLoaded: true,
      citizenship: CITIZENSHIP.SECOND_CLASS,
      entitlement: {
        pricingTier: 'FREE',
        activeEntitlements: ['personal_notes', 'library_read'],
        expirationDate: null,
      },
      cedarDecision: 'allow',
      flagActive: true,
      flagKey: 'notes.create',
      flagType: 'operational',
    };

    const personalReq: FeatureRequirement = {
      citizenshipRequired: CITIZENSHIP.SECOND_CLASS,
      entitlementModule: 'personal_notes',
      entitlementTier: 'FREE',
      flagKey: 'notes.create',
    };

    const res = sanctuaryFeature(evalCtx, personalReq);
    expect(res.permitted).toBe(true);

    // Institutional features (e.g. Official Attendance) MUST FAIL in Personal Sanctuary
    const instAttendanceReq: FeatureRequirement = {
      citizenshipRequired: CITIZENSHIP.FIRST_CLASS,
      entitlementModule: 'attendance',
      entitlementTier: 'INSTITUTIONAL',
      flagKey: 'attendance.submit',
    };

    const instRes = sanctuaryFeature(evalCtx, instAttendanceReq);
    expect(instRes.permitted).toBe(false);
    if (!instRes.permitted) {
      expect(instRes.reason).toBe('citizenship');
    }
  });

  it('Scenario 2: Primary vs Secondary Capacities in Institutional Bond (Teacher vs Admin)', async () => {
    // 1. Switch to Royal College Teacher Perspective
    const availablePerspectives = [personalPerspective, royalTeacherPerspective, oxfordAdminPerspective];
    await transitionScopeSession({
      principalId: user.id,
      activePerspective: royalTeacherPerspective,
      availablePerspectives,
      availableBonds: bonds,
      selectedBond: bonds[0],
    });
    let state = useScopeSessionStore.getState().snapshot;
    if (!state) throw new Error('Expected canonical scope snapshot.');
    expect(state.activePerspective.kind).toBe('institutional');

    const activeInst = state.activePerspective as InstitutionalBondPerspective;
    expect(activeInst.schoolId).toBe('school_royal_college');
    expect(activeInst.capacity).toBe('teacher');
    expect(activeInst.roles).toContain('gradeHead');

    // 2. Bond Scope Resolution: Must derive Royal College schoolId
    const bondScope = resolveBondScope(bonds[0]!);
    expect(bondScope.schoolId).toBe('school_royal_college');
    expect(bondScope.isPersonal).toBe(false);

    // 3. Switch to Oxford Academy Admin Perspective
    await transitionScopeSession({
      principalId: user.id,
      activePerspective: oxfordAdminPerspective,
      availablePerspectives,
      availableBonds: bonds,
      selectedBond: bonds[1],
    });
    state = useScopeSessionStore.getState().snapshot;
    if (!state) throw new Error('Expected canonical scope snapshot.');
    expect(state.activePerspective.id).toBe('bond:oxford_academy:admin');
    const adminInst = state.activePerspective as InstitutionalBondPerspective;
    expect(adminInst.schoolId).toBe('school_oxford_academy');
    expect(adminInst.capacity).toBe('admin');
  });

  it('Scenario 3: Multi-Institution Storage Partition Sandboxing (No Cross-Bleed)', () => {
    const mockStorage = new Map<string, string>();
    const baseStorage = {
      set: (k: string, v: any) => mockStorage.set(k, String(v)),
      getString: (k: string) => mockStorage.get(k),
      getStringAsync: async (k: string) => mockStorage.get(k),
      getBoolean: (k: string) => mockStorage.get(k) === 'true',
      getNumber: (k: string) => Number(mockStorage.get(k)),
      delete: (k: string) => {
        mockStorage.delete(k);
      },
      clearAll: () => mockStorage.clear(),
      contains: (k: string) => mockStorage.has(k),
    };

    const royalScope = createPerspectiveStorageScope(
      user.id,
      'bond:royal_college:teacher',
      baseStorage,
    );
    const oxfordScope = createPerspectiveStorageScope(
      user.id,
      'bond:oxford_academy:admin',
      baseStorage,
    );
    const guardianScope = createPerspectiveStorageScope(
      user.id,
      'bond:guardian:ward_maya_jr',
      baseStorage,
    );

    // Write same key across 3 scopes
    royalScope.set('cached_roster', JSON.stringify(['Student A', 'Student B']));
    oxfordScope.set('cached_roster', JSON.stringify(['Staff Member X', 'Staff Member Y']));
    guardianScope.set('cached_roster', JSON.stringify(['Maya Jr. (Grade 5)']));

    // Assert absolute non-collision
    expect(JSON.parse(royalScope.getString('cached_roster')!)).toEqual(['Student A', 'Student B']);
    expect(JSON.parse(oxfordScope.getString('cached_roster')!)).toEqual([
      'Staff Member X',
      'Staff Member Y',
    ]);
    expect(JSON.parse(guardianScope.getString('cached_roster')!)).toEqual(['Maya Jr. (Grade 5)']);
  });

  const commercialBatchPerspective = {
    id: 'commercial:apex_nugegoda:phys_2026_sun',
    kind: 'commercial' as const,
    displayName: 'Apex Nugegoda - 2026 A/L Physics',
    instituteId: 'inst_apex_nugegoda',
    instituteName: 'Apex Institute - Nugegoda',
    subjectId: 'sub_phys',
    subjectName: 'Physics',
    grade: '2026 A/L',
    medium: 'sinhala' as const,
    format: 'physical' as const,
    batchId: 'batch_sun_am',
    batchName: 'Sunday Morning Theory',
    role: 'lead_tutor' as const,
    customAlias: 'My Main Nugegoda Theory Batch 🚀',
    displayTitle: 'My Main Nugegoda Theory Batch 🚀',
  };

  const allPerspectives: SanctuaryPerspective[] = [
    personalPerspective,
    commercialBatchPerspective,
    royalTeacherPerspective,
    oxfordAdminPerspective,
    guardianPerspective,
  ];

  it('Scenario 4: Workspace Switcher Target Resolution Across Multiple Active Bonds & Commercial Batches', () => {
    // Test the resolver when user carries Personal Studio, Commercial Batch, Teacher, and Guardian perspectives
    const targets = resolveWorkspaceSwitcherTargets({
      currentWorkspace: 'teacher',
      canManageFounderDashboard: false,
      canManageAdminDashboard: true,
      canManagePrincipalDashboard: false,
      canManageTeacherDashboard: true,
      canManageStudentDashboard: false,
      canManageGuardianDashboard: true,
      hasPrimaryInstitution: true,
      hasMountedGuardianWorkspace: true,
      availablePerspectives: allPerspectives,
      activePerspectiveId: 'bond:royal_college:teacher',
    });

    const personalTarget = targets.find((t) => t.id === 'personal');
    const commercialTarget = targets.find((t) => t.id === 'commercial');
    const teacherTarget = targets.find((t) => t.id === 'teacher');
    const adminTarget = targets.find((t) => t.id === 'admin');
    const guardianTarget = targets.find((t) => t.id === 'guardian');
    const studentTarget = targets.find((t) => t.id === 'student');

    // 1. Personal Sanctuary
    expect(personalTarget?.enabled).toBe(true);
    expect(personalTarget?.category).toBe('personal');
    expect(personalTarget?.badge).toBe('🌿 Sanctuary');

    // 2. Commercial Batch with Custom Alias formatting
    expect(commercialTarget?.enabled).toBe(true);
    expect(commercialTarget?.category).toBe('commercial');
    expect(commercialTarget?.title).toBe('My Main Nugegoda Theory Batch 🚀');
    expect(commercialTarget?.description).toContain('Sunday Morning Theory');
    expect(commercialTarget?.badge).toBe('💼 Commercial');

    // 3. Institutional
    expect(teacherTarget?.enabled).toBe(true);
    expect(teacherTarget?.status).toBe('current');
    expect(teacherTarget?.perspectiveId).toBe('bond:royal_college:teacher');
    expect(teacherTarget?.category).toBe('institutional');

    expect(adminTarget?.enabled).toBe(true);
    expect(adminTarget?.status).toBe('available');
    expect(adminTarget?.category).toBe('institutional');

    // 4. Guardian
    expect(guardianTarget?.enabled).toBe(true);
    expect(guardianTarget?.status).toBe('available');
    expect(guardianTarget?.perspectiveId).toBe('bond:guardian:ward_maya_jr');
    expect(guardianTarget?.category).toBe('guardian');
    expect(guardianTarget?.badge).toBe('👨‍👧 Ward');

    // 5. Student is not in availablePerspectives and actor has no student capacity
    expect(studentTarget).toBeUndefined();
  });

  it('Scenario 5: Database Hydration of Multi-Perspective Ecosystem', async () => {
    const mockDbCommercial: SanctuaryPerspective[] = [
      {
        id: 'batch-apex-1',
        kind: 'commercial',
        displayName: 'Physics 2026 A/L Theory',
        instituteId: 'apex-inst',
        instituteName: 'Apex Institute',
        subjectId: 'physics',
        subjectName: 'Physics',
        grade: '2026 A/L',
        medium: 'sinhala',
        batchId: 'batch-apex-1',
        batchName: 'Sunday Morning',
        role: 'lead_tutor',
        displayTitle: 'Physics 2026 A/L Theory',
      },
    ];

    const mockDbGuardian: SanctuaryPerspective[] = [
      {
        id: 'ward-maya-jr',
        kind: 'guardian',
        displayName: 'Maya Jr',
        wardUserId: 'ward_maya_jr',
        wardName: 'Maya Jr',
      },
    ];

    await transitionScopeSession({
      principalId: user.id,
      activePerspective: personalPerspective,
      availablePerspectives: [personalPerspective, ...mockDbCommercial, ...mockDbGuardian],
      availableBonds: [],
    });

    const perspectives = useScopeSessionStore.getState().snapshot?.availablePerspectives ?? [];
    expect(perspectives).toHaveLength(3); // personal + commercial + guardian
    expect(perspectives.some((p) => p.kind === 'personal')).toBe(true);
    expect(perspectives.some((p) => p.id === 'batch-apex-1')).toBe(true);
    expect(perspectives.some((p) => p.id === 'ward-maya-jr')).toBe(true);
  });
});
