/**
 * GoogleVisionProvider  cloud OCR via Google Cloud Vision API
 *
 * Calls the Supabase Edge Function `ocr-proxy` which holds the API key
 * server-side. Never exposes credentials to the app bundle.
 *
 * Pro-gated: the caller is responsible for checking `user.is_pro` before
 * instantiating this provider; the edge function enforces it a second time.
 *
 * Strengths: superior printed text, multi-language detection, high throughput.
 */

import { supabase } from '@repo/core/api';

import type { OCRProvider, OCRRawResult } from '../types';

export class GoogleVisionProvider implements OCRProvider {
  readonly name = 'google_vision' as const;

  async recognize(imageUri: string): Promise<OCRRawResult> {
    // Convert local file URI to base64 for transmission
    const base64 = await uriToBase64(imageUri);

    const { data, error } = await supabase.functions.invoke('ocr-proxy', {
      body: { provider: 'google_vision', imageBase64: base64 },
    });

    if (error) throw new Error(`GoogleVisionProvider: ${error.message}`);
    if (!data) throw new Error('GoogleVisionProvider: empty response from ocr-proxy');

    // ocr-proxy returns pre-normalized OCRRawResult
    return data as OCRRawResult;
  }
}

//  Helpers

async function uriToBase64(uri: string): Promise<string> {
  // Modern expo-file-system API (SDK 54+)
  const { File } = await import('expo-file-system');
  const file = new File(uri);
  return file.base64Sync();
}
