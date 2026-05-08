import { EducationalRepository } from '../domains/educational/ports';
import { IdentityManager } from './IdentityManager';
import { GrowthManager } from './GrowthManager';
import { CommunityManager } from './CommunityManager';
import { composeUserAbilities } from '../permissions/composer';
import { marksToGPA } from '../../lib/grading';
import { APIError } from '../../types/API';
import type { LessonMaterial } from '../../types/LessonMaterial';
import { 
  Classroom, Lesson, Assignment, AssignmentSubmission, ClassroomGroup, 
  ClassroomStudent, StudentAssignment, StudentSubmissionSummary, 
  TeacherStats, StudentAcademicRecord, TeacherProfessionalRecord, 
  PrincipalGovernanceRecord, SchoolLegacyRecord, ClassroomLegacyRecord
} from '../schemas/classroom.schema';
import type { ClassroomGradingSettings } from '../schemas/grading.schema';

/**
 * EducationalManager
 * 
 * Domain manager for educational logic (Classrooms, Lessons, Assignments, Grading).
 * Orchestrates repository access and cross-domain side-effects.
 */
export class EducationalManager {
  constructor(
    private repo: EducationalRepository,
    private identity: IdentityManager,
    private growth: GrowthManager,
    private community: CommunityManager
  ) {}

  public classrooms = {
    getByTeacher: (teacherId: string, params?: { limit?: number; offset?: number }) => 
      this.repo.getClassroomsByTeacher(teacherId, params),
    getByStudent: (studentId: string, params?: { limit?: number; offset?: number }) => 
      this.repo.getClassroomsByStudent(studentId, params),
    getBySchool: (schoolId: string, params?: { limit?: number; offset?: number }) => 
      this.repo.getClassroomsBySchool(schoolId, params),
    getAvailableByGrade: (gradeId: string) => 
      this.repo.getAvailableClassroomsByGrade(gradeId),
    getById: async (id: string) => {
      const classroom = await this.repo.getClassroomById(id);
      if (!classroom) throw new APIError('Classroom not found', 'NOT_FOUND');
      return classroom;
    },
    create: (classroom: Omit<Classroom, 'id' | 'created_at' | 'updated_at'>) => 
      this.repo.createClassroom(classroom),
    update: (id: string, updates: Partial<Classroom>) => 
      this.repo.updateClassroom(id, updates),
    delete: (id: string) => this.repo.deleteClassroom(id),
    getTeacherStats: (teacherId: string) => this.repo.getTeacherStats(teacherId),
  };

  public lessons = {
    getAll: (classroomId: string) => this.repo.getLessons(classroomId),
    getByDate: (classroomId: string, date: string) => this.repo.getLessonsByDate(classroomId, date),
    create: (lesson: Omit<Lesson, 'id' | 'created_at'>) => this.repo.createLesson(lesson),
    update: (id: string, updates: Partial<Lesson>) => this.repo.updateLesson(id, updates),
    delete: (id: string) => this.repo.deleteLesson(id),
  };

