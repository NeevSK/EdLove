import { community, educational, notification, profile } from '../logic/managers/factory';
import type { Capacity } from '../logic/schemas/capacity.schema';
import type { ClassroomJoinRequest, RequestStatus, SchoolJoinRequest } from '../types/Onboarding';

/**
 * Onboarding API (Sovereign Orchestration)
 * Handles "No Trust" verification flows for schools and classrooms.
 */
export const onboardingAPI = {
  /**
   * SCHOOL JOIN FLOW
   */

  async requestSchoolJoin(
    userId: string,
    schoolId: string,
    capacity: Capacity,
  ): Promise<SchoolJoinRequest> {
    return educational.institutions.requestJoin(userId, schoolId, capacity);
  },

  async handleSchoolRequest(
    requestId: string,
    status: RequestStatus,
    _adminId: string,
  ): Promise<void> {
    await educational.institutions.handleRequest(requestId, status);
  },

  /**
   * CLASSROOM JOIN FLOW
   */

  async requestClassroomJoin(
    userId: string,
    classroomId: string,
    capacity: string,
    subjectLabel?: string,
  ): Promise<ClassroomJoinRequest> {
    const request = await educational.classroomStudents.requestJoin(
      userId,
      classroomId,
      capacity,
      subjectLabel,
    );

    // Find linked community group and create pending membership
    const group = await community.getGroupByClassroom(classroomId);

    if (group) {
      // Create pending group membership
      await community.createMembership({
        groupId: group.id,
        userId,
        capacity: 'member', // Default to member for pending join
        status: 'pending',
      });
    }

    return request;
  },

  async handleClassroomRequest(
    requestId: string,
    status: RequestStatus,
    _classTeacherId: string,
  ): Promise<void> {
    await educational.classroomStudents.handleRequest(requestId, status);
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
    await notification.createNotification(userId, type, title, message, metadata);
  },

  async getNotifications(userId: string) {
    return notification.getNotifications(userId);
  },

  async updateNotificationStatus(notificationId: string, isRead: boolean): Promise<void> {
    // Note: marking as read in the manager is markAsRead
    if (isRead) {
      await notification.markAsRead('', notificationId); // userId is not strictly needed for the adapter but we should pass something if required
    }
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
      await profile.updateProfile(userId, { school_id: null });
    } else {
      await educational.classroomStudents.remove(targetId);

      const group = await community.getGroupByClassroom(targetId);
      if (group) {
        await community.deleteMembership(group.id, userId);
      }
    }

    await notification.createNotification(
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
    displayName: string,
    capacityLabel: string,
    bio?: string,
    indexNumber?: string,
    nicNumber?: string,
    firstName?: string,
    lastName?: string,
    username?: string,
  ): Promise<void> {
    // identity.completeProfile was a helper that set multiple fields
    await profile.updateProfile(userId, {
      display_name: displayName,
      first_name: firstName ?? null,
      last_name: lastName ?? null,
      username: username ?? null,
      capacity_label: capacityLabel,
      bio,
      index_number: indexNumber,
      nic_number: nicNumber,
      profile_completed: true,
    });
  },
};
