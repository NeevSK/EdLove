import { ClassroomRoleSummarySchema } from '../api/identity.contract';
import { type User, UserSchema } from '../logic/schemas/user.schema';
import { APIError } from '../types';
import { supabase } from './supabase';

// In-memory cache for the current session's internal user ID
let cachedInternalId: string | null = null;
let cachedAuthUid: string | null = null;

export const identityAPI = {
  /**
   * Resolves the internal user ID from a provider and provider-specific user ID.
   */
  async resolveInternalId(provider: string, providerUserId: string): Promise<string | null> {
    // Only return from cache if we are explicitly asking for the current Supabase session
    if (provider === 'supabase' && cachedInternalId) {
      return cachedInternalId;
    }

    const { data, error } = await supabase
      .from('auth_identities')
      .select('user_id')
      .eq('provider', provider)
      .eq('provider_user_id', providerUserId)
      .maybeSingle();

    if (error) {
      throw new APIError('Failed to resolve identity', error.code, error);
    }

    const resolvedId = data?.user_id ?? null;

    if (provider === 'supabase' && resolvedId) {
      cachedInternalId = resolvedId;
    }

    return resolvedId;
  },

  /**
   * Links an authentication identity to an existing internal user.
   */
  async linkIdentity(userId: string, provider: string, providerUserId: string) {
    const { error } = await supabase.from('auth_identities').upsert(
      {
        user_id: userId,
        provider,
        provider_user_id: providerUserId,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'provider,provider_user_id',
      },
    );

    if (error) {
      throw new APIError('Failed to link identity', error.code, error);
    }

    // Cache the newly linked ID if it's for the current supabase session
    if (provider === 'supabase') {
      cachedInternalId = userId;
    }
  },

  /**
   * Resolves the current logged-in user's internal ID.
   * This is the ONLY place in the codebase that legitimately calls supabase.auth.getUser()
   * to extract user.id \u2014 solely to look it up in auth_identities and return the
   * internal users.id. All other code must call this method, never auth.getUser() directly.
   */
  async getMyInternalId(): Promise<string | null> {
    // auth.getUser() is the bootstrap step \u2014 we extract the Supabase auth UID
    // and immediately resolve it to the internal users.id via auth_identities.
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (!user) {
      cachedInternalId = null;
      return null;
    }
    const authUid = user.id;

    // If we have a cached ID but it was for a different Supabase UID, clear it
    if (cachedInternalId && cachedAuthUid !== authUid) {
      cachedInternalId = null;
    }

    if (cachedInternalId) return cachedInternalId;

    // Resolve auth UID \u2192 internal users.id via auth_identities mapping table
    const internalId = await this.resolveInternalId('supabase', authUid);
    cachedAuthUid = authUid;

    // Fallback or Initial Mapping:
    // If not found in auth_identities (modern proxy) or public.users (legacy direct),
    // we fallback to returning the Auth UID (authUid) itself.
    // For new users, we will use the Auth UID as the initial internal users.id.
    if (!internalId) {
      const { data: legacyUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', authUid)
        .maybeSingle();

      if (legacyUser) {
        // Proactively heal the state by creating the missing identity mapping
        await this.linkIdentity(legacyUser.id, 'supabase', authUid);
        cachedInternalId = legacyUser.id;
        return legacyUser.id;
      }

      // Brand new user (no record in users or auth_identities)
      // We use the Auth UID as the internal ID.
      cachedInternalId = authUid;
      return authUid;
    }

    cachedInternalId = internalId;
    return internalId;
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

  /**
   * Returns the classroom workspace summary needed by the academic daily-work shell.
   * This is a transitional API boundary so classroom hooks stop querying Supabase directly.
   */
  async getClassroomRoleSummary(userId: string) {
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select(
        'school_id, profile_completed, role, full_name, email, platform_roles, school_role, work_roles, tenant_kind',
      )
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      throw new APIError('Failed to load classroom role summary', profileError.code, profileError);
    }

    const normalizedProfile = {
      school_id: profile?.school_id ?? null,
      profile_completed: profile?.profile_completed ?? false,
      role: profile?.role ?? null,
      full_name: profile?.full_name ?? null,
      email: profile?.email ?? null,
      platform_roles: Array.isArray(profile?.platform_roles) ? profile.platform_roles : [],
      school_role: profile?.school_role ?? null,
      work_roles: Array.isArray(profile?.work_roles) ? profile.work_roles : [],
      tenant_kind: profile?.tenant_kind ?? null,
    };

    const isStudent =
      normalizedProfile.school_role === 'student' || normalizedProfile.role === 'student';
    const isTeacher =
      normalizedProfile.school_role === 'teacher' ||
      normalizedProfile.role === 'teacher' ||
      normalizedProfile.school_role === 'class_teacher' ||
      normalizedProfile.school_role === 'subject_teacher';

    let realClassCount = 0;

    if (isStudent) {
      const { count, error } = await supabase
        .from('classroom_students')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', userId);

      if (error) {
        throw new APIError('Failed to count student classrooms', error.code, error);
      }

      realClassCount = count || 0;
    } else if (isTeacher) {
      const { count, error } = await supabase
        .from('classrooms')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', userId);

      if (error) {
        throw new APIError('Failed to count teacher classrooms', error.code, error);
      }

      realClassCount = count || 0;
    }

    return ClassroomRoleSummarySchema.parse({
      userId,
      schoolId: normalizedProfile.school_id,
      profileCompleted: !!normalizedProfile.profile_completed,
      realClassCount,
      profile: normalizedProfile,
    });
  },

  /**
   * Clears the identity cache (e.g., on logout).
   */
  clearCache() {
    cachedInternalId = null;
  },
};
