import { eq } from 'drizzle-orm';
import { getDrizzleDB } from '@repo/core/adapters/powersync/database';
import { pricingManifest } from '@repo/core/adapters/powersync/schema';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import type {
  EntitlementGrant,
  EntitlementScopeContext,
  EntitlementSnapshot,
  IEntitlementPort,
  SubscriptionTier,
} from '@repo/core/logic/ports/entitlement.port';

async function getUserPricingTier(userId: string): Promise<string> {
  const { data, error } = await supabaseClient
    .from('users')
    .select('pricing_tier')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.pricing_tier ?? 'FREE';
}

function normalizeTier(value: unknown): SubscriptionTier {
  return value === 'PRO' || value === 'INSTITUTIONAL' ? value : 'FREE';
}

async function queryManifest(tier: string): Promise<string[]> {
  const db = getDrizzleDB();
  const rows = await db
    .select()
    .from(pricingManifest)
    .where(eq(pricingManifest.tier, tier))
    .limit(1);

  if (rows.length > 0) {
    return JSON.parse(rows[0]?.features ?? '[]') as string[];
  }

  return [];
}

function normalizeModules(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
  if (typeof value === 'string') {
    try {
      return normalizeModules(JSON.parse(value));
    } catch {
      return [];
    }
  }
  return [];
}

function mapGrant(
  row: Record<string, unknown>,
  scope: EntitlementScopeContext,
): EntitlementGrant | null {
  const scopeType = row.scope_type;
  const now = Date.now();
  const startsAt = typeof row.starts_at === 'string' ? Date.parse(row.starts_at) : Number.NaN;
  const expiresAt = typeof row.expires_at === 'string' ? Date.parse(row.expires_at) : Number.NaN;
  if (Number.isFinite(startsAt) && startsAt > now) return null;
  if (Number.isFinite(expiresAt) && expiresAt <= now) return null;
  const matchesBond = scopeType === 'BOND' && row.bond_id === scope.activeBondId;
  const matchesEntity =
    scopeType === 'ENTITY' &&
    row.entity_id === scope.activeEntityId &&
    row.entity_type === scope.activeEntityType;
  const matchesAddOn =
    scopeType === 'ADD_ON' && (!row.entity_id || row.entity_id === scope.activeEntityId);
  const matchesIndividual = scopeType === 'INDIVIDUAL';
  if (!matchesBond && !matchesEntity && !matchesAddOn && !matchesIndividual) return null;

  const tier = normalizeTier(row.tier);
  const mappedScope =
    scopeType === 'BOND'
      ? 'active_bond'
      : scopeType === 'ENTITY'
        ? 'active_entity'
        : scopeType === 'ADD_ON'
          ? 'add_on'
          : 'individual';
  const status = row.status;
  if (status !== 'ACTIVE' && status !== 'SUSPENDED' && status !== 'REVOKED') return null;
  return {
    id: String(row.id),
    scope: mappedScope,
    scopeId:
      typeof row.bond_id === 'string'
        ? row.bond_id
        : typeof row.entity_id === 'string'
          ? row.entity_id
          : null,
    tier: tier as SubscriptionTier,
    modules: normalizeModules(row.modules),
    startsAt: typeof row.starts_at === 'string' ? row.starts_at : undefined,
    expiresAt: typeof row.expires_at === 'string' ? row.expires_at : null,
    status,
  };
}

export class SupabaseEntitlementAdapter implements IEntitlementPort {
  async getEntitlements(
    userId: string,
    scope: EntitlementScopeContext = {},
  ): Promise<EntitlementSnapshot> {
    const userTier = normalizeTier(await getUserPricingTier(userId));
    const { data, error } = await supabaseClient
      .from('user_entitlement_grants')
      .select(
        'id, bond_id, entity_id, entity_type, scope_type, tier, modules, status, starts_at, expires_at',
      )
      .eq('user_id', userId)
      .in('status', ['ACTIVE', 'SUSPENDED']);
    if (error) throw error;

    const grants = (data ?? [])
      .map((row) => mapGrant(row as Record<string, unknown>, scope))
      .filter((grant): grant is EntitlementGrant => grant !== null && grant.status === 'ACTIVE');
    const individualGrant = grants.find((grant) => grant.scope === 'individual');
    const tier = individualGrant?.tier ?? userTier;
    const entitlements = [
      ...(await queryManifest(tier)),
      ...(individualGrant?.modules ?? []),
    ].filter((value, index, values) => values.indexOf(value) === index);
    return {
      pricingTier: tier,
      activeEntitlements: entitlements,
      expirationDate: null,
      grants,
      refreshedAt: new Date().toISOString(),
    };
  }

  async syncPurchases(
    userId: string,
    scope?: EntitlementScopeContext,
  ): Promise<EntitlementSnapshot> {
    return this.getEntitlements(userId, scope);
  }

  subscribeToEntitlementChanges(
    userId: string,
    callback: (snapshot: EntitlementSnapshot) => void,
    scope?: EntitlementScopeContext,
  ): () => void {
    let cancelled = false;
    const poll = async () => {
      while (!cancelled) {
        await new Promise((r) => setTimeout(r, 60000));
        if (!cancelled) {
          try {
            callback(await this.getEntitlements(userId, scope));
          } catch {
            // ignore
          }
        }
      }
    };
    poll();
    return () => {
      cancelled = true;
    };
  }
}
