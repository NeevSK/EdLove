import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  AssignmentSchema,
  AssignmentSubmissionSchema,
  ClassroomGroupSchema,
  ClassroomSchema,
  ClassroomStudentSchema,
  StudentAssignmentSchema,
  StudentSubmissionSummarySchema,
  TeacherStatsSchema,
} from '../logic/schemas/classroom.schema';
import {
  ClassroomGradingSettingsSchema,
  StudentGradeSchema,
} from '../logic/schemas/grading.schema';
import { LessonSchema } from '../logic/schemas/lesson.schema';
import { MaterialSchema } from '../logic/schemas/material.schema';
import { StudentSchema } from '../logic/schemas/student.schema';
import { POAMetadataSchema } from './contract';

const c = initContract();

const classroomAuthority = (action: 'create' | 'read' | 'update' | 'delete') =>
  POAMetadataSchema.parse({ authority: { action, subject: 'Classroom' } });
const lessonAuthority = (action: 'create' | 'read' | 'update' | 'delete') =>
  POAMetadataSchema.parse({ authority: { action, subject: 'Lesson' } });
const assignmentAuthority = (action: 'create' | 'read' | 'update' | 'delete') =>
  POAMetadataSchema.parse({ authority: { action, subject: 'Assignment' } });
const assignmentSubmissionAuthority = (action: 'create' | 'read' | 'update' | 'delete') =>
  POAMetadataSchema.parse({
    authority: { action, subject: 'AssignmentSubmission' },
  });
const classroomGroupAuthority = (action: 'create' | 'read' | 'update' | 'delete') =>
  POAMetadataSchema.parse({ authority: { action, subject: 'ClassroomGroup' } });
const materialAuthority = (action: 'create' | 'read' | 'update' | 'delete') =>
  POAMetadataSchema.parse({ authority: { action, subject: 'Material' } });
const gradeAuthority = (action: 'create' | 'read' | 'update' | 'delete') =>
  POAMetadataSchema.parse({ authority: { action, subject: 'Grade' } });

