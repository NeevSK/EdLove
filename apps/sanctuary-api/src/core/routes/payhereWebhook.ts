import { createZenStackDb, executeDatabaseCommand, queryDatabaseRows } from '@repo/database/client';
import { Hono } from 'hono';

type Hashers = {
  md5Hex: (value: string) => Promise<string>;
  sha256Hex: (value: string) => Promise<string>;
};

type Environment = (key: string) => string | undefined;

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
    if (!merchantSecret) {
      console.error('PAYHERE_MERCHANT_SECRET is not set in environment variables');
      return c.text('Configuration Error', 500);
    }

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
        const systemDb = createZenStackDb({ id: 'system-payment-service' });
        const user = await systemDb.user.findUnique({ where: { id: order_id } });

        if (user) {
          await systemDb.user.update({ where: { id: order_id }, data: { pricing_tier: 'PRO' } });
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
