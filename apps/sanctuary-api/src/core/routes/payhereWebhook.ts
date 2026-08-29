import { executeDatabaseCommand, queryDatabaseRows } from '@repo/database/client';
import { Hono } from 'hono';

type Hashers = {
  md5Hex: (value: string) => Promise<string>;
  sha256Hex: (value: string) => Promise<string>;
};

type Environment = (key: string) => string | undefined;

type PaymentOwnerRecord = {
  owner_id: string;
};

type PaymentIntentRecord = {
  amount: number;
  currency: string;
  provider: string;
  status: string;
  metadata: unknown;
};

function matchesMoney(amount: number, callbackAmount: string): boolean {
  const parsed = Number(callbackAmount);
  return Number.isFinite(parsed) && Math.round(amount * 100) === Math.round(parsed * 100);
}

function paymentOwner(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== 'object') return null;
  const ownerId = (metadata as Record<string, unknown>).owner_id;
  return typeof ownerId === 'string' && /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(ownerId)
    ? ownerId
    : null;
}

export function createPayhereWebhookRoutes(hashers: Hashers, getEnv: Environment) {
  const routes = new Hono();

  routes.post('/payments/payhere-webhook', async (c) => {
    const body = await c.req.parseBody();
    const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig } = body;

    if (
      typeof merchant_id !== 'string' ||
      typeof order_id !== 'string' ||
      typeof payhere_amount !== 'string' ||
      typeof payhere_currency !== 'string' ||
      typeof status_code !== 'string' ||
      typeof md5sig !== 'string'
    ) {
      return c.text('Bad Request', 400);
    }

    const merchantSecret = getEnv('PAYHERE_MERCHANT_SECRET');
    const expectedMerchantId = getEnv('PAYHERE_MERCHANT_ID');
    if (!merchantSecret || !expectedMerchantId) {
      console.error('PayHere webhook configuration is incomplete');
      return c.text('Configuration Error', 500);
    }

    if (merchant_id !== expectedMerchantId) return c.text('Unauthorized', 401);

    const secretHash = (await hashers.md5Hex(merchantSecret)).toUpperCase();
    const rawString = `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${secretHash}`;
    const localSignature = (await hashers.md5Hex(rawString)).toUpperCase();

    if (localSignature !== md5sig) {
      console.error('Invalid signature received for order:', order_id);
      return c.text('Unauthorized', 401);
    }

    const eventKey = await hashers.sha256Hex(
      `payhere|${merchant_id}|${order_id}|${payhere_amount}|${payhere_currency}|${status_code}|${md5sig}`,
    );
    const claimed = await queryDatabaseRows<{ event_key: string; processed_at: string | null }>(
      `INSERT INTO payment_webhook_events (event_key, provider, status, attempts, locked_until)
       VALUES ($1, 'payhere', 'processing', 1, now() + interval '5 minutes')
       ON CONFLICT (event_key) DO UPDATE SET
         status = 'processing',
         attempts = payment_webhook_events.attempts + 1,
         locked_until = now() + interval '5 minutes',
         last_error = NULL
       WHERE payment_webhook_events.processed_at IS NULL
         AND (payment_webhook_events.locked_until IS NULL OR payment_webhook_events.locked_until < now())
       RETURNING event_key, processed_at`,
      [eventKey],
    );

    if (claimed.length === 0) {
      const existing = await queryDatabaseRows<{ processed_at: string | null }>(
        `SELECT processed_at FROM payment_webhook_events WHERE event_key = $1`,
        [eventKey],
      );
      if (existing[0]?.processed_at) return c.text('OK', 200);
      return c.text('Webhook already processing', 409);
    }

    try {
      if (status_code === '2') {
        const newlyPaid = await queryDatabaseRows<PaymentOwnerRecord>(
          `UPDATE public.payment_intents
           SET status = 'paid', updated_at = now(),
             metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
               'payhere_merchant_id', $2,
               'payhere_status_code', $3,
               'payhere_paid_amount', $4,
               'payhere_paid_currency', $5
             )
           WHERE id = $1::uuid
             AND provider = 'payhere'
             AND status = 'pending'
             AND upper(currency) = upper($5)
             AND round(amount::numeric, 2) = round($4::numeric, 2)
             AND metadata ? 'owner_id'
             AND metadata->>'owner_id' ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
           RETURNING metadata->>'owner_id' AS owner_id`,
          [order_id, merchant_id, status_code, payhere_amount, payhere_currency],
        );

        const ownerId = newlyPaid[0]?.owner_id;
        if (ownerId) {
          await executeDatabaseCommand(
            `UPDATE public.users SET pricing_tier = 'PRO' WHERE id = $1::uuid`,
            [ownerId],
          );
        } else {
          const intents = await queryDatabaseRows<PaymentIntentRecord>(
            `select amount, currency, provider, status, metadata
             from public.payment_intents where id = $1::uuid`,
            [order_id],
          );
          const intent = intents[0];
          const existingOwnerId = intent ? paymentOwner(intent.metadata) : null;
          if (
            !intent ||
            !existingOwnerId ||
            intent.provider !== 'payhere' ||
            intent.currency.toUpperCase() !== payhere_currency.toUpperCase() ||
            !matchesMoney(intent.amount, payhere_amount) ||
            !['pending', 'paid'].includes(intent.status)
          ) {
            await executeDatabaseCommand(
              `UPDATE payment_webhook_events
             SET status = 'rejected', processed_at = now(), locked_until = NULL,
               last_error = 'payment_intent_verification_failed'
             WHERE event_key = $1`,
              [eventKey],
            );
            return c.text('Unauthorized', 401);
          }
        }
      }

      await executeDatabaseCommand(
        `UPDATE payment_webhook_events
         SET status = 'processed', processed_at = now(), locked_until = NULL
         WHERE event_key = $1`,
        [eventKey],
      );
    } catch (dbError) {
      console.error('Database update failed during webhook handling:', dbError);
      await executeDatabaseCommand(
        `UPDATE payment_webhook_events
         SET status = 'failed', locked_until = NULL, last_error = $2
         WHERE event_key = $1`,
        [eventKey, 'payment_processing_failed'],
      ).catch((releaseError) => console.error('Failed releasing webhook claim:', releaseError));
      return c.text('Database Error', 500);
    }

    return c.text('OK', 200);
  });

  return routes;
}