  public assignments = {
    getAll: (classroomId: string) => this.repo.getAssignments(classroomId),
    getByLesson: (lessonId: string) => this.repo.getAssignmentsByLesson(lessonId),
    getUpcomingForStudent: (studentId: string) => this.repo.getUpcomingAssignmentsForStudent(studentId),
    getSubmissionHistory: (studentId: string, classroomId?: string) =>
      this.repo.getStudentSubmissionHistory(studentId, classroomId),
    submitSubmission: async (assignmentId: string, content?: string, photoUrl?: string | null) => {
      const myId = await this.identity.getMyInternalId();
      if (!myId) throw new APIError('Authentication required to submit assignment', 'UNAUTHORIZED');

      const submission = await this.repo.createAssignmentSubmission({
        assignment_id: assignmentId,
        student_id: myId,
        content: content?.trim() || null,
        photo_url: photoUrl ?? null,
        submitted_at: new Date().toISOString(),
      });

      void this.growth.emitSilent({
        user_id: myId,
        event_type: 'assignment_submitted',
        event_metadata: {
          assignment_id: assignmentId,
          has_content: !!content?.trim(),
          has_photo: !!photoUrl,
        },
      });

      return submission;
    },
    create: async (assignment: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>) => {
      const created = await this.repo.createAssignment(assignment);
      const myId = await this.identity.getMyInternalId();
      if (myId) {
        void this.growth.emitSilent({
          user_id: myId,
          event_type: 'assignment_created',
          event_metadata: { classroom_id: assignment['classroom_id'] },
        });
      }
      return created;
    },
    update: (id: string, updates: Partial<Assignment>) => this.repo.updateAssignment(id, updates),
    delete: (id: string) => this.repo.deleteAssignment(id),
    getRecentGradesOverviewForStudent: (studentId: string, limit?: number) =>
      this.repo.getRecentGradesOverviewForStudent(studentId, limit),
  };

  public classroomGroups = {
    getAll: (classroomId: string) => this.repo.getClassroomGroups(classroomId),
    create: (classroomId: string, input: { name: string; description?: string | null; student_ids?: string[]; color?: string | null }) =>
      this.repo.createClassroomGroup({
        classroom_id: classroomId,
        name: input.name.trim(),
        description: input.description?.trim() || null,
        student_ids: input.student_ids ?? [],
        color: input.color ?? null,
      }),
    update: (id: string, updates: { name?: string; description?: string | null; student_ids?: string[]; color?: string | null }) =>
      this.repo.updateClassroomGroup(id, {
        ...updates,
        name: updates.name?.trim(),
        description: updates.description === undefined ? undefined : updates.description?.trim() || null,
        student_ids: updates.student_ids,
        color: updates.color,
      }),
    delete: (id: string) => this.repo.deleteClassroomGroup(id),
  };

  public classroomStudents = {
    getAll: (classroomId: string) => this.repo.getEnrollmentRecords(classroomId),
    addShadowStudent: (classroomId: string, fullName: string, rollNumber?: string, notes?: string) =>
      this.repo.addShadowStudent(classroomId, fullName, rollNumber, notes),
    claimStudent: async (inviteCode: string) => {
      const myId = await this.identity.getMyInternalId();
      if (!myId) throw new APIError('Authentication required to claim record', 'UNAUTHORIZED');
      return this.repo.claimStudent(inviteCode, myId);
    },
    add: (classroomId: string, studentId: string, rollNumber?: string, notes?: string) =>
      this.repo.addStudent(classroomId, studentId, rollNumber, notes),
    updateById: (id: string, updates: { roll_number?: string; notes?: string }) => 
      this.repo.updateEnrollmentRecordById(id, updates),
    update: (classroomId: string, studentId: string, updates: { roll_number?: string; notes?: string }) =>
      this.repo.updateEnrollmentRecord(classroomId, studentId, updates),
    remove: (id: string) => this.repo.deleteEnrollmentRecord(id),
    requestJoin: (userId: string, classroomId: string, role: string, subjectLabel?: string) =>
      this.repo.requestClassroomJoin(userId, classroomId, role, subjectLabel),
    handleRequest: async (requestId: string, status: string) => {
      // 1. Update status
      const result = await this.repo.updateClassroomJoinRequest(requestId, status);
      const request = await this.repo.getClassroomJoinRequest(requestId);
      
      if (!request) return result;

      // 2. Sync with community group membership
      const group = await this.community.getGroupByClassroom(request.classroom_id);
      
      if (status === 'approved') {
        if (group) {
          // Activate group membership (UPSERT style logic in adapter)
          await this.community.updateMembership(group.id, request.user_id, { status: 'active' });
        }

        // Determine capabilities for automated record creation
        const ability = composeUserAbilities({
          user_id: request.user_id,
          active_bond: {
            capacity: request.role as any,
            entity_id: request.classroom_id,
            entity_type: 'CLASSROOM',
          } as any,
        });

        if (ability.can('manage', 'StudentDashboard')) {
          await this.repo.addStudent(request.classroom_id, request.user_id);
        } else if (ability.can('manage', 'TeacherDashboard')) {
          // If it's a teacher request being approved, they might become the primary teacher
          const classroom = await this.repo.getClassroomById(request.classroom_id);
          if (classroom && !classroom.teacher_id) {
            await this.repo.updateClassroom(request.classroom_id, { teacher_id: request.user_id });
          }
        }

        await this.identity.createNotification(
          request.user_id,
          'join_request_approved',
          'Classroom Joined',
          'You have been admitted to the classroom sanctuary.'
        );
      } else if (status === 'rejected') {
        if (group) {
          await this.community.updateMembership(group.id, request.user_id, { status: 'rejected' });
        }
      }
      
      return result;
    },
  };

