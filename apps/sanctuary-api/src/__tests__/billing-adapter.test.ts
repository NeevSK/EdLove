import { describe, expect, it, afterEach, beforeEach } from 'vitest';
import { DbBillingAdapter } from '../ai/adapters/DbBillingAdapter';

describe('DbBillingAdapter Resolution Matrix', () => {
  const originalEnv = { ...process.env };
  const mockDb = {
    user: { findUnique: async () => ({ pricing_tier: 'FREE' }) },
  };

  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.DEEPSEEK_API_KEY;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('selects Gemini 2.5 Flash as default platform baseline when GEMINI_API_KEY is configured', async () => {
    process.env.GEMINI_API_KEY = 'test-gemini-key-123';
    const adapter = new DbBillingAdapter(mockDb);

    const billing = await adapter.resolveBilling('usr-1', 'baseline');
    expect(billing.provider).toBe('gemini');
    expect(billing.model).toBe('gemini-2.5-flash');
    expect(billing.apiKey).toBe('test-gemini-key-123');
  });

  it('honors preferredProvider in baseline when key is available', async () => {
    process.env.GEMINI_API_KEY = 'test-gemini-key';
    process.env.OPENAI_API_KEY = 'test-openai-key';
    const adapter = new DbBillingAdapter(mockDb);

    const billing = await adapter.resolveBilling('usr-1', 'baseline', {
      preferredProvider: 'openai',
    });
    expect(billing.provider).toBe('openai');
    expect(billing.model).toBe('gpt-4o-mini');
  });

  it('resolves Google AI Studio BYOK key (AIzaSy prefix) to Gemini 2.5 Flash', async () => {
    const adapter = new DbBillingAdapter(mockDb);

    const billing = await adapter.resolveBilling('usr-1', 'byok', {
      byokKeyInput: 'AIzaSyDemoKeyForTesting1234567890',
    });
    expect(billing.mode).toBe('byok');
    expect(billing.provider).toBe('gemini');
    expect(billing.model).toBe('gemini-2.5-flash');
  });

  it('falls back to OpenRouter baseline when OpenAI and Gemini are absent', async () => {
    process.env.OPENROUTER_API_KEY = 'sk-or-v1-test';
    const adapter = new DbBillingAdapter(mockDb);

    const billing = await adapter.resolveBilling('usr-1', 'baseline');
    expect(billing.provider).toBe('openrouter');
  });
});
