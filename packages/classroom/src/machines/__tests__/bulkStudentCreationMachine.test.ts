import { storage } from '@repo/core/logic/managers/StorageManager';
import {
  bulkStudentCreationMachine,
  createBulkStudentCreationActor,
  executeBulkStudentImportEffect,
  restoreBulkStudentDraftSnapshot,
  saveBulkStudentDraftSnapshot,
} from '@repo/classroom/machines/bulkStudentCreationMachine';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createActor } from 'xstate';

describe('bulkStudentCreationMachine (XState v6 + Effect v4)', () => {
  beforeEach(() => {
    storage.clearAll();
  });

  it('initializes in count state with empty roster', () => {
    const actor = createActor(bulkStudentCreationMachine);
    actor.start();

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('count');
    expect(snapshot.context.totalCount).toBe('');
    expect(snapshot.context.students).toEqual([]);
    expect(snapshot.context.currentIndex).toBe(0);
  });

  it('rejects invalid student count numbers', () => {
    const actor = createActor(bulkStudentCreationMachine);
    actor.start();

    actor.send({ type: 'SET_TOTAL_COUNT', totalCount: '0' });
    actor.send({ type: 'START_ENTRY' });

    let snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('count');
    expect(snapshot.context.error).toBe('Please enter a number between 1 and 100');

    actor.send({ type: 'SET_TOTAL_COUNT', totalCount: '105' });
    actor.send({ type: 'START_ENTRY' });
    snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('count');
    expect(snapshot.context.error).toBe('Please enter a number between 1 and 100');
  });

  it('allocates student slots and advances to entry on valid count', () => {
    const actor = createActor(bulkStudentCreationMachine);
    actor.start();

    actor.send({ type: 'SET_TOTAL_COUNT', totalCount: '3' });
    actor.send({ type: 'START_ENTRY' });

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('entry');
    expect(snapshot.context.students.length).toBe(3);
    expect(snapshot.context.currentIndex).toBe(0);
    expect(snapshot.context.error).toBeNull();
  });

  it('updates current student fields and navigates between student cards', () => {
    const actor = createActor(bulkStudentCreationMachine);
    actor.start();

    actor.send({ type: 'SET_TOTAL_COUNT', totalCount: '2' });
    actor.send({ type: 'START_ENTRY' });

    // Try moving next without name & index -> error
    actor.send({ type: 'NEXT_STUDENT' });
    expect(actor.getSnapshot().value).toBe('entry');
    expect(actor.getSnapshot().context.error).toBe('Name and Index are required');

    // Fill student 0
    actor.send({ type: 'UPDATE_CURRENT_STUDENT', field: 'name', value: 'Ananya Sharma' });
    actor.send({ type: 'UPDATE_CURRENT_STUDENT', field: 'index_number', value: 'STU-001' });
    actor.send({ type: 'UPDATE_CURRENT_STUDENT', field: 'notes', value: 'Excels in science' });

    actor.send({ type: 'NEXT_STUDENT' });
    expect(actor.getSnapshot().value).toBe('entry');
    expect(actor.getSnapshot().context.currentIndex).toBe(1);

    // Step back to student 0
    actor.send({ type: 'PREV_STUDENT' });
    expect(actor.getSnapshot().context.currentIndex).toBe(0);
    expect(actor.getSnapshot().context.students[0]?.name).toBe('Ananya Sharma');

    // Return to student 1 and fill
    actor.send({ type: 'NEXT_STUDENT' });
    actor.send({ type: 'UPDATE_CURRENT_STUDENT', field: 'name', value: 'Rohan Gupta' });
    actor.send({ type: 'UPDATE_CURRENT_STUDENT', field: 'index_number', value: 'STU-002' });

    // Last student NEXT_STUDENT transitions to review
    actor.send({ type: 'NEXT_STUDENT' });
    expect(actor.getSnapshot().value).toBe('review');
  });

  it('supports editing an individual student from review mode', () => {
    const actor = createActor(bulkStudentCreationMachine);
    actor.start();

    actor.send({ type: 'SET_TOTAL_COUNT', totalCount: '2' });
    actor.send({ type: 'START_ENTRY' });
    actor.send({ type: 'GO_TO_REVIEW' });
    expect(actor.getSnapshot().value).toBe('review');

    actor.send({ type: 'EDIT_STUDENT', index: 1 });
    expect(actor.getSnapshot().value).toBe('entry');
    expect(actor.getSnapshot().context.currentIndex).toBe(1);
  });

  it('persists and restores snapshot through StorageManager', () => {
    const actor = createBulkStudentCreationActor();
    actor.send({ type: 'SET_TOTAL_COUNT', totalCount: '2' });
    actor.send({ type: 'START_ENTRY' });
    actor.send({ type: 'UPDATE_CURRENT_STUDENT', field: 'name', value: 'Pooja Iyer' });
    actor.send({ type: 'UPDATE_CURRENT_STUDENT', field: 'index_number', value: 'STU-099' });

    saveBulkStudentDraftSnapshot(actor);

    const freshActor = createBulkStudentCreationActor();
    const restored = restoreBulkStudentDraftSnapshot(freshActor);

    expect(restored).toBe(true);
    expect(freshActor.getSnapshot().value).toBe('entry');
    expect(freshActor.getSnapshot().context.students[0]?.name).toBe('Pooja Iyer');
    expect(freshActor.getSnapshot().context.students[0]?.index_number).toBe('STU-099');
  });

  it('executes executeBulkStudentImportEffect with Effect-TS v4 successfully', async () => {
    const actor = createBulkStudentCreationActor();
    actor.send({ type: 'SET_TOTAL_COUNT', totalCount: '1' });
    actor.send({ type: 'START_ENTRY' });
    actor.send({ type: 'UPDATE_CURRENT_STUDENT', field: 'name', value: 'Meera Rao' });
    actor.send({ type: 'UPDATE_CURRENT_STUDENT', field: 'index_number', value: 'STU-100' });
    actor.send({ type: 'NEXT_STUDENT' }); // transitions to review

    const mockImport = vi.fn().mockResolvedValue(undefined);
    const mockClear = vi.fn();

    const result = await executeBulkStudentImportEffect(actor, mockImport, mockClear);
    expect(result.success).toBe(true);
    expect(result.count).toBe(1);
    expect(mockImport).toHaveBeenCalledWith([
      { name: 'Meera Rao', index_number: 'STU-100', notes: '' },
    ]);
    expect(mockClear).toHaveBeenCalled();
    expect(actor.getSnapshot().value).toBe('completed');
  });

  it('handles executeBulkStudentImportEffect rejection gracefully', async () => {
    const actor = createBulkStudentCreationActor();
    actor.send({ type: 'SET_TOTAL_COUNT', totalCount: '1' });
    actor.send({ type: 'START_ENTRY' });
    actor.send({ type: 'UPDATE_CURRENT_STUDENT', field: 'name', value: 'Karan Sen' });
    actor.send({ type: 'UPDATE_CURRENT_STUDENT', field: 'index_number', value: 'STU-101' });
    actor.send({ type: 'NEXT_STUDENT' });

    const mockImport = vi.fn().mockRejectedValue(new Error('Database write constraint violation.'));

    const result = await executeBulkStudentImportEffect(actor, mockImport);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Database write constraint violation.');
    expect(actor.getSnapshot().value).toBe('review');
    expect(actor.getSnapshot().context.error).toBe('Database write constraint violation.');
  });
});
