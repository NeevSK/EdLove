/**
 * E1 Acceptance Test Suite: Snapshot Integrity & Offline Permission Evaluation
 *
 * Baseline Commit: 252bec65f746c362fec12472999cccfba187d0b9
 * Subsystem: packages/core/src/logic/permissions/localEvaluator.native.ts
 *
 * PURPOSE:
 * Independent acceptance test harness for E1 (Extracting snapshot integrity
 * verification into a pure helper). Tests observe black-box behavior and
 * causal short-circuit properties without depending on internal implementation details.
 */

import { generateKeyPairSync, sign as nodeSign } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { checkLocalPermission } from '@repo/core/logic/permissions/localEvaluator.native';
import * as signatureModule from '@repo/core/logic/permissions/signature';
import type { UserContext } from '@repo/core/logic/schemas/user.schema';

// Mock database layer
const mockDrizzle = {
  select: vi.fn().mockReturnValue({
    from: vi.fn().mockResolvedValue([]),
  }),
  query: {
    permissionSnapshots: {
      findFirst: vi.fn(),
    },
    policyVersion: {
      findFirst: vi.fn().mockResolvedValue({ hash: 'policy-v1' }),
    },
  },
};

vi.mock('@repo/core/adapters/powersync/database', () => ({
  getDrizzleDB: () => mockDrizzle,
  registerPermissionValidator: vi.fn(),
}));

// Set up Ed25519 signing keypair for cryptographic test fixtures
const { privateKey: snapshotPrivateKey, publicKey: snapshotPublicKey } =
  generateKeyPairSync('ed25519');
const snapshotPublicKeyDer = snapshotPublicKey.export({ format: 'der', type: 'spki' }) as Buffer;
process.env.EXPO_PUBLIC_SNAPSHOT_SIGNING_PUBLIC_KEY = snapshotPublicKeyDer
  .subarray(-32)
  .toString('base64');

async function generateTestSignature(params: {
  generatedAt: string;
  expiresAt: string;
  userId: string;
  activeBondId?: string;
  activeEntityId?: string;
  activeEntityType?: string;
  schoolId: string;
  policyVersion?: string;
  permissions: any;
  temporalHints?: any;
}): Promise<string> {
  const payload = {
    generatedAt: params.generatedAt,
    expiresAt: params.expiresAt,
    userId: params.userId,
    activeBondId: params.activeBondId,
    activeEntityId: params.activeEntityId,
    activeEntityType: params.activeEntityType,
    schoolId: params.schoolId,
    policyVersion: params.policyVersion,
    permissions: params.permissions,
    temporalHints: params.temporalHints || {},
  };

  const signature = nodeSign(null, Buffer.from(JSON.stringify(payload)), snapshotPrivateKey);
  return `ed25519:${signature.toString('base64')}`;
}

