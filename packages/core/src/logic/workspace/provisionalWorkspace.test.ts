import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  queueCommercialWorkspace,
  queueGuardianWorkspace,
  reconcileProvisionalWorkspaces,
  useProvisionalWorkspaceQueue,
} from './provisionalWorkspace';

const commercialInput = {
  subjectName: 'Physics',
  gradeLevel: 'A/L',
  medium: 'english' as const,
  schedule: 'Sunday',
};

describe('provisional workspace queue', () => {
  beforeEach(async () => {
    await useProvisionalWorkspaceQueue.persist.rehydrate();
    await useProvisionalWorkspaceQueue.setState({ commands: [] });
  });

  afterEach(() => vi.restoreAllMocks());

  it('waits for durable enqueue acknowledgment and blocks claim until it arrives', async () => {
    expect(useProvisionalWorkspaceQueue.persist.hasHydrated()).toBe(true);
    const acknowledgeWrites: Array<() => void> = [];
    const storageWrite = vi.spyOn(SafeZustandStorage, 'setItem').mockImplementation(() => {
      if (acknowledgeWrites.length > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        acknowledgeWrites.push(resolve);
      });
    });
    let returnedCommandId: string | undefined;
    const enqueue = queueCommercialWorkspace('principal-a', commercialInput).then((command) => {
      returnedCommandId = command.id;
      return command;
    });

    await vi.waitFor(() => expect(storageWrite).toHaveBeenCalled());
    const inMemoryCommand = useProvisionalWorkspaceQueue.getState().commands[0];
    expect(inMemoryCommand).toBeDefined();
    expect(returnedCommandId).toBeUndefined();
    if (!inMemoryCommand) throw new Error('Expected the command to remain available during save');
    await expect(
      useProvisionalWorkspaceQueue.getState().claim(inMemoryCommand.id, 'principal-a'),
    ).resolves.toBe(false);

    acknowledgeWrites.forEach((acknowledgeWrite) => acknowledgeWrite());
    const acknowledged = await enqueue;
    expect(returnedCommandId).toBe(acknowledged.id);
    expect(storageWrite.mock.calls[0]?.[0]).toBe('gurudevi-provisional-workspace-queue');
    expect(JSON.parse(storageWrite.mock.calls[0]?.[1] ?? 'null').state.commands).toContainEqual(
      expect.objectContaining({ id: acknowledged.id, status: 'queued' }),
    );
    await expect(
      useProvisionalWorkspaceQueue.getState().claim(acknowledged.id, 'principal-a'),
    ).resolves.toBe(true);
  });

  it('retains a failed append and retries the same receipt key before allowing claim', async () => {
    const persistenceError = new Error('provisional queue storage unavailable');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const storageWrite = vi
      .spyOn(SafeZustandStorage, 'setItem')
      .mockRejectedValueOnce(persistenceError)
      .mockResolvedValue(undefined);

    await expect(queueCommercialWorkspace('principal-a', commercialInput)).rejects.toBe(
      persistenceError,
    );
    const retained = useProvisionalWorkspaceQueue.getState().commands[0];
    expect(retained).toMatchObject({ principalId: 'principal-a', input: commercialInput });
    if (!retained) throw new Error('Expected failed enqueue input to remain recoverable in memory');
    await expect(
      useProvisionalWorkspaceQueue.getState().claim(retained.id, 'principal-a'),
    ).resolves.toBe(false);

    const retry = await queueCommercialWorkspace('principal-a', commercialInput);

    expect(storageWrite).toHaveBeenCalledTimes(2);
    expect(retry.id).toBe(retained.id);
    expect(retry.idempotencyKey).toBe(retained.idempotencyKey);
    expect(useProvisionalWorkspaceQueue.getState().commands).toHaveLength(1);
    await expect(
      useProvisionalWorkspaceQueue.getState().claim(retained.id, 'principal-a'),
    ).resolves.toBe(true);
  });

  it('restores queued state and never dispatches when durable claim acknowledgment fails', async () => {
    const command = await queueCommercialWorkspace('principal-a', commercialInput);
    const persistenceError = new Error('claim state could not be saved');
    const storageWrite = vi
      .spyOn(SafeZustandStorage, 'setItem')
      .mockRejectedValueOnce(persistenceError);

    await expect(
      useProvisionalWorkspaceQueue.getState().claim(command.id, 'principal-a'),
    ).rejects.toBe(persistenceError);
    expect(useProvisionalWorkspaceQueue.getState().commands[0]?.status).toBe('queued');
    expect(storageWrite).toHaveBeenCalledTimes(2);
    await expect(
      useProvisionalWorkspaceQueue.getState().claim(command.id, 'principal-a'),
    ).resolves.toBe(true);
  });

  it('keeps a committed response recoverable when its local receipt write fails', async () => {
    const command = await queueCommercialWorkspace('principal-a', commercialInput);
    await useProvisionalWorkspaceQueue.getState().claim(command.id, 'principal-a');
    const persistenceError = new Error('receipt could not be saved');
    vi.spyOn(SafeZustandStorage, 'setItem')
      .mockRejectedValueOnce(persistenceError)
      .mockResolvedValue(undefined);
    const perspective = {
      id: 'batch-1',
      kind: 'commercial' as const,
      displayName: 'Physics',
      instituteId: 'independent',
      instituteName: 'Independent Studio',
      subjectId: 'physics',
      subjectName: 'Physics',
      grade: 'A/L',
      medium: 'english' as const,
      batchId: 'batch-1',
      batchName: 'Sunday',
      role: 'lead_tutor' as const,
      displayTitle: 'Physics',
    };

    await expect(
      useProvisionalWorkspaceQueue.getState().resolve(command.id, 'principal-a', perspective),
    ).rejects.toBe(persistenceError);
    expect(useProvisionalWorkspaceQueue.getState().commands[0]?.status).toBe('dispatching');

    const dispatch = vi.fn().mockResolvedValue(perspective);
    await reconcileProvisionalWorkspaces({
      principalId: 'principal-a',
      createCommercialBatch: dispatch,
      createGuardianLink: vi.fn(),
    });

    expect(dispatch).toHaveBeenCalledWith(commercialInput, command.idempotencyKey);
    expect(useProvisionalWorkspaceQueue.getState().commands[0]?.status).toBe('reconciled');
  });

  it('keeps an interrupted command dispatching when the receipt-check write fails', async () => {
    const command = await queueCommercialWorkspace('principal-a', commercialInput);
    await useProvisionalWorkspaceQueue.getState().claim(command.id, 'principal-a');
    const persistenceError = new Error('recovery state could not be saved');
    vi.spyOn(SafeZustandStorage, 'setItem')
      .mockRejectedValueOnce(persistenceError)
      .mockResolvedValue(undefined);

    await expect(
      useProvisionalWorkspaceQueue.getState().recoverInterrupted('principal-a', command.id),
    ).rejects.toBe(persistenceError);
    expect(useProvisionalWorkspaceQueue.getState().commands[0]?.status).toBe('dispatching');
    await useProvisionalWorkspaceQueue.getState().recoverInterrupted('principal-a', command.id);
    expect(useProvisionalWorkspaceQueue.getState().commands[0]?.status).toBe('receipt_check');
  });

  it('does not mistake an in-process request for a dispatch interrupted by restart', async () => {
    const command = await queueCommercialWorkspace('principal-a', commercialInput);
    await useProvisionalWorkspaceQueue.getState().claim(command.id, 'principal-a');
    const dispatch = vi.fn();

    await useProvisionalWorkspaceQueue.getState().recoverInterrupted('principal-a');
    await reconcileProvisionalWorkspaces({
      principalId: 'principal-a',
      createCommercialBatch: dispatch,
      createGuardianLink: vi.fn(),
    });

    expect(dispatch).not.toHaveBeenCalled();
    expect(useProvisionalWorkspaceQueue.getState().commands[0]?.status).toBe('dispatching');
    await useProvisionalWorkspaceQueue.getState().recoverInterrupted('principal-a', command.id);
    expect(useProvisionalWorkspaceQueue.getState().commands[0]?.status).toBe('receipt_check');
  });

  it('keeps an offline workspace request outside active scope until a server receipt', async () => {
    await queueCommercialWorkspace('principal-a', commercialInput);

    expect(useProvisionalWorkspaceQueue.getState().commands[0]).toMatchObject({
      principalId: 'principal-a',
      kind: 'commercial-batch',
      status: 'queued',
    });

    const createCommercialBatch = vi.fn().mockResolvedValue({
      id: 'batch-1',
      kind: 'commercial',
      displayName: 'Physics',
      instituteId: 'independent',
      instituteName: 'Independent Studio',
      subjectId: 'physics',
      subjectName: 'Physics',
      grade: 'A/L',
      medium: 'english',
      batchId: 'batch-1',
      batchName: 'Sunday',
      role: 'lead_tutor',
      displayTitle: 'Physics',
    });
    const reconciled = await reconcileProvisionalWorkspaces({
      principalId: 'principal-a',
      createCommercialBatch,
      createGuardianLink: vi.fn(),
    });

    expect(createCommercialBatch).toHaveBeenCalledWith(commercialInput, expect.any(String));
    expect(reconciled).toHaveLength(1);
    expect(useProvisionalWorkspaceQueue.getState().commands[0]?.status).toBe('reconciled');
  });

  it('never replays another account’s provisional command', async () => {
    await queueGuardianWorkspace('principal-a', {
      wardUserId: 'ward-1',
      relationship: 'parent',
      wardName: 'Student One',
    });
    const createGuardianLink = vi.fn();

    await reconcileProvisionalWorkspaces({
      principalId: 'principal-b',
      createCommercialBatch: vi.fn(),
      createGuardianLink,
    });

    expect(createGuardianLink).not.toHaveBeenCalled();
    expect(useProvisionalWorkspaceQueue.getState().commands[0]?.status).toBe('queued');
  });

  it('recovers an ambiguous request through its stable server idempotency key', async () => {
    await queueCommercialWorkspace('principal-a', commercialInput);
    await reconcileProvisionalWorkspaces({
      principalId: 'principal-a',
      createCommercialBatch: vi.fn().mockRejectedValue(new TypeError('Network request failed')),
      createGuardianLink: vi.fn(),
    });
    expect(useProvisionalWorkspaceQueue.getState().commands[0]).toMatchObject({
      status: 'receipt_check',
    });

    await useProvisionalWorkspaceQueue.setState({ commands: [] });
    await queueCommercialWorkspace('principal-a', commercialInput);
    await reconcileProvisionalWorkspaces({
      principalId: 'principal-a',
      createCommercialBatch: vi.fn().mockRejectedValue({ status: 403, message: 'Forbidden' }),
      createGuardianLink: vi.fn(),
    });
    expect(useProvisionalWorkspaceQueue.getState().commands[0]).toMatchObject({
      status: 'rejected',
      lastError: 'Forbidden',
    });
  });

  it('retries an interrupted dispatch with the original key after reconnect', async () => {
    const command = await queueCommercialWorkspace('principal-a', commercialInput);
    await useProvisionalWorkspaceQueue.setState({
      commands: [{ ...command, status: 'dispatching' }],
    });
    await useProvisionalWorkspaceQueue.persist.rehydrate();
    expect(useProvisionalWorkspaceQueue.getState().commands[0]?.status).toBe('dispatching');
    const events: string[] = [];
    const storageWrite = vi
      .spyOn(SafeZustandStorage, 'setItem')
      .mockImplementation(async (_name, raw) => {
        const persisted = JSON.parse(raw) as { state: { commands: Array<{ status: string }> } };
        events.push(`write:${persisted.state.commands[0]?.status}`);
      });
    const dispatch = vi.fn().mockImplementation(async () => {
      events.push('dispatch');
      return {
        id: 'batch-1',
        kind: 'commercial' as const,
        displayName: 'Physics',
        instituteId: 'independent',
        instituteName: 'Independent Studio',
        subjectId: 'physics',
        subjectName: 'Physics',
        grade: 'A/L',
        medium: 'english' as const,
        batchId: 'batch-1',
        batchName: 'Sunday',
        role: 'lead_tutor' as const,
        displayTitle: 'Physics',
      };
    });

    await reconcileProvisionalWorkspaces({
      principalId: 'principal-a',
      createCommercialBatch: dispatch,
      createGuardianLink: vi.fn(),
    });

    expect(dispatch).toHaveBeenCalledWith(commercialInput, command.idempotencyKey);
    expect(events.indexOf('write:receipt_check')).toBeGreaterThanOrEqual(0);
    expect(events.indexOf('write:receipt_check')).toBeLessThan(events.indexOf('dispatch'));
    expect(events.indexOf('write:dispatching')).toBeLessThan(events.indexOf('dispatch'));
    expect(storageWrite).toHaveBeenCalled();
    expect(useProvisionalWorkspaceQueue.getState().commands[0]?.status).toBe('reconciled');
  });

  it('does not return a resolved perspective after the authenticated account changes', async () => {
    await queueCommercialWorkspace('principal-a', commercialInput);
    let current = true;
    const reconciled = await reconcileProvisionalWorkspaces({
      principalId: 'principal-a',
      createCommercialBatch: vi.fn().mockImplementation(async () => {
        current = false;
        return {
          id: 'batch-1',
          kind: 'commercial' as const,
          displayName: 'Physics',
          instituteId: 'independent',
          instituteName: 'Independent Studio',
          subjectId: 'physics',
          subjectName: 'Physics',
          grade: 'A/L',
          medium: 'english' as const,
          batchId: 'batch-1',
          batchName: 'Sunday',
          role: 'lead_tutor' as const,
          displayTitle: 'Physics',
        };
      }),
      createGuardianLink: vi.fn(),
      isStillCurrent: () => current,
    });

    expect(reconciled).toEqual([]);
    expect(useProvisionalWorkspaceQueue.getState().commands[0]?.status).toBe('receipt_check');
  });
});
