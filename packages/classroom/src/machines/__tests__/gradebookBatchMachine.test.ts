import {
  createGradebookBatchActor,
  executeGradebookBatchSyncEffect,
  gradebookBatchMachine,
  restoreGradebookDraftSnapshot,
  saveGradebookDraftSnapshot,
} from '@repo/classroom/machines/gradebookBatchMachine';
import { storage } from '@repo/core/lib/storage.adapter';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createActor } from 'xstate';

describe('GradebookBatchMachine v6 + Effect-TS v4', () => {
  beforeEach(() => {
    storage.clearAll();
  });

  const mockStudents = [
    { studentId: 'stu-1', studentName: 'Kamal Perera', marks: 85 },
    { studentId: 'stu-2', studentName: 'Nimal Silva', marks: 45 },
    { studentId: 'stu-3', studentName: 'Anoma Wickramasinghe', marks: 95 },
  ];

  it('initializes in idle state', () => {
    const actor = createActor(gradebookBatchMachine);
    actor.start();

    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.students).toEqual([]);
  });

  it('loads roster, computes letter grades, and calculates ranks on LOAD_ROSTER', () => {
    const actor = createGradebookBatchActor();
    actor.send({
      type: 'LOAD_ROSTER',
      classroomId: 'class-10A',
      assignmentId: 'assign-term-1',
      assignmentTitle: 'Science Midterm',
      students: mockStudents,
    });

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('editing');
    expect(snapshot.context.students.length).toBe(3);

    const anoma = snapshot.context.students.find((s) => s.studentId === 'stu-3');
    expect(anoma?.marks).toBe(95);
    expect(anoma?.letterGrade).toBe('A');
    expect(anoma?.rank).toBe(1);

    const nimal = snapshot.context.students.find((s) => s.studentId === 'stu-2');
    expect(nimal?.marks).toBe(45);
    expect(nimal?.letterGrade).toBe('S');
    expect(nimal?.rank).toBe(3);
  });

  it('updates student score, marks student dirty, and recalculates rank', () => {
    const actor = createGradebookBatchActor();
    actor.send({
      type: 'LOAD_ROSTER',
      classroomId: 'class-10A',
      assignmentId: 'assign-term-1',
      students: mockStudents,
    });

    actor.send({
      type: 'UPDATE_SCORE',
      studentId: 'stu-2',
      marks: 98,
      feedback: 'Outstanding improvement on revision.',
    });

    let snapshot = actor.getSnapshot();
    const updatedNimal = snapshot.context.students.find((s) => s.studentId === 'stu-2');
    expect(updatedNimal?.marks).toBe(98);
    expect(updatedNimal?.letterGrade).toBe('A');
    expect(updatedNimal?.isDirty).toBe(true);
    expect(updatedNimal?.feedback).toBe('Outstanding improvement on revision.');

    actor.send({ type: 'RECALCULATE_RANKS' });
    snapshot = actor.getSnapshot();
    const reRankedNimal = snapshot.context.students.find((s) => s.studentId === 'stu-2');
    expect(reRankedNimal?.rank).toBe(1);
  });

  it('navigates through student entries using NEXT_STUDENT, PREV_STUDENT, SELECT_STUDENT', () => {
    const actor = createGradebookBatchActor();
    actor.send({
      type: 'LOAD_ROSTER',
      classroomId: 'class-10A',
      assignmentId: 'assign-term-1',
      students: mockStudents,
    });

    expect(actor.getSnapshot().context.activeStudentIndex).toBe(0);

    actor.send({ type: 'NEXT_STUDENT' });
    expect(actor.getSnapshot().context.activeStudentIndex).toBe(1);

    actor.send({ type: 'NEXT_STUDENT' });
    expect(actor.getSnapshot().context.activeStudentIndex).toBe(2);

    actor.send({ type: 'NEXT_STUDENT' }); // clamped at boundary
    expect(actor.getSnapshot().context.activeStudentIndex).toBe(2);

    actor.send({ type: 'PREV_STUDENT' });
    expect(actor.getSnapshot().context.activeStudentIndex).toBe(1);

    actor.send({ type: 'SELECT_STUDENT', index: 0 });
    expect(actor.getSnapshot().context.activeStudentIndex).toBe(0);
  });

  it('executes executeGradebookBatchSyncEffect successfully with dirty grades only', async () => {
    const actor = createGradebookBatchActor();
    actor.send({
      type: 'LOAD_ROSTER',
      classroomId: 'class-10A',
      assignmentId: 'assign-term-1',
      students: mockStudents,
    });

    // Update only stu-1
    actor.send({
      type: 'UPDATE_SCORE',
      studentId: 'stu-1',
      marks: 90,
      feedback: 'Great job',
    });

    const mockSync = vi.fn().mockResolvedValue(undefined);
    const mockPurge = vi.fn();

    const result = await executeGradebookBatchSyncEffect(actor, mockSync, mockPurge);

    expect(result.success).toBe(true);
    expect(result.syncedCount).toBe(1);
    expect(mockSync).toHaveBeenCalledWith('class-10A', 'assign-term-1', [
      { studentId: 'stu-1', marks: 90, feedback: 'Great job' },
    ]);
    expect(mockPurge).toHaveBeenCalled();
    expect(actor.getSnapshot().value).toBe('synced');
    expect(actor.getSnapshot().context.students.every((s) => !s.isDirty)).toBe(true);
  });

  it('handles executeGradebookBatchSyncEffect failure gracefully', async () => {
    const actor = createGradebookBatchActor();
    actor.send({
      type: 'LOAD_ROSTER',
      classroomId: 'class-10A',
      assignmentId: 'assign-term-1',
      students: mockStudents,
    });

    actor.send({
      type: 'UPDATE_SCORE',
      studentId: 'stu-1',
      marks: 90,
    });

    const mockSync = vi.fn().mockRejectedValue(new Error('Network server timeout'));

    const result = await executeGradebookBatchSyncEffect(actor, mockSync);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Network server timeout');
    expect(actor.getSnapshot().value).toBe('editing');
    expect(actor.getSnapshot().context.error).toBe('Network server timeout');
  });

  it('safely handles actor disposal/stop mid-flight in executeGradebookBatchSyncEffect', async () => {
    const actor = createGradebookBatchActor();
    actor.send({
      type: 'LOAD_ROSTER',
      classroomId: 'class-10A',
      assignmentId: 'assign-term-1',
      students: mockStudents,
    });

    actor.send({
      type: 'UPDATE_SCORE',
      studentId: 'stu-1',
      marks: 90,
    });

    const mockSync = vi.fn().mockImplementation(async () => {
      actor.stop();
    });

    const result = await executeGradebookBatchSyncEffect(actor, mockSync);

    expect(result.success).toBe(true);
    expect(result.syncedCount).toBe(1);
    expect(actor.getSnapshot().status).toBe('stopped');
  });

  it('persists and restores draft snapshots using partitioned keys', () => {
    const actor = createGradebookBatchActor();
    actor.send({
      type: 'LOAD_ROSTER',
      classroomId: 'class-10A',
      assignmentId: 'assign-term-1',
      students: mockStudents,
    });

    actor.send({
      type: 'UPDATE_SCORE',
      studentId: 'stu-1',
      marks: 99,
      feedback: 'Draft comment',
    });

    saveGradebookDraftSnapshot(actor, { tenantId: 'school-42', userId: 'teacher-7' });

    const freshActor = createGradebookBatchActor();
    const restored = restoreGradebookDraftSnapshot(
      freshActor,
      'class-10A',
      'assign-term-1',
      { tenantId: 'school-42', userId: 'teacher-7' },
    );

    expect(restored).toBe(true);
    const restoredStu1 = freshActor.getSnapshot().context.students.find((s) => s.studentId === 'stu-1');
    expect(restoredStu1?.marks).toBe(99);
    expect(restoredStu1?.feedback).toBe('Draft comment');

    // Cross-tenant isolation verification
    const freshActorB = createGradebookBatchActor();
    const restoredB = restoreGradebookDraftSnapshot(
      freshActorB,
      'class-10A',
      'assign-term-1',
      { tenantId: 'school-other', userId: 'teacher-7' },
    );
    expect(restoredB).toBe(false);
  });
});
