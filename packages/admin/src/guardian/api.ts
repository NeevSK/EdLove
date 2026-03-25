import { 
  GuardianIdentity, 
  StudentGuardianRelationship, 
  GuardianPermissionConfig,
  GuardianDashboard,
  VerificationDocument,
  ContactInfo,
  RelationshipType,
  VerificationStatus
} from './types';
import { supabase } from '@repo/core';

export interface GuardianAPI {
  // Identity management
  createGuardianProfile(data: Omit<GuardianIdentity, 'id' | 'createdAt' | 'updatedAt'>): Promise<GuardianIdentity>;
  verifyGuardian(guardianId: string, documents: VerificationDocument[]): Promise<void>;
  updateGuardianProfile(guardianId: string, updates: Partial<GuardianIdentity>): Promise<GuardianIdentity>;
  getGuardianProfile(guardianId: string): Promise<GuardianIdentity | null>;
  
  // Relationship management
  linkGuardianToStudent(guardianId: string, studentId: string, relationship: RelationshipType): Promise<StudentGuardianRelationship>;
  updatePermissions(guardianId: string, studentId: string, permissions: GuardianPermissionConfig[]): Promise<void>;
  terminateRelationship(guardianId: string, studentId: string): Promise<void>;
  
  // Access and visibility
  getGuardianStudents(guardianId: string): Promise<any[]>; // Student[] from core
  getStudentGuardians(studentId: string): Promise<GuardianIdentity[]>;
  
  // Dashboard and data
  getGuardianDashboard(guardianId: string): Promise<GuardianDashboard>;
  updateNotificationSettings(guardianId: string, settings: any): Promise<void>;
}

