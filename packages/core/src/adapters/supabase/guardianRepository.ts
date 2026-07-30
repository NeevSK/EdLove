import type { SupabaseClient } from '@supabase/supabase-js';
import { selectLatestPublishedSnapshots } from '@repo/core/lib/gradePublication';
import { selectGuardianVisibleGrades } from '@repo/core/logic/domains/guardian/gradeVisibility';
import type { GuardianRepository } from '@repo/core/logic/domains/guardian/ports';
import {
  type GuardianIdentity,
  GuardianIdentitySchema,
  type GuardianNotification,
  type GuardianNotificationSettings,
  type GuardianPermissionConfig,
  type GuardianProfileCreate,
  type GuardianSchoolEvent,
  type GuardianVerificationDocument,
  type StudentGuardianRelationship,
  StudentGuardianRelationshipSchema,
} from '@repo/core/logic/schemas/guardian.schema';
import { APIError } from '@repo/core/types/API';

interface AttendanceRow {
  id: string;
  student_id: string;
  status: string;
  date: string;
}

interface AssignmentRow {
  id: string;
  title: string;
  subject?: string;
  due_date: string;
  classroom_id: string;
}

interface GradeRow {
  id: string;
  subject?: string;
  grade?: string;
  percentage?: number;
  marks?: number;
  published_at?: string;
  created_at: string;
  type?: string;
}

