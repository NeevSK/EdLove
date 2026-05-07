import { supabase } from '../api/supabase';
import { Bond, Perspective, Capacity } from '../types/Identity';
import { User } from '../types/User';
import { IIdentityPort } from '../logic/ports/identity.port';
import { APIError } from '../types/API';
import { storage } from '../lib/storage';
/**
 * SupabaseIdentityAdapter: The bridge between Supabase Auth/DB and the Identity Port.
 * This adapter maps legacy RBAC fields and relational ReBAC tables into the unified Bond model.
 */
export class SupabaseIdentityAdapter implements IIdentityPort {
  private cachedInternalId: string | null = null;
  private activePerspective: Perspective | null = null;

  private cachedAuthUid: string | null = null;

  async resolveInternalId(provider: string, providerUserId: string): Promise<string | null> {
    if (provider === 'supabase' && this.cachedInternalId) {
      return this.cachedInternalId;
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
      this.cachedInternalId = resolvedId;
    }

    return resolvedId;
  }

  async linkIdentity(userId: string, provider: string, providerUserId: string): Promise<void> {
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

    if (provider === 'supabase') {
      this.cachedInternalId = userId;
    }
  }

  async getMyInternalId(): Promise<string | null> {
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (!user) {
      this.cachedInternalId = null;
      return null;
    }
    const authUid = user.id;

    if (this.cachedInternalId && this.cachedAuthUid !== authUid) {
      this.cachedInternalId = null;
    }

    if (this.cachedInternalId) return this.cachedInternalId;

    const internalId = await this.resolveInternalId('supabase', authUid);
    this.cachedAuthUid = authUid;

    if (!internalId) {
      const { data: legacyUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', authUid)
        .maybeSingle();

      if (legacyUser) {
        await this.linkIdentity(legacyUser.id, 'supabase', authUid);
        this.cachedInternalId = legacyUser.id;
        return legacyUser.id;
      }

      await this.linkIdentity(authUid, 'supabase', authUid);
      this.cachedInternalId = authUid;
      return authUid;
    }

    this.cachedInternalId = internalId;
    return internalId;
  }

  async getProfile(userId: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw new APIError('Profile fetch failed', error.code, error);
    return data as User;
  }

  async getBonds(userId: string): Promise<Bond[]> {
    const { data, error } = await supabase
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
    const userId = await this.getMyInternalId();
    if (!userId) return false;

    const bonds = await this.getBonds(userId);
    
    if (contextId) {
      return bonds.some(b => b.entity_id === contextId && b.capacity === capacity);
    }

    return bonds.some(b => b.capacity === capacity);
  }

  async getActivePerspective(): Promise<Perspective | null> {
    if (this.activePerspective) return this.activePerspective;

    const userId = await this.getMyInternalId();
    if (!userId) return null;

    const bonds = await this.getBonds(userId);
    if (bonds.length === 0) return null;

    const persisted = await storage.getStringAsync(`active_perspective_${userId}`);
    if (persisted) {
      try {
        const parsed = JSON.parse(persisted);
        const activeBond = bonds.find(b => b.id === parsed.active_bond?.id);
        if (activeBond) {
          this.activePerspective = { active_bond: activeBond, available_bonds: bonds };
          return this.activePerspective;
        }
      } catch (e) {
        // ignore JSON parse error
      }
    }

    // Default to the first bond as the active perspective if none set
    this.activePerspective = {
      active_bond: bonds[0]!,
      available_bonds: bonds,
    };
    storage.set(`active_perspective_${userId}`, JSON.stringify(this.activePerspective));

    return this.activePerspective;
  }

  async switchPerspective(entityId: string, capacity: Capacity): Promise<void> {
    const userId = await this.getMyInternalId();
    if (!userId) throw new Error('Not authenticated');

    const bonds = await this.getBonds(userId);
    const targetBond = bonds.find(b => b.entity_id === entityId && b.capacity === capacity);

    if (!targetBond) {
      throw new Error(`User does not have a Bond for Entity ${entityId} with Capacity ${capacity}`);
    }

    this.activePerspective = {
      active_bond: targetBond,
      available_bonds: bonds,
    };
    storage.set(`active_perspective_${userId}`, JSON.stringify(this.activePerspective));
  }

  async createInitialBond(orientation: Capacity, context: Record<string, any>): Promise<void> {
    const userId = await this.getMyInternalId();
    if (!userId) throw new Error('Not authenticated');

    const { error: profileError } = await supabase
      .from('users')
      .update({
        full_name: context['fullName'] || 'Gurudevi User',
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        school_id: context['schoolId'] || null,
      })
      .eq('id', userId);

    if (profileError) throw new APIError('Failed to update profile during onboarding', profileError.code, profileError);

    // Create the formal Bond
    // 1. Wanderer/Guest (Anonymous) -> GUEST bond to GLOBAL
    // 2. 2nd Class Citizen (Authenticated, no school) -> PERSONAL bond to Personal Workspace
    // 3. 1st Class Citizen (Authenticated, has school) -> SCHOOL bond
    
    const { data: profile } = await supabase.from('users').select('is_anonymous').eq('id', userId).single();
    const isWanderer = profile?.is_anonymous;
    
    const entity_type = isWanderer 
      ? 'GUEST' 
      : (context['schoolId'] ? 'SCHOOL' : 'PERSONAL');
      
    const entity_id = isWanderer ? 'GLOBAL' : (context['schoolId'] || 'PERSONAL_WORKSPACE');

    const { error: bondError } = await supabase.from('bonds').insert({
      user_id: userId,
      entity_id,
      entity_type,
      capacity: orientation,
      metadata: context['metadata'] || {},
    });

    if (bondError) throw new APIError('Failed to create formal bond', bondError.code, bondError);

    // Clear local perspective to force a re-fetch of bonds
    this.activePerspective = null;
  }
}
