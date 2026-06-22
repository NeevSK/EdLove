import './setup';
import { describe, expect, it } from 'vitest';
import { app } from '../core/app.js';
import { setMockActiveBond, setMockZenStackDbAvailable } from './setup';

describe('Sanctuary API Gateway: Cedar Server Gate Downstream Integration', () => {
  const schoolId = '123e4567-e89b-12d3-a456-426614174000';

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

  it('should block client-side admin header escalation when DB hydration is available', async () => {
    setHydratedTeacher();

    const res = await app.request(`/api/admin/schools/${schoolId}`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer teacher-user-1',
        'x-capacity': 'admin',
        'x-school-id': schoolId,
      },
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Forbidden');
    expect(body.message).toContain('administrative capability');
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

    const res = await app.request(`/api/admin/schools/${schoolId}`, {
      method: 'GET',
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Forbidden');
    expect(body.message).toContain('Access denied by authoritative Cedar policy engine');
  });

  it('should allow Platform/School Admin to read school details (Double Gate: Allowed by Cedar)', async () => {
    setHydratedAdmin();

    const res = await app.request(`/api/admin/schools/${schoolId}`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer admin-user-1',
        'x-capacity': 'admin',
        'x-school-id': schoolId,
      },
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe('mock-school');
  });

  it('should block Student from submitting a grade (Double Gate: Denied by Cedar)', async () => {
    setHydratedTeacher();

    const res = await app.request('/api/grades', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer student-user-1',
        'x-capacity': 'student',
        'x-school-id': schoolId,
      },
      body: JSON.stringify({
        classroom_id: 'class-1',
        student_id: 'student-1',
        marks: 85,
        grade: 'A',
      }),
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Forbidden');
  });

  it('should allow Teacher to submit a grade (Double Gate: Allowed by Cedar)', async () => {
    setHydratedTeacher();

    const res = await app.request('/api/grades', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer teacher-user-1',
        'x-capacity': 'teacher',
        'x-school-id': schoolId,
        'x-classroom-ids': 'class-1',
        'x-device-trust': 'high',
      },
      body: JSON.stringify({
        classroomId: 'class-1',
        studentId: 'student-1',
        marks: 85,
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.classroom_id).toBe('class-1');
    expect(body.student_id).toBe('student-1');
  });

  it('should deny unauthorized PowerSync uploads through the Cedar double gate', async () => {
    setMockZenStackDbAvailable(false);

    const res = await app.request('/api/powersync/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        crud: [
          {
            id: 'mutation-1',
            op: 'PATCH',
            table: 'users',
            opData: {
              display_name: 'Parent One',
            },
          },
        ],
      }),
    });

    expect(res.status).toBe(403);
  });

  it('should allow retrieving classroom capacity summary for a user', async () => {
    setHydratedTeacher();

    const res = await app.request(
      '/api/identity/classroom-capacity-summary/fe889249-5929-431e-bdc9-2c1e81dd25b2',
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer fe889249-5929-431e-bdc9-2c1e81dd25b2',
          'x-capacity': 'teacher',
          'x-school-id': schoolId,
        },
      },
    );

    // The handler should successfully run without database mapping or relation errors!
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('user_id', 'fe889249-5929-431e-bdc9-2c1e81dd25b2');
    expect(body).toHaveProperty('real_class_count');
  });

  it('should guarantee absolute tenant isolation under 50 rapid parallel requests', async () => {
    const requests = Array.from({ length: 50 }).map(async (_, index) => {
      // Generate standard-compliant UUIDs for test JWT bypass
      const tenantId = `123e4567-e89b-12d3-a456-${index.toString().padStart(12, '0')}`;
      const res = await app.request(`/api/identity/classroom-capacity-summary/${tenantId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${tenantId}`,
          'x-capacity': 'teacher',
          'x-school-id': schoolId,
        },
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('user_id', tenantId);
    });

    await Promise.all(requests);
  });

  it('should handle database outages without throwing unhandled panics that crash the process', async () => {
    const res = await app.request(
      '/api/identity/classroom-capacity-summary/fe889249-5929-431e-bdc9-2c1e81dd25b2',
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer fe889249-5929-431e-bdc9-2c1e81dd25b2',
          'x-capacity': 'teacher',
          'x-school-id': schoolId,
        },
      },
      {
        // Inject offline connection details to simulate DB outages
        DATABASE_URL:
          'postgresql://invalid_user:invalid_pass@localhost:54321/db_offline?connect_timeout=1',
      },
    );

    // Outage should be caught by global onError boundary and return generic 500 error envelope
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Internal Server Error');
    expect(body.message).toBe('An unexpected error occurred.');
  });

  it('should catch malformed body parameters and return a structured 400 Bad Request validation response', async () => {
    setHydratedTeacher();
    const res = await app.request('/api/grades', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer teacher-user-1',
        'x-capacity': 'teacher',
        'x-school-id': schoolId,
        'x-classroom-ids': 'class-1',
        'x-device-trust': 'high',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        classroomId: 'class-1',
        studentId: 'invalid-uuid',
        marks: 150, // Invalid marks (max is 100)
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.name).toBe('ZodError');
  });
});
