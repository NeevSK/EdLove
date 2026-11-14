/**
 * OCRPipeline — registry-based OCR and Multimodal Document Orchestrator
 *
 * Providers are registered by name. When recognize() is invoked,
 * the requested provider is called. If it fails or is unconfigured,
 * it falls back cleanly across the registered chain.
 */

import { MLKitProvider } from '@repo/scanner-kit/ocr/providers/MLKitProvider';
import type { OCRProvider, OCRRawResult, OCRRecognizeOptions } from '@repo/scanner-kit/ocr/types';

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
    const { provider: providerName = 'mlkit' } = options;
    const provider =
      this.registry.get(providerName) ??
      this.registry.get('mlkit');

    if (!provider) {
      throw new Error(`OCRPipeline: no provider registered for "${providerName}"`);
    }

    try {
      return await provider.recognize(imageUri, options);
    } catch (err) {
      // Prefer the on-device provider as the offline fallback.
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
 * Registers the on-device MLKit provider for offline recognition.
 */
export const defaultOCRPipeline = new OCRPipeline().register(new MLKitProvider());
