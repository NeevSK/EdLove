import { SovereignError } from '@repo/core/types/Errors';
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
  const api = new Hono<{ Variables: { user: { id: string } } }>();
  api.onError((error, context) => {
    if (error instanceof SovereignError) {
      return new Response(JSON.stringify(error.details), {
        status: error.details.status,
        headers: { 'Content-Type': 'application/problem+json; charset=utf-8' },
      });
    }
    return context.text('Internal Server Error', 500);
  });
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
      .mockImplementationOnce(async (_sql: string, params: unknown[]) => [
        {
          id: params[0],
          status: 'queued',
          mode: 'live',
          request_payload: JSON.parse(String(params[9])),
        },
      ])
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

  it('replays an identical idempotent enqueue without sending another worker event', async () => {
    let persisted: any;
    database.queryDatabaseRows
      .mockResolvedValueOnce([{ schoolId: authoritativeSchoolId, classroomId, teacherId: actorId }])
      .mockImplementationOnce(async (_sql: string, params: unknown[]) => {
        persisted = {
          id: params[0],
          status: 'queued',
          mode: 'live',
          request_payload: JSON.parse(String(params[9])),
        };
        return [persisted];
      })
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ schoolId: authoritativeSchoolId, classroomId, teacherId: actorId }])
      .mockResolvedValueOnce([])
      .mockImplementationOnce(async () => [persisted]);

    const request = () =>
      app().request('/api/durable-agents/student-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': 'retry-key-123' },
        body: JSON.stringify(body()),
      });

    const first = await request();
    const replay = await request();

    expect(first.status).toBe(202);
    expect(replay.status).toBe(202);
    await expect(replay.json()).resolves.toMatchObject({
      runId: persisted.id,
      replayed: true,
    });
    expect(agents.send).toHaveBeenCalledTimes(1);
  });

  it('keeps sensitive evidence and worker diagnostics out of the run list', async () => {
    const runId = '66666666-6666-4666-8666-666666666666';
    database.queryDatabaseRows.mockResolvedValueOnce([
      {
        action: 'durable_agent_requested',
        entity_id: runId,
        created_at: '2026-08-30T00:00:00.000Z',
        metadata: {
          runType: 'student_support_snapshot',
          classroomId,
          studentId,
          studentName: 'Sensitive Student Name',
          teacherId: actorId,
          requestedBy: actorId,
        },
      },
      {
        action: 'durable_agent_completed',
        entity_id: runId,
        created_at: '2026-08-30T00:01:00.000Z',
        metadata: {
          summaryDraft: 'Sensitive draft',
          evidence: { wellbeing: { privateNote: 'Sensitive evidence' } },
          governor: { provider: 'internal' },
        },
      },
      {
        action: 'durable_agent_failed',
        entity_id: runId,
        created_at: '2026-08-30T00:02:00.000Z',
        metadata: { error: 'provider stack trace with student details' },
      },
    ]);

    const response = await app().request('/api/durable-agents/runs');

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.runs).toEqual([expect.objectContaining({ runId, status: 'failed', studentId })]);
    expect(payload.runs[0]).not.toHaveProperty('studentName');
    expect(payload.runs[0]).not.toHaveProperty('summaryDraft');
    expect(payload.runs[0]).not.toHaveProperty('evidence');
    expect(payload.runs[0]).not.toHaveProperty('governor');
    expect(payload.runs[0]).not.toHaveProperty('error');
  });
});
