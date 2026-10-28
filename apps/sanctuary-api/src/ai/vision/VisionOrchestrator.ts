import { VercelVisionAdapter } from '../adapters/VercelVisionAdapter';
import type { AiProvider, BillingPort } from '../ports/BillingPort';
import type { VisionPort } from '../ports/VisionPort';
import type { UniversalDocumentEnvelope, VisionExtractionRequest } from './schemas';

export class VisionOrchestrator {
  constructor(
    private billingPort: BillingPort,
    private getVisionAdapter: (provider: AiProvider) => VisionPort = (p) => new VercelVisionAdapter(p),
  ) {}

  async extractDocument(
    userId: string,
    request: VisionExtractionRequest,
    abortSignal?: AbortSignal,
  ): Promise<UniversalDocumentEnvelope> {
    const configuredDefaultProvider = (process.env.VISION_DEFAULT_PROVIDER as AiProvider) || 'gemini';
    const primaryProvider = request.preferredProvider || configuredDefaultProvider;

    const primaryModel =
      request.preferredModel ||
      this.resolveDefaultModel(primaryProvider);

    // 1. Resolve primary billing and credentials
    const primaryKey = await this.resolveApiKey(userId, primaryProvider);

    const start = Date.now();

    // 2. Attempt primary provider extraction
    try {
      const adapter = this.getVisionAdapter(primaryProvider);
      const result = await adapter.extractDocument(request, primaryKey, primaryModel, abortSignal);

      // Usage logging
      const durationMs = Date.now() - start;
      if (typeof (this.billingPort as any).logUsage === 'function') {
        (this.billingPort as any)
          .logUsage(userId, primaryModel, 1000, durationMs)
          .catch((err: unknown) => console.warn('[VisionOrchestrator] Usage logging non-fatal error:', err));
      }

      return result;
    } catch (err) {
      console.warn(
        `[VisionOrchestrator] Primary provider "${primaryProvider}" failed, evaluating failover chain...`,
        err,
      );

      // 3. Failover chain across alternative providers
      const fallbacks: Array<{ provider: AiProvider; model: string }> = [
        { provider: 'gemini', model: process.env.VISION_GEMINI_MODEL || 'gemini-2.5-flash' },
        { provider: 'openai', model: process.env.VISION_OPENAI_MODEL || 'gpt-4o-mini' },
        { provider: 'anthropic', model: process.env.VISION_ANTHROPIC_MODEL || 'claude-3-5-haiku-20241022' },
      ];

      for (const fallback of fallbacks) {
        if (fallback.provider === primaryProvider) continue;

        try {
          const fallbackKey = await this.resolveApiKey(userId, fallback.provider);
          if (!fallbackKey) continue;

          console.info(`[VisionOrchestrator] Failing over to "${fallback.provider}" (${fallback.model})...`);
          const fallbackAdapter = this.getVisionAdapter(fallback.provider);
          const fallbackResult = await fallbackAdapter.extractDocument(
            request,
            fallbackKey,
            fallback.model,
            abortSignal,
          );

          const durationMs = Date.now() - start;
          if (typeof (this.billingPort as any).logUsage === 'function') {
            (this.billingPort as any)
              .logUsage(userId, fallback.model, 1500, durationMs)
              .catch(() => {});
          }

          return fallbackResult;
        } catch (fallbackErr) {
          console.warn(`[VisionOrchestrator] Fallback to "${fallback.provider}" also failed:`, fallbackErr);
        }
      }

      // If all fallbacks failed, rethrow original error
      throw err;
    }
  }

  private resolveDefaultModel(provider: AiProvider): string {
    switch (provider) {
      case 'gemini':
        return process.env.VISION_GEMINI_MODEL || 'gemini-2.5-flash';
      case 'anthropic':
        return process.env.VISION_ANTHROPIC_MODEL || 'claude-3-5-haiku-20241022';
      case 'openai':
      default:
        return process.env.VISION_OPENAI_MODEL || 'gpt-4o-mini';
    }
  }

  private async resolveApiKey(userId: string, provider: AiProvider): Promise<string> {
    try {
      const billing = await this.billingPort.resolveBilling(userId, 'baseline', {
        preferredProvider: provider,
      });
      if (billing.apiKey) return billing.apiKey;
    } catch {
      // Fall through to environment variables
    }

    switch (provider) {
      case 'gemini':
        return process.env.GEMINI_API_KEY || '';
      case 'anthropic':
        return process.env.ANTHROPIC_API_KEY || '';
      case 'openai':
      default:
        return process.env.OPENAI_API_KEY || '';
    }
  }
}
