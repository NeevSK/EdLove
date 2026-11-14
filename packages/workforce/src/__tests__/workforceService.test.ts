import { describe, expect, it } from 'vitest';
import { workforceService } from '../workforceService';

describe('Workforce Domain & Staff Leave Service', () => {
  it('retrieves faculty roster with diverse job families and leave balances', async () => {
    const faculty = await workforceService.getFaculty('school-ananda-colombo');
    expect(faculty.length).toBeGreaterThanOrEqual(4);

    const scienceMaster = faculty.find((f) => f.userId === 'usr-teacher-karunaratne');
    expect(scienceMaster).toBeDefined();
    expect(scienceMaster?.family).toBe('academic');
    expect(scienceMaster?.leaveBalance.casual).toBeGreaterThan(0);

    const counselor = faculty.find((f) => f.family === 'wellbeing');
    expect(counselor).toBeDefined();
  });

  it('calculates workforce coverage metrics correctly', async () => {
    const metrics = await workforceService.getMetrics('school-ananda-colombo');
    expect(metrics.totalStaff).toBeGreaterThanOrEqual(4);
    expect(metrics.coverageRatePercent).toBeGreaterThan(0);
    expect(metrics.coverageRatePercent).toBeLessThanOrEqual(100);
    expect(metrics.activeToday + metrics.onLeaveToday).toBe(metrics.totalStaff);
  });

  it('submits a new staff leave application with pending status', async () => {
    const newLeave = await workforceService.submitLeaveRequest({
      schoolId: 'school-ananda-colombo',
      userId: 'usr-teacher-karunaratne',
      staffName: 'Bandula Karunaratne',
      role: 'Senior Science Master',
      leaveType: 'medical',
      startDate: '2026-11-10',
      endDate: '2026-11-12',
      reason: 'Ayurvedic wellness rejuvenation treatment',
      substituteId: 'fac-2',
      substituteName: 'Sunil Jayawardena',
    });

    expect(newLeave.id).toBeDefined();
    expect(newLeave.status).toBe('pending');
    expect(newLeave.leaveType).toBe('medical');
    expect(newLeave.reason).toContain('Ayurvedic');

    // Retrieve and check presence
    const allLeaves = await workforceService.getLeaveRequests();
    const found = allLeaves.find((l) => l.id === newLeave.id);
    expect(found).toBeDefined();
  });

  it('approves a pending leave request with principal signature', async () => {
    const pendingLeave = await workforceService.submitLeaveRequest({
      schoolId: 'school-ananda-colombo',
      userId: 'usr-history-head',
      staffName: 'Sunil Jayawardena',
      role: 'Head of Humanities',
      leaveType: 'duty',
      startDate: '2026-11-20',
      endDate: '2026-11-21',
      reason: 'Regional debate competition judge',
      substituteId: null,
      substituteName: null,
    });

    const approved = await workforceService.reviewLeaveRequest(
      pendingLeave.id,
      'approved',
      'usr-principal-colombo',
      'fac-1',
    );

    expect(approved.status).toBe('approved');
    expect(approved.reviewedBy).toBe('usr-principal-colombo');
    expect(approved.reviewedAt).toBeDefined();
    expect(approved.substituteName).toBe('Bandula Karunaratne');
  });
});
