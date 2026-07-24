import { Data, Duration, Effect, pipe, Schedule } from 'effect';
import { registerTokenResolver } from '../api/contract';
import type { Identity } from '../api/identity.generated';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '../api/supabase';
import { storage } from '../lib/storage';
import type { IIdentityPort } from '../logic/ports/identity.port';
import { APIError } from '../types/API';
import type { Bond, Capacity, Perspective } from '../types/Identity';
import type { User } from '../types/User';

// ─── Token Resolver (unchanged) ──────────────────────────────────

registerTokenResolver(async () => {
  try {
    const { data } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.auth.getSession();
    return data?.session?.access_token ?? null;
  } catch {
    return null;
  }
});

// ─── Effect helpers ──────────────────────────────────────────────

class SupabaseQueryError extends Data.TaggedError('SupabaseQueryError')<{
  readonly message: string;
}> {}

const retryPolicy = pipe(
  Schedule.exponential(Duration.millis(200)),
  Schedule.intersect(Schedule.recurs(2)),
);

function supabaseCall<T>(
  fn: () => PromiseLike<{ data: T; error: any }>,
): Effect.Effect<T, SupabaseQueryError, never> {
  return pipe(
    Effect.tryPromise({
      try: fn,
      catch: (e) => new SupabaseQueryError({ message: String(e) }),
    }),
    Effect.flatMap(({ data, error }) =>
      error
        ? Effect.fail(new SupabaseQueryError({ message: error.message ?? String(error) }))
        : Effect.succeed(data as T),
    ),
    Effect.retry(retryPolicy),
    Effect.timeout(Duration.seconds(15)),
    Effect.catchTag('TimeoutException', () =>
      Effect.fail(new SupabaseQueryError({ message: 'Supabase query timed out' })),
    ),
  );
}

function runEffect<T>(effect: Effect.Effect<T, SupabaseQueryError, never>): Promise<T> {
  return Effect.runPromise(
    effect.pipe(
      Effect.catchAll((e) => Effect.fail(new APIError(e.message, 'SUPABASE_ERROR'))),
    ),
  );
}

// ─── Adapter ─────────────────────────────────────────────────────

export class SupabaseIdentityAdapter implements IIdentityPort {
  private cachedInternalId: string | null = null;
  private activePerspective: Perspective | null = null;
  private cachedAuthUid: string | null = null;

  async resolveInternalId(provider: string, providerUserId: string): Promise<string | null> {
    if (provider === '__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__' && this.cachedInternalId) {
      return this.cachedInternalId;
    }

    const result = await runEffect(
      supabaseCall(() =>
        __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
          .from('auth_identities')
          .select('user_id')
          .eq('provider', provider)
          .eq('provider_user_id', providerUserId)
          .maybeSingle(),
      ),
    );

    const resolvedId = (result as { user_id?: string } | null)?.user_id ?? null;

    if (provider === '__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__' && resolvedId) {
      this.cachedInternalId = resolvedId;
    }

    return resolvedId;
  }

  async linkIdentity(userId: string, provider: string, providerUserId: string): Promise<void> {
    await runEffect(
      supabaseCall(() =>
        __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
          .from('auth_identities')
          .upsert(
            {
              user_id: userId,
              provider,
              provider_user_id: providerUserId,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'provider,provider_user_id' },
          ),
      ),
    );

    if (provider === '__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__') {
      this.cachedInternalId = userId;
    }
  }

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
      internalId = await this.resolveInternalId('__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__', authUid);
      this.cachedAuthUid = authUid;

