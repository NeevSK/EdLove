// Runs against a disposable Postgres: TEST_DATABASE_URL=postgres://... pnpm vitest run src/transaction.test.ts
// Skipped without it. It proves the wiring the API relies on, not any table's design.
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createZenStackOnConnection } from './transaction';

const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)('ZenStack on the API transaction connection', () => {
  const pool = new pg.Pool({ connectionString: url, max: 2 });
  const owner = '00000000-0000-4000-8000-000000000001';
  const other = '00000000-0000-4000-8000-000000000002';

  beforeAll(async () => {
    await pool.query(`
      drop table if exists todos; drop table if exists lists;
      do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
      create table lists (id text primary key, user_id text not null, name text not null,
        color text, created_at timestamptz not null default now());
      alter table lists enable row level security;
      create policy own_lists on lists to authenticated
        using (user_id = current_setting('request.jwt.claims', true)::json->>'canonical_account_id')
        with check (user_id = current_setting('request.jwt.claims', true)::json->>'canonical_account_id');
      grant select, insert, update, delete on lists to authenticated;
      insert into lists (id, user_id, name) values ('theirs', '${other}', 'not yours');
    `);
  });
  afterAll(async () => {
    await pool.query('drop table if exists lists');
    await pool.end();
  });

  // The same steps the API's withAccountData takes before handing over the connection.
  async function asAccount<T>(account: string, work: (client: pg.PoolClient) => Promise<T>) {
    const client = await pool.connect();
    try {
      await client.query('begin');
      await client.query(`select set_config('request.jwt.claims', $1, true)`, [
        JSON.stringify({ role: 'authenticated', canonical_account_id: account }),
      ]);
      await client.query('set local role authenticated');
      const result = await work(client);
      await client.query('commit');
      return result;
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }

  it('reads and writes through row-level security on the same transaction', async () => {
    const seen = await asAccount(owner, async (client) => {
      const db = createZenStackOnConnection(client);
      await db.todoList.create({ data: { id: 'mine', user_id: owner, name: 'Mine' } });
      const role = await client.query('select current_user as role');
      return {
        lists: await db.todoList.findMany({ select: { id: true } }),
        role: role.rows[0].role,
      };
    });
    expect(seen.role).toBe('authenticated');
    expect(seen.lists).toEqual([{ id: 'mine' }]);
    await expect(
      asAccount(owner, (client) =>
        createZenStackOnConnection(client).todoList.create({
          data: { id: 'forged', user_id: other, name: 'Forged' },
        }),
      ),
    ).rejects.toThrow();
  });

  it('turns its own transactions into savepoints inside the caller transaction', async () => {
    await asAccount(owner, async (client) => {
      const db = createZenStackOnConnection(client);
      await db.todoList.create({ data: { id: 'kept', user_id: owner, name: 'Kept' } });
      await expect(
        db.$transaction(async (tx) => {
          await tx.todoList.create({ data: { id: 'undone', user_id: owner, name: 'Undone' } });
          throw new Error('inner failure');
        }),
      ).rejects.toThrow('inner failure');
      await db.$transaction(async (tx) => {
        await tx.todoList.create({ data: { id: 'inner', user_id: owner, name: 'Inner' } });
      });
      const status = await client.query('select 1 as alive');
      expect(status.rows[0].alive).toBe(1);
    });
    const ids = await pool.query(`select id from lists where user_id = $1 order by id`, [owner]);
    expect(ids.rows.map((row) => row.id)).toEqual(['inner', 'kept', 'mine']);
  });

  it('leaves commit and rollback to the caller', async () => {
    await expect(
      asAccount(owner, async (client) => {
        await createZenStackOnConnection(client).todoList.create({
          data: { id: 'rolled-back', user_id: owner, name: 'Gone' },
        });
        throw new Error('caller failed');
      }),
    ).rejects.toThrow('caller failed');
    const gone = await pool.query(`select count(*)::int as n from lists where id = 'rolled-back'`);
    expect(gone.rows[0].n).toBe(0);
  });
});
