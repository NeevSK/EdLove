import {
  assertSupabaseSessionContinuity,
  readSupabaseSession,
} from '@repo/core/adapters/supabase/sessionContinuity';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import type { SessionContinuity } from '@repo/core/api/clientRuntime';
import { registerActiveBondIdResolver, registerTokenResolver } from '@repo/core/api/clientRuntime';
import { type Identity, IdentitySchema } from '@repo/core/api/identity.generated';
import { orpcClient } from '@repo/core/api/orpcClient';
import { getActiveAccountId } from '@repo/core/lib/accountScope';
import { storage } from '@repo/core/lib/storage';
import type { IIdentityPort } from '@repo/core/logic/ports/identity.port';
import { CanonicalAccountIdSchema } from '@repo/core/logic/schemas/identity.schema';
import {
  CompleteProfileSchema,
  type ProfileCompletionDetails,
  UserProfilePatchSchema,
} from '@repo/core/logic/schemas/profileUpdate.schema';
import { APIError } from '@repo/core/types/API';
import type { Bond, Capacity, Perspective } from '@repo/core/types/Identity';
import type { User } from '@repo/core/types/User';
import { strictRetryPolicy } from '@repo/core/utils/effect';
import { Data, Duration, Effect, pipe } from 'effect';

// ─── Token Resolver (unchanged) ──────────────────────────────────

registerTokenResolver(async () => {
  try {
    const { data } = await supabaseClient.auth.getSession();
    return data?.session?.access_token ?? null;
  } catch {
    return null;
  }
});

registerActiveBondIdResolver(async () => {
  try {
    const session = await readSupabaseSession();
    if (!session) return null;
    const accountId = getActiveAccountId();
    if (!accountId) return null;
    const persisted = await storage.getStringAsync(`active_perspective_${accountId}`);
    if (getActiveAccountId() !== accountId) return null;
    if (!persisted) return null;
    const parsed = JSON.parse(persisted) as { activeBond?: { id?: string } };
    return parsed.activeBond?.id ?? null;
  } catch {
    return null;
  }
});

// ─── Effect helpers ──────────────────────────────────────────────

class SupabaseQueryError extends Data.TaggedError('SupabaseQueryError')<{
  readonly message: string;
}> {}

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
    Effect.retry(strictRetryPolicy),
    Effect.timeout(Duration.seconds(15)),
    Effect.catchTag('TimeoutError', () =>
      Effect.fail(new SupabaseQueryError({ message: 'Supabase query timed out' })),
    ),
  );
}

function runEffect<T>(effect: Effect.Effect<T, SupabaseQueryError, never>): Promise<T> {
  return Effect.runPromise(
    effect.pipe(
      Effect.catch((e: SupabaseQueryError) =>
        Effect.fail(new APIError(e.message, 'SUPABASE_ERROR')),
      ),
    ),
  );
}

// ─── Adapter ─────────────────────────────────────────────────────

export class SupabaseIdentityAdapter implements IIdentityPort {
  async resolveInternalId(provider: string, providerUserId: string): Promise<string | null> {
    if (provider !== 'supabase') return null;
    const session = await readSupabaseSession();
    if (session?.user.id !== providerUserId) return null;
    const identity = await this.resolveSessionIdentity({
      accessToken: session.access_token,
      subject: providerUserId,
    });
    return identity?.id ?? null;
  }

  async linkIdentity(userId: string, provider: string, providerUserId: string): Promise<void> {
    const accountId = await this.resolveInternalId(provider, providerUserId);
    if (!accountId || accountId !== userId) {
      throw new APIError(
        'Identity linking requires trusted provider provisioning.',
        'IDENTITY_LINK_REQUIRED',
      );
    }
  }

  async identifyActiveCitizen(): Promise<Identity | null> {
    const session = await readSupabaseSession();
    if (!session) return null;
    return this.resolveSessionIdentity({
      accessToken: session.access_token,
      subject: session.user.id,
    });
  }

  private async resolveSessionIdentity(expectedSession: SessionContinuity): Promise<Identity> {
    const identity = IdentitySchema.parse(
      await orpcClient.identity.identifyActiveCitizen(
        {},
        { context: { expectedSession, retry: 0 } },
      ),
    );
    CanonicalAccountIdSchema.parse(identity.id);
    await assertSupabaseSessionContinuity(expectedSession);
    return identity;
  }

  async getProfile(userId: string): Promise<User> {
    return runEffect(
      supabaseCall(() => supabaseClient.from('users').select('*').eq('id', userId).single()),
    ) as Promise<User>;
  }

