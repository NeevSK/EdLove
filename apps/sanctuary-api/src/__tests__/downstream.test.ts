import './setup';
import { describe, expect, it } from 'vitest';
import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { app } from '../core/app.js';
import { setMockActiveBond, setMockZenStackDbAvailable } from './setup';
import { createTestORPCClient } from './orpc-client';

async function requestNativeLibraryCollections(headers: Record<string, string>) {
  let response: Response | undefined;
  const link = new RPCLink<Record<never, never>>({
    url: 'http://sanctuary.test/api',
    headers,
    fetch: async (request, init) => {
      response = await app.fetch(new Request(request, init));
      return response;
    },
  });
  const client = createORPCClient<any>(link);
  await client.library.getCollections({});
  if (!response) throw new Error('Native library response was not captured');
  return response;
}

describe('Sanctuary API Gateway: Cedar Server Gate Downstream Integration', () => {
  const schoolId = '123e4567-e89b-12d3-a456-426614174000';
  const classroomId = '123e4567-e89b-12d3-a456-426614174004';

  const setHydratedAdmin = () => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({
      capacity: 'admin',
      entity_type: 'SCHOOL',
      entity_id: schoolId,
    });
  };

  const setHydratedTeacher = () => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({
      capacity: 'teacher',
      entity_type: 'SCHOOL',
      entity_id: schoolId,
    });
  };

  const setHydratedStudent = () => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({
      capacity: 'student',
      entity_type: 'SCHOOL',
      entity_id: schoolId,
    });
  };

  it('should block client-side admin header escalation when DB hydration is available', async () => {
    setHydratedTeacher();

    await expect(createTestORPCClient({
      Authorization: 'Bearer teacher-user-1',
      'x-capacity': 'admin',
      'x-school-id': schoolId,
    }).admin.getSchool({ id: schoolId })).rejects.toMatchObject({ status: 403 });
  });

  it('should fall back to client headers when DB hydration is unavailable', async () => {
    setMockZenStackDbAvailable(false);

    const res = await app.request(`/api/admin/schools/${schoolId}`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer admin-user-1',
        'x-capacity': 'admin',
        'x-school-id': schoolId,
      },
    });

    expect(res.status).not.toBe(403);
    setHydratedTeacher();
  });

  it('should block anonymous Wanderer from reading school details (Double Gate: Denied by Cedar)', async () => {
    setHydratedTeacher();

    await expect(createTestORPCClient({}).admin.getSchool({ id: schoolId })).rejects.toMatchObject({ status: 403 });
  });

  it('should allow Platform/School Admin to read school details (Double Gate: Allowed by Cedar)', async () => {
    setHydratedAdmin();

    const body = await createTestORPCClient({
      Authorization: 'Bearer admin-user-1',
      'x-capacity': 'admin',
      'x-school-id': schoolId,
    }).admin.getSchool({ id: schoolId });
    expect(body.id).toBe('mock-school');
  });

  it('should block Student from submitting a grade (Double Gate: Denied by Cedar)', async () => {
    setHydratedStudent();

    await expect(createTestORPCClient({
      Authorization: 'Bearer 123e4567-e89b-12d3-a456-426614174002',
      'x-capacity': 'student',
      'x-school-id': schoolId,
    }).grading.submitGrade({
      classroomId: schoolId,
      studentId: '123e4567-e89b-12d3-a456-426614174003',
      marks: 85,
    })).rejects.toMatchObject({ status: 403 });
  });

  it('should allow Teacher to submit a grade (Double Gate: Allowed by Cedar)', async () => {
    setHydratedTeacher();

    const body = await createTestORPCClient({
        Authorization: 'Bearer teacher-user-1',
        'x-capacity': 'teacher',
        'x-school-id': schoolId,
        'x-classroom-ids': classroomId,
        'x-device-trust': 'high',
      }).grading.submitGrade({
        classroomId,
        studentId: '123e4567-e89b-12d3-a456-426614174003',
        marks: 85,
      });

    expect(body.classroom_id).toBe(classroomId);
    expect(body.student_id).toBe('123e4567-e89b-12d3-a456-426614174003');
  });

  it('should deny unauthorized PowerSync uploads through the Cedar double gate', async () => {
    setMockZenStackDbAvailable(false);

    await expect(
      createTestORPCClient().sync.uploadBatch({
        crud: [{ id: 'mutation-1', op: 'PATCH', table: 'users', opData: { display_name: 'Parent One' } }],
      }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('should allow retrieving classroom capacity summary for a user', async () => {
    setHydratedTeacher();

    const body = await createTestORPCClient({
      Authorization: 'Bearer fe889249-5929-431e-bdc9-2c1e81dd25b2',
      'x-capacity': 'teacher',
      'x-school-id': schoolId,
    }).identity.resolveWorkspaceContext({ id: 'fe889249-5929-431e-bdc9-2c1e81dd25b2' });

    expect(body).toHaveProperty('user_id', 'fe889249-5929-431e-bdc9-2c1e81dd25b2');
    expect(body).toHaveProperty('real_class_count');
  });

  it('should guarantee absolute tenant isolation under 50 rapid parallel requests', async () => {
    const requests = Array.from({ length: 50 }).map(async (_, index) => {
      // Generate standard-compliant UUIDs for test JWT bypass
      const tenantId = `123e4567-e89b-12d3-a456-${index.toString().padStart(12, '0')}`;
      const body = await createTestORPCClient({
          Authorization: `Bearer ${tenantId}`,
          'x-capacity': 'teacher',
          'x-school-id': schoolId,
        }).identity.resolveWorkspaceContext({ id: tenantId });

      expect(body).toHaveProperty('user_id', tenantId);
    });

    await Promise.all(requests);
  });

  it('should handle database outages without throwing unhandled panics that crash the process', async () => {
    const res = await app.request(
      '/api/identity/resolveWorkspaceContext',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer fe889249-5929-431e-bdc9-2c1e81dd25b2',
          'x-capacity': 'teacher',
          'x-school-id': schoolId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: 'fe889249-5929-431e-bdc9-2c1e81dd25b2' }),
      },
      {
        // Inject offline connection details to simulate DB outages
        DATABASE_URL:
          'postgresql://invalid_user:invalid_pass@localhost:54321/db_offline?connect_timeout=1',
      },
    );

    // Outage should be caught by global onError boundary and return structured SovereignError
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.title).toBe('Unexpected Platform Error');
    expect(body.code).toBe('INTERNAL_SERVER_ERROR');
    expect(body.detail).toContain('Could not connect to database');
  });

  it('should catch malformed body parameters and return a structured 400 Bad Request validation response', async () => {
    setHydratedTeacher();
    await expect(createTestORPCClient({
        Authorization: 'Bearer teacher-user-1',
        'x-capacity': 'teacher',
        'x-school-id': schoolId,
        'x-classroom-ids': 'class-1',
        'x-device-trust': 'high',
      }).grading.submitGrade({
        classroomId: 'class-1',
        studentId: 'invalid-uuid',
        marks: 150,
      })).rejects.toMatchObject({ status: 400 });
  });

  it('should include rate limiting headers on API routes', async () => {
    setHydratedTeacher();
    const res = await requestNativeLibraryCollections({
      Authorization: 'Bearer teacher-user-1',
      'x-capacity': 'teacher',
      'x-school-id': schoolId,
    });

    expect(res.headers.get('X-RateLimit-Limit')).toBe('100');
    expect(res.headers.get('X-RateLimit-Remaining')).toBeDefined();
    expect(res.headers.get('X-RateLimit-Reset')).toBeDefined();
    expect(res.headers.get('Server-Timing')).toContain('jwt');
    // Native oRPC currently inherits JWT and total request timing from Hono;
    // procedure-level Cedar timing is covered separately when telemetry is added.
    expect(res.headers.get('Server-Timing')).toContain('total');

    const etagVal = res.headers.get('ETag');
    expect(etagVal).toBeDefined();

    // Conditional GET request using ETag should yield 304 Not Modified
    let conditionalResponse: Response | undefined;
    const conditionalLink = new RPCLink<Record<never, never>>({
      url: 'http://sanctuary.test/api',
      headers: {
        Authorization: 'Bearer teacher-user-1',
        'x-capacity': 'teacher',
        'x-school-id': schoolId,
        'If-None-Match': etagVal!,
      },
      fetch: async (request, init) => {
        conditionalResponse = await app.fetch(new Request(request, init));
        return conditionalResponse;
      },
    });
    await createORPCClient<any>(conditionalLink).library.getCollections({});
    // Hono's ETag middleware still applies to the native oRPC response.
    expect(conditionalResponse?.status).toBe(304);
  });

  it('should include Cache-Control headers on read-heavy routes', async () => {
    setHydratedTeacher();
    const res = await requestNativeLibraryCollections({
      Authorization: 'Bearer teacher-user-1',
      'x-capacity': 'teacher',
      'x-school-id': schoolId,
    });

    expect(res.headers.get('Cache-Control')).toBe('public, max-age=60, stale-while-revalidate=600');
  });

  it('should reject payloads larger than 5MB with a 413 Payload Too Large status', async () => {
    // Generate a payload slightly larger than 5MB
    const largeBody = 'a'.repeat(6 * 1024 * 1024);

    const res = await app.request('/api/grades', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer teacher-user-1',
        'x-capacity': 'teacher',
        'x-school-id': schoolId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: largeBody }),
    });

    expect(res.status).toBe(413);
  });
});
