/**
 * MLKitProvider — on-device text recognition stub
 *
 * Free, offline, zero latency fallback.
 * Automatically falls back to Cloud providers when native module is absent.
 */

import type { OCRBlock, OCRProvider, OCRRawResult } from '@repo/scanner-kit/ocr/types';

export class MLKitProvider implements OCRProvider {
  readonly name = 'mlkit' as const;

  async recognize(_imageUri: string): Promise<OCRRawResult> {
    throw new Error('On-device MLKit text recognition is not available in this build.');
  }
}