describe('E1 Acceptance Tests: Snapshot Integrity & Offline Permissions', () => {
  const defaultUserContext: UserContext = {
    userId: 'user-123',
    activeBond: {
      id: 'bond-123',
      user_id: 'user-123',
      entity_id: 'entity-123',
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      status: 'active',
    } as any,
    schoolId: 'school-123',
    activeEntityId: 'entity-123',
    activeEntityType: 'SCHOOL',
    capacity: 'teacher' as any,
  };

  const validBasePayload = {
    userId: 'user-123',
    schoolId: 'school-123',
    activeBondId: 'bond-123',
    activeEntityId: 'entity-123',
    activeEntityType: 'SCHOOL',
    policyVersion: 'policy-v1',
    generatedAt: '2026-05-10T12:00:00Z',
    expiresAt: '2099-01-01T12:00:00Z',
    permissions: { Classroom: { read: true, create: true } },
    temporalHints: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockDrizzle.query.policyVersion.findFirst.mockResolvedValue({ hash: 'policy-v1' });
  });

  // ---------------------------------------------------------------------------
  // Suite 1: Signature Verification & Argument Integrity
  // ---------------------------------------------------------------------------
  describe('Suite 1: Signature Verification & Causal Short-Circuiting', () => {
    it('ATC-01: invokes signature verifier with complete snapshot record matching database state', async () => {
      const verifySpy = vi.spyOn(signatureModule, 'verifySnapshotSignature');
      const signature = await generateTestSignature(validBasePayload);

      const dbRecord = {
        userId: validBasePayload.userId,
        schoolId: validBasePayload.schoolId,
        activeBondId: validBasePayload.activeBondId,
        activeEntityId: validBasePayload.activeEntityId,
        activeEntityType: validBasePayload.activeEntityType,
        policyVersion: validBasePayload.policyVersion,
        generatedAt: validBasePayload.generatedAt,
        expiresAt: validBasePayload.expiresAt,
        permissions: JSON.stringify(validBasePayload.permissions),
        temporalHints: null,
        signature,
      };
      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValueOnce(dbRecord);

      const isAllowed = await checkLocalPermission({
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext: defaultUserContext,
      });

      expect(verifySpy).toHaveBeenCalledTimes(1);
      expect(verifySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          activeBondId: 'bond-123',
          activeEntityId: 'entity-123',
          activeEntityType: 'SCHOOL',
          policyVersion: 'policy-v1',
          signature,
        }),
      );
      expect(isAllowed).toBe(true);

      verifySpy.mockRestore();
    });

    it('ATC-02: denies access when snapshot cryptographic signature is invalid', async () => {
      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValueOnce({
        userId: validBasePayload.userId,
        schoolId: validBasePayload.schoolId,
        activeBondId: validBasePayload.activeBondId,
        activeEntityId: validBasePayload.activeEntityId,
        activeEntityType: validBasePayload.activeEntityType,
        policyVersion: validBasePayload.policyVersion,
        generatedAt: validBasePayload.generatedAt,
        expiresAt: validBasePayload.expiresAt,
        permissions: JSON.stringify(validBasePayload.permissions),
        temporalHints: null,
        signature: 'ed25519:invalidBase64SignatureThatDoesNotMatchPayload',
      });

      const isAllowed = await checkLocalPermission({
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext: defaultUserContext,
      });

      expect(isAllowed).toBe(false);
    });

    it('ATC-03: halts evaluation immediately upon signature failure (causal sensitivity proof)', async () => {
      const verifySpy = vi.spyOn(signatureModule, 'verifySnapshotSignature');

      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValueOnce({
        userId: validBasePayload.userId,
        schoolId: validBasePayload.schoolId,
        activeBondId: validBasePayload.activeBondId,
        activeEntityId: validBasePayload.activeEntityId,
        activeEntityType: validBasePayload.activeEntityType,
        policyVersion: validBasePayload.policyVersion,
        generatedAt: validBasePayload.generatedAt,
        expiresAt: validBasePayload.expiresAt,
        permissions: JSON.stringify(validBasePayload.permissions),
        temporalHints: null,
        signature: 'invalid-sig',
      });

      const isAllowed = await checkLocalPermission({
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext: defaultUserContext,
      });

      expect(isAllowed).toBe(false);
      // Causal proof: signature verifier was invoked, but subsequent database selects were NEVER reached
      expect(verifySpy).toHaveBeenCalled();
      expect(mockDrizzle.select).not.toHaveBeenCalled();

      verifySpy.mockRestore();
    });

    it('ATC-04: rejects tampered permissions payload even if signature belongs to original payload', async () => {
      const signature = await generateTestSignature(validBasePayload);

      // Simulates attacker altering permissions from read-only to delete
      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValueOnce({
        userId: validBasePayload.userId,
        schoolId: validBasePayload.schoolId,
        activeBondId: validBasePayload.activeBondId,
        activeEntityId: validBasePayload.activeEntityId,
        activeEntityType: validBasePayload.activeEntityType,
        policyVersion: validBasePayload.policyVersion,
        generatedAt: validBasePayload.generatedAt,
        expiresAt: validBasePayload.expiresAt,
        permissions: JSON.stringify({ Classroom: { read: true, delete: true } }), // tampered!
        temporalHints: null,
        signature, // original signature
      });

      const isAllowed = await checkLocalPermission({
        action: 'delete',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext: defaultUserContext,
      });

      expect(isAllowed).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Suite 2: Decision Outcomes & Verb Mapping
  // ---------------------------------------------------------------------------
  describe('Suite 2: Permission Decision Outcomes & Verb Mapping', () => {
    it('ATC-05: grants access for valid snapshot with explicit positive permission', async () => {
      const signature = await generateTestSignature(validBasePayload);

      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValueOnce({
        userId: validBasePayload.userId,
        schoolId: validBasePayload.schoolId,
        activeBondId: validBasePayload.activeBondId,
        activeEntityId: validBasePayload.activeEntityId,
        activeEntityType: validBasePayload.activeEntityType,
        policyVersion: validBasePayload.policyVersion,
        generatedAt: validBasePayload.generatedAt,
        expiresAt: validBasePayload.expiresAt,
        permissions: JSON.stringify(validBasePayload.permissions),
        temporalHints: null,
        signature,
      });

      const isAllowed = await checkLocalPermission({
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext: defaultUserContext,
      });

      expect(isAllowed).toBe(true);
    });

    it('ATC-06: denies access when snapshot contains explicit negative permission (false)', async () => {
      const negativePayload = {
        ...validBasePayload,
        permissions: { Classroom: { read: false } },
      };
      const signature = await generateTestSignature(negativePayload);

      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValueOnce({
        userId: negativePayload.userId,
        schoolId: negativePayload.schoolId,
        activeBondId: negativePayload.activeBondId,
        activeEntityId: negativePayload.activeEntityId,
        activeEntityType: negativePayload.activeEntityType,
        policyVersion: negativePayload.policyVersion,
        generatedAt: negativePayload.generatedAt,
        expiresAt: negativePayload.expiresAt,
        permissions: JSON.stringify(negativePayload.permissions),
        temporalHints: null,
        signature,
      });

      const isAllowed = await checkLocalPermission({
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext: defaultUserContext,
      });

      expect(isAllowed).toBe(false);
    });

    it('ATC-07: correctly resolves mapped action verbs (resolve -> read)', async () => {
      const signature = await generateTestSignature(validBasePayload);

      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValueOnce({
        userId: validBasePayload.userId,
        schoolId: validBasePayload.schoolId,
        activeBondId: validBasePayload.activeBondId,
        activeEntityId: validBasePayload.activeEntityId,
        activeEntityType: validBasePayload.activeEntityType,
        policyVersion: validBasePayload.policyVersion,
        generatedAt: validBasePayload.generatedAt,
        expiresAt: validBasePayload.expiresAt,
        permissions: JSON.stringify(validBasePayload.permissions),
        temporalHints: null,
        signature,
      });

      // 'resolve' maps to 'read' for Classroom
      const isAllowed = await checkLocalPermission({
        action: 'resolve' as any,
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext: defaultUserContext,
      });

      expect(isAllowed).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Suite 3: Scope & Identity Isolation
  // ---------------------------------------------------------------------------
  describe('Suite 3: Scope & Identity Isolation', () => {
    it('ATC-08: denies access when snapshot record does not exist in database', async () => {
      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValueOnce(null);

      const isAllowed = await checkLocalPermission({
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext: defaultUserContext,
      });

      expect(isAllowed).toBe(false);
    });

    it('ATC-09: denies access when snapshot belongs to a different userId (account isolation)', async () => {
      const signature = await generateTestSignature(validBasePayload);

      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValueOnce({
        userId: 'user-other', // Mismatched userId
        schoolId: validBasePayload.schoolId,
        activeBondId: validBasePayload.activeBondId,
        activeEntityId: validBasePayload.activeEntityId,
        activeEntityType: validBasePayload.activeEntityType,
        policyVersion: validBasePayload.policyVersion,
        generatedAt: validBasePayload.generatedAt,
        expiresAt: validBasePayload.expiresAt,
        permissions: JSON.stringify(validBasePayload.permissions),
        temporalHints: null,
        signature,
      });

      const isAllowed = await checkLocalPermission({
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext: defaultUserContext,
      });

      expect(isAllowed).toBe(false);
    });

    it('ATC-10: denies access when snapshot activeBondId does not match user context', async () => {
      const signature = await generateTestSignature(validBasePayload);

      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValueOnce({
        userId: validBasePayload.userId,
        schoolId: validBasePayload.schoolId,
        activeBondId: 'bond-other', // Mismatched bond
        activeEntityId: validBasePayload.activeEntityId,
        activeEntityType: validBasePayload.activeEntityType,
        policyVersion: validBasePayload.policyVersion,
        generatedAt: validBasePayload.generatedAt,
        expiresAt: validBasePayload.expiresAt,
        permissions: JSON.stringify(validBasePayload.permissions),
        temporalHints: null,
        signature,
      });

      const isAllowed = await checkLocalPermission({
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext: defaultUserContext,
      });

      expect(isAllowed).toBe(false);
    });

    it('ATC-11: denies access when snapshot activeEntityId does not match user context', async () => {
      const signature = await generateTestSignature(validBasePayload);

      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValueOnce({
        userId: validBasePayload.userId,
        schoolId: validBasePayload.schoolId,
        activeBondId: validBasePayload.activeBondId,
        activeEntityId: 'entity-other', // Mismatched entity
        activeEntityType: validBasePayload.activeEntityType,
        policyVersion: validBasePayload.policyVersion,
        generatedAt: validBasePayload.generatedAt,
        expiresAt: validBasePayload.expiresAt,
        permissions: JSON.stringify(validBasePayload.permissions),
        temporalHints: null,
        signature,
      });

      const isAllowed = await checkLocalPermission({
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext: defaultUserContext,
      });

      expect(isAllowed).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Suite 4: Freshness & Temporal Boundaries
  // ---------------------------------------------------------------------------
  describe('Suite 4: Policy Freshness & Temporal Expiration Boundaries', () => {
    it('ATC-12: denies access when bonded session snapshot policyVersion does not match current hash', async () => {
      const signature = await generateTestSignature(validBasePayload);

      mockDrizzle.query.policyVersion.findFirst.mockResolvedValueOnce({ hash: 'policy-v2' }); // DB has v2
      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValueOnce({
        userId: validBasePayload.userId,
        schoolId: validBasePayload.schoolId,
        activeBondId: validBasePayload.activeBondId,
        activeEntityId: validBasePayload.activeEntityId,
        activeEntityType: validBasePayload.activeEntityType,
        policyVersion: 'policy-v1', // Snapshot has v1 (stale)
        generatedAt: validBasePayload.generatedAt,
        expiresAt: validBasePayload.expiresAt,
        permissions: JSON.stringify(validBasePayload.permissions),
        temporalHints: null,
        signature,
      });

      const isAllowed = await checkLocalPermission({
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext: defaultUserContext,
      });

      expect(isAllowed).toBe(false);
    });

    it('ATC-13: denies access when bonded session lacks database policyVersion hash', async () => {
      const signature = await generateTestSignature(validBasePayload);

      mockDrizzle.query.policyVersion.findFirst.mockResolvedValueOnce(null); // No DB hash
      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValueOnce({
        userId: validBasePayload.userId,
        schoolId: validBasePayload.schoolId,
        activeBondId: validBasePayload.activeBondId,
        activeEntityId: validBasePayload.activeEntityId,
        activeEntityType: validBasePayload.activeEntityType,
        policyVersion: 'policy-v1',
        generatedAt: validBasePayload.generatedAt,
        expiresAt: validBasePayload.expiresAt,
        permissions: JSON.stringify(validBasePayload.permissions),
        temporalHints: null,
        signature,
      });

      const isAllowed = await checkLocalPermission({
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext: defaultUserContext,
      });

      expect(isAllowed).toBe(false);
    });

    it('ATC-14: denies access when snapshot expiresAt timestamp is in the past', async () => {
      const pastPayload = {
        ...validBasePayload,
        expiresAt: '2020-01-01T00:00:00Z', // Definitely in the past
      };
      const signature = await generateTestSignature(pastPayload);

      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValueOnce({
        userId: pastPayload.userId,
        schoolId: pastPayload.schoolId,
        activeBondId: pastPayload.activeBondId,
        activeEntityId: pastPayload.activeEntityId,
        activeEntityType: pastPayload.activeEntityType,
        policyVersion: pastPayload.policyVersion,
        generatedAt: pastPayload.generatedAt,
        expiresAt: pastPayload.expiresAt,
        permissions: JSON.stringify(pastPayload.permissions),
        temporalHints: null,
        signature,
      });

      const isAllowed = await checkLocalPermission({
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext: defaultUserContext,
      });

      expect(isAllowed).toBe(false);
    });

    it('ATC-15: denies access when expiresAt timestamp string is malformed', async () => {
      const malformedPayload = {
        ...validBasePayload,
        expiresAt: 'not-a-valid-date-string',
      };
      const signature = await generateTestSignature(malformedPayload);

      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValueOnce({
        userId: malformedPayload.userId,
        schoolId: malformedPayload.schoolId,
        activeBondId: malformedPayload.activeBondId,
        activeEntityId: malformedPayload.activeEntityId,
        activeEntityType: malformedPayload.activeEntityType,
        policyVersion: malformedPayload.policyVersion,
        generatedAt: malformedPayload.generatedAt,
        expiresAt: malformedPayload.expiresAt,
        permissions: JSON.stringify(malformedPayload.permissions),
        temporalHints: null,
        signature,
      });

      const isAllowed = await checkLocalPermission({
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext: defaultUserContext,
      });

      expect(isAllowed).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Suite 5: Payload Malformation & Fault Tolerance
  // ---------------------------------------------------------------------------
  describe('Suite 5: Payload Malformation & Fault Tolerance', () => {
    it('ATC-16: safely fails closed when permissions column contains invalid JSON', async () => {
      const signature = await generateTestSignature(validBasePayload);

      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValueOnce({
        userId: validBasePayload.userId,
        schoolId: validBasePayload.schoolId,
        activeBondId: validBasePayload.activeBondId,
        activeEntityId: validBasePayload.activeEntityId,
        activeEntityType: validBasePayload.activeEntityType,
        policyVersion: validBasePayload.policyVersion,
        generatedAt: validBasePayload.generatedAt,
        expiresAt: validBasePayload.expiresAt,
        permissions: '{malformed-json-structure-corrupted',
        temporalHints: null,
        signature,
      });

      const isAllowed = await checkLocalPermission({
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext: defaultUserContext,
      });

      expect(isAllowed).toBe(false);
    });

    it('ATC-17: defaults to deny when permissions dictionary contains non-boolean values', async () => {
      const nonBooleanPayload = {
        ...validBasePayload,
        permissions: { Classroom: { read: 'granted' } }, // string instead of boolean
      };
      const signature = await generateTestSignature(nonBooleanPayload);

      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValueOnce({
        userId: nonBooleanPayload.userId,
        schoolId: nonBooleanPayload.schoolId,
        activeBondId: nonBooleanPayload.activeBondId,
        activeEntityId: nonBooleanPayload.activeEntityId,
        activeEntityType: nonBooleanPayload.activeEntityType,
        policyVersion: nonBooleanPayload.policyVersion,
        generatedAt: nonBooleanPayload.generatedAt,
        expiresAt: nonBooleanPayload.expiresAt,
        permissions: JSON.stringify(nonBooleanPayload.permissions),
        temporalHints: null,
        signature,
      });

      const isAllowed = await checkLocalPermission({
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext: defaultUserContext,
      });

      expect(isAllowed).toBe(false);
    });

    it('ATC-18: defaults to deny when requested resource is not present in snapshot', async () => {
      const signature = await generateTestSignature(validBasePayload);

      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValueOnce({
        userId: validBasePayload.userId,
        schoolId: validBasePayload.schoolId,
        activeBondId: validBasePayload.activeBondId,
        activeEntityId: validBasePayload.activeEntityId,
        activeEntityType: validBasePayload.activeEntityType,
        policyVersion: validBasePayload.policyVersion,
        generatedAt: validBasePayload.generatedAt,
        expiresAt: validBasePayload.expiresAt,
        permissions: JSON.stringify(validBasePayload.permissions), // only Classroom
        temporalHints: null,
        signature,
      });

      const isAllowed = await checkLocalPermission({
        action: 'read',
        resourceType: 'Assignment' as any, // Not in snapshot
        resourceId: 'assign-1',
        userContext: defaultUserContext,
      });

      expect(isAllowed).toBe(false);
    });

    it('ATC-19: safely fails closed if database query throws an error', async () => {
      mockDrizzle.query.permissionSnapshots.findFirst.mockRejectedValueOnce(
        new Error('Disk I/O failure: SQLite database corrupted or locked'),
      );

      const isAllowed = await checkLocalPermission({
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext: defaultUserContext,
      });

      expect(isAllowed).toBe(false);
    });
  });
});
