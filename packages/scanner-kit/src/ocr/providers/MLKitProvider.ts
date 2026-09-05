/**
 * MLKitProvider — on-device text recognition stub
 *
 * Free, offline, zero latency fallback.
 * Automatically falls back to Cloud providers when native module is absent.
 */

import type { OCRBlock, OCRProvider, OCRRawResult } from '@repo/scanner-kit/ocr/types';

export class MLKitProvider implements OCRProvider {
  readonly name = 'mlkit' as const;

  async recognize(imageUri: string): Promise<OCRRawResult> {
    let TextRecognition: any = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      TextRecognition = require('@react-native-ml-kit/text-recognition').default ?? require('@react-native-ml-kit/text-recognition');
    } catch {
      TextRecognition = null;
    }

    if (!TextRecognition) {
      throw new Error('On-device MLKit text recognition is not available in this build.');
    }

    const result = await TextRecognition.recognize(imageUri);

    if (!result) {
      return { text: '', blocks: [] };
    }

    const blocks: OCRBlock[] = [];

    // MLKit types: TextBlock \u2192 lines: TextLine[]
    // TextLine has: text, frame (top/left/width/height), recognizedLanguages: Language[]
    // TextLine does NOT expose a confidence field \u2014 omit for type safety.
    for (const block of result.blocks ?? []) {
      // Language hint from the block's recognized languages
      const langCode = block.recognizedLanguages?.[0]?.languageCode;

      for (const line of block.lines ?? []) {
        const frame = line.frame;
        blocks.push({
          text: line.text ?? '',
          // MLKit does not provide per-line confidence scores
          confidence: undefined,
          language: langCode,
          boundingBox: frame
            ? {
                x: frame.left,
                y: frame.top,
                width: frame.width,
                height: frame.height,
              }
            : undefined,
        });
      }
    }

    return {
      text: result.text ?? '',
      blocks,
    };
  }
}
