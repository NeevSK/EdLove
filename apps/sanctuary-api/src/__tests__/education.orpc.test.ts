import './setup';
import { ASSIGNMENT_SUBMISSION_CAPABILITY } from '@repo/core/api/educational.contract';
import { getConsistentIdempotencyKey } from '@repo/core/lib/sync/idempotency';
import { createZenStackDb } from '@repo/database/client';
import { beforeEach, describe, expect, it } from 'vitest';
import { app } from '../core/app';
import { createTestORPCClient } from './orpc-client';
import {
  setMockActiveBond,
  setMockAssignmentSubmissionRead,
  setMockClassroomRelationships,
  setMockRawQueryRowsQueue,
  setMockZenStackDbAvailable,
} from './setup';

async function prepareSubmissionReceipt(studentId: string, assignmentId: string, content: string) {
  const operation_id = '823e4567-e89b-12d3-a456-426614174002';
  const payload_hash = await getConsistentIdempotencyKey(
    { studentId, assignmentId, content },
    ASSIGNMENT_SUBMISSION_CAPABILITY,
  );
  setMockRawQueryRowsQueue([
    [{ operation_id }],
    [{ operation_id, payload_hash, status: 'pending', result: null }],
  ]);
}

describe('Sanctuary API: education via native oRPC', () => {
  const headers = {
    Authorization: 'Bearer 123e4567-e89b-12d3-a456-426614174000',
    'x-classroom-ids': '123e4567-e89b-12d3-a456-426614174001',
  };

  beforeEach(() => {
    setMockRawQueryRowsQueue([]);
    setMockAssignmentSubmissionRead(null);
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
          name: 'Synthetic classroom',
          academic_year: '2026',
          created_at: new Date('2026-01-01T00:00:00.000Z'),
          updated_at: new Date('2026-01-01T00:00:00.000Z'),
          school_id: 'school-123',
          teacher_id: '123e4567-e89b-12d3-a456-426614174000',
          is_archived: false,
        })),
      ],
      students: [
        {
          student_id: '223e4567-e89b-12d3-a456-426614174002',
          classroom_id: '123e4567-e89b-12d3-a456-426614174001',
          status: 'active',
        },
        {
          student_id: '323e4567-e89b-12d3-a456-426614174002',
          classroom_id: '123e4567-e89b-12d3-a456-426614174001',
          status: 'active',
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
    expect(shadow.student_id).toBeTruthy();
    expect(shadow.invite_code).toMatch(/^EDL-/);

    const claimingStudentId = '223e4567-e89b-12d3-a456-426614174002';
    const studentClient = createTestORPCClient({
      Authorization: `Bearer ${claimingStudentId}`,
    }).educational;
    const claimed = await studentClient.claimShadowStudent({
      body: { inviteCode: shadow.invite_code! },
    });
    expect(claimed).toMatchObject({
      classroom_id: classroomId,
      student_id: claimingStudentId,
      full_name: 'Shadow Learner',
    });
    expect(claimed.claimed_at).toBeTruthy();
    const enrollmentId = enrolled.id;
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
        classroom_id: classroomId,
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
      await client.updateClassroomNote({ params: { id: noteId }, body: { is_pinned: true } }),
    ).toMatchObject({ is_pinned: true });
    expect(await client.deleteClassroomNote({ params: { id: noteId } })).toEqual({
      success: true,
    });
  });

  it('executes material CRUD through the native Material contract', async () => {
    const client = createTestORPCClient(headers).educational;
    const classroomId = '123e4567-e89b-12d3-a456-426614174001';
    expect(await client.getMaterials({ params: { classroomId } })).toEqual([]);
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
        params: { id: created.id },
        body: { title: 'Updated reading' },
      }),
    ).toMatchObject({ title: 'Updated reading' });
    expect(await client.deleteMaterial({ params: { id: created.id } })).toEqual({ success: true });
  });

  it('executes assignment CRUD through the native Assignment contract', async () => {
    const client = createTestORPCClient(headers).educational;
    const classroomId = '123e4567-e89b-12d3-a456-426614174001';
    expect(await client.getAssignments({ params: { classroomId } })).toEqual([]);
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
        params: { id: created.id },
        body: { title: 'Updated practice' },
      }),
    ).toMatchObject({ title: 'Updated practice' });
    expect(await client.deleteAssignment({ params: { id: created.id } })).toEqual({
      success: true,
    });
  });

  it('does not authorize a missing material using a classroom-shaped identifier', async () => {
    await expect(
      createTestORPCClient(headers).educational.updateMaterial({
        params: { id: '123e4567-e89b-12d3-a456-426614174001' },
        body: { title: 'Must not write' },
      }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('resolves stored material and assignment classrooms before update or deletion', async () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const ownClassroomId = '123e4567-e89b-12d3-a456-426614174001';
    const foreignClassroomId = '423e4567-e89b-12d3-a456-426614174001';
    setMockClassroomRelationships({
      classrooms: [
        { id: ownClassroomId, school_id: 'school-123', teacher_id: userId },
        { id: foreignClassroomId, school_id: 'other-school', teacher_id: userId },
      ],
    });
    const db = createZenStackDb({ id: userId });
    const materialId = '523e4567-e89b-12d3-a456-426614174001';
    const assignmentId = '623e4567-e89b-12d3-a456-426614174001';
    await db.material.create({
      data: {
        id: materialId,
        classroom_id: foreignClassroomId,
        title: 'Foreign material',
        type: 'link',
      },
    });
    await db.assignment.create({
      data: {
        id: assignmentId,
        classroom_id: foreignClassroomId,
        title: 'Foreign assignment',
        max_points: 20,
      },
    });
    const client = createTestORPCClient(headers).educational;
    await expect(
      client.updateMaterial({ params: { id: materialId }, body: { title: 'Must not write' } }),
    ).rejects.toMatchObject({ status: 403 });
    await expect(client.deleteMaterial({ params: { id: materialId } })).rejects.toMatchObject({
      status: 403,
    });
    await expect(
      client.updateAssignment({ params: { id: assignmentId }, body: { title: 'Must not write' } }),
    ).rejects.toMatchObject({ status: 403 });
    await expect(client.deleteAssignment({ params: { id: assignmentId } })).rejects.toMatchObject({
      status: 403,
    });
  });

  it('enforces and executes native assignment submission procedures', async () => {
    const classroomId = '123e4567-e89b-12d3-a456-426614174001';
    const assignmentId = '923e4567-e89b-12d3-a456-426614174000';
    const teacherClient = createTestORPCClient(headers).educational;
    expect(
      await teacherClient.getStudentSubmissions({
        params: { studentId: '123e4567-e89b-12d3-a456-426614174002' },
        query: {
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
      params: { assignmentId },
      body: { content: 'My work' },
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
    }).educational.getUpcomingAssignments({ params: { studentId }, query: {} });
    expect(body).toEqual([]);
  });

  it.each([
    ['rpc', false],
    ['rpc', true],
    ['openapi', false],
    ['openapi', true],
  ] as const)(
    'rejects an unenrolled submission through %s (keyed=%s)',
    async (transport, keyed) => {
      const studentId = '423e4567-e89b-12d3-a456-426614174002';
      const assignmentId = '923e4567-e89b-12d3-a456-426614174000';
      setMockActiveBond({
        user_id: studentId,
        entity_id: 'school-123',
        entity_type: 'SCHOOL',
        capacity: 'student',
      });
      const requestHeaders = { Authorization: `Bearer ${studentId}` };
      const body = {
        content: 'Unenrolled work',
        ...(keyed ? { idempotencyKey: '723e4567-e89b-12d3-a456-426614174002' } : {}),
      };
      if (transport === 'rpc') {
        await expect(
          createTestORPCClient(requestHeaders).educational.submitAssignment({
            params: { assignmentId },
            body,
          }),
        ).rejects.toMatchObject({ status: 403 });
      } else {
        const response = await app.request(
          `/api/openapi/educational/assignments/${assignmentId}/submissions`,
          {
            method: 'POST',
            headers: { ...requestHeaders, 'content-type': 'application/json' },
            body: JSON.stringify(body),
          },
        );
        // The deployed OpenAPI projection is read-only; writes never reach authority.
        expect(response.status).toBe(404);
      }
    },
  );

  it('preserves replay of a submission matching the authenticated intent', async () => {
    const studentId = '223e4567-e89b-12d3-a456-426614174002';
    const assignmentId = '923e4567-e89b-12d3-a456-426614174000';
    const submissionId = '623e4567-e89b-12d3-a456-426614174002';
    await prepareSubmissionReceipt(studentId, assignmentId, 'My work');
    setMockActiveBond({
      user_id: studentId,
      entity_id: 'school-123',
      entity_type: 'SCHOOL',
      capacity: 'student',
    });
    setMockAssignmentSubmissionRead({
      id: submissionId,
      assignment_id: assignmentId,
      student_id: studentId,
      content: 'My work',
      submitted_at: new Date('2026-10-15T00:00:00.000Z'),
      assignment: { classroom_id: '123e4567-e89b-12d3-a456-426614174001' },
    });
    await expect(
      createTestORPCClient({ Authorization: `Bearer ${studentId}` }).educational.submitAssignment({
        params: { assignmentId },
        body: {
          content: 'My work',
          idempotencyKey: '723e4567-e89b-12d3-a456-426614174002',
        },
      }),
    ).resolves.toMatchObject({ id: submissionId, content: 'My work', student_id: studentId });
  });

  it.each([
    { student_id: '423e4567-e89b-12d3-a456-426614174002' },
    { assignment_id: '523e4567-e89b-12d3-a456-426614174002' },
    { content: 'Different private work' },
  ])('does not return an existing submission with inconsistent intent %j', async (change) => {
    const studentId = '223e4567-e89b-12d3-a456-426614174002';
    const assignmentId = '923e4567-e89b-12d3-a456-426614174000';
    await prepareSubmissionReceipt(studentId, assignmentId, 'My work');
    setMockActiveBond({
      user_id: studentId,
      entity_id: 'school-123',
      entity_type: 'SCHOOL',
      capacity: 'student',
    });
    setMockAssignmentSubmissionRead({
      id: '623e4567-e89b-12d3-a456-426614174002',
      assignment_id: assignmentId,
      student_id: studentId,
      content: 'My work',
      ...change,
    });
    await expect(
      createTestORPCClient({ Authorization: `Bearer ${studentId}` }).educational.submitAssignment({
        params: { assignmentId },
        body: {
          content: 'My work',
          idempotencyKey: '723e4567-e89b-12d3-a456-426614174002',
        },
      }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it('serves procedures through the OpenAPI adapter', async () => {
    const classroomId = '123e4567-e89b-12d3-a456-426614174001';
    const response = await app.fetch(
      new Request(
        `http://sanctuary.test/api/openapi/educational/classrooms/${classroomId}/assignments`,
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
