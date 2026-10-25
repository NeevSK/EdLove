import './setup';
import { describe, expect, it } from 'vitest';
import { syncMutationQueued } from '../agents/platformEvents';
import { setMockQueryRowsQueue } from './setup';

const actorId = '123e4567-e89b-8101-8000-426614174000';
const mutationId = '223e4567-e89b-12d3-a456-426614174000';
const decisionId = '323e4567-e89b-12d3-a456-426614174000';

const runWorker = (data: Record<string, unknown>) =>
  (syncMutationQueued as any).fn({
    event: { name: 'sync/mutation-queued', data },
    step: { run: async (_name: string, callback: () => Promise<unknown>) => callback() },
  });

describe('Sanctuary platform workers', () => {
  it('rejects a queued decision whose payload actor differs from the event actor', async () => {
    setMockQueryRowsQueue([[]]);

    await expect(
      runWorker({
        mutationId,
        action: 'saveDecision',
        actorId,
        payload: { user_id: '423e4567-e89b-12d3-a456-426614174000', decision_text: 'Unsafe' },
      }),
    ).rejects.toThrow('does not own the decision journal');
  });

  it('executes a decision mutation and records a terminal worker outcome', async () => {
    setMockQueryRowsQueue([[{ id: decisionId }], [{ id: '523e4567-e89b-12d3-a456-426614174000' }]]);

    const result = await runWorker({
      mutationId,
      action: 'saveDecision',
      actorId,
      idempotencyKey: 'decision:one',
      payload: { id: decisionId, user_id: actorId, decision_text: 'Choose the patient path' },
    });

    expect(result).toMatchObject({
      mutationId,
      status: 'synced',
      result: { target: 'decision_journals', duplicate: false },
    });
  });

  it('treats a duplicate decision insert as a successful replay', async () => {
    setMockQueryRowsQueue([[], [{ id: '523e4567-e89b-12d3-a456-426614174000' }]]);

    const result = await runWorker({
      mutationId,
      action: 'saveDecision',
      actorId,
      idempotencyKey: 'decision:one',
      payload: { id: decisionId, user_id: actorId, decision_text: 'Choose the patient path' },
    });

    expect(result).toMatchObject({
      status: 'synced',
      result: { target: 'decision_journals', duplicate: true },
    });
  });
});
