import {
  createGuestDataSyncActor,
  guestDataSyncMachine,
  type SyncSummary,
} from '@repo/ui/machines/guestDataSyncMachine';
import { describe, expect, it, vi } from 'vitest';
import { type AnyEventObject, createAsyncLogic, createCallbackLogic, type EventObject, waitFor } from 'xstate';

const core = vi.hoisted(() => ({ getGuestDataSummary: vi.fn(), syncAllData: vi.fn() }));
vi.mock('@repo/core/native/guestDataSync', () => ({ GuestDataSync: core }));

const SUMMARY: SyncSummary = {
  timetablePeriods: 2,
  moodLogs: 1,
  journalEntries: 3,
  students: 4,
  total: 10,
};

type Progress = { completed: number; total: number; currentStep: string };
type TransferResult = { success: boolean; errors: string[] };

/** The machine with its two jobs replaced: no device storage, no network. */
function machineWith(
  load: () => Promise<SyncSummary>,
  transfer: (
    userId: string,
    onProgress: (p: Progress) => void,
  ) => Promise<TransferResult> = async () => ({
    success: true,
    errors: [],
  }),
) {
  return guestDataSyncMachine.provide({
    actors: {
      loadSummary: createAsyncLogic<SyncSummary, void>({ run: load }),
      transfer: createCallbackLogic<EventObject, { userId: string }>(({ input, sendBack }) => {
        let active = true;
        const send = (event: AnyEventObject) => {
          if (active) sendBack(event);
        };
        transfer(input.userId, (p) =>
          send({
            type: 'TRANSFER_PROGRESS',
            current: p.completed,
            total: p.total,
            step: p.currentStep,
          }),
        ).then(
          (r) =>
            send(
              r.success
                ? { type: 'TRANSFER_DONE' }
                : { type: 'TRANSFER_FAILED', message: r.errors.join(', ') },
            ),
          (e: Error) => send({ type: 'TRANSFER_FAILED', message: e.message }),
        );
        return () => {
          active = false;
        };
      }),
    },
  });
}

describe('guestDataSyncMachine / G1, real XState, jobs provided', () => {
  it('starts idle with nothing counted', () => {
    const actor = createGuestDataSyncActor(
      undefined,
      machineWith(async () => SUMMARY),
    );
    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context).toMatchObject({ summary: { total: 0 }, error: null });
  });

  it('counts what is on the device when loading starts', async () => {
    const actor = createGuestDataSyncActor(
      undefined,
      machineWith(async () => SUMMARY),
    );
    actor.send({ type: 'START_LOADING' });
    expect(actor.getSnapshot().value).toBe('loading');
    const ready = await waitFor(actor, (s) => s.matches('ready'));
    expect(ready.context.summary).toEqual(SUMMARY);
  });

  it('shows the error when counting fails, and can try again', async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(new Error('storage locked'))
      .mockResolvedValue(SUMMARY);
    const actor = createGuestDataSyncActor(undefined, machineWith(load));
    actor.send({ type: 'START_LOADING' });
    const failed = await waitFor(actor, (s) => s.matches('error'));
    expect(failed.context.error).toBe('storage locked');
    actor.send({ type: 'START_LOADING' });
    await waitFor(actor, (s) => s.matches('ready'));
  });

  it('asks before discarding data, and goes back on cancel', async () => {
    const actor = createGuestDataSyncActor(
      undefined,
      machineWith(async () => SUMMARY),
    );
    actor.send({ type: 'START_LOADING' });
    await waitFor(actor, (s) => s.matches('ready'));
    actor.send({ type: 'TRIGGER_CONFIRM_SKIP' });
    expect(actor.getSnapshot().value).toBe('confirm_skip');
    actor.send({ type: 'CANCEL_CONFIRM_SKIP' });
    expect(actor.getSnapshot().value).toBe('ready');
  });

  it('moves the data for this account, reporting progress, then completes', async () => {
    const transfer = vi.fn(async (_userId: string, onProgress: (p: Progress) => void) => {
      onProgress({ completed: 5, total: 10, currentStep: 'Uploading records...' });
      return { success: true, errors: [] };
    });
    const actor = createGuestDataSyncActor(
      { userId: 'usr-123' },
      machineWith(async () => SUMMARY, transfer),
    );
    actor.send({ type: 'START_SYNC' });
    const done = await waitFor(actor, (s) => s.status === 'done');
    expect(done.value).toBe('completed');
    expect(done.context.progress).toEqual({ current: 5, total: 10, step: 'Uploading records...' });
    expect(transfer).toHaveBeenCalledWith('usr-123', expect.any(Function));
  });

  it.each([
    [
      'reports failures',
      async () => ({ success: false, errors: ['moods', 'journal'] }),
      'moods, journal',
    ],
    [
      'throws',
      async () => Promise.reject(new Error('Cloud endpoint unavailable.')),
      'Cloud endpoint unavailable.',
    ],
  ])('shows the error when the transfer %s', async (_name, transfer, message) => {
    const actor = createGuestDataSyncActor(
      { userId: 'u' },
      machineWith(async () => SUMMARY, transfer),
    );
    actor.send({ type: 'START_SYNC' });
    const failed = await waitFor(actor, (s) => s.matches('error'));
    expect(failed.context.error).toBe(message);
  });

  it('ignores a count that finishes after the modal closed', async () => {
    let finish!: (s: SyncSummary) => void;
    const actor = createGuestDataSyncActor(
      undefined,
      machineWith(() => new Promise((resolve) => (finish = resolve))),
    );
    actor.send({ type: 'START_LOADING' });
    actor.send({ type: 'RESET' });
    finish(SUMMARY);
    await Promise.resolve();
    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.summary.total).toBe(0);
  });

  it('runs the real jobs against the guest data coordinator', async () => {
    core.getGuestDataSummary.mockResolvedValue({ ...SUMMARY, extra: 'ignored' });
    core.syncAllData.mockImplementation(async (_id: string, onProgress: (p: Progress) => void) => {
      onProgress({ completed: 1, total: 2, currentStep: 'Moods' });
      return { success: true, synced: {}, errors: [] };
    });
    const actor = createGuestDataSyncActor({ userId: 'usr-9' });
    actor.send({ type: 'START_LOADING' });
    const ready = await waitFor(actor, (s) => s.matches('ready'));
    expect(ready.context.summary).toEqual(SUMMARY);
    actor.send({ type: 'START_SYNC' });
    const done = await waitFor(actor, (s) => s.status === 'done');
    expect(done.context.progress.step).toBe('Moods');
    expect(core.syncAllData).toHaveBeenCalledWith('usr-9', expect.any(Function));
  });
});
