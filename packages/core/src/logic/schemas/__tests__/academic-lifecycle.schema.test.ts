import {
  AcademicCycleLeadershipAssignmentSchema,
  AcademicCycleWithTermsSchema,
  AttendanceSessionSchema,
  DailyAttendanceSchema,
  GradeClassSubjectContextSchema,
  GradeClassSubjectSchema,
} from '../academic-lifecycle.schema';
import {
  AcademicCycleSchema,
  TermSchema,
} from '../grade-domain.schema';

const cycleId = '550e8400-e29b-41d4-a716-446655440000';
const schoolId = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const sectionId = '7ba7b810-9dad-11d1-80b4-00c04fd430c8';
const gradeLevelId = '8ba7b810-9dad-11d1-80b4-00c04fd430c8';
const gradeClassId = '9ba7b810-9dad-11d1-80b4-00c04fd430c8';
const termId = 'aba7b810-9dad-11d1-80b4-00c04fd430c8';
const studentId = 'bba7b810-9dad-11d1-80b4-00c04fd430c8';
const userId = 'cba7b810-9dad-11d1-80b4-00c04fd430c8';
const now = '2026-08-12T00:00:00.000Z';
const cycleStart = '2026-01-01T00:00:00.000Z';
const cycleEnd = '2026-12-31T00:00:00.000Z';
const audit = {
  created_by: userId,
  updated_by: null,
  created_at: now,
  updated_at: now,
};

