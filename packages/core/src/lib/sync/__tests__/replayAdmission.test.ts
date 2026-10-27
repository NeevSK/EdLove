import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  closeReplayAdmission,
  isReplayAdmissionOpen,
  openReplayAdmission,
  subscribeReplayAdmission,
  tryBeginReplay,
} from '../replayAdmission';

describe('principal replay admission', () => {
  beforeEach(() => openReplayAdmission('account-a'));

  it('notifies observers only when the principal gate changes', async () => {
    const listener = vi.fn();
    const unsubscribe = subscribeReplayAdmission(listener);
    await closeReplayAdmission('account-a');
    await closeReplayAdmission('account-a');
    expect(isReplayAdmissionOpen('account-a')).toBe(false);
    expect(listener).toHaveBeenCalledTimes(1);
    openReplayAdmission('account-a');
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    await closeReplayAdmission('account-a');
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('closes claims immediately and keeps a timed-out principal closed until explicit activation', async () => {
    const inFlight = tryBeginReplay('account-a');
    expect(inFlight).not.toBeNull();

    await expect(closeReplayAdmission('account-a', 1)).rejects.toThrow(
      'Timed out waiting for account-a replay to settle.',
    );
    expect(tryBeginReplay('account-a')).toBeNull();

    inFlight?.release();
    expect(tryBeginReplay('account-a')).toBeNull();
    openReplayAdmission('account-a');
    const activated = tryBeginReplay('account-a');
    expect(activated).not.toBeNull();
    activated?.release();
  });
});
