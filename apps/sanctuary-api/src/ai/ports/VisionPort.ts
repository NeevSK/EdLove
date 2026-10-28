import type { UniversalDocumentEnvelope, VisionExtractionRequest } from '../vision/schemas';

export interface VisionPort {
  extractDocument(
    request: VisionExtractionRequest,
    apiKey: string,
    model: string,
    abortSignal?: AbortSignal,
  ): Promise<UniversalDocumentEnvelope>;
}
