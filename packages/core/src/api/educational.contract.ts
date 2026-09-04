import type { SovereignContract } from '@repo/core/api/contracts';
import { ClassroomSchema, LessonSchema } from '@repo/core/logic/schemas/classroom.schema';
import {
  ClassroomNoteLifecycleEventSchema,
  ClassroomNoteSchema,
} from '@repo/core/logic/schemas/classroom-note.schema';
import { z } from 'zod';

const classroomAuthority = (action: 'create' | 'read' | 'update' | 'delete') =>
  ({
    policy: { action, subject: 'Classroom' },
  }) as const;

const lessonAuthority = (action: 'create' | 'read' | 'update' | 'delete') =>
  ({
    policy: { action, subject: 'Lesson' },
  }) as const;

const classroomNoteCreate = ClassroomNoteSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  author_id: true,
  author: true,
}).extend({
  note_type: ClassroomNoteSchema.shape.note_type.optional(),
  visibility: ClassroomNoteSchema.shape.visibility.optional(),
  is_pinned: ClassroomNoteSchema.shape.is_pinned.optional(),
});

const classroomNoteAuthority = (action: 'create' | 'read' | 'update' | 'delete') =>
  ({
    policy: { action, subject: 'ClassroomNote' },
  }) as const;

const classroomStudent = z.object({
  id: z.uuid(),
  classroom_id: z.uuid(),
  student_id: z.uuid().nullable(),
  full_name: z.string().nullable(),
  invite_code: z.string().nullable(),
  roll_number: z.number().nullable(),
  enrolled_at: z.string().nullable(),
  claimed_at: z.string().nullable(),
  class_id: z.uuid().optional(),
});

