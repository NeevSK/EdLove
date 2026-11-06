import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { dispatchDueEffects, EffectAuthorizationDenied } from './dispatcher';
import {
  OperationConflict,
  OperationOutcomeUnknown,
  OperationRecoveryRequired,
  OperationStore,
} from './store';

let fixtureCreated = false;
const accountId = '11111111-1111-8111-8111-111111111111';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 8,
  connectionTimeoutMillis: 5000,
  statement_timeout: 5000,
  idle_in_transaction_session_timeout: 5000,
});
const store = new OperationStore(pool);
const authorize = async () => {};
const input = () => ({
  accountId,
  scope: 'school:test',
  capability: 'fixture.mutate.v1',
  key: randomUUID(),
  payload: { value: 1 },
});

beforeAll(async () => {
  if (process.env.API_DATABASE_TEST !== '1' || !process.env.DATABASE_URL)
    throw new Error(
      'Explicit API_DATABASE_TEST=1 and DATABASE_URL are required; no storage substitution is permitted',
    );
  if (
    process.env.API_DATABASE_TEST_ACK !== 'isolated-foundation' ||
    !new URL(process.env.DATABASE_URL).pathname.slice(1).startsWith('pjc_api_foundation_')
  )
    throw new Error('Refusing a database outside the isolated foundation prefix');
  const database = await pool.query<{ name: string }>('select current_database() name');
  if (!database.rows[0]?.name.startsWith('pjc_api_foundation_'))
    throw new Error('Connected database is not an isolated foundation database');
  // The disposable runner applies the real migrations to public before tests;
  // there is no rewritten schema or substitute operation-store definition.
  await pool.query(
    'create table public.fixture_changes(id uuid primary key, value integer not null)',
  );
  fixtureCreated = true;
  await pool.query('insert into public.users(id) values ($1)', [accountId]);
}, 20_000);

beforeEach(async () => {
  if (!fixtureCreated) throw new Error('Isolated operation fixture was not provisioned');
  await pool.query(
    'truncate public.operation_receipts,public.external_effect_intents,public.fixture_changes',
  );
});

afterAll(async () => {
  try {
    if (fixtureCreated) {
      await pool.query(
        'truncate public.operation_receipts,public.external_effect_intents,public.fixture_changes',
      );
      await pool.query('drop table public.fixture_changes');
      await pool.query('delete from public.users where id=$1', [accountId]);
    }
  } finally {
    await pool.end();
  }
});