export const educationalContract = c.router({
  getByTeacher: {
    method: 'GET',
    path: '/educational/classrooms/by-teacher',
    query: z.object({
      teacher_id: z.string(),
      limit: z.coerce.number().optional(),
      offset: z.coerce.number().optional(),
    }),
    responses: { 200: z.array(ClassroomSchema) },
    metadata: classroomAuthority('read'),
  },
  getByStudent: {
    method: 'GET',
    path: '/educational/classrooms/by-student',
    query: z.object({
      student_id: z.string(),
      limit: z.coerce.number().optional(),
      offset: z.coerce.number().optional(),
    }),
    responses: { 200: z.array(ClassroomSchema) },
    metadata: classroomAuthority('read'),
  },
  getBySchool: {
    method: 'GET',
    path: '/educational/classrooms/by-school',
    query: z.object({
      school_id: z.string(),
      limit: z.coerce.number().optional(),
      offset: z.coerce.number().optional(),
    }),
    responses: { 200: z.array(ClassroomSchema) },
    metadata: classroomAuthority('read'),
  },
  getAvailableByGrade: {
    method: 'GET',
    path: '/educational/classrooms/available-by-grade',
    query: z.object({ grade_id: z.string() }),
    responses: { 200: z.array(ClassroomSchema) },
    metadata: classroomAuthority('read'),
  },
  getById: {
    method: 'GET',
    path: '/educational/classrooms/:id',
    responses: { 200: ClassroomSchema },
    metadata: classroomAuthority('read'),
  },
  create: {
    method: 'POST',
    path: '/educational/classrooms',
    body: ClassroomSchema.omit({
      id: true,
      created_at: true,
      updated_at: true,
    }),
    responses: { 201: ClassroomSchema },
    metadata: classroomAuthority('create'),
  },
  update: {
    method: 'PATCH',
    path: '/educational/classrooms/:id',
    body: ClassroomSchema.partial(),
    responses: { 200: ClassroomSchema },
    metadata: classroomAuthority('update'),
  },
  delete: {
    method: 'DELETE',
    path: '/educational/classrooms/:id',
    responses: { 204: z.void() },
    metadata: classroomAuthority('delete'),
  },
  getTeacherClassrooms: {
    method: 'GET',
    path: '/educational/classrooms/teacher/:teacherId',
    responses: { 200: z.array(ClassroomSchema) },
    metadata: classroomAuthority('read'),
  },
  getTeacherStats: {
    method: 'GET',
    path: '/educational/classrooms/teacher/:teacherId/stats',
    responses: { 200: TeacherStatsSchema },
    metadata: classroomAuthority('read'),
  },

  getAll: {
    method: 'GET',
    path: '/educational/lessons',
    query: z.object({ classroom_id: z.string() }),
    responses: { 200: z.array(LessonSchema) },
    metadata: lessonAuthority('read'),
  },
  getByDate: {
    method: 'GET',
    path: '/educational/lessons/by-date',
    query: z.object({ classroom_id: z.string(), date: z.string() }),
    responses: { 200: z.array(LessonSchema) },
    metadata: lessonAuthority('read'),
  },
  createLesson: {
    method: 'POST',
    path: '/educational/lessons',
    body: LessonSchema.omit({ id: true, created_at: true }),
    responses: { 201: LessonSchema },
    metadata: lessonAuthority('create'),
  },
  updateLesson: {
    method: 'PATCH',
    path: '/educational/lessons/:id',
    body: LessonSchema.partial(),
    responses: { 200: LessonSchema },
    metadata: lessonAuthority('update'),
  },
  deleteLesson: {
    method: 'DELETE',
    path: '/educational/lessons/:id',
    responses: { 204: z.void() },
    metadata: lessonAuthority('delete'),
  },

  getAssignments: {
    method: 'GET',
    path: '/educational/assignments',
    query: z.object({ classroom_id: z.string() }),
    responses: { 200: z.array(AssignmentSchema) },
    metadata: assignmentAuthority('read'),
  },
  getByLessonAssignment: {
    method: 'GET',
    path: '/educational/assignments/by-lesson',
    query: z.object({ lesson_id: z.string() }),
    responses: { 200: z.array(AssignmentSchema) },
    metadata: assignmentAuthority('read'),
  },
  getUpcomingAssignmentsForStudent: {
    method: 'GET',
    path: '/educational/assignments/upcoming-by-student',
    query: z.object({ student_id: z.string() }),
    responses: { 200: z.array(StudentAssignmentSchema) },
    metadata: assignmentAuthority('read'),
  },
  getStudentSubmissionHistory: {
    method: 'GET',
    path: '/educational/assignments/submissions/by-student',
    query: z.object({
      student_id: z.string(),
      classroom_id: z.string().optional(),
    }),
    responses: { 200: z.array(StudentSubmissionSummarySchema) },
    metadata: assignmentSubmissionAuthority('read'),
  },
  submitAssignmentSubmission: {
    method: 'POST',
    path: '/educational/assignments/:assignmentId/submissions',
    body: z.object({
      content: z.string().optional(),
      photo_url: z.string().optional().nullable(),
    }),
    responses: { 201: AssignmentSubmissionSchema },
    metadata: assignmentSubmissionAuthority('create'),
  },
  createAssignment: {
    method: 'POST',
    path: '/educational/assignments',
    body: AssignmentSchema.omit({
      id: true,
      created_at: true,
      updated_at: true,
    }),
    responses: { 201: AssignmentSchema },
    metadata: assignmentAuthority('create'),
  },
  updateAssignment: {
    method: 'PATCH',
    path: '/educational/assignments/:id',
    body: AssignmentSchema.partial(),
    responses: { 200: AssignmentSchema },
    metadata: assignmentAuthority('update'),
  },
  deleteAssignment: {
    method: 'DELETE',
    path: '/educational/assignments/:id',
    responses: { 204: z.void() },
    metadata: assignmentAuthority('delete'),
  },

  getClassroomGroups: {
    method: 'GET',
    path: '/educational/classrooms/:classroomId/groups',
    responses: { 200: z.array(ClassroomGroupSchema) },
    metadata: classroomGroupAuthority('read'),
  },
  createClassroomGroup: {
    method: 'POST',
    path: '/educational/classrooms/:classroomId/groups',
    body: z.object({
      name: z.string(),
      description: z.string().optional().nullable(),
      student_ids: z.array(z.string()).optional(),
      color: z.string().optional().nullable(),
    }),
    responses: { 201: ClassroomGroupSchema },
    metadata: classroomGroupAuthority('create'),
  },
  updateClassroomGroup: {
    method: 'PATCH',
    path: '/educational/classroom-groups/:id',
    body: z.object({
      name: z.string().optional(),
      description: z.string().optional().nullable(),
      student_ids: z.array(z.string()).optional(),
      color: z.string().optional().nullable(),
    }),
    responses: { 200: ClassroomGroupSchema },
    metadata: classroomGroupAuthority('update'),
  },
  deleteClassroomGroup: {
    method: 'DELETE',
    path: '/educational/classroom-groups/:id',
    responses: { 204: z.void() },
    metadata: classroomGroupAuthority('delete'),
  },

  getClassroomStudents: {
    method: 'GET',
    path: '/educational/classrooms/:classroomId/students',
    responses: { 200: z.array(ClassroomStudentSchema) },
    metadata: classroomAuthority('read'),
  },
  enrollClassroomStudent: {
    method: 'POST',
    path: '/educational/classrooms/:classroomId/students/:studentId',
    body: z.object({}),
    responses: { 201: ClassroomStudentSchema },
    metadata: classroomAuthority('update'),
  },
  removeClassroomStudent: {
    method: 'DELETE',
    path: '/educational/classrooms/:classroomId/students/:studentId',
    responses: { 204: z.void() },
    metadata: classroomAuthority('update'),
  },

  getEnrollmentRecords: {
    method: 'GET',
    path: '/educational/enrollments',
    query: z.object({ classroom_id: z.string() }),
    responses: { 200: z.array(StudentSchema) },
    metadata: classroomAuthority('read'),
  },
  addShadowStudent: {
    method: 'POST',
    path: '/educational/enrollments/shadow',
    body: z.object({
      classroom_id: z.string(),
      full_name: z.string(),
      roll_number: z.string().optional(),
      notes: z.string().optional(),
    }),
    responses: { 201: StudentSchema },
    metadata: classroomAuthority('update'),
  },
  claimStudent: {
    method: 'POST',
    path: '/educational/enrollments/claim',
    body: z.object({ invite_code: z.string() }),
    responses: { 200: StudentSchema },
    metadata: classroomAuthority('update'),
  },
  add: {
    method: 'POST',
    path: '/educational/enrollments',
    body: z.object({
      classroom_id: z.string(),
      student_id: z.string(),
      roll_number: z.string().optional(),
      notes: z.string().optional(),
    }),
    responses: { 201: StudentSchema },
    metadata: classroomAuthority('update'),
  },
  updateById: {
    method: 'PATCH',
    path: '/educational/enrollments/:id',
    body: z.object({
      roll_number: z.string().optional(),
      notes: z.string().optional(),
    }),
    responses: { 200: StudentSchema },
    metadata: classroomAuthority('update'),
  },
  updateEnrollmentRecord: {
    method: 'PATCH',
    path: '/educational/enrollments/by-student',
    body: z.object({
      classroom_id: z.string(),
      student_id: z.string(),
      updates: z.object({
        roll_number: z.string().optional(),
        notes: z.string().optional(),
      }),
    }),
    responses: { 200: StudentSchema },
    metadata: classroomAuthority('update'),
  },
  deleteEnrollmentRecord: {
    method: 'DELETE',
    path: '/educational/enrollments/:id',
    responses: { 204: z.void() },
    metadata: classroomAuthority('update'),
  },

  getAllMaterials: {
    method: 'GET',
    path: '/educational/materials',
    query: z.object({ classroom_id: z.string() }),
    responses: { 200: z.array(MaterialSchema) },
    metadata: materialAuthority('read'),
  },
  getByLessonMaterial: {
    method: 'GET',
    path: '/educational/materials/by-lesson',
    query: z.object({ lesson_id: z.string() }),
    responses: { 200: z.array(MaterialSchema) },
    metadata: materialAuthority('read'),
  },
  createMaterial: {
    method: 'POST',
    path: '/educational/materials',
    body: MaterialSchema.omit({ id: true, created_at: true, updated_at: true }),
    responses: { 201: MaterialSchema },
    metadata: materialAuthority('create'),
  },
  updateMaterial: {
    method: 'PATCH',
    path: '/educational/materials/:id',
    body: MaterialSchema.partial(),
    responses: { 200: MaterialSchema },
    metadata: materialAuthority('update'),
  },
  deleteMaterial: {
    method: 'DELETE',
    path: '/educational/materials/:id',
    responses: { 204: z.void() },
    metadata: materialAuthority('delete'),
  },

  getReportCard: {
    method: 'GET',
    path: '/educational/grades/report-card',
    query: z.object({ student_id: z.string() }),
    responses: { 200: z.array(StudentGradeSchema) },
    metadata: gradeAuthority('read'),
  },
  getClassroomGrades: {
    method: 'GET',
    path: '/educational/grades/classroom',
    query: z.object({ classroom_id: z.string() }),
    responses: { 200: z.array(StudentGradeSchema) },
    metadata: gradeAuthority('read'),
  },
  submitGrade: {
    method: 'POST',
    path: '/educational/grades',
    body: z.object({
      student_id: z.string(),
      classroom_id: z.string(),
      marks: z.number(),
      assignment_id: z.string().optional(),
      feedback: z.string().optional(),
    }),
    responses: { 201: StudentGradeSchema },
    metadata: gradeAuthority('create'),
  },
  deleteGrade: {
    method: 'DELETE',
    path: '/educational/grades/:id',
    responses: { 204: z.void() },
    metadata: gradeAuthority('delete'),
  },
  getGradingSettings: {
    method: 'GET',
    path: '/educational/classrooms/:classroomId/grading-settings',
    responses: { 200: ClassroomGradingSettingsSchema },
    metadata: gradeAuthority('read'),
  },
  updateGradingSettings: {
    method: 'PATCH',
    path: '/educational/classrooms/:classroomId/grading-settings',
    body: ClassroomGradingSettingsSchema.partial(),
    responses: { 200: ClassroomGradingSettingsSchema },
    metadata: gradeAuthority('update'),
  },
  getHistoricalAcademicRecords: {
    method: 'GET',
    path: '/educational/students/:studentId/history',
    responses: { 200: z.array(z.any()) }, // Using any for now to avoid schema recursion issues in contract
    metadata: POAMetadataSchema.parse({
      authority: { action: 'read', subject: 'AcademicHistory' },
    }),
  },
  getHistoricalProfessionalRecords: {
    method: 'GET',
    path: '/educational/teachers/:teacherId/history',
    responses: { 200: z.array(z.any()) },
    metadata: POAMetadataSchema.parse({
      authority: { action: 'read', subject: 'ProfessionalHistory' },
    }),
  },
  getHistoricalGovernanceRecords: {
    method: 'GET',
    path: '/educational/principals/:principalId/history',
    responses: { 200: z.array(z.any()) },
    metadata: POAMetadataSchema.parse({
      authority: { action: 'read', subject: 'GovernanceHistory' },
    }),
  },
  getSchoolLegacyHistory: {
    method: 'GET',
    path: '/educational/schools/:schoolId/legacy',
    responses: { 200: z.array(z.any()) },
    metadata: POAMetadataSchema.parse({
      authority: { action: 'read', subject: 'School' },
    }),
  },
  getClassroomLegacyHistory: {
    method: 'GET',
    path: '/educational/classrooms/:classroomId/legacy',
    responses: { 200: z.array(z.any()) },
    metadata: POAMetadataSchema.parse({
      authority: { action: 'read', subject: 'Classroom' },
    }),
  },
});
