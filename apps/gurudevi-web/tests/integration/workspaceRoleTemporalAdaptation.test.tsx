import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkspaceFloor } from '../../app/(sanctuary)/workspace/WorkspaceFloor';

// Mock the attendance procedures & storage
vi.mock('../../lib/workspace/attendance', async () => {
  const actual = await vi.importActual<typeof import('../../lib/workspace/attendance')>(
    '../../lib/workspace/attendance',
  );
  return {
    ...actual,
    loadAccountClassrooms: vi.fn().mockResolvedValue([
      { id: 'class-1', name: 'Grade 10 Lotus', grade: '10' },
    ]),
    loadAccountAttendance: vi.fn().mockResolvedValue({
      classroomId: 'class-1',
      date: '2026-10-18',
      session: 'morning',
      students: [
        { id: 'rec-1', studentId: 'stu-1', name: 'Naveen S', status: 'present' },
        { id: 'rec-2', studentId: 'stu-2', name: 'Kavindi P', status: 'late' },
      ],
    }),
    loadAccountAttendanceDraft: vi.fn().mockReturnValue(null),
    loadAccountPracticeAttendance: vi.fn().mockResolvedValue(null),
    loadExploreAttendance: vi.fn().mockReturnValue({
      classrooms: [{ id: 'class-1', name: 'Sample Classroom' }],
      students: [{ id: 's-1', studentId: 'stu-1', name: 'Demo Student', status: 'present' }],
    }),
  };
});

describe('Workspace Role & Temporal Adaptation (G1)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders RoleLensSwitcher and default teacher posture on explore mode', async () => {
    render(<WorkspaceFloor mode="explore" capacity="TEACHER" />);

    // Check RoleLensSwitcher presence
    expect(screen.getByRole('toolbar', { name: /role perspective lens/i })).toBeDefined();
    expect(screen.getByRole('radio', { name: /teacher/i })).toBeDefined();
    expect(screen.getByRole('radio', { name: /student/i })).toBeDefined();
    expect(screen.getByRole('radio', { name: /principal/i })).toBeDefined();

    // Check default Teacher posture
    expect(screen.getByText(/Overview · Classroom Practice/i)).toBeDefined();
    expect(screen.getByText(/Daily Attendance Roll Call/i)).toBeDefined();

    // Check workspace tools catalog renders
    expect(screen.getByRole('heading', { name: /teacher tools/i })).toBeDefined();
    expect(screen.getAllByText('Daily Attendance').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Curriculum & Lesson Plans').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Assignment Submissions').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Climate Sensing').length).toBeGreaterThan(0);
  });

  it('filters workspace tools when switching to Student role lens', async () => {
    render(<WorkspaceFloor mode="explore" capacity="TEACHER" />);

    const studentRadio = screen.getByRole('radio', { name: /student/i });
    fireEvent.click(studentRadio);

    // Dynamic Overview posture adapts to Student
    expect(screen.getByText(/Overview · Today’s Learning Space/i)).toBeDefined();
    expect(screen.getByText(/Today’s Classes & Daily Presence/i)).toBeDefined();
    expect(screen.getByText(/Open Daily Check-in/i)).toBeDefined();

    // Student sees Timetable, Submissions, and Claim Spot, but NOT teacher Lesson Plans, Climate Sensing, or Doorway Kiosk
    expect(screen.getAllByText('Timetable').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Claim Spot').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Assignment Submissions').length).toBeGreaterThan(0);
    expect(screen.queryByText('Curriculum & Lesson Plans')).toBeNull();
    expect(screen.queryByText('Climate Sensing')).toBeNull();
    expect(screen.queryByText('Doorway Kiosk')).toBeNull();
  });

  it('filters workspace tools when switching to Principal role lens', async () => {
    render(<WorkspaceFloor mode="explore" capacity="TEACHER" />);

    const principalRadio = screen.getByRole('radio', { name: /principal/i });
    fireEvent.click(principalRadio);

    // Dynamic Overview posture adapts to Principal
    expect(screen.getByText(/Overview · Campus Leadership/i)).toBeDefined();
    expect(screen.getByText(/Real-Time Campus Presence & Kiosks/i)).toBeDefined();

    // Principal sees Doorway Kiosk, ID Badges, School Profile, Climate Sensing, and Tuition & Fees
    expect(screen.getAllByText('Doorway Kiosk').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ID Badges').length).toBeGreaterThan(0);
    expect(screen.getAllByText('School Profile').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Climate Sensing').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Tuition & Fees').length).toBeGreaterThan(0);
  });

  it('adapts posture across temporal horizons (review, plan, current)', async () => {
    render(<WorkspaceFloor mode="explore" capacity="TEACHER" />);

    // Current posture
    expect(screen.getByText(/Daily Attendance Roll Call/i)).toBeDefined();

    // Step back to yesterday / past date
    const prevButton = screen.getByRole('button', { name: /previous day/i });
    fireEvent.click(prevButton);

    // Posture shifts to Archival Attendance Audit
    expect(screen.getByText(/Overview · Classroom Archive/i)).toBeDefined();
    expect(screen.getByText(/Attendance & Roster Audit/i)).toBeDefined();
    expect(screen.getByText(/Audit Attendance Log/i)).toBeDefined();

    // Step forward 2 days into the future
    const nextButton = screen.getByRole('button', { name: /next day/i });
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);

    // Posture shifts to Future Lesson Planning
    expect(screen.getByText(/Overview · Instructional Horizon/i)).toBeDefined();
    expect(screen.getByText(/Lesson Planning & Pacing/i)).toBeDefined();
    expect(screen.getByText(/Draft Lesson Plan/i)).toBeDefined();
  });
});