      if (!internalId) {
        const legacyResult = await runEffect(
          supabaseCall(() =>
            __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
              .from('users')
              .select('id')
              .eq('id', authUid)
              .maybeSingle(),
          ).pipe(Effect.optionFromOptional),
        );

        if (legacyResult._tag === 'Some') {
          const legacyId = (legacyResult.value as any).id;
          await this.linkIdentity(legacyId, '__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__', authUid);
          internalId = legacyId;
        } else {
          await this.linkIdentity(authUid, '__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__', authUid);
          internalId = authUid;
        }
      }
      this.cachedInternalId = internalId;
    }

    if (!internalId) return null;

    const profile = await this.getProfile(internalId);
    const perspective = await this.getActivePerspective();
    if (!perspective) return null;

    return {
      id: internalId,
      email: profile.email ?? null,
      name: profile.display_name || undefined,
      onboarding_completed: !!profile.onboarding_completed,
      activeBond: (perspective.activeBond || null) as Bond | null,
      availableBonds: (perspective.availableBonds || []) as Bond[],
    };
  }

  async getProfile(userId: string): Promise<User> {
    return runEffect(
      supabaseCall(() =>
        __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
          .from('users')
          .select('*')
          .eq('id', userId)
          .single(),
      ),
    ) as Promise<User>;
  }

  async getBonds(userId: string): Promise<Bond[]> {
    const result = await Effect.runPromise(
      supabaseCall(() =>
        __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
          .from('bonds')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true }),
      ).pipe(
        Effect.catchAll((e) => {
          console.warn('[SupabaseIdentityAdapter] Bonds table not found or error:', e.message);
          return Effect.succeed(null);
        }),
      ),
    );

    if (!result) return [];

    return (result as any[]).map((b: any) => ({
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

    let userId = this.cachedInternalId;
    if (!userId) {
      const authUid = data.user.id;
      userId = await this.resolveInternalId('__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__', authUid);
      if (!userId) userId = authUid;
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
      } catch {
        // ignore JSON parse error
      }
    }

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

    const profile = await runEffect(
      supabaseCall(() =>
        __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
          .from('users')
          .select('is_anonymous')
          .eq('id', userId)
          .single(),
      ).pipe(Effect.map((r: any) => r as { is_anonymous: boolean | null })),
    );

    const isSupabaseAnonymous = profile?.is_anonymous ?? true;
    const schoolId = context.schoolId || null;

    let citizenship: 'WANDERER' | 'SECOND_CLASS' | 'FIRST_CLASS' = 'WANDERER';

    if (!isSupabaseAnonymous) {
      citizenship = 'SECOND_CLASS';

      if (schoolId) {
        const school = await runEffect(
          supabaseCall(() =>
            __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
              .from('schools')
              .select('type')
              .eq('id', schoolId)
              .maybeSingle(),
          ),
        );

        if (school && (school as any).type !== 'personal_workspace') {
          citizenship = 'FIRST_CLASS';
        }
      }
    }

    let username =
      typeof context.username === 'string' ? context.username.trim().toLowerCase() : null;
    if (username && !/^[a-z0-9_-]{3,30}$/.test(username)) {
      username = null;
    }

    let full_name = typeof context.fullName === 'string' ? context.fullName.trim() : '';
    if (!full_name) {
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

    const display_name =
      typeof context.displayName === 'string' && context.displayName.trim()
        ? context.displayName.trim()
        : full_name || 'Gurudevi User';

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

      const pcResult = await Effect.runPromise(
        supabaseCall(() =>
          __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
            .from('personal_classrooms')
            .insert({
              name: classroomName,
              type: classroomType,
              user_id: userId,
            })
            .select('id')
            .single(),
        ).pipe(
          Effect.catchAll((e) => {
            console.error('[createInitialBond] Failed to initialize personal classroom record:', e.message);
            return Effect.succeed(null);
          }),
        ),
      );

      if (pcResult) {
        finalPersonalClassroomId = (pcResult as any).id;
      }
    }

    await runEffect(
      supabaseCall(() =>
        __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
          .from('users')
          .update({
            display_name,
            full_name,
            first_name: context.firstName ?? null,
            last_name: context.lastName ?? null,
            username,
            identity_state: isSupabaseAnonymous ? 'anonymous' : 'identifying',
            school_id: schoolId,
            citizenship,
            capacity: orientation,
          })
          .eq('id', userId),
      ),
    );

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

    await runEffect(
      supabaseCall(() =>
        __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
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
          ),
      ),
    );

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

    await runEffect(
      supabaseCall(() =>
        __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
          .from('users')
          .update(normalizedUpdates)
          .eq('id', userId),
      ),
    );
  }

  async blockUser(blockerId: string, blockedId: string): Promise<void> {
    await runEffect(
      supabaseCall(() =>
        __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
          .from('user_blocks')
          .insert([{ blocker_id: blockerId, blocked_id: blockedId }]),
      ),
    );
  }

  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    await runEffect(
      supabaseCall(() =>
        __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
          .from('user_blocks')
          .delete()
          .eq('blocker_id', blockerId)
          .eq('blocked_id', blockedId),
      ),
    );
  }

  async completeProfile(userId: string, data: any): Promise<void> {
    await runEffect(
      supabaseCall(() =>
        __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
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
          .eq('id', userId),
      ),
    );
  }

  async completeOnboarding(userId: string): Promise<void> {
    const self = this;

    await Effect.runPromise(
      Effect.gen(function* () {
        const bonds = yield* Effect.promise(() => self.getBonds(userId)).pipe(
          Effect.catchAll(() => Effect.succeed<Bond[]>([])),
        );

        if (bonds.length === 0) {
          const profile = yield* Effect.promise(() => self.getProfile(userId)).pipe(
            Effect.catchAll(() => Effect.succeed(null)),
          );

          if (profile) {
            const capacity = (profile as any).capacity || 'teacher';

            const pc = yield* supabaseCall(() =>
              __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
                .from('personal_classrooms')
                .insert({
                  name: `${(profile as any).display_name || 'Sanctuary'}'s Workspace`,
                  type: capacity === 'student' ? 'student_classroom' : 'teacher_classroom',
                  user_id: userId,
                })
                .select('id')
                .single(),
            ).pipe(
              Effect.catchAll((e) => {
                console.error('[completeOnboarding] Failed to create default personal classroom:', e.message);
                return Effect.succeed(null);
              }),
            );

            if (pc) {
              yield* supabaseCall(() =>
                __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
                  .from('bonds')
                  .upsert(
                    {
                      user_id: userId,
                      entity_id: (pc as any).id,
                      entity_type: 'PERSONAL_CLASSROOM',
                      capacity: capacity,
                      metadata: {},
                    },
                    { onConflict: 'user_id,entity_id,capacity' },
                  ),
              ).pipe(
                Effect.catchAll((e) => {
                  console.error('[completeOnboarding] Failed to create default PERSONAL_CLASSROOM bond:', e.message);
                  return Effect.void;
                }),
              );
            }
          }
        }
      }).pipe(
        Effect.catchAll((e) => {
          console.warn('[completeOnboarding] Failed to check/create default sanctuary:', e);
          return Effect.void;
        }),
      ),
    );

    await runEffect(
      supabaseCall(() =>
        __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
          .from('users')
          .update({
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString(),
            identity_state: 'onboarded',
          })
          .eq('id', userId),
      ),
    );
  }
}
