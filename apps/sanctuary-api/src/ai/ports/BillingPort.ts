export type AiProvider = 'openai' | 'gemini' | 'anthropic' | 'deepseek' | 'openrouter';

export interface BillingPort {
  resolveBilling(
    userId: string,
    requestedMode: 'baseline' | 'byok' | 'purchased',
    options?: {
      byokKeyInput?: string;
      schoolId?: string;
      preferredProvider?: AiProvider;
    },
  ): Promise<{
    mode: 'baseline' | 'byok' | 'purchased';
    provider: AiProvider;
    apiKey: string;
    model: string;
  }>;
}