describe('academic lifecycle contracts', () => {
  const cycle = {
    id: cycleId,
    school_id: schoolId,
    name: '2026 Academic Year',
    starts_at: cycleStart,
    ends_at: cycleEnd,
    status: 'active' as const,
    ...audit,
  };

  const term = {
    id: termId,
    academic_cycle_id: cycleId,
    name: 'Term 1',
    term_kind: 'term' as const,
    sequence: 1,
    starts_at: cycleStart,
    ends_at: '2026-04-30T00:00:00.000Z',
    ...audit,
  };

  test('contains ordered terms within their academic cycle', () => {
    expect(AcademicCycleSchema.safeParse(cycle).success).toBe(true);
    expect(TermSchema.safeParse(term).success).toBe(true);
    expect(AcademicCycleWithTermsSchema.safeParse({ cycle, terms: [term] }).success).toBe(true);
    expect(
      AcademicCycleWithTermsSchema.safeParse({
        cycle,
        terms: [{ ...term, academic_cycle_id: schoolId }],
      }).success,
    ).toBe(false);
    expect(
      AcademicCycleWithTermsSchema.safeParse({
        cycle,
        terms: [{ ...term, starts_at: '2025-12-31T00:00:00.000Z' }],
      }).success,
    ).toBe(false);
  });

  test('rejects reversed cycle and term intervals and validates class subject containment', () => {
    expect(AcademicCycleSchema.safeParse({ ...cycle, ends_at: cycleStart }).success).toBe(false);
    expect(TermSchema.safeParse({ ...term, ends_at: term.starts_at }).success).toBe(false);
    expect(
      GradeClassSubjectContextSchema.safeParse({
        grade_level: {
          id: gradeLevelId,
          section_id: sectionId,
          grade_number: 6,
          label: 'Grade 6',
          ...audit,
        },
        grade_class: {
          id: gradeClassId,
          grade_level_id: gradeLevelId,
          academic_cycle_id: cycleId,
          name: '6A',
          status: 'active',
          ...audit,
        },
        term,
        subject: {
          id: 'fba7b810-9dad-11d1-80b4-00c04fd430c8',
          grade_class_id: gradeClassId,
          term_id: termId,
          subject_context: 'Mathematics',
          status: 'active',
          ...audit,
        },
      }).success,
    ).toBe(true);
  });

  test('validates cycle-scoped leadership roles and required scope', () => {
    expect(
      AcademicCycleLeadershipAssignmentSchema.safeParse({
        id: 'dba7b810-9dad-11d1-80b4-00c04fd430c8',
        school_id: schoolId,
        academic_cycle_id: cycleId,
        assignee_id: userId,
        role: 'section_head',
        section_id: sectionId,
        grade_level_id: null,
        effective_from: now,
        effective_to: null,
        status: 'active',
        ...audit,
      }).success,
    ).toBe(true);

    expect(
      AcademicCycleLeadershipAssignmentSchema.safeParse({
        id: 'eba7b810-9dad-11d1-80b4-00c04fd430c8',
        school_id: schoolId,
        academic_cycle_id: cycleId,
        assignee_id: userId,
        role: 'grade_head',
        section_id: null,
        grade_level_id: null,
        effective_from: now,
        effective_to: null,
        status: 'active',
        ...audit,
      }).success,
    ).toBe(false);
  });

  test('keeps subjects scoped to a grade class and term', () => {
    expect(
      GradeClassSubjectSchema.safeParse({
        id: 'fba7b810-9dad-11d1-80b4-00c04fd430c8',
        grade_class_id: gradeClassId,
        term_id: termId,
        subject_context: 'Mathematics',
        status: 'active',
        ...audit,
      }).success,
    ).toBe(true);
  });

  test('validates daily attendance and lesson/arrival/departure sessions', () => {
    const daily = {
      id: '0ba7b810-9dad-11d1-80b4-00c04fd430c8',
      student_id: studentId,
      school_id: schoolId,
      grade_class_id: gradeClassId,
      academic_cycle_id: cycleId,
      attendance_date: '2026-08-12',
      status: 'present' as const,
      note: null,
      recorded_by: userId,
      ...audit,
    };

    expect(DailyAttendanceSchema.safeParse(daily).success).toBe(true);
    expect(
      AttendanceSessionSchema.safeParse({
        id: '1ba7b810-9dad-11d1-80b4-00c04fd430c8',
        daily_attendance_id: daily.id,
        student_id: studentId,
        grade_class_id: gradeClassId,
        academic_cycle_id: cycleId,
        term_id: termId,
        session_kind: 'lesson',
        teacher_id: userId,
        subject_context: 'Mathematics',
        session_at: now,
        status: 'present',
        recorded_by: userId,
        ...audit,
      }).success,
    ).toBe(true);
    expect(
      AttendanceSessionSchema.safeParse({
        id: '2ba7b810-9dad-11d1-80b4-00c04fd430c8',
        daily_attendance_id: daily.id,
        student_id: studentId,
        grade_class_id: gradeClassId,
        academic_cycle_id: cycleId,
        term_id: null,
        session_kind: 'arrival',
        teacher_id: null,
        subject_context: null,
        session_at: now,
        status: 'late',
        recorded_by: userId,
        ...audit,
      }).success,
    ).toBe(true);
  });

  test('requires lesson sessions to identify their subject context', () => {
    expect(
      AttendanceSessionSchema.safeParse({
        id: '3ba7b810-9dad-11d1-80b4-00c04fd430c8',
        daily_attendance_id: '0ba7b810-9dad-11d1-80b4-00c04fd430c8',
        student_id: studentId,
        grade_class_id: gradeClassId,
        academic_cycle_id: cycleId,
        term_id: termId,
        session_kind: 'lesson',
        teacher_id: userId,
        subject_context: null,
        session_at: now,
        status: 'present',
        recorded_by: userId,
        ...audit,
      }).success,
    ).toBe(false);

    expect(
      AttendanceSessionSchema.safeParse({
        id: '4ba7b810-9dad-11d1-80b4-00c04fd430c8',
        daily_attendance_id: '0ba7b810-9dad-11d1-80b4-00c04fd430c8',
        student_id: studentId,
        grade_class_id: gradeClassId,
        academic_cycle_id: cycleId,
        term_id: termId,
        session_kind: 'lesson',
        teacher_id: null,
        subject_context: 'Mathematics',
        session_at: now,
        status: 'present',
        recorded_by: userId,
        ...audit,
      }).success,
    ).toBe(false);
  });
});
