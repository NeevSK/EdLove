/**
 * OCR Adapter Types
 *
 * Platform-agnostic interfaces for all OCR providers.
 * Providers (MLKit, Google Vision, OpenAI) implement OCRProvider
 * and return normalized OCRRawResult  the rest of the system
 * never knows which backend produced the output.
 */

//  Core provider interface

export interface OCRProvider {
  readonly name: 'mlkit' | 'google_vision' | 'openai_vision';
  recognize(imageUri: string): Promise<OCRRawResult>;
}

//  Raw output (normalized across all providers)

export interface OCRRawResult {
  /** Full concatenated text of the document */
  text: string;
  /** Structural blocks (paragraphs / lines / words depending on provider) */
  blocks: OCRBlock[];
  /** Overall document confidence, 01. Not all providers supply this. */
  confidence?: number;
}

export interface OCRBlock {
  text: string;
  /** Per-block confidence, 01. Used for uncertainty highlighting in review UI. */
  confidence?: number;
  /** Pixel-space position within the source image */
  boundingBox?: OCRBoundingBox;
  /**
   * BCP-47 language hint if detectable (e.g. 'si', 'ta', 'en').
   * Present on MLKit for multi-script documents.
   */
  language?: string;
}

export interface OCRBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

//  Table structure (from TableParser)

export interface OCRTable {
  rows: OCRTableRow[];
}

export interface OCRTableRow {
  cells: string[];
}

//  Pipeline options

export type OCRProviderName = OCRProvider['name'];

export interface OCRRecognizeOptions {
  /**
   * Preferred provider. Falls back to 'mlkit' on error.
   * @default 'mlkit'
   */
  provider?: OCRProviderName;
}
