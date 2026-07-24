// ─── Pricing Manifest (Entitlement Source of Truth) ───────────────────────────
export const pricingManifest = sqliteTable(
  'pricing_manifest',
  {
    id: text('id').primaryKey(),
    tier: text('tier').notNull(), // 'FREE' | 'PRO' | 'INSTITUTIONAL'
    features: text('features').notNull(), // JSON array of entitlement keys
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('pricing_manifest_tier_idx').on(table.tier)],
);

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
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// ─── Attendance ───────────────────────────────────────────────────────────────
export const attendance = sqliteTable(
  'attendance',
  {
    id: text('id').primaryKey(),
    studentId: text('student_id').notNull(),
    classroomId: text('classroom_id').notNull(),
    date: text('date').notNull(), // ISO date string (YYYY-MM-DD)
    status: text('status').notNull(), // 'present' | 'absent' | 'late' | 'excused'
    markedBy: text('marked_by').notNull(),
    note: text('note'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    occurredAt: text('occurred_at'),
    academicCycleId: text('academic_cycle_id'),
  },
  (table) => [
    // Compound index on classroom and date for lightning-fast attendance sheets
    index('attendance_classroom_date_idx').on(table.classroomId, table.date),
    index('attendance_student_idx').on(table.studentId),
  ],
);

// ─── Students (People) ────────────────────────────────────────────────────────
export const students = sqliteTable(
  'students',
  {
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
  },
  (table) => [
    index('students_classroom_idx').on(table.classroomId),
    index('students_school_idx').on(table.schoolId),
  ],
);

// ─── Classrooms ───────────────────────────────────────────────────────────────
export const classrooms = sqliteTable(
  'classrooms',
  {
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
  },
  (table) => [
    index('classrooms_school_idx').on(table.schoolId),
    index('classrooms_teacher_idx').on(table.teacherId),
  ],
);

// ─── Moods / Wellbeing ────────────────────────────────────────────────────────
export const moodLogs = sqliteTable(
  'mood_logs',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    moodScore: integer('mood_score').notNull(),
    mood: text('mood'),
    note: text('note'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('mood_logs_user_idx').on(table.userId),
    index('mood_logs_created_idx').on(table.createdAt),
  ],
);

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
export const cedarPolicies = sqliteTable(
  'cedar_policies',
  {
    id: text('id').primaryKey(), // policy ID
    name: text('name').notNull(), // e.g. 'school/principal.cedar'
    content: text('content').notNull(), // Cedar DSL string
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('cedar_policies_name_idx').on(table.name)],
);

// ─── Cryptographically Signed Permission Snapshots ─────────────────────────────
export const permissionSnapshots = sqliteTable(
  'permission_snapshots',
  {
    id: text('id').primaryKey(), // user-school compound id
    userId: text('user_id').notNull(),
    schoolId: text('school_id').notNull(),
    generatedAt: text('generated_at').notNull(),
    expiresAt: text('expires_at').notNull(),
    permissions: text('permissions').notNull(), // Serialized JSON: Record<Resource, Record<Action, boolean>>
    temporalHints: text('temporal_hints'), // Optional temporal lease details/hints (JSON string or null)
    signature: text('signature').notNull(), // HMAC SHA-256 Server Cryptographic Signature
  },
  (table) => [index('permission_snapshots_user_idx').on(table.userId)],
);

// ─── Policy Version (Token Invalidation Key, ADR-006) ──────────────────────────
export const policyVersion = sqliteTable(
  'policy_version',
  {
    id: text('id').primaryKey(),
    hash: text('hash').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
);

// ─── Form Templates ───────────────────────────────────────────────────────────
export const formTemplates = sqliteTable(
  'form_templates',
  {
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
  },
  (table) => [
    index('form_templates_owner_idx').on(table.ownerId),
    index('form_templates_slug_idx').on(table.slug),
  ],
);

// ─── Form Responses ───────────────────────────────────────────────────────────
export const formResponses = sqliteTable(
  'form_responses',
  {
    id: text('id').primaryKey(),
    templateId: text('template_id').notNull(),
    responderId: text('responder_id'),
    data: text('data').notNull(), // Serialised JSON string of response object
    submittedAt: text('submitted_at').notNull(),
  },
  (table) => [index('form_responses_template_idx').on(table.templateId)],
);

// ─── Shared Database Schema Object ────────────────────────────────────────────
export const AppSchema = {
  attendance,
  students,
  classrooms,
  moodLogs,
  schools,
  cedarPolicies,
  permissionSnapshots,
  policyVersion,
  formTemplates,
  formResponses,
  pricingManifest,
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

export type PricingManifest = typeof pricingManifest.$inferSelect;
export type InsertPricingManifest = typeof pricingManifest.$inferInsert;

export type PolicyVersion = typeof policyVersion.$inferSelect;
export type InsertPolicyVersion = typeof policyVersion.$inferInsert;
