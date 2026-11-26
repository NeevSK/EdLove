import { beforeEach, describe, expect, expectTypeOf, it, test, vi } from 'vitest';
import { checkLocalPermission, getLocalResourceAttributes } from '../localEvaluator.adapter';

// Mock database wrapper
const mockDrizzle = {
  select: vi.fn(),
  query: {
    classrooms: {
      findFirst: vi.fn(),
    },
    schools: {
      findFirst: vi.fn(),
    },
  },
};

vi.mock('../../../adapters/powersync/database', () => ({
  getDrizzleDB: () => mockDrizzle,
  registerPermissionValidator: vi.fn(),
}));

vi.mock('../../../lib/security/deviceTrust.adapter', () => ({
  DeviceTrustEngine: {
    checkDeviceTrustStatus: vi.fn(() => Promise.resolve(true)),
  },
}));

vi.mock('../../../api/deviceTrust', () => ({
  deviceTrustAPI: {
    getCurrentDeviceTrust: vi.fn(() => Promise.resolve({ trustStatus: 'trusted' })),
  },
}));

// Mock the dynamic WebAssembly package
const mockEvaluate = vi.fn();
vi.mock('@cedar-policy/cedar-wasm/web', () => ({
  default: async () => {},
  isAuthorized: (...args: unknown[]) => mockEvaluate(...args),
}));

describe('localEvaluator (WASM PDP)', { tags: ['wasm', 'security'] }, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getLocalResourceAttributes', () => {
    it('returns school_id, teacher_id, grade_id, and section_id for Classrooms', async () => {
      mockDrizzle.query.classrooms.findFirst.mockResolvedValueOnce({
        schoolId: 'school-123',
        teacherId: 'teacher-456',
        gradeId: 'grade-789',
        sectionId: 'section-abc',
      });

      const attrs = await getLocalResourceAttributes('Classroom', 'class-1');
      expect(attrs).toEqual({
        school_id: 'school-123',
        teacher_id: 'teacher-456',
        grade_id: 'grade-789',
        section_id: 'section-abc',
      });
    });

    it('returns subscription_tier and is_active for Schools', async () => {
      mockDrizzle.query.schools.findFirst.mockResolvedValueOnce({
        subscriptionTier: 'PREMIUM',
        isActive: true,
      });

      const attrs = await getLocalResourceAttributes('School', 'school-123');
      expect(attrs).toEqual({
        subscription_tier: 'PREMIUM',
        is_active: true,
      });
    });

    it('returns empty object for unknown resource types', async () => {
      const attrs = await getLocalResourceAttributes('UnknownResource', 'id-123');
      expect(attrs).toEqual({});
    });

    it('statically enforces evaluator contract signatures using expectTypeOf (T16)', () => {
      expectTypeOf(checkLocalPermission).toBeFunction();
      expectTypeOf(checkLocalPermission).returns.resolves.toBeBoolean();
      expectTypeOf(getLocalResourceAttributes).toBeFunction();
      expectTypeOf(getLocalResourceAttributes).returns.resolves.toBeObject();
    });

    test.for([
      { resourceType: 'NonExistentA', id: 'id-a' },
      { resourceType: 'NonExistentB', id: 'id-b' },
      { resourceType: 'RandomEntity', id: 'id-c' },
    ])(
      'returns empty record for unknown entity $resourceType (T17 test.for)',
      async ({ resourceType, id }) => {
        const res = await getLocalResourceAttributes(resourceType as any, id);
        expect(res).toEqual({});
      },
    );
  });

  describe('checkLocalPermission', () => {
    const userContext = {
      userId: 'user-123',
      schoolId: 'school-123',
      capacity: 'teacher' as const,
      classroomId: 'classroom-123',
    };

    it('denies access by default if no local policies are present', async () => {
      mockDrizzle.select.mockReturnValueOnce({
        from: vi.fn().mockResolvedValueOnce([]),
      });

      const isAllowed = await checkLocalPermission({
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext,
      });

      expect(isAllowed).toBe(false);
    });

    it('fails secure if policy content size exceeds MAX_LOCAL_POLICY_SIZE_BYTES (100KB)', async () => {
      const hugePolicyString = 'A'.repeat(101 * 1024); // 101KB
      mockDrizzle.select.mockReturnValueOnce({
        from: vi.fn().mockResolvedValueOnce([{ content: hugePolicyString }]),
      });

      const isAllowed = await checkLocalPermission({
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext,
      });

      expect(isAllowed).toBe(false);
    });

    it('delegates to WASM evaluate and returns true if decision is Allow', async () => {
      mockDrizzle.select.mockReturnValueOnce({
        from: vi.fn().mockResolvedValueOnce([{ content: 'permit(principal, action, resource);' }]),
      });
      mockDrizzle.query.classrooms.findFirst.mockResolvedValueOnce({
        schoolId: 'school-123',
      });
      mockEvaluate.mockReturnValueOnce({
        type: 'success',
        response: { decision: 'allow', diagnostics: { errors: [] } },
      });

      const isAllowed = await checkLocalPermission({
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext,
      });

      expect(isAllowed).toBe(true);
      expect(mockEvaluate).toHaveBeenCalledWith(
        expect.objectContaining({
          policies: { staticPolicies: 'permit(principal, action, resource);' },
          principal: { type: 'User', id: 'user-123' },
          action: { type: 'Action', id: 'read' },
          resource: { type: 'Classroom', id: 'class-1' },
        }),
      );
    });

    it('returns false if WASM evaluate decision is Deny', async () => {
      mockDrizzle.select.mockReturnValueOnce({
        from: vi.fn().mockResolvedValueOnce([{ content: 'permit(principal, action, resource);' }]),
      });
      mockDrizzle.query.classrooms.findFirst.mockResolvedValueOnce({
        schoolId: 'school-123',
      });
      mockEvaluate.mockReturnValueOnce({
        type: 'success',
        response: { decision: 'deny', diagnostics: { errors: [] } },
      });

      const isAllowed = await checkLocalPermission({
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext,
      });

      expect(isAllowed).toBe(false);
    });

    it('fails secure if WASM evaluation throws an error', async () => {
      mockDrizzle.select.mockReturnValueOnce({
        from: vi.fn().mockResolvedValueOnce([{ content: 'permit(principal, action, resource);' }]),
      });
      mockEvaluate.mockImplementationOnce(() => {
        throw new Error('WASM compilation error');
      });

      const isAllowed = await checkLocalPermission({
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext,
      });

      expect(isAllowed).toBe(false);
    });
  });
});
