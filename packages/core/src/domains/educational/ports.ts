import type { Classroom, Assignment, AssignmentSubmission, ClassroomGroup, ClassroomStudent, StudentAssignment, StudentSubmissionSummary } from '../../api/schemas/classroom.schema';
import type { Lesson } from '../../api/schemas/lesson.schema';
import type { Material as LessonMaterial } from '../../api/schemas/material.schema';
import type { Attendance as AttendanceRecord } from '../../api/schemas/attendance.schema';
import type { Student } from '../../api/schemas/student.schema';
import type { Grade, ClassroomGradingSettings } from '../../api/schemas/grading.schema';

export type EnrollmentRecord = Student;

export interface EducationalRepository {
    getClassroomsByTeacher(teacherId: string, params?: { limit?: number; offset?: number }): Promise<Classroom[]>;
    getClassroomsByStudent(studentId: string, params?: { limit?: number; offset?: number }): Promise<Classroom[]>;
    getClassroomsBySchool(schoolId: string, params?: { limit?: number; offset?: number }): Promise<Classroom[]>;
    getAvailableClassroomsByGrade(gradeId: string): Promise<Classroom[]>;
    getClassroomById(id: string): Promise<Classroom | null>;
    createClassroom(classroom: Omit<Classroom, 'id' | 'created_at' | 'updated_at'>): Promise<Classroom>;
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
    getStudentSubmissionHistory(studentId: string, classroomId?: string): Promise<StudentSubmissionSummary[]>;
    createAssignmentSubmission(input: {
        assignment_id: string;
        student_id: string;
        content?: string | null;
        photo_url?: string | null;
        submitted_at: string;
    }): Promise<AssignmentSubmission>;
    createAssignment(assignment: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>): Promise<Assignment>;
    updateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment>;
    deleteAssignment(id: string): Promise<void>;

    getClassroomGroups(classroomId: string): Promise<ClassroomGroup[]>;
    createClassroomGroup(input: {
        classroom_id: string;
        name: string;
        description?: string | null;
        student_ids?: string[];
        color?: string | null;
    }): Promise<ClassroomGroup>;
    updateClassroomGroup(id: string, updates: {
        name?: string;
        description?: string | null;
        student_ids?: string[];
        color?: string | null;
    }): Promise<ClassroomGroup>;
    deleteClassroomGroup(id: string): Promise<void>;

    getSimpleStudents(classroomId: string): Promise<ClassroomStudent[]>;
    enrollStudent(classroomId: string, studentId: string): Promise<ClassroomStudent>;
    removeStudent(classroomId: string, studentId: string): Promise<void>;

    getEnrollmentRecords(classroomId: string): Promise<EnrollmentRecord[]>;
    addShadowStudent(classroomId: string, fullName: string, rollNumber?: string, notes?: string): Promise<EnrollmentRecord>;
    claimStudent(inviteCode: string, studentId: string): Promise<EnrollmentRecord>;
    addStudent(classroomId: string, studentId: string, rollNumber?: string, notes?: string): Promise<EnrollmentRecord>;
    updateEnrollmentRecordById(id: string, updates: { roll_number?: string; notes?: string }): Promise<EnrollmentRecord>;
    updateEnrollmentRecord(classroomId: string, studentId: string, updates: { roll_number?: string; notes?: string }): Promise<EnrollmentRecord>;
    deleteEnrollmentRecord(id: string): Promise<void>;

    getTeacherStats(teacherId: string): Promise<any>;

    getMaterials(classroomId: string): Promise<LessonMaterial[]>;
    getMaterialsByLesson(lessonId: string): Promise<LessonMaterial[]>;
    createMaterial(material: Omit<LessonMaterial, 'id' | 'created_at' | 'updated_at'>): Promise<LessonMaterial>;
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
    updateGrade(gradeId: string, updates: {
        marks?: number;
        grade?: string;
        gpa?: number;
        feedback?: string | null;
        updated_at: string;
    }): Promise<Grade>;
    getGradesByStudent(studentId: string): Promise<Grade[]>;
    getGradesByClassroom(classroomId: string): Promise<Grade[]>;
    getGradingSettings(classroomId: string): Promise<ClassroomGradingSettings | null>;
    upsertGradingSettings(classroomId: string, settings: Partial<ClassroomGradingSettings>): Promise<ClassroomGradingSettings>;
    deleteGrade(gradeId: string): Promise<void>;

    getAttendanceByDate(classroomId: string, date: string): Promise<AttendanceRecord[]>;
    recordAttendance(classroomId: string, studentId: string, status: string, date: string): Promise<AttendanceRecord>;
    batchRecordAttendance(records: Array<{
        classroom_id: string;
        student_id: string;
        status: string;
        date: string;
    }>): Promise<AttendanceRecord[]>;
    getAttendanceForStudent(studentId: string, classroomId?: string): Promise<AttendanceRecord[]>;
}

export interface EducationalSideEffects {
    getCurrentUserId(): Promise<string | null>;
    emitGrowthSignal(userId: string, signal: string, payload: Record<string, unknown>): Promise<unknown> | void;
}