const material = z.object({
  id: z.uuid(),
  classroom_id: z.uuid(),
  lesson_id: z.uuid().nullable(),
  title: z.string(),
  type: z.string(),
  url: z.string().nullable(),
  content: z.string().nullable(),
  is_pinned: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

const assignment = z.object({
  id: z.uuid(),
  classroom_id: z.uuid(),
  lesson_id: z.uuid().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  due_date: z.string().nullable(),
  max_points: z.number().int().positive(),
  created_at: z.string(),
  updated_at: z.string(),
});

const submission = z.object({
  id: z.uuid(),
  assignment_id: z.uuid(),
  student_id: z.uuid(),
  classroom_id: z.uuid(),
  content: z.string().nullable(),
  submitted_at: z.string(),
  grade: z.number().int().nullable(),
  feedback: z.string().nullable(),
  graded_at: z.string().nullable(),
  idempotency_key: z.string().nullable(),
});

/**
 * Educational Port (Sovereign RPC)
 * Framework-agnostic definition of the Educational API.
 * Updated: Zod v4 + Hono alignment.
 * [LOUD-FAILURE] Methods must be explicitly mapped in the contract to be exposed via POA.
 */
export const educationalContract = {
  getByTeacher: {
    method: 'get',
    path: '/educational/classrooms/by-teacher',
    request: {
      query: z.strictObject({
        teacher_id: z.uuid(),
        limit: z.coerce.number().optional(),
        offset: z.coerce.number().optional(),
      }),
    },
    responses: {
      200: {
        schema: z.array(ClassroomSchema),
        description: 'Retrieve classrooms by teacher',
      },
    },
    metadata: classroomAuthority('read'),
  },

  getByStudent: {
    method: 'get',
    path: '/educational/classrooms/by-student',
    request: {
      query: z.strictObject({
        student_id: z.uuid(),
      }),
    },
    responses: {
      200: {
        schema: z.array(ClassroomSchema),
        description: 'Retrieve classrooms by student',
      },
    },
    metadata: classroomAuthority('read'),
  },

  getTeacherStats: {
    method: 'get',
    path: '/educational/classrooms/stats/teacher/:id',
    request: {
      params: z.strictObject({ id: z.uuid() }),
    },
    responses: {
      200: {
        schema: z.strictObject({
          active_classes: z.number(),
          total_students: z.number(),
          average_pulse: z.number().optional(),
        }),
        description: 'Get statistics for a teacher',
      },
    },
    metadata: classroomAuthority('read'),
  },

  getById: {
    method: 'get',
    path: '/educational/classrooms/:id',
    request: {
      params: z.strictObject({ id: z.uuid() }),
    },
    responses: {
      200: {
        schema: ClassroomSchema,
        description: 'Retrieve a single classroom',
      },
    },
    metadata: classroomAuthority('read'),
  },

  createClassroom: {
    method: 'post',
    path: '/educational/classrooms',
    request: {
      body: z.strictObject({
        name: z.string().min(1),
        teacherId: z.uuid(),
        schoolId: z.uuid().optional().nullable(),
        gradeId: z.uuid().optional().nullable(),
        sectionId: z.uuid().optional().nullable(),
        subject: z.string().optional().nullable(),
        description: z.string().optional().nullable(),
        handle: z.string().optional().nullable(),
        colorTheme: z.string().optional().nullable(),
        academicYear: z.string().optional().nullable(),
      }),
    },
    responses: { 201: { schema: ClassroomSchema, description: 'Create classroom' } },
    metadata: classroomAuthority('create'),
  },

  updateClassroom: {
    method: 'patch',
    path: '/educational/classrooms/:id',
    request: {
      params: z.strictObject({ id: z.uuid() }),
      body: z.strictObject({
        name: z.string().optional(),
        teacherId: z.uuid().optional().nullable(),
        schoolId: z.uuid().optional().nullable(),
        gradeId: z.uuid().optional().nullable(),
        sectionId: z.uuid().optional().nullable(),
        subject: z.string().optional().nullable(),
        description: z.string().optional().nullable(),
        handle: z.string().optional().nullable(),
        colorTheme: z.string().optional().nullable(),
        isArchived: z.boolean().optional(),
      }),
    },
    responses: { 200: { schema: ClassroomSchema, description: 'Update classroom' } },
    metadata: classroomAuthority('update'),
  },

  deleteClassroom: {
    method: 'delete',
    path: '/educational/classrooms/:id',
    request: { params: z.strictObject({ id: z.uuid() }) },
    responses: {
      200: { schema: z.object({ success: z.literal(true) }), description: 'Delete classroom' },
    },
    metadata: classroomAuthority('delete'),
  },

  getClassroomResources: {
    method: 'get',
    path: '/educational/classrooms/:classroomId/resources',
    request: {
      params: z.strictObject({ classroomId: z.uuid() }),
    },
    responses: {
      200: {
        schema: z.array(z.any()), // Simplified for now to avoid schema drift
        description: 'Retrieve classroom resources',
      },
    },
    metadata: classroomAuthority('read'),
  },

  createLesson: {
    method: 'post',
    path: '/educational/lessons',
    request: {
      body: LessonSchema.omit({ id: true, created_at: true }),
    },
    responses: {
      201: {
        schema: LessonSchema,
        description: 'Lesson created successfully',
      },
    },
    metadata: lessonAuthority('create'),
  },

  getClassroomStudents: {
    method: 'get',
    path: '/educational/classrooms/:classroomId/students',
    request: { params: z.strictObject({ classroomId: z.uuid() }) },
    responses: {
      200: { schema: z.array(classroomStudent), description: 'List classroom students' },
    },
    metadata: classroomAuthority('read'),
  },

  enrollStudent: {
    method: 'post',
    path: '/educational/classrooms/:classroomId/students/enroll',
    request: {
      params: z.strictObject({ classroomId: z.uuid() }),
      body: z.strictObject({ studentId: z.uuid(), rollNumber: z.number().optional().nullable() }),
    },
    responses: { 200: { schema: classroomStudent, description: 'Enroll a student' } },
    metadata: classroomAuthority('update'),
  },

  addShadowStudent: {
    method: 'post',
    path: '/educational/classrooms/:classroomId/students/shadow',
    request: {
      params: z.strictObject({ classroomId: z.uuid() }),
      body: z.strictObject({
        fullName: z.string().trim().min(1).max(200),
        rollNumber: z.number().optional().nullable(),
      }),
    },
    responses: {
      201: { schema: classroomStudent, description: 'Add an unclaimed classroom student' },
    },
    metadata: classroomAuthority('create'),
  },

  updateClassroomStudent: {
    method: 'patch',
    path: '/educational/classroom-students/:id',
    request: {
      params: z.strictObject({ id: z.uuid() }),
      body: z.strictObject({
        classroomId: z.uuid().optional(),
        fullName: z.string().trim().min(1).max(200).optional(),
        rollNumber: z.number().optional().nullable(),
      }),
    },
    responses: { 200: { schema: classroomStudent, description: 'Update a classroom student' } },
    metadata: classroomAuthority('update'),
  },

  removeClassroomStudent: {
    method: 'delete',
    path: '/educational/classroom-students/:id',
    request: {
      params: z.strictObject({ id: z.uuid() }),
      body: z.strictObject({ classroomId: z.uuid().optional() }),
    },
    responses: {
      200: {
        schema: z.object({ success: z.literal(true) }),
        description: 'Remove a classroom student',
      },
    },
    metadata: classroomAuthority('delete'),
  },

  claimShadowStudent: {
    method: 'post',
    path: '/educational/classroom-students/claim',
    request: {
      body: z.strictObject({ inviteCode: z.string().trim().min(8).max(128) }),
    },
    responses: { 200: { schema: classroomStudent, description: 'Claimed classroom student' } },
    metadata: classroomAuthority('create'),
  },

  getMaterials: {
    method: 'get',
    path: '/educational/classrooms/:classroomId/materials',
    request: { query: z.strictObject({ classroomId: z.uuid() }) },
    responses: { 200: { schema: z.array(material), description: 'Classroom materials' } },
    metadata: classroomAuthority('read'),
  },

  getLessonMaterials: {
    method: 'get',
    path: '/educational/lessons/:lessonId/materials',
    request: { query: z.strictObject({ lessonId: z.uuid() }) },
    responses: { 200: { schema: z.array(material), description: 'Lesson materials' } },
    metadata: lessonAuthority('read'),
  },

  createMaterial: {
    method: 'post',
    path: '/educational/materials',
    request: {
      body: z.strictObject({
        classroomId: z.uuid(),
        lessonId: z.uuid().nullable().optional(),
        title: z.string().trim().min(1).max(240),
        type: z.string().trim().min(1).max(80),
        url: z.url().nullable().optional(),
        content: z.string().max(100_000).nullable().optional(),
        isPinned: z.boolean().optional(),
      }),
    },
    responses: { 201: { schema: material, description: 'Created material' } },
    metadata: classroomAuthority('create'),
  },

  updateMaterial: {
    method: 'patch',
    path: '/educational/materials/:id',
    request: {
      params: z.strictObject({ id: z.uuid() }),
      body: z
        .strictObject({
          title: z.string().trim().min(1).max(240).optional(),
          type: z.string().trim().min(1).max(80).optional(),
          url: z.url().nullable().optional(),
          content: z.string().max(100_000).nullable().optional(),
          isPinned: z.boolean().optional(),
        })
        .refine((value) => Object.keys(value).length > 0, 'At least one field is required'),
    },
    responses: { 200: { schema: material, description: 'Updated material' } },
    metadata: classroomAuthority('update'),
  },

  deleteMaterial: {
    method: 'delete',
    path: '/educational/materials/:id',
    request: { params: z.strictObject({ id: z.uuid() }) },
    responses: {
      200: { schema: z.object({ success: z.literal(true) }), description: 'Deleted material' },
    },
    metadata: classroomAuthority('delete'),
  },

  getAssignments: {
    method: 'get',
    path: '/educational/classrooms/:classroomId/assignments',
    request: { query: z.strictObject({ classroomId: z.uuid() }) },
    responses: { 200: { schema: z.array(assignment), description: 'Classroom assignments' } },
    metadata: classroomAuthority('read'),
  },

  getLessonAssignments: {
    method: 'get',
    path: '/educational/lessons/:lessonId/assignments',
    request: { query: z.strictObject({ lessonId: z.uuid() }) },
    responses: { 200: { schema: z.array(assignment), description: 'Lesson assignments' } },
    metadata: lessonAuthority('read'),
  },

  createAssignment: {
    method: 'post',
    path: '/educational/assignments',
    request: {
      body: z.strictObject({
        classroomId: z.uuid(),
        lessonId: z.uuid().nullable().optional(),
        title: z.string().trim().min(1).max(240),
        description: z.string().max(20_000).nullable().optional(),
        dueDate: z.string().datetime().nullable().optional(),
        maxPoints: z.number().int().positive().max(10_000).optional(),
      }),
    },
    responses: { 201: { schema: assignment, description: 'Created assignment' } },
    metadata: classroomAuthority('create'),
  },

  updateAssignment: {
    method: 'patch',
    path: '/educational/assignments/:id',
    request: {
      params: z.strictObject({ id: z.uuid() }),
      body: z
        .strictObject({
          title: z.string().trim().min(1).max(240).optional(),
          description: z.string().max(20_000).nullable().optional(),
          dueDate: z.string().datetime().nullable().optional(),
          maxPoints: z.number().int().positive().max(10_000).optional(),
        })
        .refine((value) => Object.keys(value).length > 0, 'At least one field is required'),
    },
    responses: { 200: { schema: assignment, description: 'Updated assignment' } },
    metadata: classroomAuthority('update'),
  },

  deleteAssignment: {
    method: 'delete',
    path: '/educational/assignments/:id',
    request: { params: z.strictObject({ id: z.uuid() }) },
    responses: {
      200: { schema: z.object({ success: z.literal(true) }), description: 'Deleted assignment' },
    },
    metadata: classroomAuthority('delete'),
  },

  getStudentSubmissions: {
    method: 'get',
    path: '/educational/students/:studentId/submissions',
    request: { query: z.strictObject({ studentId: z.uuid(), classroomId: z.uuid().optional() }) },
    responses: { 200: { schema: z.array(submission), description: 'Student submissions' } },
    metadata: classroomAuthority('read'),
  },

  getUpcomingAssignments: {
    method: 'get',
    path: '/educational/students/:studentId/assignments/upcoming',
    request: {
      query: z.strictObject({
        studentId: z.uuid(),
        limit: z.coerce.number().int().min(1).max(24).optional(),
      }),
    },
    responses: {
      200: {
        schema: z.array(
          assignment.extend({ classroom: z.string().nullable(), submitted: z.boolean() }),
        ),
        description: 'Upcoming assignments',
      },
    },
    metadata: classroomAuthority('read'),
  },

  submitAssignment: {
    method: 'post',
    path: '/educational/assignments/:assignmentId/submissions',
    request: {
      body: z.strictObject({
        assignmentId: z.uuid(),
        content: z.string().max(100_000).nullable().optional(),
        idempotencyKey: z.uuid().optional(),
      }),
    },
    responses: { 201: { schema: submission, description: 'Submitted assignment' } },
    metadata: { policy: { action: 'create', subject: 'AssignmentSubmission' } } as const,
  },

  gradeAssignmentSubmission: {
    method: 'patch',
    path: '/educational/submissions/:id/grade',
    request: {
      body: z.strictObject({
        id: z.uuid(),
        grade: z.number().int().min(0).max(10_000).nullable(),
        feedback: z.string().max(20_000).nullable().optional(),
      }),
    },
    responses: { 200: { schema: submission, description: 'Graded submission' } },
    metadata: classroomAuthority('update'),
  },

  // Classroom Notes
  getClassroomNotes: {
    method: 'get',
    path: '/educational/classrooms/:classroomId/notes',
    request: {
      params: z.strictObject({ classroomId: z.uuid() }),
    },
    responses: {
      200: {
        schema: z.array(ClassroomNoteSchema),
        description: 'Retrieve classroom notes',
      },
    },
    metadata: classroomNoteAuthority('read'),
  },

  getClassroomNoteSnapshot: {
    method: 'get',
    path: '/educational/classrooms/:classroomId/notes/snapshot',
    request: {
      params: z.strictObject({ classroomId: z.uuid() }),
      query: z.strictObject({ view_date: z.string() }),
    },
    responses: {
      200: {
        schema: z.array(ClassroomNoteSchema),
        description: 'Retrieve classroom notes snapshot',
      },
    },
    metadata: classroomNoteAuthority('read'),
  },

  createClassroomNote: {
    method: 'post',
    path: '/educational/notes',
    request: {
      body: classroomNoteCreate,
    },
    responses: {
      201: {
        schema: ClassroomNoteSchema,
        description: 'Classroom note created successfully',
      },
    },
    metadata: classroomNoteAuthority('create'),
  },

  updateClassroomNote: {
    method: 'patch',
    path: '/educational/notes/:id',
    request: {
      params: z.strictObject({ id: z.uuid() }),
      body: ClassroomNoteSchema.pick({
        content: true,
        is_pinned: true,
        visibility: true,
      }).partial(),
    },
    responses: {
      200: {
        schema: ClassroomNoteSchema,
        description: 'Classroom note updated successfully',
      },
    },
    metadata: classroomNoteAuthority('update'),
  },

  deleteClassroomNote: {
    method: 'delete',
    path: '/educational/notes/:id',
    request: {
      params: z.strictObject({ id: z.uuid() }),
    },
    responses: {
      204: {
        schema: z.null(),
        description: 'Classroom note deleted successfully',
      },
    },
    metadata: classroomNoteAuthority('delete'),
  },

  getClassroomNoteTimeline: {
    method: 'get',
    path: '/educational/notes/:id/timeline',
    request: {
      params: z.strictObject({ id: z.uuid() }),
    },
    responses: {
      200: {
        schema: z.array(ClassroomNoteLifecycleEventSchema),
        description: 'Retrieve classroom note timeline',
      },
    },
    metadata: classroomNoteAuthority('read'),
  },
} as const satisfies SovereignContract;