  public students = {
    getAll: (classroomId: string) => this.repo.getSimpleStudents(classroomId),
    enroll: (classroomId: string, studentId: string) => this.repo.enrollStudent(classroomId, studentId),
    remove: (classroomId: string, studentId: string) => this.repo.removeStudent(classroomId, studentId),
    getHistoricalAcademicRecords: (studentId: string) => this.repo.getHistoricalAcademicRecords(studentId),
  };

  public teachers = {
    getHistoricalProfessionalRecords: (teacherId: string) => this.repo.getHistoricalProfessionalRecords(teacherId),
    getHistoricalGovernanceRecords: (principalId: string) => this.repo.getHistoricalGovernanceRecords(principalId),
  };

  public institutions = {
    getSchoolLegacyHistory: (schoolId: string) => this.repo.getSchoolLegacyHistory(schoolId),
    getClassroomLegacyHistory: (classroomId: string) => this.repo.getClassroomLegacyHistory(classroomId),
    
    // New Institutional Methods
    create: (data: { name: string; handle?: string | null; type: string; created_by: string }) => 
      this.repo.createSchool(data),
    getById: (id: string) => this.repo.getSchool(id),
    update: (id: string, updates: any) => this.repo.updateSchool(id, updates),
    search: (query: string) => this.repo.searchSchools(query),
    getSections: (schoolId: string) => this.repo.getSections(schoolId),
    getGrades: (sectionId: string) => this.repo.getGrades(sectionId),
    createSection: (schoolId: string, name: string) => this.repo.createSection(schoolId, name),
    createGrade: (sectionId: string, number: number) => this.repo.createGrade(sectionId, number),
    getInviteCodes: (schoolId: string) => this.repo.getInviteCodes(schoolId),
    generateInviteCode: (schoolId: string, role: string, createdBy: string) => 
      this.repo.generateInviteCode(schoolId, role, createdBy),

    // Academic Cycles
    getAcademicCycles: (schoolId: string) => this.repo.getAcademicCycles(schoolId),
    getCurrentAcademicCycle: (schoolId: string) => this.repo.getCurrentAcademicCycle(schoolId),
    createAcademicCycle: (data: any) => this.repo.createAcademicCycle(data),
    updateAcademicCycle: (id: string, schoolId: string, data: any) => 
      this.repo.updateAcademicCycle(id, schoolId, data),
    deleteAcademicCycle: (id: string) => this.repo.deleteAcademicCycle(id),
    requestJoin: (userId: string, schoolId: string, role: string) =>
      this.repo.requestSchoolJoin(userId, schoolId, role),
    handleRequest: async (requestId: string, status: string) => {
      const result = await this.repo.updateSchoolJoinRequest(requestId, status);
      
      if (status === 'approved' && result) {
        // Orchestrate side-effects: update user school and notify
        await this.identity.updateProfile(result.user_id, { school_id: result.school_id });
        
        await this.identity.createNotification(
          result.user_id,
          'join_request_approved',
          'School Joined',
          'Your request to join the school has been approved.'
        );
      }
      
      return result;
    },
  };

