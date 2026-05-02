import { describe, it, expect, vi, beforeEach } from 'vitest';
import { attendanceAPI } from '../orchestration/operations';
import { useAuthStore } from '../../store/useAuthStore';
import { useTemporalStore } from '../../store/useTemporalStore';
import { storage } from '../../logic/managers/StorageManager';

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
    // Setup mock abilities
    useAuthStore.setState({
      user: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        role: 'teacher',
        roles: ['teacher'],
        authority: 'teacher',
      } as any,
    });
    useTemporalStore.setState({
      phase: 'present',
      isOffline: false,
    });
  });

  it('should record attendance when authorized', async () => {
    const result = await attendanceAPI.record(
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
      attendanceAPI.record('class-1', 'student-1', 'present', '2026-05-02'),
    ).rejects.toThrow('Cannot modify history');
  });
});
