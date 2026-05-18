/**
 * PowerSync Schema — Client-Side Drizzle SQLite Table Definitions (May 2026)
 *
 * Defines the type-safe SQLite database schema using Drizzle ORM.
 * These tables are replicated from Supabase Postgres down to the local
 * SQLCipher SQLite file on the device.
 *
 * Since this file uses pure Drizzle sqliteTable definitions with no native
 * JSI C++ dependencies, it compiles cleanly across both server (Node/Vitest)
 * and mobile (React Native/Expo) environments.
 *
 * @see https://docs.powersync.com/usage/use-case-examples/drizzle
 */
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

// ─── Attendance ───────────────────────────────────────────────────────────────
export const attendance = sqliteTable('attendance', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull(),
  classroomId: text('classroom_id').notNull(),
  date: text('date').notNull(), // ISO date string (YYYY-MM-DD)
  status: text('status').notNull(), // 'present' | 'absent' | 'late' | 'excused'
  markedBy: text('marked_by').notNull(),
  note: text('note'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  // Compound index on classroom and date for lightning-fast attendance sheets
  index('attendance_classroom_date_idx').on(table.classroomId, table.date),
  index('attendance_student_idx').on(table.studentId),
]);

// ─── Students (People) ────────────────────────────────────────────────────────
export const students = sqliteTable('students', {
  id: text('id').primaryKey(),
  fullName: text('full_name').notNull(),
  classroomId: text('classroom_id').notNull(),
  schoolId: text('school_id').notNull(),
  gradeId: text('grade_id'),
  sectionId: text('section_id'),
  admissionNumber: text('admission_number'),
  // Mode boolean handles 0/1 integer conversion automatically at the database level!
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('students_classroom_idx').on(table.classroomId),
  index('students_school_idx').on(table.schoolId),
]);

// ─── Classrooms ───────────────────────────────────────────────────────────────
export const classrooms = sqliteTable('classrooms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  schoolId: text('school_id').notNull(),
  gradeId: text('grade_id'),
  sectionId: text('section_id'),
  teacherId: text('teacher_id'),
  academicYear: text('academic_year').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('classrooms_school_idx').on(table.schoolId),
  index('classrooms_teacher_idx').on(table.teacherId),
]);

// ─── Moods / Wellbeing ────────────────────────────────────────────────────────
export const moodLogs = sqliteTable('mood_logs', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull(),
  recordedBy: text('recorded_by').notNull(),
  mood: text('mood').notNull(), // e.g. 'happy' | 'neutral' | 'sad'
  note: text('note'),
  recordedAt: text('recorded_at').notNull(),
}, (table) => [
  index('mood_logs_student_idx').on(table.studentId),
  index('mood_logs_recorded_idx').on(table.recordedAt),
]);

// ─── Schools (needed for context) ─────────────────────────────────────────────
export const schools = sqliteTable('schools', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type'),
  subscriptionTier: text('subscription_tier'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
});

// ─── Cedar Policies (Local PDP Distribution) ──────────────────────────────────
export const cedarPolicies = sqliteTable('cedar_policies', {
  id: text('id').primaryKey(), // policy ID
  name: text('name').notNull(), // e.g. 'school/principal.cedar'
  content: text('content').notNull(), // Cedar DSL string
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('cedar_policies_name_idx').on(table.name),
]);

// ─── Permission Snapshots (Local Capability Token Claims) ─────────────────────
export const permissionSnapshots = sqliteTable('permission_snapshots', {
  id: text('id').primaryKey(), // userId or compound
  userId: text('user_id').notNull(),
  schoolId: text('school_id').notNull(),
  generatedAt: text('generated_at').notNull(),
  expiresAt: text('expires_at').notNull(),
  permissions: text('permissions').notNull(), // Serialised JSON string
  temporalHints: text('temporal_hints'), // Serialised JSON string
  signature: text('signature').notNull(),
}, (table) => [
  index('permission_snapshots_user_idx').on(table.userId),
]);


// ─── Form Templates ───────────────────────────────────────────────────────────
export const formTemplates = sqliteTable('form_templates', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  config: text('config').notNull(), // Serialised JSON string of FieldDefinition[]
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(false),
  slug: text('slug'),
  category: text('category'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('form_templates_owner_idx').on(table.ownerId),
  index('form_templates_slug_idx').on(table.slug),
]);

// ─── Form Responses ───────────────────────────────────────────────────────────
export const formResponses = sqliteTable('form_responses', {
  id: text('id').primaryKey(),
  templateId: text('template_id').notNull(),
  responderId: text('responder_id'),
  data: text('data').notNull(), // Serialised JSON string of response object
  submittedAt: text('submitted_at').notNull(),
}, (table) => [
  index('form_responses_template_idx').on(table.templateId),
]);

// ─── Shared Database Schema Object ────────────────────────────────────────────
export const AppSchema = {
  attendance,
  students,
  classrooms,
  moodLogs,
  schools,
  cedarPolicies,
  formTemplates,
  formResponses,
  permissionSnapshots,
};

// ─── Relational TypeScript Types ──────────────────────────────────────────────
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = typeof attendance.$inferInsert;

export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;

export type Classroom = typeof classrooms.$inferSelect;
export type InsertClassroom = typeof classrooms.$inferInsert;

export type MoodLog = typeof moodLogs.$inferSelect;
export type InsertMoodLog = typeof moodLogs.$inferInsert;

export type School = typeof schools.$inferSelect;
export type InsertSchool = typeof schools.$inferInsert;

export type CedarPolicy = typeof cedarPolicies.$inferSelect;
export type InsertCedarPolicy = typeof cedarPolicies.$inferInsert;

export type DrizzleFormTemplate = typeof formTemplates.$inferSelect;
export type InsertDrizzleFormTemplate = typeof formTemplates.$inferInsert;

export type DrizzleFormResponse = typeof formResponses.$inferSelect;
export type InsertDrizzleFormResponse = typeof formResponses.$inferInsert;

export type PermissionSnapshot = typeof permissionSnapshots.$inferSelect;
export type InsertPermissionSnapshot = typeof permissionSnapshots.$inferInsert;

