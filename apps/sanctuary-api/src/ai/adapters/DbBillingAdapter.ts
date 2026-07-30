import { type BillingPort } from '../ports/BillingPort';
import { decryptKey } from '../utils/crypto';

export class DbBillingAdapter implements BillingPort {
  constructor(private db: any) {}

  async resolveBilling(
    userId: string,
    requestedMode: 'baseline' | 'byok' | 'purchased',
    options?: {
      byokKeyInput?: string;
      schoolId?: string;
      preferredProvider?: 'openai' | 'gemini' | 'anthropic' | 'deepseek';
    },
  ): Promise<{
    mode: 'baseline' | 'byok' | 'purchased';
    provider: 'openai' | 'gemini' | 'anthropic' | 'deepseek';
    apiKey: string;
    model: string;
  }> {
    // 1. Resolve BYOK
    if (requestedMode === 'byok' && options?.byokKeyInput) {
      let key = options.byokKeyInput;

      // Decrypt client key if it is AES-256-GCM cipher text (contains iv:cipher:tag format)
      if (key.includes(':')) {
        try {
          key = decryptKey(key);
        } catch (err) {
          console.error('[DbBillingAdapter] Failed to decrypt client BYOK key:', err);
        }
      }

      // Infer provider from key prefix or fallback to preferredProvider
      let provider: 'openai' | 'gemini' | 'anthropic' | 'deepseek' =
        options.preferredProvider || 'openai';
      let model = 'gpt-4o';

      if (key.startsWith('sk-ant-')) {
        provider = 'anthropic';
        model = 'claude-3-5-sonnet-20241022';
      } else if (key.startsWith('AIzaSy')) {
        provider = 'gemini';
        model = 'gemini-1.5-pro';
      } else if (provider === 'deepseek') {
        model = 'deepseek-chat';
      }

      return {
        mode: 'byok',
        provider,
        apiKey: key,
        model,
      };
    }

    // 2. Fetch User Pricing Tier
    let pricingTier = 'FREE';
    let hasScopedAiGrant = false;
    if (this.db) {
      try {
        const userRecord = await this.db.user.findUnique({
          where: { id: userId },
        });
        pricingTier = userRecord?.pricing_tier ?? 'FREE';
        if (options?.schoolId) {
          const schoolBonds = await this.db.bond.findMany({
            where: { user_id: userId, entity_id: options.schoolId, entity_type: 'SCHOOL' },
            select: { id: true },
          });
          const grants = await this.db.userEntitlementGrant.findMany({
            where: {
              user_id: userId,
              status: 'ACTIVE',
              OR: [
                { entity_id: options.schoolId, scope_type: 'ENTITY' },
                {
                  bond_id: { in: schoolBonds.map((bond: { id: string }) => bond.id) },
                  scope_type: 'BOND',
                },
              ],
            },
            select: { modules: true, expires_at: true, starts_at: true },
          });
          hasScopedAiGrant = grants.some(
            (grant: { modules: unknown[]; starts_at: Date; expires_at: Date | null }) => {
              const now = Date.now();
              return (
                grant.starts_at.getTime() <= now &&
                (!grant.expires_at || grant.expires_at.getTime() > now) &&
                Array.isArray(grant.modules) &&
                grant.modules.includes('ai_chat')
              );
            },
          );
        }
      } catch (err) {
        console.warn('[DbBillingAdapter] Failed to fetch user tier:', err);
      }
    }

    // 3. Resolve Institutional BYOK Key
    if (options?.schoolId) {
      let institutionalKey = process.env[`SCHOOL_KEY_${options.schoolId}`];
      if (institutionalKey) {
        if (institutionalKey.includes(':')) {
          try {
            institutionalKey = decryptKey(institutionalKey);
          } catch (err) {
            console.error('[DbBillingAdapter] Failed to decrypt school key:', err);
          }
        }
        return {
          mode: 'purchased',
          provider: 'openai',
          apiKey: institutionalKey,
          model: 'gpt-4o',
        };
      }
    }

    // 4. Resolve Platform keys
    const preferred = options?.preferredProvider || 'openai';
    const isPremium = pricingTier === 'PRO' || pricingTier === 'INSTITUTIONAL' || hasScopedAiGrant;

    if (isPremium) {
      if (preferred === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
        return {
          mode: 'purchased',
          provider: 'anthropic',
          apiKey: process.env.ANTHROPIC_API_KEY,
          model: 'claude-3-5-sonnet-20241022',
        };
      }
      if (preferred === 'gemini' && process.env.GEMINI_API_KEY) {
        return {
          mode: 'purchased',
          provider: 'gemini',
          apiKey: process.env.GEMINI_API_KEY,
          model: 'gemini-1.5-pro',
        };
      }
      if (preferred === 'deepseek' && process.env.DEEPSEEK_API_KEY) {
        return {
          mode: 'purchased',
          provider: 'deepseek',
          apiKey: process.env.DEEPSEEK_API_KEY,
          model: 'deepseek-chat',
        };
      }
      return {
        mode: 'purchased',
        provider: 'openai',
        apiKey: process.env.OPENAI_API_KEY || '',
        model: 'gpt-4o',
      };
    }

    // Default: Baseline model (gpt-4o-mini)
    return {
      mode: 'baseline',
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-4o-mini',
    };
  }

  /**
   * Logs token consumption and latency metrics to SentinelAuditLog.
   */
  async logUsage(
    userId: string,
    model: string,
    tokensUsed: number,
    durationMs: number,
  ): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.sentinelAuditLog.create({
        data: {
          actor_id: userId,
          action: 'ai_chat',
          resource_type: 'ai_model',
          resource_id: model,
          details: {
            tokensUsed,
            durationMs,
            timestamp: new Date().toISOString(),
          },
        },
      });
      console.log(`[DbBillingAdapter] Logged AI usage metrics for user: ${userId}`);
    } catch (err) {
      console.error('[DbBillingAdapter] Failed to log usage metrics:', err);
    }
  }
}
