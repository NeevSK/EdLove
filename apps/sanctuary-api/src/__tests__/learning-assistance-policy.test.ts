import { describe, expect, it, vi } from 'vitest';
import { Orchestrator } from '../ai/domain/Orchestrator';
import type { BillingPort } from '../ai/ports/BillingPort';
import type { LlmPort } from '../ai/ports/LlmPort';

describe('learning assistance policy', () => {
  it.each(['student', 'teacher'])('sends learning and assessment guidance for %s', async (role) => {
    const billing: BillingPort = {
      resolveBilling: vi.fn().mockResolvedValue({
        mode: 'baseline',
        provider: 'openai',
        apiKey: 'test-key',
        model: 'test-model',
      }),
    };
    const streamChat = vi.fn<LlmPort['streamChat']>().mockResolvedValue((async function* () {})());
    const orchestrator = new Orchestrator(billing, () => ({ streamChat }));

    await orchestrator.processChat(
      'user-1',
      'Help me learn',
      [{ role: 'user', content: 'Help me learn' }],
      { role },
    );

    const prompt = streamChat.mock.calls[0]?.[0];
    expect(prompt).toContain('help the learner understand and do the work');
    expect(prompt).toContain('assessment is currently in progress');
    expect(prompt).toContain('do not provide answers, completed solutions, or text to submit');
    expect(prompt).toContain('when context is unclear, ask whether help is permitted');
  });
});
