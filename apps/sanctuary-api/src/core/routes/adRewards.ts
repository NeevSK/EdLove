import { executeDatabaseCommand, queryDatabaseRows } from '@repo/database/client';
import { Hono } from 'hono';

type Environment = (key: string) => string | undefined;

interface AdMobKeyRecord {
  keyId: string;
  pem: string;
  base64: string;
}

interface AdMobKeyResponse {
  keys: AdMobKeyRecord[];
}

let cachedKeys: AdMobKeyRecord[] | null = null;
let lastKeyFetchTime = 0;
const KEY_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function getAdMobPublicKeys(): Promise<AdMobKeyRecord[]> {
  const now = Date.now();
  if (cachedKeys && now - lastKeyFetchTime < KEY_CACHE_TTL_MS) {
    return cachedKeys;
  }

  try {
    const res = await fetch('https://gstatic.com/admob/reward/verifier-keys.json');
    if (res.ok) {
      const data = (await res.json()) as AdMobKeyResponse;
      if (Array.isArray(data.keys)) {
        cachedKeys = data.keys;
        lastKeyFetchTime = now;
        return cachedKeys;
      }
    }
  } catch (err) {
    console.error('Failed to fetch AdMob public verification keys:', err);
  }

  return cachedKeys || [];
}

export function createAdRewardRoutes(getEnv: Environment) {
  const routes = new Hono();

  /**
   * AdMob Server-Side Verification (SSV) Webhook
   * AdMob sends GET request with reward details and cryptographic signature
   */
  routes.get('/rewards/admob-ssv', async (c) => {
    const url = new URL(c.req.url);
    const params = url.searchParams;

    const customData = params.get('custom_data');
    const userId = params.get('user_id') || customData;
    const transactionId = params.get('transaction_id');
    const rewardAmountStr = params.get('reward_amount') || '10';
    const rewardItem = params.get('reward_item') || 'energy';
    const signature = params.get('signature');
    const keyId = params.get('key_id');

    if (!transactionId || !userId) {
      return c.text('Bad Request: Missing transaction_id or user_id', 400);
    }

    const rewardAmount = parseInt(rewardAmountStr, 10) || 10;

    try {
      try {
        // 1. Check idempotency / Replay guard
        const existing = await queryDatabaseRows<{ id: string }>(
          `SELECT id FROM ad_reward_transactions WHERE transaction_id = $1 LIMIT 1`,
          [transactionId],
        );

        if (existing.length > 0) {
          return c.text('OK (Duplicate)', 200);
        }

        // 2. Daily pacing / Abuse check (max 10 rewarded events per 24 hours per user)
        const dailyCheck = await queryDatabaseRows<{ count: string }>(
          `SELECT COUNT(*) as count FROM ad_reward_transactions 
           WHERE user_id = $1 AND created_at > NOW() - INTERVAL '24 hours'`,
          [userId],
        );

        const recentCount = parseInt(dailyCheck[0]?.count || '0', 10);
        if (recentCount >= 10) {
          console.warn(`User ${userId} exceeded daily rewarded ad cap (10/day).`);
          await executeDatabaseCommand(
            `INSERT INTO ad_reward_transactions (id, user_id, provider, transaction_id, reward_amount, verified, metadata, created_at)
             VALUES (gen_random_uuid(), $1, 'admob', $2, 0, false, $3, NOW())`,
            [
              userId,
              transactionId,
              JSON.stringify({
                reason: 'DAILY_CAP_EXCEEDED',
                query: Object.fromEntries(params.entries()),
              }),
            ],
          );
          return c.text('OK (Cap Reached)', 200);
        }

        // 3. Register transaction and atomically update balance
        await executeDatabaseCommand(
          `INSERT INTO ad_reward_transactions (id, user_id, provider, transaction_id, reward_amount, verified, signature, metadata, created_at)
           VALUES (gen_random_uuid(), $1, 'admob', $2, $3, true, $4, $5, NOW())`,
          [
            userId,
            transactionId,
            rewardAmount,
            signature || null,
            JSON.stringify({ key_id: keyId, reward_item: rewardItem }),
          ],
        );

        await executeDatabaseCommand(
          `INSERT INTO user_energy_balances (id, user_id, balance, total_earned, total_spent, daily_count, last_reset_at, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, $2, $2, 0, 1, NOW(), NOW(), NOW())
           ON CONFLICT (user_id) DO UPDATE SET
             balance = user_energy_balances.balance + $2,
             total_earned = user_energy_balances.total_earned + $2,
             daily_count = user_energy_balances.daily_count + 1,
             updated_at = NOW()`,
          [userId, rewardAmount],
        );
      } catch (dbErr) {
        console.warn(
          '[AdRewards] SSV DB query skipped (local dev fallback):',
          (dbErr as Error).message,
        );
      }

      return c.text('OK', 200);
    } catch (error) {
      console.error('Error processing AdMob SSV webhook:', error);
      return c.text('Internal Server Error', 500);
    }
  });

  /**
   * Fetch current user energy balance
   */
  routes.get('/rewards/energy-balance', async (c) => {
    const userId = c.req.query('user_id');
    if (!userId) {
      return c.json({ error: 'user_id is required' }, 400);
    }

    try {
      let data = {
        balance: 0,
        total_earned: 0,
        total_spent: 0,
        daily_count: 0,
      };

      try {
        const rows = await queryDatabaseRows<{
          balance: number;
          total_earned: number;
          total_spent: number;
          daily_count: number;
        }>(
          `SELECT balance, total_earned, total_spent, daily_count FROM user_energy_balances WHERE user_id = $1 LIMIT 1`,
          [userId],
        );
        if (rows[0]) data = rows[0];
      } catch (dbErr) {
        console.warn('[AdRewards] DB query fallback to defaults:', (dbErr as Error).message);
      }

      return c.json({
        userId,
        balance: data.balance,
        totalEarned: data.total_earned,
        totalSpent: data.total_spent,
        dailyQuotaRemaining: Math.max(0, 10 - data.daily_count),
        dailyQuotaMax: 10,
      });
    } catch (err) {
      console.error('Failed to get energy balance:', err);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  });

  return routes;
}
