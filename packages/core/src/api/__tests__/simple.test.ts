vi.mock('../runtimes/educational.runtime', () => ({
  educationalServices: {
    attendance: {
      getByDate: vi.fn(),
      record: vi.fn(),
      batchRecord: vi.fn(),
      getForStudent: vi.fn(),
    },
  },
}));

vi.mock('../runtimes/attendanceProjection.runtime', () => ({
  attendanceProjectionServices: {
    getSchoolAttendancePulse: vi.fn(),
    getAttendanceReport: vi.fn(),
  },
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

import { describe, expect, it, vi } from 'vitest';

describe('simple', () => {
  it('works', () => {
    expect(1).toBe(1);
  });
});
