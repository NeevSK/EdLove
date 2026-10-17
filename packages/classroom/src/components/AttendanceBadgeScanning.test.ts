import { parseInstitutionalQR } from '@repo/scanner-kit/qr/institutionalQrParser';
import type { AttendanceStatus, StudentAttendance } from '@repo/core/logic';
import { describe, expect, it } from 'vitest';

describe('Attendance Badge Scanning Pipeline', () => {
  const roster: StudentAttendance[] = [
    {
      id: 'enroll_01',
      student_id: 'stu_kamal',
      full_name: 'Kamal Perera',
      roll_number: '10A-01',
      status: 'absent',
    },
    {
      id: 'enroll_02',
      student_id: 'stu_nimal',
      full_name: 'Nimal Silva',
      roll_number: '10A-02',
      status: 'absent',
    },
    {
      id: 'enroll_03',
      student_id: 'stu_anoma',
      full_name: 'Anoma Wickramasinghe',
      roll_number: '10A-03',
      status: 'present',
    },
  ];

  function applyScannedToken(
    token: string,
    currentStudents: StudentAttendance[],
  ): { updatedStudents: StudentAttendance[]; matchedStudent: StudentAttendance | null; error?: string } {
    const parsed = parseInstitutionalQR(token);
    if (!parsed || (parsed.kind !== 'attendance' && parsed.kind !== 'student_id')) {
      return { updatedStudents: currentStudents, matchedStudent: null, error: 'INVALID_QR_TOKEN' };
    }

    const studentId = parsed.studentId;
    const target = currentStudents.find((s) => s.student_id === studentId || s.id === studentId);
    if (!target) {
      return { updatedStudents: currentStudents, matchedStudent: null, error: 'STUDENT_NOT_ENROLLED' };
    }

    const updatedStudents = currentStudents.map((s) =>
      s.id === target.id ? { ...s, status: 'present' as AttendanceStatus } : s,
    );

    return { updatedStudents, matchedStudent: target };
  }

  it('scans prefixed colon token ATTENDANCE:class_1:stu_kamal and marks student present', () => {
    const token = 'ATTENDANCE:cls_10a:stu_kamal';
    const result = applyScannedToken(token, roster);

    expect(result.error).toBeUndefined();
    expect(result.matchedStudent?.full_name).toBe('Kamal Perera');
    const updatedKamal = result.updatedStudents.find((s) => s.student_id === 'stu_kamal');
    expect(updatedKamal?.status).toBe('present');
    // Verify other students are unchanged
    const nimal = result.updatedStudents.find((s) => s.student_id === 'stu_nimal');
    expect(nimal?.status).toBe('absent');
  });

  it('scans deep-link URI gurudevi://attendance/stu_nimal and marks student present', () => {
    const token = 'gurudevi://attendance/stu_nimal?classroomId=cls_10a';
    const result = applyScannedToken(token, roster);

    expect(result.error).toBeUndefined();
    expect(result.matchedStudent?.full_name).toBe('Nimal Silva');
    const updatedNimal = result.updatedStudents.find((s) => s.student_id === 'stu_nimal');
    expect(updatedNimal?.status).toBe('present');
  });

  it('scans JSON attendance payload and marks student present', () => {
    const token = JSON.stringify({
      schema: 'gurudevi.institution.qr',
      kind: 'attendance',
      studentId: 'stu_kamal',
      classroomId: 'cls_10a',
    });
    const result = applyScannedToken(token, roster);

    expect(result.error).toBeUndefined();
    expect(result.matchedStudent?.student_id).toBe('stu_kamal');
  });

  it('rejects student not present in classroom roster', () => {
    const token = 'STUDENT:stu_outsider_999';
    const result = applyScannedToken(token, roster);

    expect(result.matchedStudent).toBeNull();
    expect(result.error).toBe('STUDENT_NOT_ENROLLED');
  });

  it('rejects garbage or non-institutional tokens', () => {
    const token = 'https://some-random-phishing-url.com';
    const result = applyScannedToken(token, roster);

    expect(result.matchedStudent).toBeNull();
    expect(result.error).toBe('INVALID_QR_TOKEN');
  });
});
