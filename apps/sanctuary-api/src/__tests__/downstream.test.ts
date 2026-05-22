import './setup';
import { describe, expect, it } from 'vitest';
import app from '../index.js';
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

    const res = await app.request('/api/grade/submit', {
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
    setHydratedAdmin();

    const res = await app.request('/api/powersync/upload', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer student-user-1',
        'x-capacity': 'student',
        'x-school-id': schoolId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        crud: [
          {
            id: 'mutation-1',
            op: 'PATCH',
            table: 'users',
            opData: {
              display_name: 'Teacher One',
            },
          },
        ],
      }),
    });

    expect(res.status).toBe(403);
  });
});
