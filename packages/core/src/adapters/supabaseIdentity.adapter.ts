import { registerTokenResolver } from '../api/contract';
import type { Identity } from '../api/identity.generated';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '../api/supabase';
import { storage } from '../lib/storage';
import type { IIdentityPort } from '../logic/ports/identity.port';
import { APIError } from '../types/API';
import type { Bond, Capacity, Perspective } from '../types/Identity';
import type { User } from '../types/User';

// Automatically register the token resolver for Sovereign clients
registerTokenResolver(async () => {
  try {
    const { data } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.auth.getSession();
    return data?.session?.access_token ?? null;
  } catch (err) {
    console.warn('[Sovereign Client] Failed to retrieve Supabase session token:', err);
    return null;
  }
});

/**
 * SupabaseIdentityAdapter: The bridge between Supabase Auth/DB and the Identity Port.
 * This adapter maps legacy RBAC fields and relational ReBAC tables into the unified Bond model.
 */
export class SupabaseIdentityAdapter implements IIdentityPort {
  private cachedInternalId: string | null = null;
  private activePerspective: Perspective | null = null;

  private cachedAuthUid: string | null = null;

  async resolveInternalId(provider: string, providerUserId: string): Promise<string | null> {
    if (provider === '__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__' && this.cachedInternalId) {
      return this.cachedInternalId;
    }

    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('auth_identities')
      .select('user_id')
      .eq('provider', provider)
      .eq('provider_user_id', providerUserId)
      .maybeSingle();

    if (error) {
      throw new APIError('Failed to resolve identity', error.code, error);
    }

    const resolvedId = data?.user_id ?? null;

    if (provider === '__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__' && resolvedId) {
      this.cachedInternalId = resolvedId;
    }

    return resolvedId;
  }

