import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import { setMockActiveBond, setMockZenStackDbAvailable } from './setup';

describe('Sanctuary API: typed agent system-status via native oRPC', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({
      id: 'bond-agent',
      user_id: userId,
      entity_id: 'school-123',
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      status: 'active',
    });
  });

  it('rejects anonymous status reads with a typed 403', async () => {
    await expect(createTestORPCClient().agent.getSystemStatus({})).rejects.toMatchObject({
      status: 403,
    });
  });

  it('returns a typed system-status snapshot for an authenticated principal', async () => {
    const client = createTestORPCClient({ Authorization: `Bearer ${userId}` });
    const status = await client.agent.getSystemStatus({});
    expect(status.principal.user_id).toBe(userId);
    expect(status.principal.capacity).toBe('teacher');
    expect(status.principal.active_bond_id).toBe('bond-agent');
    expect(status.authorization).toEqual({ evaluator: 'wasm', subject: 'User', action: 'read' });
    expect(status.api.status).toBe('ok');
    expect(status.request_id).toBeTruthy();
  });
});
