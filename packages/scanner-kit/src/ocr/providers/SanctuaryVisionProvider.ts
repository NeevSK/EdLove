import { invokeEdgeFunction } from '@repo/core/api/functions';
import type { OCRProvider, OCRRawResult, OCRRecognizeOptions } from '@repo/scanner-kit/ocr/types';
import { preFlightImage } from '../../utils/imagePreFlight';

export interface UniversalDocumentPayload {
  classification: {
    detectedType: string;
    confidence: number;
    documentTitle?: string;
    detectedLanguage?: string;
    summary: string;
  };
  entities: {
    students?: Array<{
      name: string;
      index_number: string;
      notes?: string;
      confidence: number;
      uncertain: boolean;
    }>;
    lesson_flow?: Array<{
      phase: string;
      duration_minutes?: number;
      teacher_activity: string;
      student_activity: string;
    }>;
    custom_records?: Array<Record<string, any>>;
  };
  tables?: Array<{
    name?: string;
    headers: string[];
    rows: Array<Record<string, any>>;
  }>;
  metadata?: Record<string, string>;
  rawTranscription: string;
  suggestedActions: string[];
}

export class SanctuaryVisionProvider implements OCRProvider {
  readonly name = 'sanctuary_vision' as const;

  async recognize(imageUri: string, options: OCRRecognizeOptions = {}): Promise<OCRRawResult> {
    // 1. Client-side pre-flight downsampling and base64 extraction
    const { base64 } = await preFlightImage(imageUri);

    if (!base64) {
      throw new Error('SanctuaryVisionProvider: failed to acquire base64 image data');
    }

    // 2. Dispatch to the generic multimodal vision gateway
    const { data, error } = await invokeEdgeFunction<{
      success: boolean;
      data: UniversalDocumentPayload;
    }>('ai/vision/extract', {
      body: {
        imageBase64: base64,
        mimeType: 'image/jpeg',
        intentHint: options.intentHint,
      },
    });

    if (error) {
      // Fallback: try legacy ocr-proxy if gateway route is proxy-mapped
      const fallback = await invokeEdgeFunction<OCRRawResult>('ocr-proxy', {
        body: {
          provider: 'openai_vision',
          imageBase64: base64,
          intentHint: options.intentHint,
        },
      });
      if (fallback.data) return fallback.data;
      throw new Error(`SanctuaryVisionProvider: ${error.message}`);
    }

    if (!data?.data) {
      throw new Error('SanctuaryVisionProvider: received empty envelope from vision gateway');
    }

    const envelope = data.data;

    // 3. Normalize into OCRRawResult while preserving structured domain entities
    return {
      text: envelope.rawTranscription || '',
      blocks: (envelope.tables?.[0]?.rows || []).map((row) => ({
        text: Object.values(row).join(' '),
        confidence: envelope.classification.confidence,
      })),
      confidence: envelope.classification.confidence,
      students: envelope.entities.students,
      envelope,
    };
  }
}
