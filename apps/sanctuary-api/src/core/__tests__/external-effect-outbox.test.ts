import { describe, expect, it, vi } from 'vitest';
import type { CapabilityDescriptor } from '@repo/core/api/capabilityFoundation';
import { z } from 'zod';

const database = vi.hoisted(() => ({
  execute: vi.fn(async (..._args: unknown[]) => undefined),
  query: vi.fn(async () => []),
}));

vi.mock('@repo/database/client', () => ({
  executeDatabaseCommand: database.execute,
  queryDatabaseRows: database.query,
}));

import {
  claimPendingExternalEffects,
  enqueueExternalEffect,
  markExternalEffectDispatched,
  rescheduleExternalEffect,
} from '../externalEffectOutbox';

const descriptor: CapabilityDescriptor = {
  id: 'community.notice.release',
  lifecycle: 'external-effect',
  privacy: 'sensitive',
  idempotency: 'required',
  receipt: 'required',
  audit: 'required',
  activity: { kind: 'none' },
  telemetry: { kind: 'operational', allowedFields: ['capability', 'outcome'] },
  effect: {
    kind: 'deferred-effect',
    repairRequired: true,
    effectName: 'community/notice.release',
    payloadSchema: z.object({ noticeId: z.string().uuid() }),
  },
};

const intent = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  capability: descriptor.id,
  operationId: '123e4567-e89b-12d3-a456-426614174001',
  idempotencyKey: 'notice:123:1',
  purpose: 'release-approved-notice',
  payload: { noticeId: '123e4567-e89b-12d3-a456-426614174099', ignored: 'not persisted' },
};
const effectName = 'community/notice.release';

describe('external effect outbox', () => {
  it('claims effects with a lease token and fences both terminal updates', async () => {
    database.query.mockResolvedValueOnce([
      {
        ...intent,
        effectName,
        payload: { noticeId: '123e4567-e89b-12d3-a456-426614174099' },
        attempts: 1,
        leaseToken: '123e4567-e89b-12d3-a456-426614174088',
      },
    ]);
    const [claimed] = await claimPendingExternalEffects(1);
    const querySql = (database.query.mock.calls as unknown[][])[0]?.[0] as string;
    expect(querySql).toContain('lock_token = gen_random_uuid()');
    expect(querySql).toContain('effects.lock_token AS "leaseToken"');

    await markExternalEffectDispatched(claimed!);
    await rescheduleExternalEffect(claimed!, new Error('temporary provider outage'));
    const dispatchedCall = (database.execute.mock.calls as unknown[][])[0]!;
    const retriedCall = (database.execute.mock.calls as unknown[][])[1]!;
    expect(dispatchedCall[0] as string).toContain('lock_token = $2::uuid');
    expect(dispatchedCall[1]).toEqual([
      intent.id,
      claimed!.leaseToken,
      intent.id,
    ]);
    expect(retriedCall[0] as string).toContain('SET status = $3');
    expect(retriedCall[0] as string).toContain("available_at = now() + ($4::text || ' seconds')::interval");
    expect(retriedCall[0] as string).toContain('lock_token = $2::uuid');
    expect(retriedCall[1]).toEqual([
      intent.id,
      claimed!.leaseToken,
      'pending',
      2,
      'temporary provider outage',
    ]);
  });

  it('transitions exhausted leases into the repairable failed state', async () => {
    const exhausted = {
      ...intent,
      effectName,
      payload: { noticeId: '123e4567-e89b-12d3-a456-426614174099' },
      attempts: 8,
      leaseToken: '123e4567-e89b-12d3-a456-426614174087',
    };
    await rescheduleExternalEffect(exhausted, new Error('provider rejected request'));

    const parameters = (database.execute.mock.calls as unknown[][]).at(-1)?.[1];
    expect(parameters).toEqual([
      intent.id,
      exhausted.leaseToken,
      'failed',
      256,
      'provider rejected request',
    ]);
  });

  it('persists a descriptor-authorized effect intent transactionally', async () => {
    const execute = vi.fn(async (..._args: unknown[]) => undefined);
    await enqueueExternalEffect({ $executeRaw: execute }, descriptor, intent);

    expect(execute).toHaveBeenCalledOnce();
    expect(Array.isArray(execute.mock.calls[0]?.[0]) ? execute.mock.calls[0]?.[0].join('?') : '').toContain(
      'INSERT INTO public.external_effect_intents',
    );
    expect(execute.mock.calls[0]?.slice(1)).toEqual([
      intent.id,
      descriptor.id,
      effectName,
      intent.operationId,
      intent.idempotencyKey,
      descriptor.privacy,
      intent.purpose,
      JSON.stringify({ noticeId: '123e4567-e89b-12d3-a456-426614174099' }),
    ]);
  });

  it('rejects effects for a capability that did not explicitly admit one', async () => {
    const execute = vi.fn(async (..._args: unknown[]) => undefined);
    await expect(
      enqueueExternalEffect(
        { $executeRaw: execute },
        { ...descriptor, effect: { kind: 'none' } },
        intent,
      ),
    ).rejects.toThrow('does not admit an external effect');
    expect(execute).not.toHaveBeenCalled();
  });

  it('rejects a caller trying to enqueue under a different capability', async () => {
    await expect(
      enqueueExternalEffect(
        { $executeRaw: vi.fn(async (..._args: unknown[]) => undefined) },
        descriptor,
        { ...intent, capability: 'forged.capability' },
      ),
    ).rejects.toThrow('must match its descriptor');
  });
});
