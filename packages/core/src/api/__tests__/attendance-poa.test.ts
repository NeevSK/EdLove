vi.mock('../native/runtimes/educational.runtime', () => ({
  educationalServices: {
    attendance: {
      getByDate: vi.fn(),
      record: vi.fn(),
      batchRecord: vi.fn(),
      getForStudent: vi.fn(),
    },
  },
}));

vi.mock('../native/runtimes/attendanceProjection.runtime', () => ({
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

import { attendanceAPI as rawAttendanceAPI } from '../attendance';
import { assertContractCoverage, defineContractCoverage } from '../contractCoverage';
import { operationsContract } from '../operations.contract';

describe('attendance POA coverage', () => {
  test('attendance public API methods are fully contract-covered', () => {
    const coverage = assertContractCoverage(
      rawAttendanceAPI,
      defineContractCoverage({
        moduleName: 'attendance-test',
        contract: operationsContract,
        methodMapping: {
          getByDate: 'getAttendance',
          record: 'recordAttendance',
          batchRecord: 'batchRecordAttendance',
          getForStudent: 'getAttendanceForStudent',
          getClassroomAttendanceSnapshot: 'getClassroomAttendanceSnapshot',
          getStudentAttendanceTimeline: 'getStudentAttendanceTimeline',
          getSchoolAttendancePulse: 'getSchoolAttendancePulse',
          getAttendanceReport: 'getAttendanceReport',
        },
      }),
    );

    expect(coverage.contract).toBe(operationsContract);
  });

  test('attendance temporal routes carry authority metadata', () => {
    expect(operationsContract.getClassroomAttendanceSnapshot.metadata?.authority).toEqual({
      action: 'read',
      subject: 'Attendance',
    });
    expect(operationsContract.getStudentAttendanceTimeline.metadata?.authority).toEqual({
      action: 'read',
      subject: 'Attendance',
    });
    expect(operationsContract.getSchoolAttendancePulse.metadata?.authority).toEqual({
      action: 'read',
      subject: 'Attendance',
    });
    expect(operationsContract.getAttendanceReport.metadata?.authority).toEqual({
      action: 'read',
      subject: 'Attendance',
    });
  });
});
