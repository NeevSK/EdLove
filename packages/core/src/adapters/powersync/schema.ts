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

export const userEntitlementGrants = sqliteTable(
  'user_entitlement_grants',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    bondId: text('bond_id'),
    entityId: text('entity_id'),
    entityType: text('entity_type'),
    scopeType: text('scope_type').notNull(),
    tier: text('tier').notNull(),
    modules: text('modules').notNull(),
    source: text('source').notNull(),
    status: text('status').notNull(),
    startsAt: text('starts_at').notNull(),
    expiresAt: text('expires_at'),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('user_entitlement_grants_user_scope_idx').on(table.userId, table.scopeType),
    index('user_entitlement_grants_user_bond_idx').on(table.userId, table.bondId),
  ],
);

// ─── User Preferences ────────────────────────────────────────────────────────
// Arrays and JSON are serialized by PowerSync into SQLite text columns.
export const userPreferences = sqliteTable(
  'user_preferences',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    favoriteFeatures: text('favorite_features').notNull(),
    hiddenFeatures: text('hidden_features').notNull(),
    morningCheckTime: text('morning_check_time'),
    afternoonCheckTime: text('afternoon_check_time'),
    eveningWindDownTime: text('evening_wind_down_time'),
    enableContextualPrompts: integer('enable_contextual_prompts', { mode: 'boolean' })
      .notNull()
      .default(true),
    enableUsageTracking: integer('enable_usage_tracking', { mode: 'boolean' })
      .notNull()
      .default(true),
    notificationSettings: text('notification_settings'),
    updatedAt: text('updated_at').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [index('user_preferences_user_idx').on(table.userId)],
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

// ─── Offline identity bonds ──────────────────────────────────────────────────
// Bonds are the local read projection of ReBAC context. They are refreshed by
// the server and never become an offline authority for privileged mutations.
export const bonds = sqliteTable(
  'bonds',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    entityId: text('entity_id').notNull(),
    entityType: text('entity_type').notNull(),
    capacity: text('capacity').notNull(),
    metadata: text('metadata'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('bonds_user_idx').on(table.userId),
    index('bonds_entity_idx').on(table.entityId, table.entityType),
  ],
);

// ─── Offline classroom membership ────────────────────────────────────────────
// Supports teacher-created shadow students and later account claiming.
export const classroomStudents = sqliteTable(
  'classroom_students',
  {
    id: text('id').primaryKey(),
    classroomId: text('classroom_id').notNull(),
    studentId: text('student_id'),
    fullName: text('full_name'),
    inviteCode: text('invite_code'),
    rollNumber: integer('roll_number'),
    enrolledAt: text('enrolled_at').notNull(),
    claimedAt: text('claimed_at'),
    status: text('status').notNull(),
    joinedAt: text('joined_at').notNull(),
    notes: text('notes'),
  },
  (table) => [
    index('classroom_students_classroom_status_idx').on(table.classroomId, table.status),
    index('classroom_students_student_status_idx').on(table.studentId, table.status),
  ],
);

// ─── Offline institutional membership ───────────────────────────────────────
export const schoolMemberships = sqliteTable(
  'school_memberships',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    schoolId: text('school_id').notNull(),
    role: text('role').notNull(),
    status: text('status').notNull(),
    startDate: text('start_date'),
    endDate: text('end_date'),
    isPrimary: integer('is_primary', { mode: 'boolean' }),
    deletedAt: text('deleted_at'),
    createdAt: text('created_at'),
    updatedAt: text('updated_at'),
    deletedBy: text('deleted_by'),
    deletionReason: text('deletion_reason'),
    joinedAt: text('joined_at'),
    leftAt: text('left_at'),
  },
  (table) => [
    index('school_memberships_user_idx').on(table.userId),
    index('school_memberships_school_status_idx').on(table.schoolId, table.status),
  ],
);

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
    userId: text('user_id').notNull(),
    activeBondId: text('active_bond_id').notNull(),
    activeEntityId: text('active_entity_id').notNull(),
    activeEntityType: text('active_entity_type').notNull(),
    schoolId: text('school_id'),
    policyVersion: text('policy_version').notNull(),
    generatedAt: text('generated_at').notNull(),
    expiresAt: text('expires_at').notNull(),
    permissions: text('permissions').notNull(), // Serialized JSON: Record<Resource, Record<Action, boolean>>
    temporalHints: text('temporal_hints'), // Optional temporal lease details/hints (JSON string or null)
    signature: text('signature').notNull(), // Ed25519 server signature
  },
  (table) => [index('permission_snapshots_user_idx').on(table.userId)],
);

// ─── Policy Version (Token Invalidation Key, ADR-006) ──────────────────────────
export const policyVersion = sqliteTable('policy_version', {
  id: text('id').primaryKey(),
  hash: text('hash').notNull(),
  updatedAt: text('updated_at').notNull(),
});

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
  bonds,
  classroomStudents,
  schoolMemberships,
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
  userEntitlementGrants,
  userPreferences,
};

// ─── Relational TypeScript Types ──────────────────────────────────────────────
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = typeof attendance.$inferInsert;

export type Bond = typeof bonds.$inferSelect;
export type InsertBond = typeof bonds.$inferInsert;

export type ClassroomStudent = typeof classroomStudents.$inferSelect;
export type InsertClassroomStudent = typeof classroomStudents.$inferInsert;

export type SchoolMembership = typeof schoolMemberships.$inferSelect;
export type InsertSchoolMembership = typeof schoolMemberships.$inferInsert;

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

export type UserEntitlementGrant = typeof userEntitlementGrants.$inferSelect;
export type InsertUserEntitlementGrant = typeof userEntitlementGrants.$inferInsert;

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

export type PolicyVersion = typeof policyVersion.$inferSelect;
export type InsertPolicyVersion = typeof policyVersion.$inferInsert;
