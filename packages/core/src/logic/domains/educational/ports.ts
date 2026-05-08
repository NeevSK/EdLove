import type { Attendance as AttendanceRecord } from '../../schemas/attendance.schema';
import type {
  Assignment,
  AssignmentSubmission,
  Classroom,
  ClassroomGroup,
  ClassroomStudent,
  StudentAssignment,
  StudentSubmissionSummary,
  StudentAcademicRecord,
  TeacherProfessionalRecord,
  PrincipalGovernanceRecord,
  SchoolLegacyRecord,
  ClassroomLegacyRecord,
} from '../../schemas/classroom.schema';
import type { ClassroomGradingSettings, Grade } from '../../schemas/grading.schema';
import type { Lesson } from '../../schemas/lesson.schema';
import type { Material as LessonMaterial } from '../../schemas/material.schema';
import type { Student } from '../../schemas/student.schema';

export type EnrollmentRecord = Student;

export interface EducationalRepository {
  getClassroomsByTeacher(
    teacherId: string,
    params?: { limit?: number; offset?: number },
  ): Promise<Classroom[]>;
  getClassroomsByStudent(
    studentId: string,
    params?: { limit?: number; offset?: number },
  ): Promise<Classroom[]>;
  getClassroomsBySchool(
    schoolId: string,
    params?: { limit?: number; offset?: number },
  ): Promise<Classroom[]>;
  getAvailableClassroomsByGrade(gradeId: string): Promise<Classroom[]>;
  getClassroomById(id: string): Promise<Classroom | null>;
  createClassroom(
    classroom: Omit<Classroom, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<Classroom>;
  updateClassroom(id: string, updates: Partial<Classroom>): Promise<Classroom>;
  deleteClassroom(id: string): Promise<void>;

  getLessons(classroomId: string): Promise<Lesson[]>;
  getLessonsByDate(classroomId: string, date: string): Promise<Lesson[]>;
  createLesson(lesson: Omit<Lesson, 'id' | 'created_at'>): Promise<Lesson>;
  updateLesson(id: string, updates: Partial<Lesson>): Promise<Lesson>;
  deleteLesson(id: string): Promise<void>;

  getAssignments(classroomId: string): Promise<Assignment[]>;
  getAssignmentsByLesson(lessonId: string): Promise<Assignment[]>;
  getUpcomingAssignmentsForStudent(studentId: string): Promise<StudentAssignment[]>;
  getStudentSubmissionHistory(
    studentId: string,
    classroomId?: string,
  ): Promise<StudentSubmissionSummary[]>;
  createAssignmentSubmission(input: {
    assignment_id: string;
    student_id: string;
    content?: string | null;
    photo_url?: string | null;
    submitted_at: string;
  }): Promise<AssignmentSubmission>;
  createAssignment(
    assignment: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<Assignment>;
  updateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment>;
  deleteAssignment(id: string): Promise<void>;
  getRecentGradesOverviewForStudent(
    studentId: string,
    limit?: number,
  ): Promise<any[]>;

  getClassroomGroups(classroomId: string): Promise<ClassroomGroup[]>;
  createClassroomGroup(input: {
    classroom_id: string;
    name: string;
    description?: string | null;
    student_ids?: string[];
    color?: string | null;
  }): Promise<ClassroomGroup>;
  updateClassroomGroup(
    id: string,
    updates: {
      name?: string;
      description?: string | null;
      student_ids?: string[];
      color?: string | null;
    },
  ): Promise<ClassroomGroup>;
  deleteClassroomGroup(id: string): Promise<void>;

  getSimpleStudents(classroomId: string): Promise<ClassroomStudent[]>;
  enrollStudent(classroomId: string, studentId: string): Promise<ClassroomStudent>;
  removeStudent(classroomId: string, studentId: string): Promise<void>;

  getEnrollmentRecords(classroomId: string): Promise<EnrollmentRecord[]>;
  addShadowStudent(
    classroomId: string,
    fullName: string,
    rollNumber?: string,
    notes?: string,
  ): Promise<EnrollmentRecord>;
  claimStudent(inviteCode: string, studentId: string): Promise<EnrollmentRecord>;
  addStudent(
    classroomId: string,
    studentId: string,
    rollNumber?: string,
    notes?: string,
  ): Promise<EnrollmentRecord>;
  updateEnrollmentRecordById(
    id: string,
    updates: { roll_number?: string; notes?: string },
  ): Promise<EnrollmentRecord>;
  updateEnrollmentRecord(
    classroomId: string,
    studentId: string,
    updates: { roll_number?: string; notes?: string },
  ): Promise<EnrollmentRecord>;
  deleteEnrollmentRecord(id: string): Promise<void>;
  getHistoricalAcademicRecords(studentId: string): Promise<StudentAcademicRecord[]>;
  getHistoricalProfessionalRecords(teacherId: string): Promise<TeacherProfessionalRecord[]>;
  getHistoricalGovernanceRecords(principalId: string): Promise<PrincipalGovernanceRecord[]>;
  getSchoolLegacyHistory(schoolId: string): Promise<SchoolLegacyRecord[]>;
  getClassroomLegacyHistory(classroomId: string): Promise<ClassroomLegacyRecord[]>;

  getTeacherStats(teacherId: string): Promise<any>;

  getMaterials(classroomId: string): Promise<LessonMaterial[]>;
  getMaterialsByLesson(lessonId: string): Promise<LessonMaterial[]>;
  createMaterial(
    material: Omit<LessonMaterial, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<LessonMaterial>;
  updateMaterial(id: string, updates: Partial<LessonMaterial>): Promise<LessonMaterial>;
  deleteMaterial(id: string): Promise<void>;

  upsertGrade(input: {
    student_id: string;
    classroom_id: string;
    assignment_id?: string;
    marks: number;
    grade: string;
    gpa: number;
    feedback?: string;
    graded_by: string;
    created_at: string;
    updated_at: string;
  }): Promise<Grade>;
  getGradeById(gradeId: string): Promise<Grade | null>;
  updateGrade(
    gradeId: string,
    updates: {
      marks?: number;
      grade?: string;
      gpa?: number;
      feedback?: string | null;
      updated_at: string;
    },
  ): Promise<Grade>;
  getGradesByStudent(studentId: string): Promise<Grade[]>;
  getGradesByClassroom(classroomId: string): Promise<Grade[]>;
  getGradingSettings(classroomId: string): Promise<ClassroomGradingSettings | null>;
  upsertGradingSettings(
    classroomId: string,
    settings: Partial<ClassroomGradingSettings>,
  ): Promise<ClassroomGradingSettings>;
  deleteGrade(gradeId: string): Promise<void>;

  getAttendanceByDate(classroomId: string, date: string): Promise<AttendanceRecord[]>;
  recordAttendance(
    classroomId: string,
    studentId: string,
    status: string,
    date: string,
  ): Promise<AttendanceRecord>;
  batchRecordAttendance(
    records: Array<{
      classroom_id: string;
      student_id: string;
      status: string;
      date: string;
    }>,
  ): Promise<AttendanceRecord[]>;
  getAttendanceForStudent(studentId: string, classroomId?: string): Promise<AttendanceRecord[]>;

  // Institutional Management
  createSchool(data: { name: string; handle?: string | null; type: string; created_by: string }): Promise<any>;
  getSchool(id: string): Promise<any>;
  updateSchool(id: string, updates: any): Promise<any>;
  searchSchools(query: string): Promise<any[]>;
  getSections(schoolId: string): Promise<any[]>;
  getGrades(sectionId: string): Promise<any[]>;
  createSection(schoolId: string, name: string): Promise<any>;
  createGrade(sectionId: string, number: number): Promise<any>;
  getInviteCodes(schoolId: string): Promise<any[]>;
  generateInviteCode(schoolId: string, role: string, createdBy: string): Promise<any>;

  // Academic Cycles
  getAcademicCycles(schoolId: string): Promise<any[]>;
  getCurrentAcademicCycle(schoolId: string): Promise<any | null>;
  createAcademicCycle(data: any): Promise<any>;
  updateAcademicCycle(id: string, schoolId: string, data: any): Promise<any>;
  deleteAcademicCycle(id: string): Promise<void>;

  // Classroom Notes
  listVisibleNotes(classroomId: string): Promise<any[]>;
  listVisibleNotesAsOf(classroomId: string, viewDate: string): Promise<any[]>;
  createNote(authorId: string, note: any): Promise<any>;
  updateNote(id: string, updates: any): Promise<any>;
  deleteNote(id: string): Promise<void>;
  getNoteTimeline(id: string): Promise<any[]>;

  // Join Requests
  requestSchoolJoin(userId: string, schoolId: string, role: string): Promise<any>;
  updateSchoolJoinRequest(requestId: string, status: string): Promise<any>;
  requestClassroomJoin(userId: string, classroomId: string, role: string, subjectLabel?: string): Promise<any>;
  updateClassroomJoinRequest(requestId: string, status: string): Promise<any>;
  getClassroomJoinRequest(requestId: string): Promise<any>;
}

export interface EducationalSideEffects {
  getCurrentUserId(): Promise<string | null>;
  emitGrowthSignal(
    userId: string,
    signal: string,
    payload: Record<string, unknown>,
  ): Promise<unknown> | undefined;
}
