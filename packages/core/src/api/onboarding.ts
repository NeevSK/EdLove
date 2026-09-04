import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import { community, educational, notification, profile } from '@repo/core/logic/managers/factory';
import type { Capacity } from '@repo/core/logic/schemas/capacity.schema';
import { trackProductEvent } from '@repo/core/monitoring';
import { getLocalGuestIdentity, updateLocalGuestIdentity } from '@repo/core/native/guestIdentity';
import { setGuestScope } from '@repo/core/native/guestScope';
import { APIError } from '@repo/core/types/API';
import type { Perspective } from '@repo/core/types/Identity';
import type {
  ClassroomJoinRequest,
  RequestStatus,
  SchoolJoinRequest,
} from '@repo/core/types/Onboarding';

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

/**
 * Onboarding API (Sovereign Orchestration)
 * Handles "No Trust" verification flows for schools and classrooms.
 */
export const onboardingAPI = {
  /**
   * ONBOARDING IDENTITY FLOW
   */

  async getActivePerspective(): Promise<Perspective | null> {
    const { identity } = await import('../logic/managers/factory');
    return identity.getActivePerspective();
  },

  async createInitialBond(orientation: Capacity, context: Record<string, any>): Promise<void> {
    trackProductEvent('onboarding_started');
    const { data: sessionData } = await supabaseClient.auth.getSession();
    const guestUser = sessionData.session?.user;
    if (guestUser?.is_anonymous) {
      setGuestScope(guestUser.id);
      const bondId = globalThis.crypto?.randomUUID?.() ?? `guest-bond-${guestUser.id}`;
      const bond = {
        id: bondId,
        user_id: guestUser.id,
        entity_id: `personal-${guestUser.id}`,
        entity_type: 'PERSONAL_CLASSROOM' as const,
        capacity: orientation,
        status: 'active' as const,
      };
      await updateLocalGuestIdentity(guestUser.id, {
        display_name: String(context.displayName ?? ''),
        availableBonds: [bond],
        activeBond: bond,
      });
      return;
    }
    const res = await (client.api as any).identity['initial-bond'].$post({
      json: { orientation, context },
    });
    if (!res.ok) {
      throw new APIError('Failed to create initial bond', res.status.toString());
    }
    await res.json();
  },

  async completeOnboarding(userId: string): Promise<void> {
    const { data: sessionData } = await supabaseClient.auth.getSession();
    if (sessionData.session?.user?.is_anonymous && sessionData.session.user.id === userId) {
      setGuestScope(userId);
      const local = await getLocalGuestIdentity(userId);
      if (!local.activeBond || !local.activeBond.capacity) {
        throw new APIError(
          'Select a primary capacity before completing onboarding',
          'ONBOARDING_CAPACITY_REQUIRED',
        );
      }
      await updateLocalGuestIdentity(userId, { onboarding_completed: true });
      trackProductEvent('onboarding_completed');
      return;
    }
    const res = await (client.api as any).identity['complete-onboarding'].$post({
      json: { userId },
    });
    if (!res.ok) {
      throw new APIError('Failed to complete onboarding', res.status.toString());
    }
    await res.json();
    trackProductEvent('onboarding_completed');
  },

  /** Creates the founder's verified school bond after an official school is created. */
  async createFounderSchoolBond(userId: string, schoolId: string): Promise<string> {
    const res = await (client.api as any).identity['school-founder-bond'].$post({
      json: { schoolId },
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.success || typeof data.bondId !== 'string') {
      throw new APIError(
        data?.message || 'School founder bond was not established',
        res.status.toString() || 'SCHOOL_BOND_NOT_CREATED',
      );
    }
    return data.bondId;
  },

  async revokeSchoolBond(userId: string, schoolId: string): Promise<void> {
    const res = await (client.api as any).identity['school-bond'][schoolId].$delete();
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new APIError(
        data?.message || 'School bond was not revoked',
        res.status.toString() || 'SCHOOL_BOND_NOT_REVOKED',
      );
    }
  },

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
      await this.revokeSchoolBond(userId, targetId);
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
