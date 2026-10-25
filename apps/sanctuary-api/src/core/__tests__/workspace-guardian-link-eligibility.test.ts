import { describe, expect, it, vi } from 'vitest';
import { assertGuardianLinkEligibility } from '../handlers/workspaceProvisioning';

const guardianId = '123e4567-e89b-12d3-a456-426614174000';
const studentId = '123e4567-e89b-12d3-a456-426614174001';
const schoolId = '123e4567-e89b-12d3-a456-426614174002';

function fixture(identity: unknown, enrollment: unknown = { id: 'enrollment' }) {
  return {
    guardianIdentity: { findFirst: vi.fn(async () => identity) },
    studentGradeClassEnrollment: { findFirst: vi.fn(async () => enrollment) },
  };
}

describe('guardian-link eligibility', () => {
  it('requires a guardian identity even when the caller supplies a school id', async () => {
    const tx = fixture(null);
    await expect(
      assertGuardianLinkEligibility(tx, { guardianId, studentId, schoolId }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(tx.studentGradeClassEnrollment.findFirst).not.toHaveBeenCalled();
  });

  it('binds a supplied school id to an active target-student enrollment', async () => {
    const tx = fixture({ id: 'guardian', school_id: null }, null);
    await expect(
      assertGuardianLinkEligibility(tx, { guardianId, studentId, schoolId }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(tx.studentGradeClassEnrollment.findFirst).toHaveBeenCalledWith({
      where: { student_id: studentId, school_id: schoolId, status: 'active' },
      select: { id: true },
    });
  });

  it('rejects a school outside the guardian profile association', async () => {
    const tx = fixture({ id: 'guardian', school_id: '123e4567-e89b-12d3-a456-426614174099' });
    await expect(
      assertGuardianLinkEligibility(tx, { guardianId, studentId, schoolId }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(tx.studentGradeClassEnrollment.findFirst).not.toHaveBeenCalled();
  });
});
