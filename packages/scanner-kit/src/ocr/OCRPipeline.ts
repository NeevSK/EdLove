/**
 * OCRPipeline — registry-based OCR and Multimodal Document Orchestrator
 *
 * Providers are registered by name. When recognize() is invoked,
 * the requested provider is called. If it fails or is unconfigured,
 * it falls back cleanly across the registered chain.
 */

import { MLKitProvider } from '@repo/scanner-kit/ocr/providers/MLKitProvider';
import type { OCRProvider, OCRRawResult, OCRRecognizeOptions } from '@repo/scanner-kit/ocr/types';
import { SanctuaryVisionProvider } from './providers/SanctuaryVisionProvider';

export class OCRPipeline {
  private registry = new Map<string, OCRProvider>();

  register(provider: OCRProvider): this {
    this.registry.set(provider.name, provider);
    return this;
  }

  getProvider(name: string): OCRProvider | undefined {
    return this.registry.get(name);
  }

  async recognize(imageUri: string, options: OCRRecognizeOptions = {}): Promise<OCRRawResult> {
    const { provider: providerName = 'sanctuary_vision' } = options;
    const provider =
      this.registry.get(providerName) ??
      this.registry.get('sanctuary_vision') ??
      this.registry.get('mlkit');

    if (!provider) {
      throw new Error(`OCRPipeline: no provider registered for "${providerName}"`);
    }

    try {
      return await provider.recognize(imageUri, options);
    } catch (err) {
      // If sanctuary_vision fails and mlkit is available, attempt local fallback
      if (providerName !== 'mlkit' && this.registry.has('mlkit')) {
        console.warn(`OCRPipeline: "${providerName}" failed, falling back to mlkit.`, err);
        return this.recognize(imageUri, { ...options, provider: 'mlkit' });
      }
      throw err;
    }
  }
}

/**
 * App-wide default pipeline.
 * Registers the generic Sanctuary Vision Provider by default,
 * with MLKit registered as an offline secondary.
 */
export const defaultOCRPipeline = new OCRPipeline()
  .register(new SanctuaryVisionProvider())
  .register(new MLKitProvider());