export const guardianAPI: GuardianAPI = {
  // Identity management
  async createGuardianProfile(data: Omit<GuardianIdentity, 'id' | 'createdAt' | 'updatedAt'>): Promise<GuardianIdentity> {
    const guardian: Partial<GuardianIdentity> = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from('guardian_identities')
      .insert(guardian)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  async verifyGuardian(guardianId: string, documents: VerificationDocument[]): Promise<void> {
    // Upload verification documents
    for (const doc of documents) {
      const { error } = await supabase
        .from('verification_documents')
        .insert({
          ...doc,
          guardianId,
          uploadedAt: new Date().toISOString(),
        });

      if (error) throw error;
    }

    // Update verification status to pending
    await supabase
      .from('guardian_identities')
      .update({ 
        verificationStatus: 'pending',
        updatedAt: new Date().toISOString()
      })
      .eq('id', guardianId);
  },

  async updateGuardianProfile(guardianId: string, updates: Partial<GuardianIdentity>): Promise<GuardianIdentity> {
    const { data, error } = await supabase
      .from('guardian_identities')
      .update({ 
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .eq('id', guardianId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getGuardianProfile(guardianId: string): Promise<GuardianIdentity | null> {
    const { data, error } = await supabase
      .from('guardian_identities')
      .select('*')
      .eq('id', guardianId)
      .single();

    if (error) return null;
    return data;
  },

  // Relationship management
  async linkGuardianToStudent(guardianId: string, studentId: string, relationship: RelationshipType): Promise<StudentGuardianRelationship> {
    const relationshipData: Partial<StudentGuardianRelationship> = {
      id: crypto.randomUUID(),
      guardianId,
      studentId,
      relationshipType: relationship,
      permissions: [], // Default permissions, can be updated separately
      custodyLevel: 'partial', // Default custody level
      effectiveDate: new Date().toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      schoolId: '', // TODO: Get from context
    };

    const { data, error } = await supabase
      .from('student_guardian_relationships')
      .insert(relationshipData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePermissions(guardianId: string, studentId: string, permissions: GuardianPermissionConfig[]): Promise<void> {
    const { error } = await supabase
      .from('student_guardian_relationships')
      .update({ 
        permissions,
        updatedAt: new Date().toISOString()
      })
      .eq('guardianId', guardianId)
      .eq('studentId', studentId);

    if (error) throw error;
  },

  async terminateRelationship(guardianId: string, studentId: string): Promise<void> {
    const { error } = await supabase
      .from('student_guardian_relationships')
      .update({ 
        isActive: false,
        terminationDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .eq('guardianId', guardianId)
      .eq('studentId', studentId);

    if (error) throw error;
  },

  // Access and visibility
  async getGuardianStudents(guardianId: string): Promise<any[]> {
    const { data, error } = await supabase
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
      .eq('guardianId', guardianId)
      .eq('isActive', true);

    if (error) throw error;
    return data?.map(rel => rel.students) || [];
  },

  async getStudentGuardians(studentId: string): Promise<GuardianIdentity[]> {
    const { data, error } = await supabase
      .from('student_guardian_relationships')
      .select(`
        guardianId,
        guardians:guardian_id (
          *
        )
      `)
      .eq('studentId', studentId)
      .eq('isActive', true);

    if (error) throw error;
    return data?.map(rel => rel.guardians) || [];
  },

  // Dashboard and data
  async getGuardianDashboard(guardianId: string): Promise<GuardianDashboard> {
    // Get students for this guardian
    const students = await this.getGuardianStudents(guardianId);
    
    // For each student, get their overview data
    const studentOverviews = await Promise.all(
      students.map(async (student) => {
        // Get attendance data
        const { data: attendance } = await supabase
          .from('attendance')
          .select('*')
          .eq('student_id', student.id)
          .gte('date', new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString());

        // Get grades data
        const { data: grades } = await supabase
          .from('grades')
          .select('*')
          .eq('student_id', student.id)
          .order('created_at', { ascending: false })
          .limit(5);

        // Get upcoming assignments
        const { data: assignments } = await supabase
          .from('assignments')
          .select('*')
          .eq('classroom_id', student.classroom_id)
          .gte('due_date', new Date().toISOString())
          .order('due_date', { ascending: true })
          .limit(3);

        return {
          studentId: student.id,
          name: `${student.first_name} ${student.last_name}`,
          grade: student.grade,
          classroom: student.classroom_id,
          attendance: {
            present: attendance?.filter(a => a.status === 'present').length || 0,
            absent: attendance?.filter(a => a.status === 'absent').length || 0,
            late: attendance?.filter(a => a.status === 'late').length || 0,
            total: attendance?.length || 0,
            percentage: attendance?.length > 0 
              ? (attendance?.filter(a => a.status === 'present').length || 0) / attendance.length * 100 
              : 0,
          },
          grades: {
            latest: grades?.map(g => ({
              subject: g.subject,
              grade: g.grade,
              percentage: g.percentage,
              date: g.created_at,
              type: g.type
            })) || [],
            average: grades?.length > 0 
              ? grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length 
              : 0,
          },
          upcomingAssignments: assignments?.map(a => ({
            id: a.id,
            title: a.title,
            subject: a.subject,
            dueDate: a.due_date,
            status: 'pending',
            grade: undefined
          })) || [],
          recentAnnouncements: [], // TODO: Implement announcements
        };
      })
    );

    // Get notifications
    const { data: notifications } = await supabase
      .from('guardian_notifications')
      .select('*')
      .eq('guardianId', guardianId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get upcoming events
    const { data: events } = await supabase
      .from('school_events')
      .select('*')
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })
      .limit(5);

    return {
      guardianId,
      students: studentOverviews,
      notifications: notifications?.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.is_read,
        createdAt: n.created_at,
        actionUrl: n.action_url
      })) || [],
      upcomingEvents: events?.map(e => ({
        id: e.id,
        title: e.title,
        description: e.description,
        date: e.date,
        time: e.time,
        location: e.location,
        type: e.type,
        requiresRsvp: e.requires_rsvp,
        rsvpStatus: e.rsvp_status
      })) || [],
      recentActivity: [], // TODO: Implement activity tracking
    };
  },

  async updateNotificationSettings(guardianId: string, settings: any): Promise<void> {
    const { error } = await supabase
      .from('guardian_notification_settings')
      .upsert({
        guardianId,
        settings,
        updatedAt: new Date().toISOString(),
      });

    if (error) throw error;
  }
};
