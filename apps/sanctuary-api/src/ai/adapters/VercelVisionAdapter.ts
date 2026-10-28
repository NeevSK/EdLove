import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogle } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import type { AiProvider } from '../ports/BillingPort';
import type { VisionPort } from '../ports/VisionPort';
import {
  type UniversalDocumentEnvelope,
  UniversalDocumentEnvelopeSchema,
  type VisionExtractionRequest,
} from '../vision/schemas';

export class VercelVisionAdapter implements VisionPort {
  constructor(private providerType: AiProvider) {}

  async extractDocument(
    request: VisionExtractionRequest,
    apiKey: string,
    model: string,
    abortSignal?: AbortSignal,
  ): Promise<UniversalDocumentEnvelope> {
    const modelInstance = this.resolveModel(apiKey, model);

    const systemPrompt = [
      'You are a sovereign document intelligence and transcription system.',
      'Your task is to analyze document photos (printed or handwritten, including Sinhala, Tamil, and English) and extract structured information.',
      request.intentHint
        ? `Context Intent Hint: "${request.intentHint}". Prioritize extracting relevant entities matching this intent if present on the document.`
        : 'Autonomous Mode: Accurately discover and classify what type of document this is.',
      'Always extract text accurately, preserve table structure, identify student names and index numbers when present, and flag smudged or ambiguous handwriting with uncertain: true.',
    ].join(' ');

    const mime = request.mimeType || 'image/jpeg';
    const cleanBase64 = request.imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const dataUrl = `data:${mime};base64,${cleanBase64}`;

    const { object } = await generateObject({
      model: modelInstance,
      schema: UniversalDocumentEnvelopeSchema,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please examine this document image and extract its classification, tables, entities, metadata, and full transcription.',
            },
            {
              type: 'image',
              image: dataUrl,
            },
          ],
        },
      ],
      abortSignal,
    });

    return object;
  }

  private resolveModel(apiKey: string, model: string) {
    switch (this.providerType) {
      case 'gemini': {
        const google = createGoogle({ apiKey });
        return google(model);
      }
      case 'anthropic': {
        const anthropic = createAnthropic({ apiKey });
        return anthropic(model);
      }
      case 'openai':
      default: {
        const openai = createOpenAI({ apiKey });
        return openai(model);
      }
    }
  }
}
