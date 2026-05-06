import { marksToGPA } from '../../../lib/grading';
import { APIError } from '../../../types/API';
import type { Attendance as AttendanceRecord } from '../../schemas/attendance.schema';
import type {
  Assignment,
  AssignmentSubmission,
  Classroom,
  ClassroomGroup,
  ClassroomStudent,
  StudentAssignment,
  StudentSubmissionSummary,
  TeacherStats,
  StudentAcademicRecord,
  TeacherProfessionalRecord,
  PrincipalGovernanceRecord,
  SchoolLegacyRecord,
  ClassroomLegacyRecord,
} from '../../schemas/classroom.schema';
import type { ClassroomGradingSettings, Grade } from '../../schemas/grading.schema';
import type { Lesson } from '../../schemas/lesson.schema';
import type { Material as LessonMaterial } from '../../schemas/material.schema';
import type { EducationalRepository, EducationalSideEffects, EnrollmentRecord } from './ports';

export interface EducationalServices {
  classrooms: {
    getByTeacher(
      teacherId: string,
      params?: { limit?: number; offset?: number },
    ): Promise<Classroom[]>;
    getByStudent(
      studentId: string,
      params?: { limit?: number; offset?: number },
    ): Promise<Classroom[]>;
    getBySchool(
      schoolId: string,
      params?: { limit?: number; offset?: number },
    ): Promise<Classroom[]>;
    getAvailableByGrade(gradeId: string): Promise<Classroom[]>;
    getById(id: string): Promise<Classroom>;
    create(classroom: Omit<Classroom, 'id' | 'created_at' | 'updated_at'>): Promise<Classroom>;
    update(id: string, updates: Partial<Classroom>): Promise<Classroom>;
    delete(id: string): Promise<void>;
    getTeacherStats(teacherId: string): Promise<TeacherStats>;
  };
  lessons: {
    getAll(classroomId: string): Promise<Lesson[]>;
    getByDate(classroomId: string, date: string): Promise<Lesson[]>;
    create(lesson: Omit<Lesson, 'id' | 'created_at'>): Promise<Lesson>;
    update(id: string, updates: Partial<Lesson>): Promise<Lesson>;
    delete(id: string): Promise<void>;
  };
  assignments: {
    getAll(classroomId: string): Promise<Assignment[]>;
    getByLesson(lessonId: string): Promise<Assignment[]>;
    getUpcomingForStudent(studentId: string): Promise<StudentAssignment[]>;
    getSubmissionHistory(
      studentId: string,
      classroomId?: string,
    ): Promise<StudentSubmissionSummary[]>;
    submitSubmission(
      assignmentId: string,
      content?: string,
      photoUrl?: string | null,
    ): Promise<AssignmentSubmission>;
    create(assignment: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>): Promise<Assignment>;
    update(id: string, updates: Partial<Assignment>): Promise<Assignment>;
    delete(id: string): Promise<void>;
  };
  classroomGroups: {
    getAll(classroomId: string): Promise<ClassroomGroup[]>;
    create(
      classroomId: string,
      input: {
        name: string;
        description?: string | null;
        student_ids?: string[];
        color?: string | null;
      },
    ): Promise<ClassroomGroup>;
    update(
      id: string,
      updates: {
        name?: string;
        description?: string | null;
        student_ids?: string[];
        color?: string | null;
      },
    ): Promise<ClassroomGroup>;
    delete(id: string): Promise<void>;
  };
  students: {
    getAll(classroomId: string): Promise<ClassroomStudent[]>;
    enroll(classroomId: string, studentId: string): Promise<ClassroomStudent>;
    remove(classroomId: string, studentId: string): Promise<void>;
    getHistoricalAcademicRecords(studentId: string): Promise<StudentAcademicRecord[]>;
  };
  teachers: {
    getHistoricalProfessionalRecords(teacherId: string): Promise<TeacherProfessionalRecord[]>;
    getHistoricalGovernanceRecords(principalId: string): Promise<PrincipalGovernanceRecord[]>;
  };
  institutions: {
    getSchoolLegacyHistory(schoolId: string): Promise<SchoolLegacyRecord[]>;
    getClassroomLegacyHistory(classroomId: string): Promise<ClassroomLegacyRecord[]>;
  };
  classroomStudents: {
    getAll(classroomId: string): Promise<EnrollmentRecord[]>;
    addShadowStudent(
      classroomId: string,
      fullName: string,
      rollNumber?: string,
      notes?: string,
    ): Promise<EnrollmentRecord>;
    claimStudent(inviteCode: string): Promise<EnrollmentRecord>;
    add(
      classroomId: string,
      studentId: string,
      rollNumber?: string,
      notes?: string,
    ): Promise<EnrollmentRecord>;
    updateById(
      id: string,
      updates: { roll_number?: string; notes?: string },
    ): Promise<EnrollmentRecord>;
    update(
      classroomId: string,
      studentId: string,
      updates: { roll_number?: string; notes?: string },
    ): Promise<EnrollmentRecord>;
    remove(id: string): Promise<void>;
  };
  lessonMaterials: {
    getAll(classroomId: string): Promise<LessonMaterial[]>;
    getByLesson(lessonId: string): Promise<LessonMaterial[]>;
    create(
      material: Omit<LessonMaterial, 'id' | 'created_at' | 'updated_at'>,
    ): Promise<LessonMaterial>;
    update(id: string, updates: Partial<LessonMaterial>): Promise<LessonMaterial>;
    delete(id: string): Promise<void>;
  };
  grading: {
    submitGrade(
      studentId: string,
      classroomId: string,
      marks: number,
      assignmentId?: string,
      feedback?: string,
    ): Promise<Grade>;
    getById(gradeId: string): Promise<Grade>;
    reviseGrade(gradeId: string, marks: number, feedback?: string): Promise<Grade>;
    getReportCard(studentId: string): Promise<Grade[]>;
    getClassroomGrades(classroomId: string): Promise<Grade[]>;
    getGradingSettings(classroomId: string): Promise<ClassroomGradingSettings>;
    updateGradingSettings(
      classroomId: string,
      settings: Partial<ClassroomGradingSettings>,
    ): Promise<ClassroomGradingSettings>;
    deleteGrade(gradeId: string): Promise<void>;
  };
  attendance: {
    getByDate(classroomId: string, date: string): Promise<AttendanceRecord[]>;
    record(
      classroomId: string,
      studentId: string,
      status: string,
      date: string,
    ): Promise<AttendanceRecord>;
    batchRecord(
      records: Array<{
        classroom_id: string;
        student_id: string;
        status: string;
        date: string;
      }>,
    ): Promise<AttendanceRecord[]>;
    getForStudent(studentId: string, classroomId?: string): Promise<AttendanceRecord[]>;
  };
}

