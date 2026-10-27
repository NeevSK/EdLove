import {
  attendanceSessionMachine,
  calculateAttendanceStats,
  createAttendanceSessionActor,
  executeFetchAttendanceRosterEffect,
  executeSaveAttendanceSessionEffect,
} from '@repo/classroom/machines/attendanceSessionMachine';
import type { StudentAttendance } from '@repo/core/logic';
import { describe, expect, it, vi } from 'vitest';
import { createActor } from 'xstate';

describe('attendanceSessionMachine (XState v6 + Effect v4)', () => {
  const mockStudents: StudentAttendance[] = [
    {
      id: 'rec-1',
      student_id: 'stu-1',
      full_name: 'Ananya Sharma',
      roll_number: '1',
      status: 'present',
    },
    {
      id: 'rec-2',
      student_id: 'stu-2',
      full_name: 'Rohan Gupta',
      roll_number: '2',
      status: 'absent',
    },
    {
      id: 'rec-3',
      student_id: 'stu-3',
      full_name: 'Pooja Iyer',
      roll_number: '3',
      status: 'late',
    },
  ];

  it('calculates attendance statistics correctly', () => {
    const stats = calculateAttendanceStats(mockStudents);
    expect(stats.total).toBe(3);
    expect(stats.present).toBe(1);
    expect(stats.absent).toBe(1);
    expect(stats.late).toBe(1);
  });

  it('initializes in loading state and transitions to marking on FETCH_SUCCESS', () => {
    const actor = createActor(attendanceSessionMachine);
    actor.start();

    expect(actor.getSnapshot().value).toBe('loading');

    actor.send({ type: 'FETCH_SUCCESS', students: mockStudents });

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('marking');
    expect(snapshot.context.students.length).toBe(3);
    expect(snapshot.context.error).toBeNull();
  });

  it('updates individual student status and applies rapid absentees', () => {
    const actor = createActor(attendanceSessionMachine);
    actor.start();
    actor.send({ type: 'FETCH_SUCCESS', students: mockStudents });

    // Update stu-1 from present to absent
    actor.send({ type: 'UPDATE_STATUS', studentId: 'stu-1', status: 'absent' });
    expect(actor.getSnapshot().context.students[0]?.status).toBe('absent');

    // Apply rapid absentees "3" -> rolls 3 marked absent, others present
    actor.send({ type: 'APPLY_RAPID_ABSENTEES', tokens: '3' });
    const students = actor.getSnapshot().context.students;
    expect(students[0]?.status).toBe('present');
    expect(students[1]?.status).toBe('present');
    expect(students[2]?.status).toBe('absent');
  });

  it('marks all students to a single status', () => {
    const actor = createActor(attendanceSessionMachine);
    actor.start();
    actor.send({ type: 'FETCH_SUCCESS', students: mockStudents });

    actor.send({ type: 'MARK_ALL', status: 'present' });
    for (const student of actor.getSnapshot().context.students) {
      expect(student.status).toBe('present');
    }
  });

  it('handles saving lifecycle (marking -> saving -> synced)', () => {
    const actor = createActor(attendanceSessionMachine);
    actor.start();
    actor.send({ type: 'FETCH_SUCCESS', students: mockStudents });

    actor.send({ type: 'START_SAVING' });
    expect(actor.getSnapshot().value).toBe('saving');
    expect(actor.getSnapshot().context.isSaving).toBe(true);

    actor.send({ type: 'SAVE_SUCCESS' });
    expect(actor.getSnapshot().value).toBe('synced');
    expect(actor.getSnapshot().context.isSaving).toBe(false);

    // Modifying attendance returns state to marking
    actor.send({ type: 'UPDATE_STATUS', studentId: 'stu-1', status: 'late' });
    expect(actor.getSnapshot().value).toBe('marking');
  });

  it('executes executeFetchAttendanceRosterEffect in parallel with Effect-TS v4', async () => {
    const actor = createAttendanceSessionActor({
      classroomId: 'cls-101',
      date: '2026-10-26',
    });

    const mockFetchRoster = vi.fn().mockResolvedValue([
      { id: '1', student_id: 's-1', full_name: 'Student One', roll_number: 1 },
      { id: '2', student_id: 's-2', full_name: 'Student Two', roll_number: 2 },
    ]);
    const mockFetchSnapshot = vi.fn().mockResolvedValue({
      records: [{ student_id: 's-2', status: 'absent' }],
    });

    const result = await executeFetchAttendanceRosterEffect(actor, {
      classroomId: 'cls-101',
      date: '2026-10-26',
      fetchRoster: mockFetchRoster,
      fetchSnapshot: mockFetchSnapshot,
    });

    expect(result.success).toBe(true);
    expect(actor.getSnapshot().value).toBe('marking');
    const students = actor.getSnapshot().context.students;
    expect(students.length).toBe(2);
    expect(students[0]?.status).toBe('present'); // Default unmarked
    expect(students[1]?.status).toBe('absent'); // Reconciled from snapshot
  });

  it('executes executeSaveAttendanceSessionEffect with Effect-TS v4', async () => {
    const actor = createAttendanceSessionActor({
      classroomId: 'cls-101',
      date: '2026-10-26',
      students: mockStudents,
    });
    actor.send({ type: 'FETCH_SUCCESS', students: mockStudents });

    const mockSave = vi.fn().mockResolvedValue(undefined);

    const result = await executeSaveAttendanceSessionEffect(actor, mockSave);
    expect(result.success).toBe(true);
    expect(actor.getSnapshot().value).toBe('synced');
    expect(mockSave).toHaveBeenCalledWith('cls-101', '2026-10-26', [
      { student_id: 'stu-1', status: 'present' },
      { student_id: 'stu-2', status: 'absent' },
      { student_id: 'stu-3', status: 'late' },
    ]);
  });
});
