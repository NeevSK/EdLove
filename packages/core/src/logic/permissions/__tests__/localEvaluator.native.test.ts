import crypto from 'isomorphic-webcrypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { checkLocalPermission } from '../localEvaluator.native';
import { verifySnapshotSignature } from '../signature';

// Mock database wrapper
const mockDrizzle = {
  select: vi.fn().mockReturnValue({
    from: vi.fn().mockResolvedValue([]),
  }),
  query: {
    permissionSnapshots: {
      findFirst: vi.fn(),
    },
  },
};

vi.mock('../../../adapters/powersync/database', () => ({
  getDrizzleDB: () => mockDrizzle,
  registerPermissionValidator: vi.fn(),
}));

// Helper to sign snapshot payload using the exact same HMAC mechanism and key ordering
async function generateTestSignature(params: {
  generatedAt: string;
  expiresAt: string;
  userId: string;
  schoolId: string;
  permissions: any;
  temporalHints?: any;
}): Promise<string> {
  const secretKey = 'default-fallback-secret-for-development';

  // Construct with strict key order matching verifySnapshotSignature
  const payload = {
    generatedAt: params.generatedAt,
    expiresAt: params.expiresAt,
    userId: params.userId,
    schoolId: params.schoolId,
    permissions: params.permissions,
    temporalHints: params.temporalHints || {},
  };

  const enc = new TextEncoder();
  const keyData = enc.encode(secretKey);
  const messageData = enc.encode(JSON.stringify(payload));

  const importedKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign'],
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', importedKey, messageData);
  const sigArray = Array.from(new Uint8Array(signatureBuffer));
  return sigArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

describe('localEvaluator.native (Snapshot PDP)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('verifySnapshotSignature', () => {
    it('returns true for a valid cryptographically signed snapshot', async () => {
      const permissionsObj = { Classroom: { read: true, create: true } };
      const basePayload = {
        userId: 'user-123',
        schoolId: 'school-123',
        generatedAt: '2026-05-10T12:00:00Z',
        expiresAt: '2026-05-11T12:00:00Z',
        permissions: permissionsObj,
        temporalHints: {},
      };

      const signature = await generateTestSignature(basePayload);

      const snapshotRecord = {
        userId: basePayload.userId,
        schoolId: basePayload.schoolId,
        generatedAt: basePayload.generatedAt,
        expiresAt: basePayload.expiresAt,
        permissions: JSON.stringify(basePayload.permissions),
        temporalHints: JSON.stringify(basePayload.temporalHints),
        signature,
      };

      const isValid = await verifySnapshotSignature(snapshotRecord);
      expect(isValid).toBe(true);
    });

    it('returns false if snapshot details have been tampered with', async () => {
      const permissionsObj = { Classroom: { read: true, create: true } };
      const basePayload = {
        userId: 'user-123',
        schoolId: 'school-123',
        generatedAt: '2026-05-10T12:00:00Z',
        expiresAt: '2026-05-11T12:00:00Z',
        permissions: permissionsObj,
        temporalHints: {},
      };

      const signature = await generateTestSignature(basePayload);

      const tamperedRecord = {
        userId: basePayload.userId,
        schoolId: basePayload.schoolId,
        generatedAt: basePayload.generatedAt,
        expiresAt: basePayload.expiresAt,
        permissions: JSON.stringify({ Classroom: { read: true, create: true, delete: true } }), // modified permissions
        temporalHints: JSON.stringify(basePayload.temporalHints),
        signature,
      };

      const isValid = await verifySnapshotSignature(tamperedRecord);
      expect(isValid).toBe(false);
    });
  });

  describe('checkLocalPermission', () => {
    const userContext = {
      userId: 'user-123',
      schoolId: 'school-123',
      capacity: 'teacher' as const,
    };

    it('denies access if no snapshot record is found in SQLite', async () => {
      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValueOnce(null);

      const isAllowed = await checkLocalPermission({
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext,
      });

      expect(isAllowed).toBe(false);
    });

    it('denies access if snapshot signature is invalid (tamper check)', async () => {
      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValueOnce({
        userId: 'user-123',
        schoolId: 'school-123',
        generatedAt: '2026-05-10T12:00:00Z',
        expiresAt: '2026-05-11T12:00:00Z',
        permissions: JSON.stringify({ Classroom: { read: true } }),
        temporalHints: null,
        signature: 'invalid-sig',
      });

      const isAllowed = await checkLocalPermission({
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext,
      });

      expect(isAllowed).toBe(false);
    });

    it('denies access if snapshot has expired', async () => {
      const expiredTime = '2026-05-09T12:00:00Z';
      const permissionsObj = { Classroom: { read: true } };
      const basePayload = {
        userId: 'user-123',
        schoolId: 'school-123',
        generatedAt: '2026-05-08T12:00:00Z',
        expiresAt: expiredTime,
        permissions: permissionsObj,
        temporalHints: {},
      };

      const signature = await generateTestSignature(basePayload);

      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValueOnce({
        userId: basePayload.userId,
        schoolId: basePayload.schoolId,
        generatedAt: basePayload.generatedAt,
        expiresAt: basePayload.expiresAt,
        permissions: JSON.stringify(basePayload.permissions),
        temporalHints: null,
        signature,
      });

      // Mock date to be past expiresAt
      const mockNow = new Date('2026-05-10T12:00:00Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockNow);

      const isAllowed = await checkLocalPermission({
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext,
      });

      expect(isAllowed).toBe(false);
      vi.useRealTimers();
    });

    it('allows access if signature is valid, active, and action is explicitly mapped as true', async () => {
      const permissionsObj = { Classroom: { read: true } };
      const basePayload = {
        userId: 'user-123',
        schoolId: 'school-123',
        generatedAt: '2026-05-10T12:00:00Z',
        expiresAt: '2026-05-12T12:00:00Z',
        permissions: permissionsObj,
        temporalHints: {},
      };

      const signature = await generateTestSignature(basePayload);

      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValueOnce({
        userId: basePayload.userId,
        schoolId: basePayload.schoolId,
        generatedAt: basePayload.generatedAt,
        expiresAt: basePayload.expiresAt,
        permissions: JSON.stringify(basePayload.permissions),
        temporalHints: null,
        signature,
      });

      // Mock date to be within validity period
      const mockNow = new Date('2026-05-11T12:00:00Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockNow);

      const isAllowed = await checkLocalPermission({
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext,
      });

      expect(isAllowed).toBe(true);
      vi.useRealTimers();
    });

    it('denies access if signature is valid but action is explicitly mapped as false or absent', async () => {
      const permissionsObj = { Classroom: { read: false } };
      const basePayload = {
        userId: 'user-123',
        schoolId: 'school-123',
        generatedAt: '2026-05-10T12:00:00Z',
        expiresAt: '2026-05-12T12:00:00Z',
        permissions: permissionsObj,
        temporalHints: {},
      };

      const signature = await generateTestSignature(basePayload);

      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValueOnce({
        userId: basePayload.userId,
        schoolId: basePayload.schoolId,
        generatedAt: basePayload.generatedAt,
        expiresAt: basePayload.expiresAt,
        permissions: JSON.stringify(basePayload.permissions),
        temporalHints: null,
        signature,
      });

      const mockNow = new Date('2026-05-11T12:00:00Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockNow);

      const isAllowed = await checkLocalPermission({
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext,
      });

      expect(isAllowed).toBe(false);
      vi.useRealTimers();
    });

    it('attempts Cedar WASM and falls back to snapshot if WASM engine throws an error', async () => {
      // 1. Mock select to return a policy, forcing WASM path
      mockDrizzle.select.mockReturnValueOnce({
        from: vi
          .fn()
          .mockResolvedValueOnce([{ id: '1', content: 'permit(principal, action, resource);' }]),
      });

      // 2. Mock snapshot record as fallback
      const permissionsObj = { Classroom: { read: true } };
      const basePayload = {
        userId: 'user-123',
        schoolId: 'school-123',
        generatedAt: '2026-05-10T12:00:00Z',
        expiresAt: '2026-05-12T12:00:00Z',
        permissions: permissionsObj,
        temporalHints: {},
      };
      const signature = await generateTestSignature(basePayload);

      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValueOnce({
        userId: basePayload.userId,
        schoolId: basePayload.schoolId,
        generatedAt: basePayload.generatedAt,
        expiresAt: basePayload.expiresAt,
        permissions: JSON.stringify(basePayload.permissions),
        temporalHints: null,
        signature,
      });

      const mockNow = new Date('2026-05-11T12:00:00Z');
      vi.useFakeTimers();
      vi.setSystemTime(mockNow);

      // 3. Since @cedar-policy/cedar-wasm/web isn't fully mocked for this target test,
      // it will throw a WASM load error, triggering the snapshot fallback!
      const isAllowed = await checkLocalPermission({
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext,
      });

      // 4. Verify it successfully fell back and resolved using snapshot data
      expect(isAllowed).toBe(true);
      vi.useRealTimers();
    });

    it('enforces multi-account isolation: User A cannot use User B snapshot', async () => {
      const userBPayload = {
        userId: 'user-B',
        schoolId: 'school-123',
        generatedAt: '2026-05-10T12:00:00Z',
        expiresAt: '2026-05-12T12:00:00Z',
        permissions: { Classroom: { read: true } },
        temporalHints: {},
      };
      const userBSignature = await generateTestSignature(userBPayload);

      // Query returns null if we query User A, even if User B snapshot exists in database
      mockDrizzle.query.permissionSnapshots.findFirst.mockImplementation((queryConfig: any) => {
        const queryUserId = queryConfig?.where?.val || 'unknown';
        if (queryUserId === 'user-123') {
          return Promise.resolve(null); // User A has no snapshot
        }
        return Promise.resolve({
          userId: userBPayload.userId,
          schoolId: userBPayload.schoolId,
          generatedAt: userBPayload.generatedAt,
          expiresAt: userBPayload.expiresAt,
          permissions: JSON.stringify(userBPayload.permissions),
          temporalHints: null,
          signature: userBSignature,
        });
      });

      const isAllowedForUserA = await checkLocalPermission({
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext: {
          userId: 'user-123', // User A
          schoolId: 'school-123',
        },
      });

      expect(isAllowedForUserA).toBe(false); // User A is denied because User A has no snapshot record
    });

    it('prevents identity swapping: fails if snapshot userId is modified but signature remains User B', async () => {
      const userBPayload = {
        userId: 'user-B',
        schoolId: 'school-123',
        generatedAt: '2026-05-10T12:00:00Z',
        expiresAt: '2026-05-12T12:00:00Z',
        permissions: { Classroom: { read: true } },
        temporalHints: {},
      };
      const userBSignature = await generateTestSignature(userBPayload);

      // Simulates an attacker changing the table's userId column to 'user-123' to match User A's active session,
      // but keeping User B's signature because they cannot forge a User A signature.
      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValueOnce({
        userId: 'user-123', // Swapped by attacker
        schoolId: userBPayload.schoolId,
        generatedAt: userBPayload.generatedAt,
        expiresAt: userBPayload.expiresAt,
        permissions: JSON.stringify(userBPayload.permissions),
        temporalHints: null,
        signature: userBSignature, // Original signature of User B
      });

      const isAllowed = await checkLocalPermission({
        action: 'read',
        resourceType: 'Classroom',
        resourceId: 'class-1',
        userContext: {
          userId: 'user-123', // User A
          schoolId: 'school-123',
        },
      });

      expect(isAllowed).toBe(false); // Fails verification due to signature mismatch
    });
  });
});
