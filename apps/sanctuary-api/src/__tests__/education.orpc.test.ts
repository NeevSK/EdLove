import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { app } from '../core/app';
import { createTestORPCClient } from './orpc-client';
import {
  setMockActiveBond,
  setMockClassroomRelationships,
  setMockZenStackDbAvailable,
} from './setup';

describe('Sanctuary API: education via native oRPC', () => {
  const headers = {
    Authorization: 'Bearer 123e4567-e89b-12d3-a456-426614174000',
    'x-classroom-ids': '123e4567-e89b-12d3-a456-426614174001',
  };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({
      id: 'bond-education',
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      entity_id: 'school-123',
      entity_type: 'SCHOOL',
      capacity: 'teacher',
      status: 'active',
    });
    setMockClassroomRelationships({
      classrooms: [
        ...[
          '123e4567-e89b-12d3-a456-426614174001',
          '623e4567-e89b-12d3-a456-426614174000',
          '723e4567-e89b-12d3-a456-426614174000',
          '823e4567-e89b-12d3-a456-426614174000',
          '923e4567-e89b-12d3-a456-426614174000',
        ].map((id) => ({
          id,
          school_id: 'school-123',
          teacher_id: '123e4567-e89b-12d3-a456-426614174000',
        })),
      ],
      students: [
        {
          student_id: '223e4567-e89b-12d3-a456-426614174002',
          classroom_id: '123e4567-e89b-12d3-a456-426614174001',
        },
        {
          student_id: '323e4567-e89b-12d3-a456-426614174002',
          classroom_id: '123e4567-e89b-12d3-a456-426614174001',
        },
      ],
    });
  });

  it('executes the native classroom procedure and validates an explicit DTO list', async () => {
    const body = await createTestORPCClient(headers).educational.getByTeacher({
      query: { teacher_id: '123e4567-e89b-12d3-a456-426614174000' },
    });

    expect(body).toHaveLength(5);
  });

  it('rejects malformed classroom identifiers before handler execution', async () => {
    await expect(
      createTestORPCClient(headers).educational.getById({ params: { id: 'invalid-id' } }),
    ).rejects.toMatchObject({
      status: 400,
    });
  });

  it('denies a classroom outside the server-resolved teacher relationship', async () => {
    await expect(
      createTestORPCClient(headers).educational.getById({
        params: { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' },
      }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('executes classroom lifecycle mutations through native oRPC DTOs', async () => {
    const client = createTestORPCClient(headers).educational;
    const classroom = await client.createClassroom({
      body: {
        name: 'New classroom',
        teacherId: '123e4567-e89b-12d3-a456-426614174000',
        schoolId: null,
        subject: 'Science',
      },
    });
    expect(classroom).toMatchObject({
      name: 'New classroom',
      teacher_id: '123e4567-e89b-12d3-a456-426614174000',
      subject: 'Science',
    });
    const classroomId = '123e4567-e89b-12d3-a456-426614174001';
    expect(
      await client.updateClassroom({
        params: { id: classroomId },
        body: {
          name: 'Renamed classroom',
          isArchived: true,
        },
      }),
    ).toMatchObject({ name: 'Renamed classroom', is_archived: true });
    expect(await client.deleteClassroom({ params: { id: classroomId } })).toEqual({
      success: true,
    });
  });

  it('executes enrollment and shadow-student procedures through native oRPC', async () => {
    const client = createTestORPCClient(headers).educational;
    const classroomId = '123e4567-e89b-12d3-a456-426614174001';
    const studentId = '123e4567-e89b-12d3-a456-426614174002';
    const enrolled = await client.enrollStudent({
      params: { classroomId },
      body: { studentId, rollNumber: 7 },
    });
    expect(enrolled).toMatchObject({
      classroom_id: classroomId,
      student_id: studentId,
      roll_number: 7,
    });
    const shadow = await client.addShadowStudent({
      params: { classroomId },
      body: { fullName: 'Shadow Learner' },
    });
    expect(shadow).toMatchObject({ classroom_id: classroomId, full_name: 'Shadow Learner' });
    const enrollmentId = '523e4567-e89b-12d3-a456-426614174000';
    expect(
      await client.updateClassroomStudent({
        params: { id: enrollmentId },
        body: { classroomId, rollNumber: 8 },
      }),
    ).toMatchObject({ roll_number: 8 });
    expect(
      await client.removeClassroomStudent({
        params: { id: enrollmentId },
        body: { classroomId },
      }),
    ).toEqual({
      success: true,
    });
  });

  it('executes classroom note CRUD through native oRPC DTOs', async () => {
    const client = createTestORPCClient(headers).educational;
    const classroomId = '123e4567-e89b-12d3-a456-426614174001';
    const noteId = '623e4567-e89b-12d3-a456-426614174000';
    expect(await client.getClassroomNotes({ params: { classroomId } })).toEqual([]);
    expect(
      await client.getClassroomNoteSnapshot({
        params: { classroomId },
        query: { view_date: '2026-07-30T00:00:00.000Z' },
      }),
    ).toEqual([]);
    expect(await client.getClassroomNoteTimeline({ params: { id: noteId } })).toEqual([]);
    const created = await client.createClassroomNote({
      body: {
        classroomId,
        content: 'Lesson recap',
        visibility: 'class',
      },
    });
    expect(created).toMatchObject({
      classroom_id: classroomId,
      content: 'Lesson recap',
      visibility: 'class',
    });
    expect(
      await client.updateClassroomNote({ params: { id: noteId }, body: { isPinned: true } }),
    ).toMatchObject({ is_pinned: true });
    expect(await client.deleteClassroomNote({ params: { id: noteId } })).toEqual({
      success: true,
    });
  });

  it('executes material CRUD through the native Material contract', async () => {
    const client = createTestORPCClient(headers).educational;
    const classroomId = '123e4567-e89b-12d3-a456-426614174001';
    const materialId = '723e4567-e89b-12d3-a456-426614174000';
    expect(await client.getMaterials({ query: { classroomId } })).toEqual([]);
    const created = await client.createMaterial({
      body: {
        classroomId,
        title: 'Reading',
        type: 'link',
        url: 'https://example.com',
      },
    });
    expect(created).toMatchObject({ classroom_id: classroomId, title: 'Reading', type: 'link' });
    expect(
      await client.updateMaterial({
        params: { id: materialId },
        body: { title: 'Updated reading' },
      }),
    ).toMatchObject({ title: 'Updated reading' });
    expect(await client.deleteMaterial({ params: { id: materialId } })).toEqual({ success: true });
  });

  it('executes assignment CRUD through the native Assignment contract', async () => {
    const client = createTestORPCClient(headers).educational;
    const classroomId = '123e4567-e89b-12d3-a456-426614174001';
    const assignmentId = '823e4567-e89b-12d3-a456-426614174000';
    expect(await client.getAssignments({ query: { classroomId } })).toEqual([]);
    const created = await client.createAssignment({
      body: {
        classroomId,
        title: 'Practice',
        maxPoints: 20,
      },
    });
    expect(created).toMatchObject({ classroom_id: classroomId, title: 'Practice', max_points: 20 });
    expect(
      await client.updateAssignment({
        params: { id: assignmentId },
        body: { title: 'Updated practice' },
      }),
    ).toMatchObject({ title: 'Updated practice' });
    expect(await client.deleteAssignment({ params: { id: assignmentId } })).toEqual({
      success: true,
    });
  });

  it('enforces and executes native assignment submission procedures', async () => {
    const classroomId = '123e4567-e89b-12d3-a456-426614174001';
    const assignmentId = '923e4567-e89b-12d3-a456-426614174000';
    const teacherClient = createTestORPCClient(headers).educational;
    expect(
      await teacherClient.getStudentSubmissions({
        query: {
          studentId: '123e4567-e89b-12d3-a456-426614174002',
          classroomId,
        },
      }),
    ).toEqual([]);

    const studentId = '223e4567-e89b-12d3-a456-426614174002';
    setMockActiveBond({
      id: 'bond-student',
      user_id: studentId,
      entity_id: 'school-123',
      entity_type: 'SCHOOL',
      capacity: 'student',
      status: 'active',
    });
    const studentClient = createTestORPCClient({
      Authorization: `Bearer ${studentId}`,
      'x-classroom-ids': classroomId,
    }).educational;
    const submission = await studentClient.submitAssignment({
      body: { assignmentId, content: 'My work' },
    });
    expect(submission).toMatchObject({
      assignment_id: assignmentId,
      student_id: studentId,
      content: 'My work',
    });
  });

  it('reads upcoming assignments through the native student contract', async () => {
    const studentId = '323e4567-e89b-12d3-a456-426614174002';
    setMockActiveBond({
      id: 'bond-student-upcoming',
      user_id: studentId,
      entity_id: 'school-123',
      entity_type: 'SCHOOL',
      capacity: 'student',
      status: 'active',
    });
    const body = await createTestORPCClient({
      Authorization: `Bearer ${studentId}`,
    }).educational.getUpcomingAssignments({ query: { studentId } });
    expect(body).toEqual([]);
  });

  it('serves procedures through the OpenAPI adapter', async () => {
    const classroomId = '123e4567-e89b-12d3-a456-426614174001';
    const response = await app.fetch(
      new Request(
        `http://sanctuary.test/api/openapi/educational/classrooms/${classroomId}/assignments?query[classroomId]=${classroomId}`,
        { headers },
      ),
    );
    // A permitted read is matched by the adapter and reaches authorization.
    expect(response.status).toBe(200);

    const mutationResponse = await app.fetch(
      new Request('http://sanctuary.test/api/openapi/educational/createAssignment', {
        method: 'POST',
        headers: { ...headers, 'content-type': 'application/json' },
        body: JSON.stringify({
          classroomId: '123e4567-e89b-12d3-a456-426614174001',
          title: 'Hidden from OpenAPI',
        }),
      }),
    );
    expect(mutationResponse.status).toBe(404);
  });
});