  async linkIdentity(userId: string, provider: string, providerUserId: string): Promise<void> {
    const { error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('auth_identities')
      .upsert(
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

    if (provider === '__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__') {
      this.cachedInternalId = userId;
    }
  }

  /**
   * [LOUD-FAILURE] Implementation of identifyActiveCitizen.
   * Resolves ID, Profile, and Active Perspective into a unified Identity object.
   */
  async identifyActiveCitizen(): Promise<Identity | null> {
    const { data } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.auth.getUser();
    const user = data?.user;
    if (!user) {
      this.cachedInternalId = null;
      return null;
    }
    const authUid = user.id;

    if (this.cachedInternalId && this.cachedAuthUid !== authUid) {
      this.cachedInternalId = null;
    }

    let internalId = this.cachedInternalId;

    if (!internalId) {
      internalId = await this.resolveInternalId(
        '__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__',
        authUid,
      );
      this.cachedAuthUid = authUid;

      if (!internalId) {
        const { data: legacyUser } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
          .from('users')
          .select('id')
          .eq('id', authUid)
          .maybeSingle();

        if (legacyUser) {
          await this.linkIdentity(
            legacyUser.id,
            '__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__',
            authUid,
          );
          internalId = legacyUser.id;
        } else {
          await this.linkIdentity(authUid, '__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__', authUid);
          internalId = authUid;
        }
      }
      this.cachedInternalId = internalId;
    }

    if (!internalId) return null;

    // Resolve full identity context
    const profile = await this.getProfile(internalId);
    const perspective = await this.getActivePerspective();

    if (!perspective) return null;

    return {
      id: internalId,
      email: profile.email || '',
      name: profile.display_name || undefined,
      onboarding_completed: !!profile.onboarding_completed,
      activeBond: (perspective.activeBond || null) as Bond | null,
      availableBonds: (perspective.availableBonds || []) as Bond[],
    };
  }

  async getProfile(userId: string): Promise<User> {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw new APIError('Profile fetch failed', error.code, error);
    return data as User;
  }

  async getBonds(userId: string): Promise<Bond[]> {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('bonds')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      // If table doesn't exist yet (migration pending), return empty to avoid crash but log warning
      console.warn('[SupabaseIdentityAdapter] Bonds table not found or error:', error.message);
      return [];
    }

    return (data || []).map((b: any) => ({
      id: b.id,
      user_id: b.user_id,
      entity_id: b.entity_id,
      entity_type: b.entity_type,
      capacity: b.capacity as Capacity,
      status: (b.status ?? 'active') as Bond['status'],
      valid_from: b.valid_from,
      valid_until: b.valid_until,
      metadata: b.metadata,
    }));
  }

  async hasCapacity(capacity: Capacity, contextId?: string): Promise<boolean> {
    const identity = await this.identifyActiveCitizen();
    if (!identity) return false;

    const bonds = await this.getBonds(identity.id);

    if (contextId) {
      return bonds.some((b) => b.entity_id === contextId && b.capacity === capacity);
    }

    return bonds.some((b) => b.capacity === capacity);
  }

  async getActivePerspective(): Promise<Perspective | null> {
    if (this.activePerspective) return this.activePerspective;

    const { data } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.auth.getUser();
    if (!data?.user) return null;

    // We need the internal ID to fetch bonds
    // Use a local ID lookup to avoid infinite recursion if identifyActiveCitizen calls getActivePerspective
    let userId = this.cachedInternalId;
    if (!userId) {
      const authUid = data.user.id;
      userId = await this.resolveInternalId('__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__', authUid);
      if (!userId) {
        // Fallback to authUid if not linked yet
        userId = authUid;
      }
    }

    const bonds = await this.getBonds(userId);
    if (bonds.length === 0) return null;

    const persisted = await storage.getStringAsync(`active_perspective_${userId}`);
    if (persisted) {
      try {
        const parsed = JSON.parse(persisted);
        const activeBond = bonds.find((b) => b.id === parsed.activeBond?.id);
        if (activeBond) {
          this.activePerspective = { activeBond, availableBonds: bonds };
          return this.activePerspective;
        }
      } catch (_e) {
        // ignore JSON parse error
      }
    }

    // Default to the first bond as the active perspective if none set
    this.activePerspective = {
      activeBond: bonds[0]!,
      availableBonds: bonds,
    };
    storage.set(`active_perspective_${userId}`, JSON.stringify(this.activePerspective));

    return this.activePerspective;
  }

  async switchPerspective(entityId: string, capacity: Capacity): Promise<void> {
    const identity = await this.identifyActiveCitizen();
    if (!identity) throw new Error('Not authenticated');
    const userId = identity.id;

    const bonds = await this.getBonds(userId);
    const targetBond = bonds.find((b) => b.entity_id === entityId && b.capacity === capacity);

    if (!targetBond) {
      throw new Error(`User does not have a Bond for Entity ${entityId} with Capacity ${capacity}`);
    }

    this.activePerspective = {
      activeBond: targetBond,
      availableBonds: bonds,
    };
    storage.set(`active_perspective_${userId}`, JSON.stringify(this.activePerspective));
  }

  async createInitialBond(orientation: Capacity, context: Record<string, any>): Promise<void> {
    const identity = context.userId
      ? ({ id: context.userId } as { id: string })
      : await this.identifyActiveCitizen();
    if (!identity) throw new Error('Not authenticated');
    const userId = identity.id;

    // 1. Resolve current state (Identity elevation level)
    const { data: profile } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('users')
      .select('is_anonymous')
      .eq('id', userId)
      .single();

    const isSupabaseAnonymous = profile?.is_anonymous ?? true;
    const schoolId = context.schoolId || null;

    let citizenship: 'WANDERER' | 'SECOND_CLASS' | 'FIRST_CLASS' = 'WANDERER';

    if (!isSupabaseAnonymous) {
      // If authenticated, default to 2nd Class. Upgrade to 1st Class if school context is non-personal.
      citizenship = 'SECOND_CLASS';

      if (schoolId) {
        const { data: school } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
          .from('schools')
          .select('type')
          .eq('id', schoolId)
          .maybeSingle();

        if (school && school.type !== 'personal_workspace') {
          citizenship = 'FIRST_CLASS';
        }
      }
    }

    // Sanitization & Validation to satisfy database CHECK constraints:
    // 1. username must match '^[a-z0-9_-]{3,30}$' or be NULL (empty strings violate check constraint)
    let username =
      typeof context.username === 'string' ? context.username.trim().toLowerCase() : null;
    if (username && !/^[a-z0-9_-]{3,30}$/.test(username)) {
      username = null;
    }

    // 2. full_name must be non-nullable, non-empty, and trimmed: char_length(TRIM(BOTH FROM full_name)) > 0
    let full_name = typeof context.fullName === 'string' ? context.fullName.trim() : '';
    if (!full_name) {
      // Derive from other context fields if available
      const first = typeof context.firstName === 'string' ? context.firstName.trim() : '';
      const last = typeof context.lastName === 'string' ? context.lastName.trim() : '';
      full_name = [first, last].filter(Boolean).join(' ');
    }
    if (!full_name) {
      full_name =
        typeof context.displayName === 'string' ? context.displayName.trim() : 'Sanctuary User';
    }
    if (!full_name || full_name.length === 0) {
      full_name = 'Sanctuary User';
    }

    // 3. display_name sanitization
    const display_name =
      typeof context.displayName === 'string' && context.displayName.trim()
        ? context.displayName.trim()
        : full_name || 'Gurudevi User';

    // 1. Check if authenticated but has no school context: initialize their Personal Classroom in db!
    let finalPersonalClassroomId: string | null = null;
    if (citizenship === 'SECOND_CLASS' && !schoolId) {
      const isTeacherOrPrincipal = [
        'teacher',
        'principal',
        'section_head',
        'grade_head',
        'founder',
        'assistant_principal',
        'developer',
      ].includes(orientation);

      let classroomType = 'unrelated_classroom';
      let classroomName = `${display_name}'s Personal Workspace`;

      if (isTeacherOrPrincipal) {
        classroomType = 'teacher_classroom';
        classroomName = `${display_name}'s Classroom`;
      } else if (orientation === 'student') {
        classroomType = 'student_classroom';
        classroomName = `${display_name}'s Student Workspace`;
      }

      const { data: newPersonalClassroom, error: pcErr } =
        await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
          .from('personal_classrooms')
          .insert({
            name: classroomName,
            type: classroomType,
            user_id: userId,
          })
          .select('id')
          .single();

      if (pcErr) {
        console.error('[createInitialBond] Failed to initialize personal classroom record:', pcErr);
      } else if (newPersonalClassroom) {
        finalPersonalClassroomId = newPersonalClassroom.id;
      }
    }

    const { error: profileError } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('users')
      .update({
        display_name,
        full_name,
        first_name: context.firstName ?? null,
        last_name: context.lastName ?? null,
        username,
        identity_state: isSupabaseAnonymous ? 'anonymous' : 'identifying', // Transitioning state
        school_id: schoolId, // Remains null for personal workspaces
        citizenship,
        capacity: orientation,
      })
      .eq('id', userId);

    if (profileError)
      throw new APIError(
        'Failed to update profile during onboarding',
        profileError.code,
        profileError,
      );

    // Create the formal Bond
    // 1. Wanderer/Anonymous -> PLATFORM bond to GLOBAL
    // 2. 2nd Class Citizen (Authenticated, no school) -> PERSONAL_CLASSROOM bond to Personal Classroom
    // 3. 1st Class Citizen (Authenticated, has school) -> SCHOOL bond

    const entity_type =
      citizenship === 'FIRST_CLASS'
        ? 'SCHOOL'
        : citizenship === 'SECOND_CLASS'
          ? 'PERSONAL_CLASSROOM'
          : 'PLATFORM';
    const entity_id =
      citizenship === 'FIRST_CLASS'
        ? schoolId
        : citizenship === 'SECOND_CLASS'
          ? finalPersonalClassroomId || 'PERSONAL_WORKSPACE'
          : 'GLOBAL';

    const { error: bondError } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('bonds')
      .upsert(
        {
          user_id: userId,
          entity_id,
          entity_type,
          capacity: orientation,
          metadata: context.metadata || {},
        },
        { onConflict: 'user_id,entity_id,capacity' },
      );

    if (bondError) throw new APIError('Failed to create formal bond', bondError.code, bondError);

    // Clear local perspective to force a re-fetch of bonds
    this.activePerspective = null;
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<void> {
    const normalizedUpdates: Record<string, unknown> = { ...updates };
    if ('email' in normalizedUpdates && normalizedUpdates.email === '') {
      normalizedUpdates.email = null;
    }

    if (
      'first_name' in normalizedUpdates ||
      'last_name' in normalizedUpdates ||
      'display_name' in normalizedUpdates
    ) {
      const firstName =
        typeof normalizedUpdates.first_name === 'string' ? normalizedUpdates.first_name : null;
      const lastName =
        typeof normalizedUpdates.last_name === 'string' ? normalizedUpdates.last_name : null;
      const displayName =
        typeof normalizedUpdates.display_name === 'string' ? normalizedUpdates.display_name : '';
      const resolvedName =
        displayName || [firstName, lastName].filter(Boolean).join(' ') || 'Gurudevi User';
      normalizedUpdates.display_name = resolvedName;
    }

    const { error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('users')
      .update(normalizedUpdates)
      .eq('id', userId);
    if (error) throw new APIError('Failed to update profile', error.code, error);
  }

  async blockUser(blockerId: string, blockedId: string): Promise<void> {
    const { error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('user_blocks')
      .insert([{ blocker_id: blockerId, blocked_id: blockedId }]);
    if (error) throw new APIError('Failed to block user', error.code, error);
  }

  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    const { error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('user_blocks')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId);
    if (error) throw new APIError('Failed to unblock user', error.code, error);
  }

  async completeProfile(userId: string, data: any): Promise<void> {
    const { error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('users')
      .update({
        display_name:
          data.displayName ||
          [data.firstName, data.lastName].filter(Boolean).join(' ') ||
          'Gurudevi User',
        first_name: data.firstName ?? null,
        last_name: data.lastName ?? null,
        username: data.username ?? null,
        identity_state: 'onboarded',
        capacity_label: data.capacityLabel,
        bio: data.bio,
        index_number: data.indexNumber,
        nic_number: data.nicNumber,
        profile_completed: true,
      })
      .eq('id', userId);

    if (error) throw new APIError('Failed to complete profile', error.code, error);
  }
  async completeOnboarding(userId: string): Promise<void> {
    try {
      const bonds = await this.getBonds(userId);
      if (!bonds || bonds.length === 0) {
        const profile = await this.getProfile(userId);
        const capacity = profile.capacity || 'teacher';
        console.log(`[completeOnboarding] User ${userId} has no bonds. Creating default PERSONAL_CLASSROOM sanctuary.`);
        
        const { data: pc, error: pcErr } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
          .from('personal_classrooms')
          .insert({
            name: `${profile.display_name || 'Sanctuary'}'s Workspace`,
            type: capacity === 'student' ? 'student_classroom' : 'teacher_classroom',
            user_id: userId,
          })
          .select('id')
          .single();

        if (pcErr) {
          console.error('[completeOnboarding] Failed to create default personal classroom:', pcErr);
        } else if (pc) {
          const { error: bondErr } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
            .from('bonds')
            .upsert(
              {
                user_id: userId,
                entity_id: pc.id,
                entity_type: 'PERSONAL_CLASSROOM',
                capacity: capacity,
                metadata: {},
              },
              { onConflict: 'user_id,entity_id,capacity' }
            );
          if (bondErr) {
            console.error('[completeOnboarding] Failed to create default PERSONAL_CLASSROOM bond:', bondErr);
          }
        }
      }
    } catch (e) {
      console.warn('[completeOnboarding] Failed to check/create default sanctuary:', e);
    }

    const { error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('users')
      .update({
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        identity_state: 'onboarded',
      })
      .eq('id', userId);

    if (error) throw new APIError('Failed to complete onboarding', error.code, error);
  }
}
