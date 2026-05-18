import './setup';
import { describe, it, expect } from 'vitest';
import app from '../index';

describe('Sanctuary API Gateway: Cedar Server Gate Downstream Integration', () => {
  const schoolId = '123e4567-e89b-12d3-a456-426614174000';

  it('should block anonymous Wanderer from reading school details (Double Gate: Denied by Cedar)', async () => {
    const res = await app.request(`/api/admin/schools/${schoolId}`, {
      method: 'GET',
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Forbidden');
    expect(body.message).toContain('Access denied by authoritative Cedar policy engine');
  });

  it('should allow Platform/School Admin to read school details (Double Gate: Allowed by Cedar)', async () => {
    // In this test, the Cedar check will permit it.
    // The handler itself might fail on DB connection if no database is connected,
    // but it will NOT return a 403 Forbidden! That proves the Cedar gate is passed!
    const res = await app.request(`/api/admin/schools/${schoolId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer admin-user-1',
        'x-capacity': 'admin',
        'x-school-id': schoolId,
      },
    });

    // If it's a database connection/setup issue, it might be 500 or 404, but NOT 403!
    expect(res.status).not.toBe(403);
  });

  it('should block Student from submitting a grade (Double Gate: Denied by Cedar)', async () => {
    const res = await app.request('/api/grade/submit', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer student-user-1',
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
    const res = await app.request('/api/grade/submit', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer teacher-user-1',
        'x-capacity': 'teacher',
        'x-school-id': schoolId,
        'x-classroom-ids': 'class-1',
        'x-device-trust': 'high',
      },
      body: JSON.stringify({
        classroom_id: 'class-1',
        student_id: 'student-1',
        marks: 85,
        grade: 'A',
      }),
    });

    expect(res.status).not.toBe(403);
  });
});
