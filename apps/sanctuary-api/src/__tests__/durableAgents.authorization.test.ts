import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const database = vi.hoisted(() => ({ queryDatabaseRows: vi.fn() }));
const agents = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock('@repo/database/client', () => ({ queryDatabaseRows: database.queryDatabaseRows }));
vi.mock('../agents', () => ({
  sanctuaryInngest: { send: agents.send },
  durableAgentFunctions: [],
  platformEventFunctions: [],
}));

import { createDurableAgentRoutes } from '../core/routes/durableAgents';

const actorId = '11111111-1111-4111-8111-111111111111';
const classroomId = '22222222-2222-4222-8222-222222222222';
const studentId = '33333333-3333-4333-8333-333333333333';
const authoritativeSchoolId = '44444444-4444-4444-8444-444444444444';
const attackerSchoolId = '55555555-5555-4555-8555-555555555555';

function app() {
  const api = new Hono();
  api.use('*', async (c, next) => {
    c.set('user', { id: actorId });
    await next();
  });
  api.route('/', createDurableAgentRoutes({ includeInngest: false }));
  return api;
}

function body() {
  return {
    mode: 'live',
    classroomId,
    studentId,
    schoolId: attackerSchoolId,
    teacherId: attackerSchoolId,
    requestedBy: attackerSchoolId,
    reviewMode: 'draft_only',
    evidenceScopes: ['attendance'],
  };
}

describe('durable-agent authoritative scope', () => {
  beforeEach(() => {
    database.queryDatabaseRows.mockReset();
    agents.send.mockReset();
    agents.send.mockResolvedValue(undefined);
  });

  it('derives school and teacher scope from the authorized classroom, never from request fields', async () => {
    database.queryDatabaseRows
      .mockResolvedValueOnce([{ schoolId: authoritativeSchoolId, classroomId, teacherId: actorId }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const response = await app().request('/api/durable-agents/student-support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body()),
    });

    expect(response.status).toBe(202);
    expect(database.queryDatabaseRows.mock.calls[0]?.[1]).toEqual(
      expect.arrayContaining([classroomId, actorId, expect.any(Array), studentId]),
    );
    expect(database.queryDatabaseRows.mock.calls[1]?.[1]?.[1]).toBe(authoritativeSchoolId);
    expect(agents.send).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          schoolId: authoritativeSchoolId,
          teacherId: actorId,
          requestedBy: actorId,
        }),
      }),
    );
  });

  it('does not enqueue a request when no authoritative classroom relationship permits it', async () => {
    database.queryDatabaseRows.mockResolvedValueOnce([]);

    const response = await app().request('/api/durable-agents/student-support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body()),
    });

    expect(response.status).toBe(403);
    expect(agents.send).not.toHaveBeenCalled();
    expect(database.queryDatabaseRows).toHaveBeenCalledTimes(1);
  });
});
