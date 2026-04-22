import type { GuardianDashboard } from '../../../api/schemas/guardian.schema';
import type { GuardianRepository } from '../ports';
import { createGuardianServices } from '../services';

const FIXED_NOW = new Date('2026-03-28T10:15:00.000Z');

function createRepositoryMock(): jest.Mocked<GuardianRepository> {
  return {
    createGuardianProfile: jest.fn(),
    getGuardianProfile: jest.fn(),
    verifyGuardian: jest.fn(),
    updateGuardianProfile: jest.fn(),
    linkGuardianToStudent: jest.fn(),
    getGuardianRelationships: jest.fn(),
    updateGuardianPermissions: jest.fn(),
    terminateGuardianRelationship: jest.fn(),
    getGuardianStudents: jest.fn(),
    getStudentGuardians: jest.fn(),
    getGuardianDashboard: jest.fn(),
    updateGuardianNotificationSettings: jest.fn(),
  };
}

function createDashboardFixture(): GuardianDashboard {
  return {
    guardianId: 'guardian-1',
    students: [
      {
        studentId: 'student-1',
        name: 'Asha Perera',
        grade: '7',
        classroom: '7A',
        attendance: {
          present: 18,
          absent: 1,
          late: 1,
          total: 20,
          percentage: 90,
        },
        grades: {
          latest: [
            {
              subject: 'Mathematics',
              grade: 'A',
              percentage: 93,
              date: '2026-03-27T09:00:00.000Z',
              type: 'exam',
            },
            {
              subject: 'Science',
              grade: 'B+',
              percentage: 88,
              date: '2026-03-14T09:00:00.000Z',
              type: 'project',
            },
          ],
          average: 90.5,
        },
        upcomingAssignments: [
          {
            id: 'assignment-1',
            title: 'Fractions Worksheet',
            subject: 'Mathematics',
            dueDate: '2026-04-02T08:00:00.000Z',
            status: 'pending',
          },
        ],
        recentAnnouncements: [],
      },
    ],
    notifications: [],
    upcomingEvents: [],
    recentActivity: [],
  };
}

describe('guardian temporal policy', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('getDashboard annotates guardian visibility and summary windows', async () => {
    const repository = createRepositoryMock();
    repository.getGuardianDashboard.mockResolvedValue(createDashboardFixture());
    repository.getGuardianRelationships.mockResolvedValue([
      {
        id: 'relationship-1',
        studentId: 'student-1',
        guardianId: 'guardian-1',
        relationshipType: 'parent',
        permissions: [],
        custodyLevel: 'full',
        effectiveDate: '2026-01-01T00:00:00.000Z',
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        schoolId: 'school-1',
      },
    ]);
    const services = createGuardianServices(repository);

    const dashboard = await services.getDashboard('guardian-1');

    expect(repository.getGuardianDashboard).toHaveBeenCalledWith('guardian-1');
    expect(repository.getGuardianRelationships).toHaveBeenCalledWith('guardian-1');
    expect(dashboard.policy).toEqual({
      asOf: '2026-03-28T10:15:00.000Z',
      timelineVisibility: 'official_records_only',
      summaryMode: 'bounded_windows',
      officialRecordTypes: ['attendance', 'grades'],
      projectionTypes: ['assignments', 'notifications', 'events'],
      excludedData: ['teacher_private_notes', 'draft_grades', 'admin_internal_records'],
    });
    expect(dashboard.students[0]?.timelinePolicy).toEqual({
      visibility: 'official_records_only',
      includes: ['attendance', 'grades'],
      excludes: ['teacher_private_notes', 'draft_grades', 'admin_internal_records'],
    });
    expect(dashboard.students[0]?.summaryWindows).toEqual({
      attendance: {
        kind: 'rolling_window',
        label: 'Last 30 days attendance',
        startsAt: '2026-02-26T10:15:00.000Z',
        endsAt: '2026-03-28T10:15:00.000Z',
        asOf: '2026-03-28T10:15:00.000Z',
      },
      grades: {
        kind: 'latest_snapshot',
        label: 'Latest guardian-visible grades',
        startsAt: '2026-03-14T09:00:00.000Z',
        endsAt: '2026-03-27T09:00:00.000Z',
        asOf: '2026-03-28T10:15:00.000Z',
      },
      assignments: {
        kind: 'upcoming_projection',
        label: 'Upcoming assignments',
        startsAt: '2026-03-28T10:15:00.000Z',
        endsAt: '2026-04-02T08:00:00.000Z',
        asOf: '2026-03-28T10:15:00.000Z',
      },
    });
  });

  test('getStudents reuses the dashboard policy path instead of raw student reads', async () => {
    const repository = createRepositoryMock();
    repository.getGuardianDashboard.mockResolvedValue(createDashboardFixture());
    repository.getGuardianRelationships.mockResolvedValue([
      {
        id: 'relationship-1',
        studentId: 'student-1',
        guardianId: 'guardian-1',
        relationshipType: 'parent',
        permissions: [],
        custodyLevel: 'full',
        effectiveDate: '2026-01-01T00:00:00.000Z',
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        schoolId: 'school-1',
      },
    ]);
    const services = createGuardianServices(repository);

    const students = await services.getStudents('guardian-1');

    expect(repository.getGuardianDashboard).toHaveBeenCalledWith('guardian-1');
    expect(repository.getGuardianRelationships).toHaveBeenCalledWith('guardian-1');
    expect(repository.getGuardianStudents).not.toHaveBeenCalled();
    expect(students[0]?.timelinePolicy?.visibility).toBe('official_records_only');
    expect(students[0]?.summaryWindows?.attendance.kind).toBe('rolling_window');
  });

  test('explicit none permissions hide attendance and grade data but keep the student link', async () => {
    const repository = createRepositoryMock();
    repository.getGuardianDashboard.mockResolvedValue(createDashboardFixture());
    repository.getGuardianRelationships.mockResolvedValue([
      {
        id: 'relationship-1',
        studentId: 'student-1',
        guardianId: 'guardian-1',
        relationshipType: 'guardian',
        permissions: [
          {
            category: 'attendance',
            level: 'none',
            scope: 'assigned_students',
          },
          {
            category: 'grades',
            level: 'none',
            scope: 'assigned_students',
          },
          {
            category: 'reports',
            level: 'none',
            scope: 'assigned_students',
          },
        ],
        custodyLevel: 'partial',
        effectiveDate: '2026-01-01T00:00:00.000Z',
        isActive: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        schoolId: 'school-1',
      },
    ]);
    const services = createGuardianServices(repository);

    const dashboard = await services.getDashboard('guardian-1');

    expect(dashboard.students[0]?.sectionVisibility).toEqual({
      attendance: false,
      grades: false,
      reports: false,
      assignments: true,
    });
    expect(dashboard.students[0]?.attendance).toEqual({
      present: 0,
      absent: 0,
      late: 0,
      total: 0,
      percentage: 0,
    });
    expect(dashboard.students[0]?.grades).toEqual({
      latest: [],
      average: 0,
    });
    expect(dashboard.students[0]?.timelinePolicy?.includes).toEqual([]);
  });

  test('students disappear from the dashboard when the guardian has no active relationship for them', async () => {
    const repository = createRepositoryMock();
    repository.getGuardianDashboard.mockResolvedValue(createDashboardFixture());
    repository.getGuardianRelationships.mockResolvedValue([]);
    const services = createGuardianServices(repository);

    const dashboard = await services.getDashboard('guardian-1');

    expect(dashboard.students).toEqual([]);
  });
});