describe('durable operation and effect contracts against real PostgreSQL', () => {
  it('applies configured deadlines inside durable transactions', async () => {
    const configured = new OperationStore(pool, {
      statementTimeoutMs: 120_000,
      lockTimeoutMs: 61_000,
      idleTransactionTimeoutMs: 20_000,
    });
    const result = await configured.execute(input(), {
      authorize,
      mutate: async (client) => {
        const settings = await client.query<{ statement: string; lock: string; idle: string }>(
          `select current_setting('statement_timeout') as statement,
            current_setting('lock_timeout') as lock,
            current_setting('idle_in_transaction_session_timeout') as idle`,
        );
        return settings.rows[0] ?? null;
      },
    });
    expect(result.result).toEqual({ statement: '2min', lock: '61s', idle: '20s' });
  });
  it.each(['before-commit', 'after-commit'] as const)(
    'recovers safely with the same key after an unknown outcome %s',
    async (fault) => {
      const command = input();
      let injected = false;
      let armed = false;
      let querySpy: ReturnType<typeof vi.spyOn> | undefined;
      const callbacks = {
        authorize,
        mutate: async (
          client: import('pg').PoolClient,
          enqueue: Parameters<Parameters<OperationStore['execute']>[1]['mutate']>[1],
        ) => {
          await client.query('insert into public.fixture_changes values ($1,1)', [randomUUID()]);
          await enqueue({
            name: 'notify',
            key: 'completion',
            payload: { publicReference: 'fixture' },
            privacyClass: 'minimal',
            purpose: 'integration fixture',
          });
          if (!armed) {
            armed = true;
            querySpy = vi.spyOn(client, 'query').mockImplementationOnce(async (sql, values) => {
              querySpy?.mockRestore();
              expect(sql).toContain('update public.operation_receipts');
              const result = await client.query(sql, values);
              querySpy = vi.spyOn(client, 'query').mockImplementationOnce(async (commitSql) => {
                expect(commitSql).toBe('commit');
                injected = true;
                if (fault === 'after-commit') await client.query('commit');
                throw new Error('Simulated lost commit outcome');
              });
              return result;
            });
          }
          return { value: 1 };
        },
      };
      try {
        await expect(store.execute(command, callbacks)).rejects.toBeInstanceOf(
          OperationOutcomeUnknown,
        );
      } finally {
        querySpy?.mockRestore();
      }
      expect(injected).toBe(true);
      const recovered = await store.execute(command, callbacks);
      expect(recovered.result).toEqual({ value: 1 });
      expect(recovered.replayed).toBe(fault === 'after-commit');
      const replayed = await store.execute(command, callbacks);
      expect(replayed).toEqual({ ...recovered, replayed: true });
      expect((await pool.query('select * from public.fixture_changes')).rows).toHaveLength(1);
      expect((await pool.query('select * from public.operation_receipts')).rows).toHaveLength(1);
      expect((await pool.query('select * from public.external_effect_intents')).rows).toHaveLength(
        1,
      );
    },
  );

  it('commits once across concurrent retries, replays the result and enqueues atomically', async () => {
    const command = input();
    let mutations = 0;
    const callbacks = {
      authorize,
      mutate: async (
        client: import('pg').PoolClient,
        enqueue: Parameters<Parameters<OperationStore['execute']>[1]['mutate']>[1],
      ) => {
        mutations++;
        await client.query(`insert into public.fixture_changes values ($1,1)`, [randomUUID()]);
        await enqueue({
          name: 'notify',
          key: 'completion',
          payload: { publicReference: 'fixture' },
          privacyClass: 'minimal',
          purpose: 'integration fixture',
        });
        return { value: 1 };
      },
    };
    const results = await Promise.all(
      Array.from({ length: 5 }, () => store.execute(command, callbacks)),
    );
    expect(mutations).toBe(1);
    expect(new Set(results.map((result) => result.operationId)).size).toBe(1);
    expect(results.filter((result) => !result.replayed)).toHaveLength(1);
    expect((await pool.query(`select * from public.external_effect_intents`)).rows).toHaveLength(1);
    expect((await pool.query(`select * from public.fixture_changes`)).rows).toHaveLength(1);
  });

  it('rejects payload and scope changes under the same operation key', async () => {
    const command = input();
    await store.execute(command, { authorize, mutate: async () => 'first' });
    await expect(
      store.execute(
        { ...command, payload: { value: 2 } },
        { authorize, mutate: async () => 'bad' },
      ),
    ).rejects.toBeInstanceOf(OperationConflict);
    await expect(
      store.execute(
        { ...command, scope: 'school:other' },
        { authorize, mutate: async () => 'bad' },
      ),
    ).rejects.toBeInstanceOf(OperationConflict);
  });

  it('rechecks current authority before exposing a committed replay', async () => {
    const command = input();
    await store.execute(command, { authorize, mutate: async () => 'private-result' });
    let read = false;
    await expect(
      store.execute(command, {
        authorize: async () => {
          throw new Error('denied');
        },
        mutate: async () => {
          read = true;
          return null;
        },
      }),
    ).rejects.toThrow('denied');
    expect(read).toBe(false);
  });

  it('rolls back receipt, mutation and outbox when work fails', async () => {
    await expect(
      store.execute(input(), {
        authorize,
        mutate: async (client, enqueue) => {
          await client.query(`insert into public.fixture_changes values ($1,1)`, [randomUUID()]);
          await enqueue({
            name: 'notify',
            key: 'notice',
            payload: {},
            privacyClass: 'minimal',
            purpose: 'fixture',
          });
          throw new Error('fixture mutation failed');
        },
      }),
    ).rejects.toThrow('fixture mutation failed');
    const totals = await pool.query<{ receipts: number; effects: number; changes: number }>(`
      select (select count(*)::integer from public.operation_receipts) receipts,
             (select count(*)::integer from public.external_effect_intents) effects,
             (select count(*)::integer from public.fixture_changes) changes`);
    expect(totals.rows[0]).toEqual({ receipts: 0, effects: 0, changes: 0 });
  });

  it('rolls back receipt, mutation and effect when authority expires during work', async () => {
    let deadline: Date | undefined;
    let checks = 0;
    await expect(
      store.execute(input(), {
        authorize: async (client) => {
          checks++;
          const current = await client.query<{ active: boolean }>(
            'select $1::timestamptz is null or clock_timestamp() < $1::timestamptz as active',
            [deadline ?? null],
          );
          if (!current.rows[0]?.active) throw new Error('fixture authority expired');
        },
        mutate: async (client, enqueue) => {
          await client.query('insert into public.fixture_changes values ($1,1)', [randomUUID()]);
          await enqueue({
            name: 'notify',
            key: 'notice',
            payload: {},
            privacyClass: 'minimal',
            purpose: 'fixture',
          });
          deadline = (
            await client.query<{ deadline: Date }>(
              `select clock_timestamp()+interval '200 milliseconds' as deadline`,
            )
          ).rows[0]?.deadline;
          if (!deadline) throw new Error('Expected fixture authority deadline');
          await client.query('select pg_sleep(0.25)');
          return null;
        },
      }),
    ).rejects.toThrow('fixture authority expired');
    expect(checks).toBe(3);
    const totals = await pool.query<{ receipts: number; effects: number; changes: number }>(`
      select (select count(*)::integer from public.operation_receipts) receipts,
             (select count(*)::integer from public.external_effect_intents) effects,
             (select count(*)::integer from public.fixture_changes) changes`);
    expect(totals.rows[0]).toEqual({ receipts: 0, effects: 0, changes: 0 });
  });

  it('never silently re-executes a historical pending operation', async () => {
    const command = input();
    const first = await store.execute(command, { authorize, mutate: async () => null });
    await pool.query(
      `update public.operation_receipts set status='pending' where operation_id=$1`,
      [first.operationId],
    );
    await expect(
      store.execute(command, { authorize, mutate: async () => 'bad' }),
    ).rejects.toBeInstanceOf(OperationRecoveryRequired);
  });

  it('rolls back if the caller cancels before commit', async () => {
    const controller = new AbortController();
    await expect(
      store.execute(input(), {
        authorize,
        signal: controller.signal,
        mutate: async (client) => {
          await client.query(`insert into public.fixture_changes values ($1,1)`, [randomUUID()]);
          controller.abort();
          return null;
        },
      }),
    ).rejects.toThrow();
    expect((await pool.query(`select * from public.fixture_changes`)).rows).toHaveLength(0);
  });

  async function enqueue(maxAttempts = 5) {
    await store.execute(input(), {
      authorize,
      mutate: async (_client, write) => {
        await write({
          name: 'notify',
          key: 'notice',
          payload: {},
          privacyClass: 'minimal',
          purpose: 'fixture',
          maxAttempts,
        });
        return null;
      },
    });
  }
  const claimOptions = {
    capability: 'fixture.mutate.v1',
    effectName: 'notify',
    limit: 5,
    leaseMs: 5000,
  };

  it('bounds one poll across handlers and rotates service between backlogged handlers', async () => {
    for (const name of ['first', 'first', 'second', 'second']) {
      await store.execute(input(), {
        authorize,
        mutate: async (_client, write) => {
          await write({
            name,
            key: 'notice',
            payload: {},
            privacyClass: 'minimal',
            purpose: 'fixture',
          });
          return null;
        },
      });
    }
    const sent: string[] = [];
    const handlers = ['first', 'second'].map((effectName) => ({
      capability: claimOptions.capability,
      effectName,
      authorize: async () => {},
      dispatch: async () => {
        sent.push(effectName);
        return { providerEventId: randomUUID() };
      },
    }));
    const options = {
      signal: new AbortController().signal,
      leaseMs: 5000,
      limit: 1,
      retryAfterMs: 1000,
    };
    await dispatchDueEffects(store, handlers, options);
    expect(sent).toHaveLength(1);
    await dispatchDueEffects(store, handlers, options);
    expect(sent).toEqual(['first', 'second']);
  });

  it('orders fresh and expired work by when each became eligible without consuming recovery attempts', async () => {
    await enqueue();
    const original = (await store.claim({ ...claimOptions, limit: 1 }))[0];
    if (!original) throw new Error('Expected initial claim');
    await enqueue();
    // The original creation time is deliberately oldest, but its latest lease
    // expires after the fresh work becomes available.
    await pool.query(
      `update public.external_effect_intents
       set available_at=case when id=$1 then clock_timestamp()-interval '1 hour'
                             else clock_timestamp()-interval '2 seconds' end,
           locked_until=case when id=$1 then clock_timestamp()-interval '1 second'
                             else locked_until end`,
      [original.id],
    );
    const fresh = (await store.claim({ ...claimOptions, limit: 1 }))[0];
    expect(fresh?.id).not.toBe(original.id);
    expect(fresh?.recoveryRequired).toBe(false);
    const recovery = (await store.claim({ ...claimOptions, limit: 1 }))[0];
    expect(recovery?.id).toBe(original.id);
    expect(recovery?.recoveryRequired).toBe(true);
    expect(recovery?.attempts).toBe(1);
  });

  it('does not starve an older eligible recovery when fresh work arrives', async () => {
    await enqueue();
    const original = (await store.claim({ ...claimOptions, limit: 1 }))[0];
    if (!original) throw new Error('Expected initial claim');
    await enqueue();
    await pool.query(
      `update public.external_effect_intents
       set available_at=case when id<>$1 then clock_timestamp()-interval '1 second'
                             else available_at end,
           locked_until=case when id=$1 then clock_timestamp()-interval '2 seconds'
                             else locked_until end`,
      [original.id],
    );
    const recovery = (await store.claim({ ...claimOptions, limit: 1 }))[0];
    expect(recovery?.id).toBe(original.id);
    expect(recovery?.recoveryRequired).toBe(true);
    expect(recovery?.attempts).toBe(1);
    const fresh = (await store.claim({ ...claimOptions, limit: 1 }))[0];
    expect(fresh?.id).not.toBe(original.id);
    expect(fresh?.recoveryRequired).toBe(false);
  });

  it('keeps fresh and recovery claims disjoint across concurrent workers', async () => {
    await enqueue();
    const original = (await store.claim({ ...claimOptions, limit: 1 }))[0];
    if (!original) throw new Error('Expected initial claim');
    await enqueue();
    await pool.query(
      `update public.external_effect_intents set locked_until=clock_timestamp()-interval '1 second' where id=$1`,
      [original.id],
    );
    const claims = (
      await Promise.all([
        store.claim({ ...claimOptions, limit: 1 }),
        store.claim({ ...claimOptions, limit: 1 }),
      ])
    ).flat();
    expect(claims).toHaveLength(2);
    expect(new Set(claims.map((claim) => claim.id)).size).toBe(2);
    const recovered = claims.find((claim) => claim.id === original.id);
    expect(recovered?.recoveryRequired).toBe(true);
    expect(recovered?.attempts).toBe(1);
    expect(recovered?.lock_token).not.toBe(original.lock_token);
    expect(await store.acknowledge(original, 'stale-worker')).toBe(false);
  });

  it('leases each effect only when ready to dispatch and does not retry it in the same poll', async () => {
    await enqueue();
    await enqueue();
    const sent: string[] = [];
    const outcome = await dispatchDueEffects(
      store,
      [
        {
          capability: claimOptions.capability,
          effectName: claimOptions.effectName,
          authorize: async () => {},
          dispatch: async (claim) => {
            sent.push(claim.id);
            if (sent.length === 1) {
              const waiting = await pool.query<{ status: string; attempts: number }>(
                `select status,attempts from public.external_effect_intents where id<>$1`,
                [claim.id],
              );
              expect(waiting.rows).toEqual([{ status: 'pending', attempts: 0 }]);
              // Simulate a slow provider that outlives its lease without a wall-clock sleep.
              await pool.query(
                `update public.external_effect_intents set locked_until=clock_timestamp()-interval '1 second' where id=$1`,
                [claim.id],
              );
            }
            return { providerEventId: 'synthetic-provider' };
          },
        },
      ],
      { signal: new AbortController().signal, leaseMs: 5000, limit: 5, retryAfterMs: 100 },
    );
    expect(sent).toHaveLength(2);
    expect(new Set(sent).size).toBe(2);
    expect(outcome).toEqual({ acknowledged: 1, failed: 0, uncertain: 1 });
  });

  it('bounds cleanup of exhausted expired claims per poll', async () => {
    await enqueue(1);
    await enqueue(1);
    await enqueue(1);
    expect(await store.claim({ ...claimOptions, limit: 3 })).toHaveLength(3);
    await pool.query(
      `update public.external_effect_intents set locked_until=clock_timestamp()-interval '1 second'`,
    );
    expect(await store.claim({ ...claimOptions, limit: 1 })).toHaveLength(0);
    const counts = await pool.query<{ status: string; count: number }>(
      `select status,count(*)::integer as count from public.external_effect_intents group by status order by status`,
    );
    expect(counts.rows).toEqual([
      { status: 'dispatching', count: 2 },
      { status: 'failed', count: 1 },
    ]);
  });

  it('gives concurrent workers disjoint claims and persists provider acknowledgement', async () => {
    await Promise.all([enqueue(), enqueue()]);
    const workers = await Promise.all([store.claim(claimOptions), store.claim(claimOptions)]);
    const all = workers.flat();
    expect(all).toHaveLength(2);
    expect(new Set(all.map((item) => item.id)).size).toBe(2);
    const first = all[0];
    if (!first) throw new Error('Expected claim');
    expect(await store.acknowledge(first, 'provider-reference')).toBe(true);
    expect(await store.acknowledge(first, 'provider-reference')).toBe(false);
  });

  it('retains an uncertain lease when acknowledgement fails after provider acceptance', async () => {
    await enqueue();
    const acknowledgement = vi
      .spyOn(store, 'acknowledge')
      .mockRejectedValueOnce(new Error('fixture'));
    let sends = 0;
    try {
      const outcome = await dispatchDueEffects(
        store,
        [
          {
            capability: claimOptions.capability,
            effectName: 'notify',
            authorize: async () => {},
            dispatch: async () => {
              sends++;
              return { providerEventId: 'provider-accepted' };
            },
          },
        ],
        { signal: new AbortController().signal, leaseMs: 30000, limit: 5, retryAfterMs: 100 },
      );
      expect(outcome).toEqual({ acknowledged: 0, failed: 0, uncertain: 1 });
      expect(sends).toBe(1);
      const row = (
        await pool.query<{ status: string; attempts: number; last_error: string | null }>(
          'select status,attempts,last_error from public.external_effect_intents',
        )
      ).rows[0];
      expect(row).toEqual({ status: 'dispatching', attempts: 1, last_error: null });
      expect(await store.claim(claimOptions)).toHaveLength(0);
    } finally {
      acknowledgement.mockRestore();
    }
  });

  it('retains an uncertain lease when a provider call throws after it begins', async () => {
    await enqueue();
    let sends = 0;
    const outcome = await dispatchDueEffects(
      store,
      [
        {
          capability: claimOptions.capability,
          effectName: 'notify',
          authorize: async () => {},
          dispatch: async () => {
            sends++;
            throw new Error('provider outcome unknown');
          },
        },
      ],
      { signal: new AbortController().signal, leaseMs: 30000, limit: 5, retryAfterMs: 100 },
    );
    expect(outcome).toEqual({ acknowledged: 0, failed: 0, uncertain: 1 });
    expect(sends).toBe(1);
    const row = (
      await pool.query<{ id: string; status: string; attempts: number; last_error: string | null }>(
        'select id,status,attempts,last_error from public.external_effect_intents',
      )
    ).rows[0];
    if (!row) throw new Error('Expected claimed effect');
    expect(row).toMatchObject({ status: 'dispatching', attempts: 1, last_error: null });
    expect(await store.claim(claimOptions)).toHaveLength(0);
    await pool.query(
      `update public.external_effect_intents set locked_until=clock_timestamp()-interval '1 second' where id=$1`,
      [row.id],
    );
    expect(await store.claim(claimOptions)).toHaveLength(1);
  });

  it('does not send or consume attempts when expired work has no resolved recovery', async () => {
    await enqueue();
    const first = (await store.claim(claimOptions))[0];
    if (!first) throw new Error('Expected claim');
    let sends = 0;
    const handler = {
      capability: claimOptions.capability,
      effectName: claimOptions.effectName,
      authorize: async () => {},
      dispatch: async () => {
        sends++;
        return { providerEventId: 'unexpected' };
      },
    };
    const options = {
      signal: new AbortController().signal,
      leaseMs: 5000,
      limit: 1,
      retryAfterMs: 100,
    };
    for (const recover of [
      undefined,
      async () => ({ status: 'unresolved' as const }),
      async () => {
        throw new Error('provider unavailable');
      },
    ]) {
      await pool.query(
        `update public.external_effect_intents set locked_until=clock_timestamp()-interval '1 second' where id=$1`,
        [first.id],
      );
      expect(await dispatchDueEffects(store, [{ ...handler, recover }], options)).toEqual({
        acknowledged: 0,
        failed: 0,
        uncertain: 1,
      });
      const row = await pool.query<{ attempts: number; status: string }>(
        'select attempts,status from public.external_effect_intents where id=$1',
        [first.id],
      );
      expect(row.rows[0]).toEqual({ attempts: 1, status: 'dispatching' });
    }
    expect(sends).toBe(0);
  });

  it('acknowledges verified recovery without dispatching again', async () => {
    await enqueue();
    const first = (await store.claim(claimOptions))[0];
    if (!first) throw new Error('Expected claim');
    await pool.query(
      `update public.external_effect_intents set locked_until=clock_timestamp()-interval '1 second' where id=$1`,
      [first.id],
    );
    let sends = 0;
    const outcome = await dispatchDueEffects(
      store,
      [
        {
          capability: claimOptions.capability,
          effectName: claimOptions.effectName,
          authorize: async () => {},
          recover: async () => ({ status: 'accepted', providerEventId: 'verified-provider' }),
          dispatch: async () => {
            sends++;
            return { providerEventId: 'unexpected' };
          },
        },
      ],
      { signal: new AbortController().signal, leaseMs: 5000, limit: 1, retryAfterMs: 100 },
    );
    expect(outcome).toEqual({ acknowledged: 1, failed: 0, uncertain: 0 });
    expect(sends).toBe(0);
    const row = await pool.query<{ status: string; attempts: number; provider_event_id: string }>(
      'select status,attempts,provider_event_id from public.external_effect_intents where id=$1',
      [first.id],
    );
    expect(row.rows[0]).toEqual({
      status: 'dispatched',
      attempts: 1,
      provider_event_id: 'verified-provider',
    });
  });

  it('keeps recovered work uncertain if authorization fails before recovery', async () => {
    await enqueue();
    const first = (await store.claim(claimOptions))[0];
    if (!first) throw new Error('Expected claim');
    await pool.query(
      `update public.external_effect_intents set locked_until=clock_timestamp()-interval '1 second' where id=$1`,
      [first.id],
    );
    let sends = 0;
    const result = await dispatchDueEffects(
      store,
      [
        {
          capability: claimOptions.capability,
          effectName: claimOptions.effectName,
          authorize: async () => {
            throw new EffectAuthorizationDenied();
          },
          dispatch: async () => {
            sends++;
            return { providerEventId: 'unexpected' };
          },
        },
      ],
      { signal: new AbortController().signal, leaseMs: 5000, limit: 1, retryAfterMs: 100 },
    );
    expect(result).toEqual({ acknowledged: 0, failed: 0, uncertain: 1 });
    expect(sends).toBe(0);
    const row = await pool.query<{ status: string; attempts: number }>(
      'select status,attempts from public.external_effect_intents where id=$1',
      [first.id],
    );
    expect(row.rows[0]).toEqual({ status: 'dispatching', attempts: 1 });
  });

  it('keeps recovered work uncertain if cancelled after retry admission', async () => {
    await enqueue();
    const first = (await store.claim(claimOptions))[0];
    if (!first) throw new Error('Expected claim');
    await pool.query(
      `update public.external_effect_intents set locked_until=clock_timestamp()-interval '1 second' where id=$1`,
      [first.id],
    );
    const controller = new AbortController();
    const original = store.startRecoveredAttempt.bind(store);
    const admission = vi.spyOn(store, 'startRecoveredAttempt').mockImplementation(async (claim) => {
      const accepted = await original(claim);
      controller.abort();
      return accepted;
    });
    let sends = 0;
    try {
      const result = await dispatchDueEffects(
        store,
        [
          {
            capability: claimOptions.capability,
            effectName: claimOptions.effectName,
            authorize: async () => {},
            recover: async () => ({ status: 'retry' }),
            dispatch: async () => {
              sends++;
              return { providerEventId: 'unexpected' };
            },
          },
        ],
        { signal: controller.signal, leaseMs: 5000, limit: 1, retryAfterMs: 100 },
      );
      expect(result).toEqual({ acknowledged: 0, failed: 0, uncertain: 1 });
      expect(sends).toBe(0);
      const row = await pool.query<{ status: string; attempts: number }>(
        'select status,attempts from public.external_effect_intents where id=$1',
        [first.id],
      );
      expect(row.rows[0]).toEqual({ status: 'dispatching', attempts: 2 });
    } finally {
      admission.mockRestore();
    }
  });

  it('requires current authority and a live fence before a recovered retry', async () => {
    await enqueue();
    const first = (await store.claim(claimOptions))[0];
    if (!first) throw new Error('Expected claim');
    const options = {
      signal: new AbortController().signal,
      leaseMs: 5000,
      limit: 1,
      retryAfterMs: 100,
    };
    let sends = 0;
    let checks = 0;
    const handler = {
      capability: claimOptions.capability,
      effectName: claimOptions.effectName,
      authorize: async () => {
        if (++checks === 2) throw new Error('revoked');
      },
      recover: async () => ({ status: 'retry' as const }),
      dispatch: async () => {
        sends++;
        return { providerEventId: 'provider' };
      },
    };
    await pool.query(
      `update public.external_effect_intents set locked_until=clock_timestamp()-interval '1 second' where id=$1`,
      [first.id],
    );
    expect(await dispatchDueEffects(store, [handler], options)).toEqual({
      acknowledged: 0,
      failed: 0,
      uncertain: 1,
    });
    expect(sends).toBe(0);
    await pool.query(
      `update public.external_effect_intents set locked_until=clock_timestamp()-interval '1 second' where id=$1`,
      [first.id],
    );
    const stale = {
      ...handler,
      authorize: async () => {},
      recover: async (claim: import('./store').ClaimedEffect) => {
        await pool.query(
          `update public.external_effect_intents set locked_until=clock_timestamp()-interval '1 second' where id=$1`,
          [claim.id],
        );
        return { status: 'retry' as const };
      },
    };
    expect(await dispatchDueEffects(store, [stale], options)).toEqual({
      acknowledged: 0,
      failed: 0,
      uncertain: 1,
    });
    expect(sends).toBe(0);
    await pool.query(
      `update public.external_effect_intents set locked_until=clock_timestamp()-interval '1 second' where id=$1`,
      [first.id],
    );
    expect(
      await dispatchDueEffects(store, [{ ...handler, authorize: async () => {} }], options),
    ).toEqual({ acknowledged: 1, failed: 0, uncertain: 0 });
    expect(sends).toBe(1);
    const row = await pool.query<{ attempts: number }>(
      'select attempts from public.external_effect_intents where id=$1',
      [first.id],
    );
    expect(row.rows[0]?.attempts).toBe(2);
  });

  it('backs off a cancelled attempt when dispatch has not started', async () => {
    await enqueue();
    const controller = new AbortController();
    let sends = 0;
    const outcome = await dispatchDueEffects(
      store,
      [
        {
          capability: claimOptions.capability,
          effectName: 'notify',
          authorize: async () => controller.abort(),
          dispatch: async () => {
            sends++;
            return { providerEventId: 'not-sent' };
          },
        },
      ],
      { signal: controller.signal, leaseMs: 30000, limit: 5, retryAfterMs: 1000 },
    );
    expect(outcome).toEqual({ acknowledged: 0, failed: 1, uncertain: 0 });
    expect(sends).toBe(0);
    const row = (
      await pool.query<{ status: string; last_error: string }>(
        'select status,last_error from public.external_effect_intents',
      )
    ).rows[0];
    expect(row).toEqual({ status: 'pending', last_error: 'dispatch_failed' });
  });

  it('fences old workers after lease expiry and takeover', async () => {
    await enqueue();
    const first = (await store.claim(claimOptions))[0];
    if (!first) throw new Error('Expected claim');
    await pool.query(
      `update public.external_effect_intents set locked_until=clock_timestamp()-interval '1 second' where id=$1`,
      [first.id],
    );
    expect(await store.acknowledge(first, 'late')).toBe(false);
    const second = (await store.claim(claimOptions))[0];
    if (!second) throw new Error('Expected reclaimed intent');
    expect(second.lock_token).not.toBe(first.lock_token);
    expect(await store.fail(first, { retryAfterMs: 100 })).toBe(false);
    expect(await store.acknowledge(second, 'current')).toBe(true);
  });

  it('bounds fenced acknowledgement lock waits and can recover afterward', async () => {
    await enqueue();
    const bounded = new OperationStore(pool, { lockTimeoutMs: 250 });
    const claim = (await bounded.claim({ ...claimOptions, leaseMs: 30000 }))[0];
    if (!claim) throw new Error('Expected claim');
    const blocker = await pool.connect();
    let releaseTimer: ReturnType<typeof setTimeout> | undefined;
    try {
      await blocker.query('begin');
      await blocker.query('select id from public.external_effect_intents where id=$1 for update', [
        claim.id,
      ]);
      releaseTimer = setTimeout(() => {
        void blocker.query('rollback');
      }, 5000);
      await expect(bounded.acknowledge(claim, 'accepted')).rejects.toMatchObject({ code: '55P03' });
    } finally {
      clearTimeout(releaseTimer);
      await blocker.query('rollback');
      blocker.release();
    }
    expect(await bounded.acknowledge(claim, 'accepted')).toBe(true);
  });

  it('bounds retries and retains exhausted ambiguous work for repair', async () => {
    await enqueue(1);
    const first = (await store.claim(claimOptions))[0];
    if (!first) throw new Error('Expected claim');
    await pool.query(
      `update public.external_effect_intents set locked_until=clock_timestamp()-interval '1 second' where id=$1`,
      [first.id],
    );
    expect(await store.claim(claimOptions)).toHaveLength(0);
    const row = (
      await pool.query<{ status: string; last_error: string }>(
        `select status,last_error from public.external_effect_intents where id=$1`,
        [first.id],
      )
    ).rows[0];
    expect(row).toEqual({ status: 'failed', last_error: 'attempts_exhausted_uncertain' });
  });

  it('does not claim an effect whose receipt is uncommitted or attributed to another scope', async () => {
    await enqueue();
    await pool.query(`update public.operation_receipts set status='pending'`);
    expect(await store.claim(claimOptions)).toHaveLength(0);
    await pool.query(`update public.operation_receipts set status='committed',scope='other-scope'`);
    expect(await store.claim(claimOptions)).toHaveLength(0);
  });

  it('honors backoff and records only fixed failure text', async () => {
    await enqueue();
    const first = (await store.claim(claimOptions))[0];
    if (!first) throw new Error('Expected claim');
    const before = await pool.query<{ started: Date }>('select clock_timestamp() as started');
    // Keep eligibility independent of remote round-trip speed; advance the fixture
    // explicitly below instead of sleeping through a production retry delay.
    expect(await store.fail(first, { retryAfterMs: 86_400_000 })).toBe(true);
    expect(await store.claim(claimOptions)).toHaveLength(0);
    expect(
      (
        await pool.query<{ last_error: string }>(
          `select last_error from public.external_effect_intents where id=$1`,
          [first.id],
        )
      ).rows[0]?.last_error,
    ).toBe('dispatch_failed');
    const scheduled = await pool.query<{ correct_delay: boolean }>(
      `select available_at >= $2::timestamptz + interval '1 day'
        and available_at <= clock_timestamp() + interval '1 day' as correct_delay
       from public.external_effect_intents where id=$1`,
      [first.id, before.rows[0]?.started],
    );
    expect(scheduled.rows[0]?.correct_delay).toBe(true);
    await pool.query(
      `update public.external_effect_intents set available_at=clock_timestamp()-interval '1 second' where id=$1`,
      [first.id],
    );
    const retried = await store.claim(claimOptions);
    expect(retried).toHaveLength(1);
    expect(retried[0]?.id).toBe(first.id);
    expect(retried[0]?.lock_token).not.toBe(first.lock_token);
  });

  it('dispatches only admitted handlers after current authorization', async () => {
    await enqueue();
    let sends = 0;
    const options = {
      signal: new AbortController().signal,
      leaseMs: 5000,
      limit: 5,
      retryAfterMs: 1000,
    };
    expect(await dispatchDueEffects(store, [], options)).toEqual({
      acknowledged: 0,
      failed: 0,
      uncertain: 0,
    });
    const denied = await dispatchDueEffects(
      store,
      [
        {
          capability: claimOptions.capability,
          effectName: 'notify',
          authorize: async () => {
            throw new EffectAuthorizationDenied();
          },
          dispatch: async () => {
            sends++;
            return { providerEventId: 'must-not-send' };
          },
        },
      ],
      options,
    );
    expect(denied).toEqual({ acknowledged: 0, failed: 1, uncertain: 0 });
    expect(sends).toBe(0);
    await enqueue();
    const sent = await dispatchDueEffects(
      store,
      [
        {
          capability: claimOptions.capability,
          effectName: 'notify',
          authorize: async () => {},
          dispatch: async () => {
            sends++;
            return { providerEventId: 'synthetic-provider' };
          },
        },
      ],
      options,
    );
    expect(sent).toEqual({ acknowledged: 1, failed: 0, uncertain: 0 });
    expect(sends).toBe(1);
  });

  it('keeps receipts and effects inaccessible to direct client roles', async () => {
    const result = await pool.query<{ receipts: boolean; effects: boolean }>(
      `select has_table_privilege('authenticated',$1,'SELECT') receipts,
              has_table_privilege('authenticated',$2,'SELECT') effects`,
      ['public.operation_receipts', 'public.external_effect_intents'],
    );
    expect(result.rows[0]).toEqual({ receipts: false, effects: false });
  });

  it('backs off transient authorization failure without sending or discarding work', async () => {
    await enqueue();
    let sends = 0;
    const result = await dispatchDueEffects(
      store,
      [
        {
          capability: claimOptions.capability,
          effectName: 'notify',
          authorize: async () => {
            throw new Error('authority store unavailable');
          },
          dispatch: async () => {
            sends++;
            return { providerEventId: 'not-sent' };
          },
        },
      ],
      { signal: new AbortController().signal, leaseMs: 5000, limit: 5, retryAfterMs: 1000 },
    );
    expect(result).toEqual({ acknowledged: 0, failed: 1, uncertain: 0 });
    expect(sends).toBe(0);
    const row = (
      await pool.query<{ status: string; last_error: string }>(
        `select status,last_error from public.external_effect_intents`,
      )
    ).rows[0];
    expect(row).toEqual({ status: 'pending', last_error: 'dispatch_failed' });
  });

  it('cancels before claim without changing durable work', async () => {
    await enqueue();
    const controller = new AbortController();
    controller.abort();
    await expect(
      dispatchDueEffects(
        store,
        [
          {
            capability: claimOptions.capability,
            effectName: 'notify',
            authorize: async () => {},
            dispatch: async () => ({ providerEventId: 'not-sent' }),
          },
        ],
        { signal: controller.signal, leaseMs: 5000, limit: 5, retryAfterMs: 1000 },
      ),
    ).rejects.toThrow();
    expect(await store.claim(claimOptions)).toHaveLength(1);
  });

  it.each([-3_600_000, 3_600_000])(
    'dispatches with valid database leases despite wall-clock skew of %i ms',
    async (skew) => {
      await enqueue();
      const now = Date.now();
      const clock = vi.spyOn(Date, 'now').mockReturnValue(now + skew);
      try {
        const outcome = await dispatchDueEffects(
          store,
          [
            {
              capability: claimOptions.capability,
              effectName: 'notify',
              authorize: async () => {},
              dispatch: async () => ({ providerEventId: 'clock-skew-fixture' }),
            },
          ],
          { signal: new AbortController().signal, leaseMs: 5000, limit: 5, retryAfterMs: 1000 },
        );
        expect(outcome).toEqual({ acknowledged: 1, failed: 0, uncertain: 0 });
      } finally {
        clock.mockRestore();
      }
    },
  );
});
