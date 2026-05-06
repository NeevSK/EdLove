import { getOnboardingState } from '../logic/domains/profile/onboarding';
import { type User, UserSchema } from '../logic/schemas/user.schema';
import { identity } from '../logic/managers/factory';
import { APIError } from '../types/API';
import { supabase } from './supabase';

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
   * Fetches the full user profile from the `users` table.
   */
  async getProfile(userId: string): Promise<User> {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();

    if (error) {
      throw new APIError('Failed to fetch user profile', error.code, error);
    }

    return UserSchema.parse(data);
  },

  /**
   * Updates the user's profile in the `users` table.
   */
  async updateProfile(userId: string, updates: Partial<User>) {
    // Validate updates against partial UserSchema
    const validatedUpdates = UserSchema.partial().parse(updates);

    const { error } = await supabase.from('users').update(validatedUpdates).eq('id', userId);

    if (error) {
      throw new APIError('Failed to update user profile', error.code, error);
    }
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

    const activeBond = activePerspective?.activeBond || null;

    // A "real class count" is now a count of Classroom Bonds
    const realClassCount = bonds.filter(b => b.entityType === 'CLASSROOM').length;

    return {
      userId,
      schoolId: profile.school_id,
      profileCompleted: !!profile.profile_completed,
      onboardingCompleted: !!profile.onboarding_completed,
      onboardingState: getOnboardingState(profile, activeBond),
      realClassCount,
      profile: {
        ...profile,
        activeBond,
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
      state: getOnboardingState(profile, perspective?.activeBond),
      profile,
    };
  },

  /**
   * Clears the identity cache (e.g., on logout).
   */
  clearCache() {
    // Adapter handles its own cache clearing via auth subscription if needed,
    // but we can expose it if added to port. For now, no-op.
  },
};
