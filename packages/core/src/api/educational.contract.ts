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
        id: z.uuid(),
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
