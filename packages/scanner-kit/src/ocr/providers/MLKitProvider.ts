/**
 * MLKitProvider \u2014 on-device text recognition via @react-native-ml-kit/text-recognition
 *
 * Free, offline, zero latency.
 * Default provider for all users regardless of Pro status.
 * Supports Sinhala, Tamil, English (Latin + Devanagari scripts recognized by MLKit).
 */

import TextRecognition from '@react-native-ml-kit/text-recognition';
import type { OCRBlock, OCRProvider, OCRRawResult } from '@repo/scanner-kit/ocr/types';

export class MLKitProvider implements OCRProvider {
  readonly name = 'mlkit' as const;

  async recognize(imageUri: string): Promise<OCRRawResult> {
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
