import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const database = vi.hoisted(() => ({
  queryDatabaseRows: vi.fn(),
  executeDatabaseCommand: vi.fn(),
}));

vi.mock('@repo/database/client', () => ({
  queryDatabaseRows: database.queryDatabaseRows,
  executeDatabaseCommand: database.executeDatabaseCommand,
}));

import { createPayhereWebhookRoutes } from '../core/routes/payhereWebhook';

const ownerId = '11111111-1111-4111-8111-111111111111';
const intentId = '22222222-2222-4222-8222-222222222222';

function app() {
  const api = new Hono();
  api.route(
    '/',
    createPayhereWebhookRoutes(
      { md5Hex: vi.fn(async () => 'signature'), sha256Hex: vi.fn(async () => 'event-key') },
      (key) =>
        ({
          PAYHERE_MERCHANT_SECRET: 'merchant-secret',
          PAYHERE_MERCHANT_ID: 'merchant-id',
        })[key],
    ),
  );
  return api;
}

function callbackBody(orderId = intentId) {
  return new URLSearchParams({
    merchant_id: 'merchant-id',
    order_id: orderId,
    payhere_amount: '2500.00',
    payhere_currency: 'LKR',
    status_code: '2',
    md5sig: 'SIGNATURE',
  });
}

describe('PayHere webhook payment-intent binding', () => {
  beforeEach(() => {
    database.queryDatabaseRows.mockReset();
    database.executeDatabaseCommand.mockReset();
    database.executeDatabaseCommand.mockResolvedValue(undefined);
  });

  it('only entitles the server-recorded payment owner after every immutable field matches', async () => {
    database.queryDatabaseRows
      .mockResolvedValueOnce([{ event_key: 'event-key', processed_at: null }])
      .mockResolvedValueOnce([
        {
          owner_id: ownerId,
        },
      ]);

    const response = await app().request('/payments/payhere-webhook', {
      method: 'POST',
      body: callbackBody(),
    });

    expect(response.status).toBe(200);
    expect(database.executeDatabaseCommand).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE public.users SET pricing_tier'),
      [ownerId],
    );
    expect(database.queryDatabaseRows).toHaveBeenCalledWith(
      expect.stringContaining("status = 'pending'"),
      [intentId, 'merchant-id', '2', '2500.00', 'LKR'],
    );
  });

  it('rejects a signed callback that is not bound to a valid server payment intent', async () => {
    database.queryDatabaseRows
      .mockResolvedValueOnce([{ event_key: 'event-key', processed_at: null }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const response = await app().request('/payments/payhere-webhook', {
      method: 'POST',
      body: callbackBody(),
    });

    expect(response.status).toBe(401);
    expect(database.executeDatabaseCommand).not.toHaveBeenCalledWith(
      expect.stringContaining('UPDATE public.users SET pricing_tier'),
      expect.anything(),
    );
  });
});
