import type { GuardianDashboard } from '../../../schemas/guardian.schema';
import { createGuardianServices } from '../services';

function dashboardWithMixedAssessmentData(): GuardianDashboard {
  return {
    guardianId: 'guardian-1',
    students: [
      {
        studentId: 'student-1',
        name: 'Asha Perera',
        grade: '7',
        classroom: '7A',
        attendance: { present: 1, absent: 0, late: 0, total: 1, percentage: 100 },
        grades: {
          latest: [
            {
              subject: 'Mathematics',
              grade: 'A',
              percentage: 93,
              date: '2026-03-27T09:00:00.000Z',
              type: 'exam',
              status: 'published',
            },
            {
              subject: 'Science',
              grade: 'B',
              percentage: 82,
              date: '2026-03-28T09:00:00.000Z',
              type: 'exam',
              status: 'draft',
            },
          ],
          average: 87.5,
        },
        upcomingAssignments: [],
        recentAnnouncements: [],
      },
    ],
    notifications: [],
    upcomingEvents: [],
    recentActivity: [],
  } as unknown as GuardianDashboard;
}

describe('guardian published and permitted assessment boundary', () => {
  it('excludes unpublished assessment data for a guardian permitted to read grades', async () => {
    const repository: any = {
      getGuardianDashboard: vi.fn().mockResolvedValue(dashboardWithMixedAssessmentData()),
      getGuardianRelationships: vi.fn().mockResolvedValue([
        {
          id: 'relationship-1',
          student_id: 'student-1',
          guardian_id: 'guardian-1',
          relationship_type: 'parent',
          permissions: [{ category: 'grades', level: 'read', scope: 'assigned_students' }],
          custody_level: 'full',
          effective_date: '2026-01-01T00:00:00.000Z',
          is_active: true,
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
          school_id: 'school-1',
        },
      ]),
    };

    const dashboard = await createGuardianServices(repository).getDashboard('guardian-1');

    expect(dashboard.students[0]?.sectionVisibility?.grades).toBe(true);
    expect(dashboard.students[0]?.grades.latest).toEqual([
      expect.objectContaining({ subject: 'Mathematics', status: 'published' }),
    ]);
    expect(dashboard.students[0]?.grades.average).toBe(93);
  });

  it('hides grades when permission metadata is absent', async () => {
    const repository: any = {
      getGuardianDashboard: vi.fn().mockResolvedValue(dashboardWithMixedAssessmentData()),
      getGuardianRelationships: vi.fn().mockResolvedValue([
        {
          id: 'relationship-1',
          student_id: 'student-1',
          guardian_id: 'guardian-1',
          relationship_type: 'parent',
          permissions: [],
          custody_level: 'full',
          effective_date: '2026-01-01T00:00:00.000Z',
          is_active: true,
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-01T00:00:00.000Z',
          school_id: 'school-1',
        },
      ]),
    };

    const dashboard = await createGuardianServices(repository).getDashboard('guardian-1');

    expect(dashboard.students[0]?.sectionVisibility?.grades).toBe(false);
    expect(dashboard.students[0]?.grades).toEqual({ latest: [], average: 0 });
  });
});
