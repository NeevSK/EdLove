import { getOnboardingState } from '../logic/domains/profile/onboarding';
import { type User } from '../logic/schemas/user.schema';
import { identity } from '../logic/managers/factory';
import { APIError } from '../types/API';

// State is managed by the adapter now


export const identityAPI = {
  /**
   * Resolves the internal user ID from a provider and provider-specific user ID.
   */
  async resolveInternalId(provider: string, providerUserId: string): Promise<string | null> {
    return identity.resolveInternalId(provider, providerUserId);
  },

  /**
   * Links an authentication identity to an existing internal user.
   */
  async linkIdentity(userId: string, provider: string, providerUserId: string) {
    return identity.linkIdentity(userId, provider, providerUserId);
  },

  /**
   * Resolves the current logged-in user's internal ID.
   */
  async getMyInternalId(): Promise<string | null> {
    return identity.getMyInternalId();
  },

  /**
   * Fetches the full user profile from the identity port.
   */
  async getProfile(userId: string): Promise<User> {
    return identity.getProfile(userId);
  },

  /**
   * Updates the user's profile via the identity port.
   */
  async updateProfile(userId: string, updates: Partial<User>) {
    return identity.updateProfile(userId, updates);
  },

  async getBonds(userId: string) {
    return identity.getBonds(userId);
  },

  async getActivePerspective() {
    return identity.getActivePerspective();
  },

  async switchPerspective(entityId: string, capacity: any) {
    return identity.switchPerspective(entityId, capacity);
  },


  /**
   * Returns the classroom workspace summary needed by the academic daily-work shell.
   */
  async getClassroomRoleSummary(userId: string) {
    const [profile, bonds, activePerspective] = await Promise.all([
      identity.getProfile(userId),
      identity.getBonds(userId),
      identity.getActivePerspective(),
    ]);

    const active_bond = activePerspective?.active_bond || null;

    // A "real class count" is now a count of Classroom Bonds
    const realClassCount = bonds.filter(b => b.entity_type === 'CLASSROOM').length;

    return {
      user_id: userId,
      school_id: profile.school_id,
      profile_completed: !!profile.profile_completed,
      onboarding_completed: !!profile.onboarding_completed,
      onboarding_state: getOnboardingState(profile, active_bond),
      real_class_count: realClassCount,
      profile: {
        ...profile,
        active_bond,
      },
    };
  },

  /**
   * Returns the explicit onboarding state for the current user.
   */
  async getOnboardingStatus(userId: string) {
    const profile = await identity.getProfile(userId);
    const perspective = await identity.getActivePerspective();
    return {
      state: getOnboardingState(profile, perspective?.active_bond),
      profile,
    };
  },

  /**
   * Blocks a user.
   */
  async blockUser(blockerId: string, blockedId: string) {
    return identity.blockUser(blockerId, blockedId);
  },

  /**
   * Unblocks a user.
   */
  async unblockUser(blockerId: string, blockedId: string) {
    return identity.unblockUser(blockerId, blockedId);
  },

  /**
   * Clears the identity cache (e.g., on logout).
   */
  clearCache() {
    // Adapter handles its own cache clearing
  },
};