export const createEducationalServices = (
  repository: EducationalRepository,
  sideEffects: EducationalSideEffects,
): EducationalServices => ({
  classrooms: {
    getByTeacher: (teacherId, params) => repository.getClassroomsByTeacher(teacherId, params),
    getByStudent: (studentId, params) => repository.getClassroomsByStudent(studentId, params),
    getBySchool: (schoolId, params) => repository.getClassroomsBySchool(schoolId, params),
    getAvailableByGrade: (gradeId) => repository.getAvailableClassroomsByGrade(gradeId),
    async getById(id) {
      const classroom = await repository.getClassroomById(id);
      if (!classroom) {
        throw new APIError('Classroom not found', 'NOT_FOUND');
      }
      return classroom;
    },
    create: (classroom) => repository.createClassroom(classroom),
    update: (id, updates) => repository.updateClassroom(id, updates),
    delete: (id) => repository.deleteClassroom(id),
    getTeacherStats: (teacherId) => repository.getTeacherStats(teacherId),
  },
  lessons: {
    getAll: (classroomId) => repository.getLessons(classroomId),
    getByDate: (classroomId, date) => repository.getLessonsByDate(classroomId, date),
    create: (lesson) => repository.createLesson(lesson),
    update: (id, updates) => repository.updateLesson(id, updates),
    delete: (id) => repository.deleteLesson(id),
  },
  assignments: {
    getAll: (classroomId) => repository.getAssignments(classroomId),
    getByLesson: (lessonId) => repository.getAssignmentsByLesson(lessonId),
    getUpcomingForStudent: (studentId) => repository.getUpcomingAssignmentsForStudent(studentId),
    getSubmissionHistory: (studentId, classroomId) =>
      repository.getStudentSubmissionHistory(studentId, classroomId),
    async submitSubmission(assignmentId, content, photoUrl) {
      const myId = await sideEffects.getCurrentUserId();
      if (!myId) {
        throw new APIError('Authentication required to submit assignment', 'UNAUTHORIZED');
      }

      const submission = await repository.createAssignmentSubmission({
        assignment_id: assignmentId,
        student_id: myId,
        content: content?.trim() || null,
        photo_url: photoUrl ?? null,
        // SAFE_SIDE_EFFECT: Mutation payload generated in action handler, not during hydration.
        // eslint-disable-next-line no-restricted-syntax
        submitted_at: new Date().toISOString(),
      });

      void sideEffects.emitGrowthSignal(myId, 'assignment_submitted', {
        assignment_id: assignmentId,
        has_content: !!content?.trim(),
        has_photo: !!photoUrl,
      });

      return submission;
    },
    async create(assignment) {
      const created = await repository.createAssignment(assignment);
      const myId = await sideEffects.getCurrentUserId();
      if (myId) {
        void sideEffects.emitGrowthSignal(myId, 'assignment_created', {
          classroom_id: assignment.classroom_id,
        });
      }
      return created;
    },
    update: (id, updates) => repository.updateAssignment(id, updates),
    delete: (id) => repository.deleteAssignment(id),
  },
  classroomGroups: {
    getAll: (classroomId) => repository.getClassroomGroups(classroomId),
    create: (classroomId, input) =>
      repository.createClassroomGroup({
        classroom_id: classroomId,
        name: input.name.trim(),
        description: input.description?.trim() || null,
        student_ids: input.student_ids ?? [],
        color: input.color ?? null,
      }),
    update: (id, updates) =>
      repository.updateClassroomGroup(id, {
        ...updates,
        name: updates.name?.trim(),
        description:
          updates.description === undefined ? undefined : updates.description?.trim() || null,
        student_ids: updates.student_ids,
        color: updates.color,
      }),
    delete: (id) => repository.deleteClassroomGroup(id),
  },
  classroomStudents: {
    getAll: (classroomId) => repository.getEnrollmentRecords(classroomId),
    addShadowStudent: (classroomId, fullName, rollNumber, notes) =>
      repository.addShadowStudent(classroomId, fullName, rollNumber, notes),
    async claimStudent(inviteCode) {
      const myId = await sideEffects.getCurrentUserId();
      if (!myId) throw new APIError('Authentication required to claim record', 'UNAUTHORIZED');
      return repository.claimStudent(inviteCode, myId);
    },
    add: (classroomId, studentId, rollNumber, notes) =>
      repository.addStudent(classroomId, studentId, rollNumber, notes),
    updateById: (id, updates) => repository.updateEnrollmentRecordById(id, updates),
    update: (classroomId, studentId, updates) =>
      repository.updateEnrollmentRecord(classroomId, studentId, updates),
    remove: (id) => repository.deleteEnrollmentRecord(id),
  },
  students: {
    getAll: (classroomId) => repository.getSimpleStudents(classroomId),
    enroll: (classroomId, studentId) => repository.enrollStudent(classroomId, studentId),
    remove: (classroomId, studentId) => repository.removeStudent(classroomId, studentId),
    getHistoricalAcademicRecords: (studentId) => repository.getHistoricalAcademicRecords(studentId),
  },
  teachers: {
    getHistoricalProfessionalRecords: (teacherId) =>
      repository.getHistoricalProfessionalRecords(teacherId),
    getHistoricalGovernanceRecords: (principalId) =>
      repository.getHistoricalGovernanceRecords(principalId),
  },
  institutions: {
    getSchoolLegacyHistory: (schoolId) => repository.getSchoolLegacyHistory(schoolId),
    getClassroomLegacyHistory: (classroomId) => repository.getClassroomLegacyHistory(classroomId),
  },
  lessonMaterials: {
    getAll: (classroomId) => repository.getMaterials(classroomId),
    getByLesson: (lessonId) => repository.getMaterialsByLesson(lessonId),
    create: (material) => repository.createMaterial(material),
    update: (id, updates) => repository.updateMaterial(id, updates),
    delete: (id) => repository.deleteMaterial(id),
  },
  grading: {
    async submitGrade(studentId, classroomId, marks, assignmentId, feedback) {
      const myId = await sideEffects.getCurrentUserId();
      if (!myId) {
        throw new APIError('Failed to submit grade', 'UNAUTHORIZED');
      }

      const { grade, gpa } = marksToGPA(marks);
      const created = await repository.upsertGrade({
        student_id: studentId,
        classroom_id: classroomId,
        assignment_id: assignmentId,
        marks,
        grade,
        gpa,
        feedback,
        graded_by: myId,
        // SAFE_SIDE_EFFECT: Mutation payload generated in action handler.
        // eslint-disable-next-line no-restricted-syntax
        created_at: new Date().toISOString(),
        // eslint-disable-next-line no-restricted-syntax
        updated_at: new Date().toISOString(),
      });

      void sideEffects.emitGrowthSignal(myId, 'assignment_graded', {
        classroom_id: classroomId,
        has_feedback: !!feedback && feedback.length > 0,
      });

      return created;
    },
    async getById(gradeId) {
      const grade = await repository.getGradeById(gradeId);
      if (!grade) {
        throw new APIError('Grade not found', 'NOT_FOUND');
      }
      return grade;
    },
    async reviseGrade(gradeId, marks, feedback) {
      const existing = await repository.getGradeById(gradeId);
      if (!existing) {
        throw new APIError('Grade not found', 'NOT_FOUND');
      }

      const { grade, gpa } = marksToGPA(marks);
      return repository.updateGrade(gradeId, {
        marks,
        grade,
        gpa,
        feedback: feedback ?? null,
        // SAFE_SIDE_EFFECT: Mutation payload generated in action handler.
        // eslint-disable-next-line no-restricted-syntax
        updated_at: new Date().toISOString(),
      });
    },
    getReportCard: (studentId) => repository.getGradesByStudent(studentId),
    getClassroomGrades: (classroomId) => repository.getGradesByClassroom(classroomId),
    async getGradingSettings(classroomId) {
      return (
        (await repository.getGradingSettings(classroomId)) ?? {
          classroom_id: classroomId,
          grading_mode: 'both',
          show_ranks: true,
        }
      );
    },
    updateGradingSettings: (classroomId, settings) =>
      repository.upsertGradingSettings(classroomId, settings),
    deleteGrade: (gradeId) => repository.deleteGrade(gradeId),
  },
  attendance: {
    getByDate: (classroomId, date) => repository.getAttendanceByDate(classroomId, date),
    record: (classroomId, studentId, status, date) =>
      repository.recordAttendance(classroomId, studentId, status, date),
    batchRecord: (records) => repository.batchRecordAttendance(records),
    getForStudent: (studentId, classroomId) =>
      repository.getAttendanceForStudent(studentId, classroomId),
  },
});
