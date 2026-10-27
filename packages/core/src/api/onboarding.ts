import { orpcClient } from '@repo/core/api/orpcClient';
import {
  auth,
  community,
  educational,
  notification,
  profile,
} from '@repo/core/logic/managers/factory';
import type { Capacity } from '@repo/core/logic/schemas/capacity.schema';
import { CompleteProfileSchema } from '@repo/core/logic/schemas/profileUpdate.schema';
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
    const session = await auth.getSession();
    const guestUser = session?.user;
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
    const res = await orpcClient.onboarding.createInitialBond({
      body: {
        orientation,
        confirmCapacityChange: false,
        context: (context as Record<string, unknown>) || {},
      },
    });
    if (!res.success) {
      throw new APIError('Failed to create initial bond', 'INITIAL_BOND_FAILED');
    }
  },

  async completeOnboarding(userId: string, idempotencyKey?: string): Promise<void> {
    const session = await auth.getSession();
    if (session?.user?.is_anonymous && session.user.id === userId) {
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
    const res = await orpcClient.onboarding.completeOnboarding({
      body: idempotencyKey ? { idempotencyKey } : {},
    });
    if (!res.success) {
      throw new APIError('Failed to complete onboarding', 'ONBOARDING_FAILED');
    }
    trackProductEvent('onboarding_completed');
  },

  /** Creates the founder's verified school bond after an official school is created. */
  async createFounderSchoolBond(userId: string, schoolId: string): Promise<string> {
    try {
      const res = await orpcClient.onboarding.createFounderSchoolBond({
        body: { schoolId },
      });
      return res.bondId;
    } catch (error: any) {
      throw new APIError(
        error?.message || 'School founder bond was not established',
        error?.code || 'SCHOOL_BOND_NOT_CREATED',
      );
    }
  },

  async revokeSchoolBond(userId: string, schoolId: string): Promise<void> {
    try {
      await orpcClient.onboarding.revokeSchoolBond({
        params: { schoolId },
      });
    } catch (error: any) {
      throw new APIError(
        error?.message || 'School bond was not revoked',
        error?.code || 'SCHOOL_BOND_NOT_REVOKED',
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
    const { identity } = await import('../logic/managers/factory');
    const activeIdentity = await identity.identifyActiveCitizen();
    if (!activeIdentity || activeIdentity.id !== userId) {
      throw new APIError('The authenticated account changed.', 'AUTH_ACCOUNT_MISMATCH');
    }
    await orpcClient.onboarding.completeProfile(
      {
        body: CompleteProfileSchema.parse({
          display_name: displayName,
          first_name: firstName ?? null,
          last_name: lastName ?? null,
          username: username ?? null,
          capacity_label: capacityLabel,
          bio,
          index_number: indexNumber,
          nic_number: nicNumber,
        }),
      },
      { context: { expectedAccountId: userId, retry: 0 } },
    );
  },
};
