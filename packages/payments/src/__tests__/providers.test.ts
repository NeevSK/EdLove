import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PayHereProvider } from '../plugins/payhere';
import { StripeProvider } from '../plugins/stripe';

describe('Payment Provider Stubs & Gating (WS-7 / WS-10)', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalDemo = process.env.EDLOVE_DEMO;

  beforeEach(() => {
    process.env.NODE_ENV = 'development';
    delete process.env.EDLOVE_DEMO;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    if (originalDemo !== undefined) {
      process.env.EDLOVE_DEMO = originalDemo;
    } else {
      delete process.env.EDLOVE_DEMO;
    }
  });

  describe('StripeProvider', () => {
    const provider = new StripeProvider();

    it('initializes simulated payment intent in development', async () => {
      const intent = await provider.initializePayment(100, 'USD', { feeType: 'tuition' });
      expect(intent.id).toMatch(/^st_demo_/);
      expect(intent.amount).toBe(100);
      expect(intent.currency).toBe('USD');
      expect(intent.status).toBe('pending');
      expect(intent.provider).toBe('stripe');
      expect(intent.metadata?.feeType).toBe('tuition');
    });

    it('verifies payment status in development', async () => {
      const status = await provider.verifyPayment('st_demo_123');
      expect(status).toBe('succeeded');
    });

    it('throws in production when demo flag is not set', async () => {
      process.env.NODE_ENV = 'production';
      await expect(provider.initializePayment(100, 'USD')).rejects.toThrow(
        /Direct client initialization is prohibited in production/,
      );
      await expect(provider.verifyPayment('st_demo_123')).rejects.toThrow(
        /Payment verification must query the official webhook status/,
      );
    });

    it('allows demo payment in production if explicit demo metadata is provided', async () => {
      process.env.NODE_ENV = 'production';
      const intent = await provider.initializePayment(50, 'USD', { demo: true });
      expect(intent.id).toMatch(/^st_demo_/);
      expect(intent.amount).toBe(50);
    });
  });

  describe('PayHereProvider', () => {
    const provider = new PayHereProvider();

    it('initializes simulated payment intent in development', async () => {
      const intent = await provider.initializePayment(5000, 'LKR', { feeType: 'uniform' });
      expect(intent.id).toMatch(/^ph_demo_/);
      expect(intent.amount).toBe(5000);
      expect(intent.currency).toBe('LKR');
      expect(intent.status).toBe('pending');
      expect(intent.provider).toBe('payhere');
    });

    it('throws in production when demo flag is not set', async () => {
      process.env.NODE_ENV = 'production';
      await expect(provider.initializePayment(5000, 'LKR')).rejects.toThrow(
        /Direct client initialization is prohibited in production/,
      );
      await expect(provider.verifyPayment('ph_demo_123')).rejects.toThrow(
        /Payment verification must query the official webhook status/,
      );
    });

    it('calculates expected fee estimate for Sri Lanka cards', () => {
      expect(provider.getFeeEstimate(1000)).toBe(30);
    });
  });
});
