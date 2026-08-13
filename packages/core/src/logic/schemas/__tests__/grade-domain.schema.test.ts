import {
  AcademicCycleSchema,
  GradeClassSchema,
  GradeClassTeacherAssignmentSchema,
  GradeLevelSchema,
  GradeMarkSchema,
  selectGuardianVisibleGradeMarks,
  TermSchema,
} from '../grade-domain.schema';

const schoolId = '550e8400-e29b-41d4-a716-446655440000';
const sectionId = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const gradeLevelId = '7ba7b810-9dad-11d1-80b4-00c04fd430c8';
const gradeClassId = '8ba7b810-9dad-11d1-80b4-00c04fd430c8';
const cycleId = '9ba7b810-9dad-11d1-80b4-00c04fd430c8';
const termId = 'aba7b810-9dad-11d1-80b4-00c04fd430c8';
const studentId = 'bba7b810-9dad-11d1-80b4-00c04fd430c8';
const teacherId = 'cba7b810-9dad-11d1-80b4-00c04fd430c8';
const subjectId = 'dca7b810-9dad-11d1-80b4-00c04fd430c8';
const now = '2026-08-12T00:00:00.000Z';

const audit = {
  created_by: teacherId,
  updated_by: null,
  created_at: now,
  updated_at: now,
};

const validCycle = {
  id: cycleId,
  school_id: schoolId,
  name: '2026 Academic Year',
  starts_at: '2026-01-01T00:00:00.000Z',
  ends_at: '2026-12-31T00:00:00.000Z',
  status: 'active' as const,
  ...audit,
};

const validTerm = {
  id: termId,
  academic_cycle_id: cycleId,
  name: 'Term 1',
  term_kind: 'term' as const,
  sequence: 1,
  starts_at: '2026-01-01T00:00:00.000Z',
  ends_at: '2026-04-30T00:00:00.000Z',
  ...audit,
};

const validGradeLevel = {
  id: gradeLevelId,
  section_id: sectionId,
  grade_number: 6,
  label: 'Grade 6',
  ...audit,
};

const validGradeClass = {
  id: gradeClassId,
  grade_level_id: gradeLevelId,
  academic_cycle_id: cycleId,
  name: '6A',
  status: 'active' as const,
  ...audit,
};

const validMark = {
  id: 'dba7b810-9dad-11d1-80b4-00c04fd430c8',
  student_id: studentId,
  school_id: schoolId,
  grade_class_id: gradeClassId,
  academic_cycle_id: cycleId,
  term_id: termId,
  subject_id: subjectId,
  assignment_id: null,
  submission_id: null,
  marks_earned: 18,
  max_points: 20,
  percentage: 90,
  gpa: 4,
  letter_grade: 'A',
  publication_state: 'draft' as const,
  graded_by: teacherId,
  graded_at: now,
  published_by: null,
  published_at: null,
  feedback: null,
  idempotency_key: 'grade-mark-test-1',
  created_at: now,
  updated_at: now,
};

describe('grade domain contracts', () => {
  test('models AcademicCycle/Term, GradeLevel within Section, and GradeClass within a cycle', () => {
    expect(AcademicCycleSchema.safeParse(validCycle).success).toBe(true);
    expect(TermSchema.safeParse(validTerm).success).toBe(true);
    expect(GradeLevelSchema.safeParse(validGradeLevel).success).toBe(true);
    expect(GradeClassSchema.safeParse(validGradeClass).success).toBe(true);
  });

  test('accepts historical role- and subject-scoped teacher assignments', () => {
    expect(
      GradeClassTeacherAssignmentSchema.safeParse({
        id: 'eba7b810-9dad-11d1-80b4-00c04fd430c8',
        grade_class_id: gradeClassId,
        teacher_id: teacherId,
        academic_cycle_id: cycleId,
        role: 'subject_teacher',
        subject_context: 'Mathematics',
        effective_from: now,
        effective_to: null,
        status: 'active',
        ...audit,
      }).success,
    ).toBe(true);
  });

  test('rejects plus/minus letter grades', () => {
    expect(GradeMarkSchema.safeParse({ ...validMark, letter_grade: 'A-' }).success).toBe(false);
    expect(GradeMarkSchema.safeParse({ ...validMark, letter_grade: 'B+' }).success).toBe(false);
  });

  test('requires marks earned to be between zero and max points', () => {
    expect(GradeMarkSchema.safeParse({ ...validMark, marks_earned: -1 }).success).toBe(false);
    expect(GradeMarkSchema.safeParse({ ...validMark, marks_earned: 21 }).success).toBe(false);
    expect(GradeMarkSchema.safeParse({ ...validMark, marks_earned: 0 }).success).toBe(true);
  });

  test('captures class/subject context, persisted GPA, publication, and audit metadata', () => {
    const parsed = GradeMarkSchema.parse(validMark);
    expect(parsed.grade_class_id).toBe(gradeClassId);
    expect(parsed.subject_id).toBe(subjectId);
    expect(parsed.gpa).toBe(4);
    expect(parsed.letter_grade).toBe('A');
    expect(parsed.publication_state).toBe('draft');
    expect(parsed.graded_by).toBe(teacherId);
    expect(parsed.created_at).toBe(now);
  });

  test('exposes grade marks to guardians only after publication', () => {
    const published = GradeMarkSchema.parse({
      ...validMark,
      id: 'fba7b810-9dad-11d1-80b4-00c04fd430c8',
      publication_state: 'published',
      published_by: teacherId,
      published_at: now,
    });

    expect(selectGuardianVisibleGradeMarks([validMark, published])).toEqual([published]);
  });
});
