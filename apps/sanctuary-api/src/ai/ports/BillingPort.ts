export interface BillingPort {
  resolveBilling(
    userId: string,
    requestedMode: 'baseline' | 'byok' | 'purchased',
    options?: {
      byokKeyInput?: string;
      schoolId?: string;
    }
  ): Promise<{
    mode: 'baseline' | 'byok' | 'purchased';
    provider: 'openai' | 'gemini' | 'anthropic' | 'deepseek';
    apiKey: string;
    model: string;
  }>;
}
