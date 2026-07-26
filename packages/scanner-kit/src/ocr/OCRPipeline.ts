/**
 * OCRPipeline  registry-based OCR orchestrator
 *
 * Providers are registered by name. When a recognize() call is made,
 * the requested provider is used. If it throws, the pipeline
 * transparently falls back to 'mlkit' (always registered by default).
 *
 * Usage:
 *   // Default pipeline  MLKit only:
 *   const result = await defaultOCRPipeline.recognize(uri);
 *
 *   // Pro pipeline  register cloud providers at runtime:
 *   const proPipeline = new OCRPipeline()
 *     .register(new MLKitProvider())
 *     .register(new GoogleVisionProvider());
 *   const result = await proPipeline.recognize(uri, { provider: 'google_vision' });
 */

import { MLKitProvider } from '@/ocr/providers/MLKitProvider';
import type { OCRProvider, OCRRawResult, OCRRecognizeOptions } from '@/ocr/types';

export class OCRPipeline {
  private registry = new Map<string, OCRProvider>();

  register(provider: OCRProvider): this {
    this.registry.set(provider.name, provider);
    return this;
  }

  async recognize(imageUri: string, options: OCRRecognizeOptions = {}): Promise<OCRRawResult> {
    const { provider: providerName = 'mlkit' } = options;
    const provider = this.registry.get(providerName) ?? this.registry.get('mlkit');

    if (!provider) {
      throw new Error(
        `OCRPipeline: no provider registered for "${providerName}" and no mlkit fallback`,
      );
    }

    try {
      return await provider.recognize(imageUri);
    } catch (err) {
      // Fallback to mlkit unless we already are using it
      if (providerName !== 'mlkit') {
        console.warn(`OCRPipeline: "${providerName}" failed, falling back to mlkit.`, err);
        return this.recognize(imageUri, { provider: 'mlkit' });
      }
      throw err;
    }
  }
}

/**
 * App-wide default pipeline.
 * Cloud providers are intentionally NOT registered here  they are added at
 * runtime for Pro users (e.g. in OCRScanner when user selects a cloud backend).
 */
export const defaultOCRPipeline = new OCRPipeline().register(new MLKitProvider());