interface NotificationRow {
  id: string;
  type: GuardianNotification['type'];
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

interface EventRow {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: GuardianSchoolEvent['type'];
  requires_rsvp: boolean;
  rsvp_status?: GuardianSchoolEvent['rsvpStatus'];
}

function mapGuardianIdentity(row: Record<string, unknown>): GuardianIdentity {
  const r = row as any;
  return GuardianIdentitySchema.parse({
    id: r.id,
    user_id: r.userId ?? r.user_id,
    relationship_type: r.relationshipType ?? r.relationship_type,
    contact_info: r.contactInfo ?? r.contact_info,
    verification_status: r.verificationStatus ?? r.verification_status,
    custody_info: r.custodyInfo ?? r.custody_info,
    emergency_contact: r.emergencyContact ?? r.emergency_contact,
    created_at: r.createdAt ?? r.created_at,
    updated_at: r.updatedAt ?? r.updated_at,
    school_id: r.schoolId ?? r.school_id,
    tenant_id: r.tenantId ?? r.tenant_id,
  });
}

function mapGuardianRelationship(row: Record<string, unknown>): StudentGuardianRelationship {
  const r = row as any;
  return StudentGuardianRelationshipSchema.parse({
    id: r.id,
    student_id: r.studentId ?? r.student_id,
    guardian_id: r.guardianId ?? r.guardian_id,
    relationship_type: r.relationshipType ?? r.relationship_type,
    permissions: r.permissions ?? [],
    custody_level: r.custodyLevel ?? r.custody_level,
    effective_date: r.effectiveDate ?? r.effective_date,
    termination_date: r.terminationDate ?? r.termination_date,
    is_active: r.isActive ?? r.is_active,
    created_at: r.createdAt ?? r.created_at,
    updated_at: r.updatedAt ?? r.updated_at,
    school_id: r.schoolId ?? r.school_id,
  });
}

export const createSupabaseGuardianRepository = (supabase: SupabaseClient): GuardianRepository => {
  async function getGuardianPublishedGrades(studentId: string) {
    const { data: gradeRows, error: gradesError } = await supabase
      .from('grades')
      .select('id')
      .eq('student_id', studentId);

    if (gradesError)
      throw new APIError('Failed to fetch guardian grade ids', gradesError.code, gradesError);
    if (!gradeRows || gradeRows.length === 0) return [];

    const { data: auditRows, error: auditError } = await supabase
      .from('audit_logs')
      .select('action, entity_id, created_at, metadata')
      .eq('entity_type', 'grade')
      .in(
        'entity_id',
        gradeRows.map((grade) => grade.id),
      );

    if (auditError)
      throw new APIError('Failed to fetch guardian published grades', auditError.code, auditError);

    return selectGuardianVisibleGrades(selectLatestPublishedSnapshots(auditRows ?? []));
  }

  return {
    async createGuardianProfile(data: GuardianProfileCreate) {
      const payload = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const { data: created, error } = await supabase
        .from('guardian_identities')
        .insert(payload)
        .select()
        .single();
      if (error) throw new APIError('Failed to create guardian profile', error.code, error);
      return mapGuardianIdentity(created);
    },
    async getGuardianProfile(guardianId) {
      const { data, error } = await supabase
        .from('guardian_identities')
        .select('*')
        .eq('id', guardianId)
        .maybeSingle();
      if (error) throw new APIError('Failed to fetch guardian profile', error.code, error);
      return data ? mapGuardianIdentity(data) : null;
    },
    async verifyGuardian(guardianId: string, documents: GuardianVerificationDocument[]) {
      for (const document of documents) {
        const payload = {
          ...document,
          id: document.id ?? crypto.randomUUID(),
          guardianId,
          uploadedAt: document.uploadedAt ?? new Date().toISOString(),
          status: document.status ?? 'pending',
        };
        const { error } = await supabase.from('verification_documents').insert(payload);
        if (error)
          throw new APIError('Failed to upload guardian verification document', error.code, error);
      }

      const { error } = await supabase
        .from('guardian_identities')
        .update({
          verificationStatus: 'pending',
          updatedAt: new Date().toISOString(),
        })
        .eq('id', guardianId);

      if (error)
        throw new APIError('Failed to update guardian verification status', error.code, error);
    },
    async updateGuardianProfile(guardianId, updates) {
      const payload = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from('guardian_identities')
        .update(payload)
        .eq('id', guardianId)
        .select()
        .single();
      if (error) throw new APIError('Failed to update guardian profile', error.code, error);
      return mapGuardianIdentity(data);
    },
    async linkGuardianToStudent(
      guardianId: string,
      studentId: string,
      relationshipType: GuardianIdentity['relationship_type'],
      schoolId?: string,
    ) {
      let resolvedSchoolId = schoolId;
      if (!resolvedSchoolId) {
        const guardianProfile = await this.getGuardianProfile(guardianId);
        resolvedSchoolId = guardianProfile?.school_id;
      }
      const payload = {
        id: crypto.randomUUID(),
        guardianId,
        studentId,
        relationship_type: relationshipType,
        permissions: [],
        custodyLevel: 'partial',
        effectiveDate: new Date().toISOString(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        school_id: resolvedSchoolId ?? '',
      };

      const { data, error } = await supabase
        .from('student_guardian_relationships')
        .insert(payload)
        .select()
        .single();
      if (error) throw new APIError('Failed to link guardian to student', error.code, error);
      return StudentGuardianRelationshipSchema.parse(data) as StudentGuardianRelationship;
    },
    async updateGuardianPermissions(
      guardianId: string,
      studentId: string,
      permissions: GuardianPermissionConfig[],
    ) {
      const { error } = await supabase
        .from('student_guardian_relationships')
        .update({
          permissions,
          updatedAt: new Date().toISOString(),
        })
        .eq('guardian_id', guardianId)
        .eq('student_id', studentId);
      if (error) throw new APIError('Failed to update guardian permissions', error.code, error);
    },
    async getGuardianRelationships(guardianId: string) {
      const { data, error } = await supabase
        .from('student_guardian_relationships')
        .select('*')
        .eq('guardian_id', guardianId)
        .eq('is_active', true);
      if (error) throw new APIError('Failed to fetch guardian relationships', error.code, error);
      return (data || []).map(mapGuardianRelationship);
    },
    async terminateGuardianRelationship(guardianId: string, studentId: string) {
      const { error } = await supabase
        .from('student_guardian_relationships')
        .update({
          isActive: false,
          terminationDate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .eq('guardian_id', guardianId)
        .eq('student_id', studentId);
      if (error) throw new APIError('Failed to terminate guardian relationship', error.code, error);
    },
    async getGuardianStudents(guardianId) {
      const dashboard = await this.getGuardianDashboard(guardianId);
      return dashboard.students;
    },
    async getStudentGuardians(studentId) {
      const { data, error } = await supabase
        .from('student_guardian_relationships')
        .select(`
                guardianId,
                guardians:guardian_id (
                  *
                )
              `)
        .eq('student_id', studentId)
        .eq('is_active', true);
      if (error) throw new APIError('Failed to fetch student guardians', error.code, error);
      return (
        (data?.map((relationship: any) => relationship.guardians) as Record<string, any>[]) || []
      )
        .filter(Boolean)
        .map(mapGuardianIdentity);
    },
    async getGuardianDashboard(guardianId) {
      const { data: relationships, error: relationshipsError } = await supabase
        .from('student_guardian_relationships')
        .select(`
                studentId,
                students:student_id (
                  id,
                  first_name,
                  last_name,
                  grade,
                  classroom_id
                )
              `)
        .eq('guardian_id', guardianId)
        .eq('is_active', true);
      if (relationshipsError)
        throw new APIError(
          'Failed to fetch guardian students',
          relationshipsError.code,
          relationshipsError,
        );

      const students = (
        ((relationships as any[]) || []).map(
          (relationship) => relationship.students as Record<string, any>,
        ) || []
      ).filter(Boolean);
      const monthAgoIso = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString();
      const nowIso = new Date().toISOString();

      const studentOverviews = await Promise.all(
        students.map(async (student: Record<string, any>) => {
          const [attendanceRes, publishedGrades, assignmentsRes] = await Promise.all([
            supabase
              .from('attendance')
              .select('*')
              .eq('student_id', student.id)
              .gte('date', monthAgoIso),
            getGuardianPublishedGrades(student.id),
            supabase
              .from('assignments')
              .select('*')
              .eq('classroom_id', student.classroom_id)
              .gte('due_date', nowIso)
              .order('due_date', { ascending: true })
              .limit(3),
          ]);

          if (attendanceRes.error)
            throw new APIError(
              'Failed to fetch guardian attendance summary',
              attendanceRes.error.code,
              attendanceRes.error,
            );
          if (assignmentsRes.error)
            throw new APIError(
              'Failed to fetch guardian assignments summary',
              assignmentsRes.error.code,
              assignmentsRes.error,
            );

          const attendance = (attendanceRes.data as AttendanceRow[]) || [];
          const grades = publishedGrades as GradeRow[];
          const assignments = (assignmentsRes.data as AssignmentRow[]) || [];
          const presentCount = attendance.filter((record) => record.status === 'present').length;

          return {
            studentId: student.id,
            name: `${student.first_name} ${student.last_name}`,
            grade: student.grade,
            classroom: student.classroom_id,
            attendance: {
              present: presentCount,
              absent: attendance.filter((record) => record.status === 'absent').length,
              late: attendance.filter((record) => record.status === 'late').length,
              total: attendance.length,
              percentage: attendance.length > 0 ? (presentCount / attendance.length) * 100 : 0,
            },
            grades: {
              latest: grades.map((grade) => ({
                subject: grade.subject ?? 'Published assessment',
                grade: grade.grade ?? '',
                percentage: grade.percentage ?? grade.marks,
                date: grade.published_at ?? grade.created_at,
                type: (grade.type as any) ?? 'assignment',
              })),
              average:
                grades.length > 0
                  ? grades.reduce(
                      (sum: number, grade) => sum + (grade.percentage ?? grade.marks ?? 0),
                      0,
                    ) / grades.length
                  : 0,
            },
            upcomingAssignments: assignments.map((assignment) => ({
              id: assignment.id,
              title: assignment.title,
              subject: assignment.subject ?? 'General',
              dueDate: assignment.due_date,
              status: 'pending' as const,
              grade: undefined,
            })),
            recentAnnouncements: [],
          };
        }),
      );

      const [notificationsRes, eventsRes] = await Promise.all([
        supabase
          .from('guardian_notifications')
          .select('*')
          .eq('guardian_id', guardianId)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('school_events')
          .select('*')
          .gte('date', nowIso)
          .order('date', { ascending: true })
          .limit(5),
      ]);

      if (notificationsRes.error)
        throw new APIError(
          'Failed to fetch guardian notifications',
          notificationsRes.error.code,
          notificationsRes.error,
        );
      if (eventsRes.error)
        throw new APIError(
          'Failed to fetch guardian events',
          eventsRes.error.code,
          eventsRes.error,
        );

      // Note: GuardianDashboardSchema needs to be available or imported
      // We assume it's correctly handled in the original file
      // Actually, GuardianDashboard was not in imports. Let's check imports again.
      return {
        guardianId,
        students: studentOverviews,
        notifications: ((notificationsRes.data as NotificationRow[]) || []).map((notification) => ({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          isRead: notification.is_read,
          createdAt: notification.created_at,
          actionUrl: notification.action_url,
        })),
        upcomingEvents: ((eventsRes.data as EventRow[]) || []).map((event) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          time: event.time,
          location: event.location,
          type: event.type,
          requiresRsvp: event.requires_rsvp,
          rsvpStatus: event.rsvp_status,
        })),
        recentActivity: [],
      };
    },
    async updateGuardianNotificationSettings(
      guardianId: string,
      settings: GuardianNotificationSettings,
    ) {
      const { error } = await supabase.from('guardian_notification_settings').upsert({
        guardian_id: guardianId,
        settings,
        updated_at: new Date().toISOString(),
      });
      if (error)
        throw new APIError('Failed to update guardian notification settings', error.code, error);
    },
  };
};
