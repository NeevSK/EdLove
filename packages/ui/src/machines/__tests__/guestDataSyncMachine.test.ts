import {
  createGuestDataSyncActor,
  executeFetchGuestDataSummaryEffect,
  executeGuestDataSyncEffect,
  guestDataSyncMachine,
} from '@repo/ui/machines/guestDataSyncMachine';
import { describe, expect, it, vi } from 'vitest';
import { createActor } from 'xstate';

describe('guestDataSyncMachine (XState v6 + Effect v4)', () => {
  it('initializes in idle state with empty summary and progress', () => {
    const actor = createActor(guestDataSyncMachine);
    actor.start();

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('idle');
    expect(snapshot.context.summary.total).toBe(0);
    expect(snapshot.context.progress.current).toBe(0);
    expect(snapshot.context.error).toBeNull();
  });

  it('transitions to loading on START_LOADING, then to ready on SET_SUMMARY', () => {
    const actor = createActor(guestDataSyncMachine);
    actor.start();

    actor.send({ type: 'START_LOADING' });
    expect(actor.getSnapshot().value).toBe('loading');

    actor.send({
      type: 'SET_SUMMARY',
      summary: {
        timetablePeriods: 3,
        moodLogs: 2,
        journalEntries: 1,
        students: 5,
        total: 11,
      },
    });

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('ready');
    expect(snapshot.context.summary.total).toBe(11);
    expect(snapshot.context.summary.students).toBe(5);
  });

  it('handles confirm_skip lifecycle cleanly', () => {
    const actor = createActor(guestDataSyncMachine);
    actor.start();

    actor.send({ type: 'START_LOADING' });
    actor.send({
      type: 'SET_SUMMARY',
      summary: {
        timetablePeriods: 1,
        moodLogs: 0,
        journalEntries: 0,
        students: 0,
        total: 1,
      },
    });

    expect(actor.getSnapshot().value).toBe('ready');

    actor.send({ type: 'TRIGGER_CONFIRM_SKIP' });
    expect(actor.getSnapshot().value).toBe('confirm_skip');

    actor.send({ type: 'CANCEL_CONFIRM_SKIP' });
    expect(actor.getSnapshot().value).toBe('ready');
  });

  it('manages active sync progress updates and completes', () => {
    const actor = createActor(guestDataSyncMachine);
    actor.start();

    actor.send({ type: 'START_LOADING' });
    actor.send({
      type: 'SET_SUMMARY',
      summary: {
        timetablePeriods: 1,
        moodLogs: 1,
        journalEntries: 0,
        students: 0,
        total: 2,
      },
    });

    actor.send({ type: 'START_SYNC' });
    expect(actor.getSnapshot().value).toBe('syncing');

    actor.send({
      type: 'UPDATE_PROGRESS',
      current: 1,
      total: 2,
      step: 'Syncing timetable periods...',
    });

    let snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('syncing');
    expect(snapshot.context.progress.current).toBe(1);
    expect(snapshot.context.progress.step).toBe('Syncing timetable periods...');

    actor.send({ type: 'SET_COMPLETED' });
    snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('completed');
  });

  it('transitions to error on SET_ERROR and allows retry', () => {
    const actor = createActor(guestDataSyncMachine);
    actor.start();

    actor.send({ type: 'START_LOADING' });
    actor.send({ type: 'SET_ERROR', message: 'Network offline.' });

    let snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('error');
    expect(snapshot.context.error).toBe('Network offline.');

    // Retry transitions back to syncing or loading
    actor.send({ type: 'START_SYNC' });
    snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('syncing');
  });

  it('executes fetchGuestDataSummaryEffect with Effect-TS v4 successfully', async () => {
    const actor = createGuestDataSyncActor();

    const mockFetch = vi.fn().mockResolvedValue({
      timetablePeriods: 2,
      moodLogs: 1,
      journalEntries: 3,
      students: 4,
      total: 10,
    });

    const result = await executeFetchGuestDataSummaryEffect(actor, mockFetch);
    expect(result.success).toBe(true);
    expect(result.summary?.total).toBe(10);
    expect(actor.getSnapshot().value).toBe('ready');
  });

  it('executes executeGuestDataSyncEffect with progress and success', async () => {
    const actor = createGuestDataSyncActor();

    const mockSync = vi.fn().mockImplementation(async (_userId, onProgress) => {
      onProgress({ completed: 5, total: 10, currentStep: 'Uploading records...' });
      return { success: true };
    });

    const result = await executeGuestDataSyncEffect(actor, 'usr-123', mockSync);
    expect(result.success).toBe(true);
    expect(actor.getSnapshot().value).toBe('completed');
    expect(actor.getSnapshot().context.progress.current).toBe(5);
  });

  it('handles executeGuestDataSyncEffect failure cleanly', async () => {
    const actor = createGuestDataSyncActor();

    const mockSync = vi.fn().mockRejectedValue(new Error('Cloud endpoint unavailable.'));

    const result = await executeGuestDataSyncEffect(actor, 'usr-123', mockSync);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Cloud endpoint unavailable.');
    expect(actor.getSnapshot().value).toBe('error');
    expect(actor.getSnapshot().context.error).toBe('Cloud endpoint unavailable.');
  });
});
