import { beforeEach, describe, expect, it, vi } from 'vitest';
import { storage } from '../../logic/managers/StorageManager';
import { useAuthStore } from '../../store/useAuthStore';
import { useTemporalStore } from '../../store/useTemporalStore';

vi.mock('../../logic/permissions/localEvaluator', () => ({
  checkLocalPermission: vi.fn(() => Promise.resolve(true)),
}));

vi.mock('../../lib/security/deviceTrust', () => ({
  DeviceTrustEngine: {
    checkDeviceTrustStatus: vi.fn(() => Promise.resolve(true)),
  },
}));

vi.mock('../../api/deviceTrust', () => ({
  deviceTrustAPI: {
    getCurrentDeviceTrust: vi.fn(() => Promise.resolve({ trustStatus: 'trusted' })),
  },
}));

import { attendanceAPI as rawAttendanceAPI } from '../attendance';
import { attendanceAPI } from '../orchestration/operations';

const mockStorage = {
  set: vi.fn(),
  getString: vi.fn(),
  getStringAsync: vi.fn(),
  getBoolean: vi.fn(),
  getNumber: vi.fn(),
  delete: vi.fn(),
  clearAll: vi.fn(),
  contains: vi.fn(),
};

storage.registerAdapter(mockStorage as any);

vi.mock('../supabase', () => ({
  __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 'test-1' }, error: null })),
          insert: vi.fn(() => Promise.resolve({ data: { id: 'test-1' }, error: null })),
        })),
      })),
    })),
  },
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 'test-1' }, error: null })),
          insert: vi.fn(() => Promise.resolve({ data: { id: 'test-1' }, error: null })),
        })),
      })),
    })),
  },
}));

describe('Attendance POA Orchestration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(rawAttendanceAPI, 'upsertAttendanceRecord').mockResolvedValue({
      success: true,
    } as any);
    // Setup mock abilities
    useAuthStore.setState({
      user: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        activeBond: {
          id: 'b1',
          userId: '550e8400-e29b-41d4-a716-446655440000',
          entityId: 'school-1',
          entityType: 'SCHOOL',
          capacity: 'teacher',
        },
      } as any,
    });
    useTemporalStore.setState({
      phase: 'present',
      isOffline: false,
    });
  });

  it('should record attendance when authorized', async () => {
    const result = await attendanceAPI.recordAttendance(
      'class-1',
      'student-1',
      'present',
      '2026-05-02',
    );
    expect(result).toBeDefined();
  });

  it('should prevent mutation in past phase', async () => {
    useTemporalStore.setState({ phase: 'past' });
    await expect(
      attendanceAPI.recordAttendance('class-1', 'student-1', 'present', '2026-05-02'),
    ).rejects.toThrow('Cannot modify history');
  });
});
