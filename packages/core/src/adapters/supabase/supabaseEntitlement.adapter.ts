import { eq } from 'drizzle-orm';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '../../api/supabase';
import { getDrizzleDB } from '../powersync/database';
import { pricingManifest } from '../powersync/schema';
import type { EntitlementSnapshot, IEntitlementPort } from '../../logic/ports/entitlement.port';

async function getUserPricingTier(userId: string): Promise<string> {
  try {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('users')
      .select('pricing_tier')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data?.pricing_tier) {
      return data.pricing_tier;
    }
  } catch {
    // fall through
  }
  return 'FREE';
}

async function queryManifest(tier: string): Promise<string[]> {
  try {
    const db = getDrizzleDB();
    const rows = await db
      .select()
      .from(pricingManifest)
      .where(eq(pricingManifest.tier, tier))
      .limit(1);

    if (rows.length > 0) {
      return JSON.parse(rows[0].features) as string[];
    }
  } catch {
    // DB not ready
  }
  return [];
}

export class SupabaseEntitlementAdapter implements IEntitlementPort {
  async getEntitlements(userId: string): Promise<EntitlementSnapshot> {
    const tier = await getUserPricingTier(userId);
    const entitlements = await queryManifest(tier);
    return {
      pricingTier: tier as 'FREE' | 'PRO' | 'INSTITUTIONAL',
      activeEntitlements: entitlements,
      expirationDate: null,
    };
  }

  async syncPurchases(userId: string): Promise<EntitlementSnapshot> {
    return this.getEntitlements(userId);
  }

  subscribeToEntitlementChanges(
    userId: string,
    callback: (snapshot: EntitlementSnapshot) => void,
  ): () => void {
    let cancelled = false;
    const poll = async () => {
      while (!cancelled) {
        await new Promise((r) => setTimeout(r, 60000));
        if (!cancelled) {
          try {
            callback(await this.getEntitlements(userId));
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