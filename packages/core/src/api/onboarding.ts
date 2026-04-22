import { supabase } from '../lib/supabase';
import { composeUserAbilities } from '../permissions/composer';
import type { Role } from '../permissions/schemas/role.schema';
import type { ClassroomJoinRequest, RequestStatus, SchoolJoinRequest } from '../types/Onboarding';

/**
 * Onboarding API (Triple Helix BDD Implementation)
 * Handles "No Trust" verification flows for schools and classrooms.
 */
export const onboardingAPI = {
  /**
   * SCHOOL JOIN FLOW
   */

  async requestSchoolJoin(
    userId: string,
    schoolId: string,
    role: Role,
  ): Promise<SchoolJoinRequest> {
    const { data, error } = await supabase
      .from('school_join_requests')
      .insert([{ user_id: userId, school_id: schoolId, role, status: 'pending' }])
      .select()
      .single();

    if (error) throw error;

    // Notify principal logic would go here (Trigger or follow-up)
    return data;
  },

  async handleSchoolRequest(
    requestId: string,
    status: RequestStatus,
    adminId: string,
  ): Promise<void> {
    const { error } = await supabase
      .from('school_join_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (error) throw error;

    if (status === 'approved') {
      // Get user_id from request
      const { data: request } = await supabase
        .from('school_join_requests')
        .select('user_id, school_id')
        .eq('id', requestId)
        .single();

      if (request) {
        // Update user school_id
        await supabase
          .from('users')
          .update({ school_id: request.school_id })
          .eq('id', request.user_id);

        // Add notification
        await this.createNotification(
          request.user_id,
          'join_request_approved',
          'School Joined',
          'Your request to join the school has been approved.',
        );
      }
    }
  },

  /**
   * CLASSROOM JOIN FLOW
   */

  async requestClassroomJoin(
    userId: string,
    classroomId: string,
    role: string,
    subjectLabel?: string,
  ): Promise<ClassroomJoinRequest> {
    // 1. Create classroom join request
    const { data: request, error } = await supabase
      .from('classroom_join_requests')
      .insert([
        {
          user_id: userId,
          classroom_id: classroomId,
          role,
          subject_label: subjectLabel,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // 2. Find linked community group and create pending membership
    const { data: group } = await supabase
      .from('community_groups')
      .select('id')
      .eq('classroom_id', classroomId)
      .single();

    if (group) {
      const ability = composeUserAbilities({ roles: [role as Role] });
      // POA: Use capability to determine group capacity instead of hardcoded roles
      const capacity = ability.can('manage', 'CommunityGroup') ? 'admin' : 'member';

      await supabase.from('group_members').insert([
        {
          group_id: group.id,
          user_id: userId,
          capacity,
          status: 'pending',
        },
      ]);
    }

    return request;
  },

  async handleClassroomRequest(
    requestId: string,
    status: RequestStatus,
    classTeacherId: string,
  ): Promise<void> {
    // 1. Update classroom request status
    const { error } = await supabase
      .from('classroom_join_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (error) throw error;

    // 2. Sync with community group membership
    const { data: request } = await supabase
      .from('classroom_join_requests')
      .select('user_id, classroom_id, role')
      .eq('id', requestId)
      .single();

    if (request && status === 'approved') {
      // Find linked group
      const { data: group } = await supabase
        .from('community_groups')
        .select('id')
        .eq('classroom_id', request.classroom_id)
        .single();

      if (group) {
        // Activate group membership
        await supabase
          .from('group_members')
          .update({ status: 'active' })
          .eq('group_id', group.id)
          .eq('user_id', request.user_id);
      }

      const ability = composeUserAbilities({ roles: [request.role as Role] });

      if (ability.can('manage', 'StudentDashboard')) {
        await supabase
          .from('classroom_students')
          .insert([{ student_id: request.user_id, classroom_id: request.classroom_id }]);
      } else if (ability.can('manage', 'TeacherDashboard')) {
        // If it's a teacher request being approved (e.g. by admin and they join as co-teacher)
        await supabase
          .from('classrooms')
          .update({ teacher_id: request.user_id })
          .eq('id', request.classroom_id)
          .is('teacher_id', null);
      }

      await this.createNotification(
        request.user_id,
        'join_request_approved',
        'Classroom Joined',
        'You have been admitted to the classroom sanctuary.',
      );
    } else if (request && status === 'rejected') {
      // Find linked group
      const { data: group } = await supabase
        .from('community_groups')
        .select('id')
        .eq('classroom_id', request.classroom_id)
        .single();

      if (group) {
        // Reject group membership
        await supabase
          .from('group_members')
          .update({ status: 'rejected' })
          .eq('group_id', group.id)
          .eq('user_id', request.user_id);
      }
    }
  },

  /**
   * NOTIFICATIONS
   */

  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    metadata: any = {},
  ): Promise<void> {
    await supabase
      .from('notifications')
      .insert([{ user_id: userId, type, title, message, metadata }]);
  },

  async getNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateNotificationStatus(notificationId: string, isRead: boolean): Promise<void> {
    await supabase.from('notifications').update({ is_read: isRead }).eq('id', notificationId);
  },

  /**
   * DANGEROUS ACTIONS: USER REMOVAL
   */

  async removeUserFromSpace(
    userId: string,
    targetId: string,
    type: 'school' | 'classroom',
  ): Promise<void> {
    if (type === 'school') {
      // 1. Remove from school_id in users table
      await supabase.from('users').update({ school_id: null }).eq('id', userId);

      // 2. Cascade removal from all school-specific community groups
      // (Assuming a trigger or complex query handles this, or implement here)
    } else {
      // 1. Remove from classroom_students
      await supabase
        .from('classroom_students')
        .delete()
        .eq('student_id', userId)
        .eq('classroom_id', targetId);

      // 2. Remove from classroom-specific community group
      const { data: group } = await supabase
        .from('community_groups')
        .select('id')
        .eq('classroom_id', targetId)
        .single();

      if (group) {
        await supabase
          .from('group_members')
          .delete()
          .eq('group_id', group.id)
          .eq('user_id', userId);
      }
    }

    // 3. Notify the user
    await this.createNotification(
      userId,
      'space_removal',
      'Access Revoked',
      `You have been removed from the ${type}.`,
    );
  },

  /**
   * PROFILE
   */

  async completeProfile(
    userId: string,
    fullName: string,
    roleLabel: string,
    bio?: string,
    indexNumber?: string,
    nicNumber?: string,
  ): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        authority_label: roleLabel,
        bio,
        index_number: indexNumber,
        nic_number: nicNumber,
        profile_completed: true,
      })
      .eq('id', userId);

    if (error) throw error;
  },
};
