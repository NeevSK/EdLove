import './setup';
import { it } from 'vitest';
import { app } from '../core/app';
import { createTestORPCClient } from './orpc-client';
import { setMockActiveBond, setMockZenStackDbAvailable } from './setup';

it('diag: raw rewards vs self app.fetch', async () => {
  setMockZenStackDbAvailable(true);
  setMockActiveBond({
    id: 'bond-rewards',
    user_id: '123e4567-e89b-8101-8000-426614174000',
    entity_id: '123e4567-e89b-8101-8000-426614174002',
    entity_type: 'SCHOOL',
    capacity: 'teacher',
    status: 'active',
  });

  const raw = await app.fetch(
    new Request('http://sanctuary.test/api/rewards/getRewards', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer 123e4567-e89b-8101-8000-426614174000',
      },
      body: JSON.stringify([]),
    }),
  );
  console.log('RAW rewards status:', raw.status, 'body:', (await raw.text()).slice(0, 180));

  const rawSelf = await app.fetch(
    new Request('http://sanctuary.test/api/self/getSelf', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer 123e4567-e89b-8101-8000-426614174000',
      },
      body: JSON.stringify([]),
    }),
  );
  console.log('RAW self status:', rawSelf.status, 'body:', (await rawSelf.text()).slice(0, 180));

  const client = createTestORPCClient({
    Authorization: 'Bearer 123e4567-e89b-8101-8000-426614174000',
  });
  try {
    const r = await (client as any).rewards.getRewards({});
    console.log('CLIENT rewards OK:', JSON.stringify(r).slice(0, 120));
  } catch (e: any) {
    console.log('CLIENT rewards ERROR:', e?.message ?? String(e));
  }
  try {
    const s = await (client as any).self.getSelf({});
    console.log('CLIENT self OK:', JSON.stringify(s).slice(0, 120));
  } catch (e: any) {
    console.log('CLIENT self ERROR:', e?.message ?? String(e));
  }
});
