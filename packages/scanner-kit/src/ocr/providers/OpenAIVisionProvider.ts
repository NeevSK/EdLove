/**
 * OpenAIVisionProvider  cloud OCR via GPT-4o Vision
 *
 * Best for: complex handwritten registers, mixed Sinhala/Tamil,
 * ambiguous table layouts, and degraded document quality.
 *
 * Calls the Supabase Edge Function `ocr-proxy` with a structured
 * system prompt that requests JSON block output.
 *
 * Pro-gated: same as GoogleVisionProvider.
 */

import { supabase } from '@repo/core/api';;

import type { OCRProvider, OCRRawResult } from '../types';

export class OpenAIVisionProvider implements OCRProvider {
  readonly name = 'openai_vision' as const;

  async recognize(imageUri: string): Promise<OCRRawResult> {
    const base64 = await uriToBase64(imageUri);

    const { data, error } = await supabase.functions.invoke('ocr-proxy', {
      body: { provider: 'openai_vision', imageBase64: base64 },
    });

    if (error) throw new Error(`OpenAIVisionProvider: ${error.message}`);
    if (!data) throw new Error('OpenAIVisionProvider: empty response from ocr-proxy');

    // ocr-proxy returns pre-normalized OCRRawResult
    return data as OCRRawResult;
  }
}

//  Helpers

async function uriToBase64(uri: string): Promise<string> {
  const { readAsStringAsync, EncodingType } = await import('expo-file-system/legacy');
  return readAsStringAsync(uri, { encoding: EncodingType.Base64 });
}
