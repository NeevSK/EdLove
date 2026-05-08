import { educational, identity, community } from '../logic/managers/factory';
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
    const request = await educational.classroomStudents.requestJoin(userId, classroomId, capacity, subjectLabel);
    
    // Find linked community group and create pending membership
    const group = await community.getGroupByClassroom(classroomId);

    if (group) {
      // Create pending group membership
      await community.createMembership({
        groupId: group.id,
        userId,
        capacity: 'member', // Default to member for pending join
        status: 'pending'
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
    await identity.createNotification(userId, type, title, message, metadata);
  },

  async getNotifications(userId: string) {
    return identity.getNotifications(userId);
  },

  async updateNotificationStatus(notificationId: string, isRead: boolean): Promise<void> {
    await identity.updateNotificationStatus(notificationId, isRead);
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
      await identity.updateProfile(userId, { school_id: null });
    } else {
      await educational.classroomStudents.remove(targetId); // This might need a custom method for removing specific student
      
      const group = await community.getGroupByClassroom(targetId);
      if (group) {
        await community.deleteMembership(group.id, userId);
      }
    }

    await identity.createNotification(
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
    capacityLabel: string,
    bio?: string,
    indexNumber?: string,
    nicNumber?: string,
  ): Promise<void> {
    await identity.completeProfile(userId, {
      fullName,
      capacityLabel,
      bio,
      indexNumber,
      nicNumber,
    });
  },
};
