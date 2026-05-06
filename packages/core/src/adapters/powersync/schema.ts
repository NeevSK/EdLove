/**
 * PowerSync Schema — Client-Side SQLite Table Definitions (May 2026)
 *
 * Maps Supabase Postgres tables → local SQLite tables via PowerSync.
 * Only include tables that need to be available offline.
 *
 * RULE: Only "State" tables belong here.
 * "Action" tables (mutations, audit logs) live in the Message Bus / Zustand stores.
 *
 * @see https://docs.powersync.com/usage/use-case-examples/schema-management
 */
import { column, Schema, Table } from './powersync-shim';

// ─── Attendance ───────────────────────────────────────────────────────────────
const attendance = new Table({
  student_id: column.text,
  classroom_id: column.text,
  date: column.text,       // ISO date string
  status: column.text,     // 'present' | 'absent' | 'late' | 'excused'
  marked_by: column.text,
  note: column.text,
  created_at: column.text,
  updated_at: column.text,
});

// ─── Students (People) ────────────────────────────────────────────────────────
const students = new Table({
  full_name: column.text,
  classroom_id: column.text,
  school_id: column.text,
  grade_id: column.text,
  section_id: column.text,
  admission_number: column.text,
  is_active: column.integer, // 0 | 1 (SQLite has no boolean)
  created_at: column.text,
  updated_at: column.text,
});

// ─── Classrooms ───────────────────────────────────────────────────────────────
const classrooms = new Table({
  name: column.text,
  school_id: column.text,
  grade_id: column.text,
  section_id: column.text,
  teacher_id: column.text,
  academic_year: column.text,
  is_active: column.integer,
  created_at: column.text,
  updated_at: column.text,
});

// ─── Moods / Wellbeing ────────────────────────────────────────────────────────
const mood_logs = new Table({
  student_id: column.text,
  recorded_by: column.text,
  mood: column.text,
  note: column.text,
  recorded_at: column.text,
});

// ─── Schools (needed for context) ─────────────────────────────────────────────
const schools = new Table({
  name: column.text,
  type: column.text,
  subscription_tier: column.text,
  is_active: column.integer,
  created_at: column.text,
});

// ─── Export the Schema ────────────────────────────────────────────────────────
export const AppSchema = new Schema({
  attendance,
  students,
  classrooms,
  mood_logs,
  schools,
});

export type Database = (typeof AppSchema)['types'];