  public classroomNotes = {
    getAll: (classroomId: string) => this.repo.listVisibleNotes(classroomId),
    getSnapshotAsOf: (classroomId: string, viewDate: string) => 
      this.repo.listVisibleNotesAsOf(classroomId, viewDate),
    create: (authorId: string, note: any) => this.repo.createNote(authorId, note),
    update: (id: string, updates: any) => this.repo.updateNote(id, updates),
    delete: (id: string) => this.repo.deleteNote(id),
    getTimeline: (id: string) => this.repo.getNoteTimeline(id),
  };

  public lessonMaterials = {
    getAll: (classroomId: string) => this.repo.getMaterials(classroomId),
    getByLesson: (lessonId: string) => this.repo.getMaterialsByLesson(lessonId),
    create: (material: Omit<LessonMaterial, 'id' | 'created_at' | 'updated_at'>) => this.repo.createMaterial(material),
    update: (id: string, updates: Partial<LessonMaterial>) => this.repo.updateMaterial(id, updates),
    delete: (id: string) => this.repo.deleteMaterial(id),
  };

  public grading = {
    submitGrade: async (studentId: string, classroomId: string, marks: number, assignmentId?: string, feedback?: string) => {
      const myId = await this.identity.getMyInternalId();
      if (!myId) throw new APIError('Failed to submit grade', 'UNAUTHORIZED');

      const { grade, gpa } = marksToGPA(marks);
      const created = await this.repo.upsertGrade({
        student_id: studentId,
        classroom_id: classroomId,
        assignment_id: assignmentId,
        marks,
        grade,
        gpa,
        feedback,
        graded_by: myId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      void this.growth.emitSilent({
        user_id: myId,
        event_type: 'assignment_graded',
        event_metadata: {
          classroom_id: classroomId,
          has_feedback: !!feedback && feedback.length > 0,
        },
      });

      return created;
    },
    getById: async (gradeId: string) => {
      const grade = await this.repo.getGradeById(gradeId);
      if (!grade) throw new APIError('Grade not found', 'NOT_FOUND');
      return grade;
    },
    reviseGrade: async (gradeId: string, marks: number, feedback?: string) => {
      const existing = await this.repo.getGradeById(gradeId);
      if (!existing) throw new APIError('Grade not found', 'NOT_FOUND');

      const { grade, gpa } = marksToGPA(marks);
      return this.repo.updateGrade(gradeId, {
        marks,
        grade,
        gpa,
        feedback: feedback ?? null,
        updated_at: new Date().toISOString(),
      });
    },
    getReportCard: (studentId: string) => this.repo.getGradesByStudent(studentId),
    getClassroomGrades: (classroomId: string) => this.repo.getGradesByClassroom(classroomId),
    getGradingSettings: async (classroomId: string) => 
      (await this.repo.getGradingSettings(classroomId)) ?? {
        classroom_id: classroomId,
        grading_mode: 'both',
        show_ranks: true,
      },
    updateGradingSettings: (classroomId: string, settings: Partial<ClassroomGradingSettings>) =>
      this.repo.upsertGradingSettings(classroomId, settings),
    deleteGrade: (gradeId: string) => this.repo.deleteGrade(gradeId),
  };

  public attendance = {
    getByDate: (classroomId: string, date: string) => this.repo.getAttendanceByDate(classroomId, date),
    record: (classroomId: string, studentId: string, status: string, date: string) =>
      this.repo.recordAttendance(classroomId, studentId, status, date),
    batchRecord: (records: any[]) => this.repo.batchRecordAttendance(records),
    getForStudent: (studentId: string, classroomId?: string) =>
      this.repo.getAttendanceForStudent(studentId, classroomId),
  };
}