  async getBonds(userId: string): Promise<Bond[]> {
    const result = await Effect.runPromise(
      supabaseCall(() =>
        supabaseClient
          .from('bonds')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true }),
      ).pipe(
        Effect.catch((e: SupabaseQueryError) => {
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
    const identity = await this.identifyActiveCitizen();
    if (!identity) return null;
    return {
      ...(identity.activeBond ? { activeBond: identity.activeBond } : {}),
      availableBonds: identity.availableBonds,
    };
  }

  async switchPerspective(entityId: string, capacity: Capacity): Promise<void> {
    const identity = await this.identifyActiveCitizen();
    if (!identity) throw new Error('Not authenticated');
    const userId = identity.id;

    const bonds = identity.availableBonds;
    const targetBond = bonds.find((b) => b.entity_id === entityId && b.capacity === capacity);

    if (!targetBond) {
      throw new Error(`User does not have a Bond for Entity ${entityId} with Capacity ${capacity}`);
    }

    const selected = IdentitySchema.parse(
      await orpcClient.identity.selectActiveScope(
        {
          body: { bondId: targetBond.id },
        },
        { context: { expectedAccountId: userId, retry: 0 } },
      ),
    );
    if (selected.id !== userId || selected.activeBond?.id !== targetBond.id) {
      throw new APIError(
        'Scope selection did not match the requested account and bond.',
        'SCOPE_SELECTION_CONFLICT',
      );
    }
    storage.set(
      `active_perspective_${userId}`,
      JSON.stringify({
        activeBond: selected.activeBond,
        availableBonds: selected.availableBonds,
      }),
    );
  }

  async createInitialBond(orientation: Capacity, context: Record<string, unknown>): Promise<void> {
    const identity = await this.identifyActiveCitizen();
    if (!identity) throw new APIError('Not authenticated', 'AUTH_REQUIRED');
    if (context.userId !== undefined && context.userId !== identity.id) {
      throw new APIError(
        'The requested account does not match the authenticated account.',
        'AUTH_ACCOUNT_MISMATCH',
      );
    }
    await orpcClient.onboarding.createInitialBond(
      {
        body: {
          orientation,
          confirmCapacityChange: context.confirmCapacityChange === true,
          context,
        },
      },
      { context: { expectedAccountId: identity.id, retry: 0 } },
    );
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<void> {
    const identity = await this.identifyActiveCitizen();
    if (!identity || identity.id !== userId) {
      throw new APIError(
        'The requested account does not match the authenticated account.',
        'AUTH_ACCOUNT_MISMATCH',
      );
    }
    const body = UserProfilePatchSchema.parse(updates);
    await orpcClient.identity.modifyUserProfile(
      { params: { id: userId }, body },
      { context: { expectedAccountId: userId, retry: 0 } },
    );
  }

  async blockUser(blockerId: string, blockedId: string): Promise<void> {
    await runEffect(
      supabaseCall(() =>
        supabaseClient
          .from('user_blocks')
          .insert([{ blocker_id: blockerId, blocked_id: blockedId }]),
      ),
    );
  }

  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    await runEffect(
      supabaseCall(() =>
        supabaseClient
          .from('user_blocks')
          .delete()
          .eq('blocker_id', blockerId)
          .eq('blocked_id', blockedId),
      ),
    );
  }

  async completeProfile(userId: string, data: ProfileCompletionDetails): Promise<void> {
    const identity = await this.identifyActiveCitizen();
    if (!identity || identity.id !== userId) {
      throw new APIError(
        'The requested account does not match the authenticated account.',
        'AUTH_ACCOUNT_MISMATCH',
      );
    }
    const body = CompleteProfileSchema.parse({
      display_name:
        data.displayName ||
        [data.firstName, data.lastName].filter(Boolean).join(' ') ||
        'Gurudevi User',
      first_name: data.firstName ?? null,
      last_name: data.lastName ?? null,
      username: data.username ?? null,
      capacity_label: data.capacityLabel,
      bio: data.bio,
      index_number: data.indexNumber,
      nic_number: data.nicNumber,
    });
    await orpcClient.onboarding.completeProfile(
      { body },
      { context: { expectedAccountId: userId, retry: 0 } },
    );
  }

  async completeOnboarding(userId: string): Promise<void> {
    const identity = await this.identifyActiveCitizen();
    if (!identity || identity.id !== userId) {
      throw new APIError(
        'The requested account does not match the authenticated account.',
        'AUTH_ACCOUNT_MISMATCH',
      );
    }
    await orpcClient.onboarding.completeOnboarding(
      { body: {} },
      { context: { expectedAccountId: userId, retry: 0 } },
    );
  }
}
