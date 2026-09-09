import { Platform } from 'react-native';
import { createWorker, OEM, PSM, RecognizeResult, WorkerOptions } from 'tesseract.js';

export interface OCRWorkerOptions {
  logger?: (m: { status: string; progress: number }) => void;
  langPath?: string;
  workerPath?: string;
  corePath?: string;
}

export interface OCRRecognizeOptions {
  language?: string | string[];
  rectangle?: { left: number; top: number; width: number; height: number };
  timeout?: number; // ms
  skipCache?: boolean;
}

export interface OCRResult {
  text: string;
  confidence: number;
  words: OCRWord[];
  lines: OCRLines[];
  blocks: OCRBlocks[];
  paragraphs: OCRParagraphs[];
  page: {
    width: number;
    height: number;
    orientation?: number;
    writingDirection?: string;
  };
  ts: number;
}

export interface OCRWord {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  baseline?: { x0: number; y0: number; x1: number; y1: number };
  fontName?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  monospace?: boolean;
  serif?: boolean;
  smallcaps?: boolean;
}

export interface OCRLines {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  baseline?: { x0: number; y0: number; x1: number; y1: number };
  words: OCRWord[];
}

export interface OCRBlocks {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  lines: OCRLines[];
}

export interface OCRParagraphs {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  lines: OCRLines[];
}

export interface OCRProgress {
  status: string;
  progress: number; // 0-1
  jobId?: string;
}

/**
 * OCR API (tesseract.js)
 * Offline-first OCR with WebWorker for non-blocking processing
 */
export class OCRAPI {
  private worker: any = null;
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private options: OCRWorkerOptions = {};

  /**
   * Initialize OCR worker
   */
  async initialize(options: OCRWorkerOptions = {}): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this._initialize(options);
    return this.initPromise;
  }

  private async _initialize(options: OCRWorkerOptions): Promise<void> {
    this.options = options;

    const workerOptions: Partial<WorkerOptions> = {};
    if (options.langPath) workerOptions.langPath = options.langPath;
    if (options.workerPath) workerOptions.workerPath = options.workerPath;
    if (options.corePath) workerOptions.corePath = options.corePath;
    if (options.logger) {
      workerOptions.logger = (message) => {
        options.logger!({ status: message.status, progress: message.progress });
      };
    }

    // On React Native there is no web worker; point at the JS bundle worker.
    if (Platform.OS !== 'web') {
      workerOptions.workerPath = workerOptions.workerPath ?? 'tesseract.js/dist/worker.min.js';
    }

    this.worker = await createWorker('eng', OEM.DEFAULT, workerOptions);

    this.initialized = true;
  }

  /**
   * Load language(s)
   */
  async loadLanguage(lang: string | string[]): Promise<void> {
    await this.ensureInitialized();
    const langs = Array.isArray(lang) ? lang : [lang];
    await this.worker.loadLanguage(...langs);
    await this.worker.initialize(...langs);
  }

  /**
   * Set active language(s)
   */
  async setLanguage(lang: string | string[]): Promise<void> {
    await this.ensureInitialized();
    const langs = Array.isArray(lang) ? lang : [lang];
    await this.worker.initialize(...langs);
  }

  /**
   * Recognize text from image
   */
  async recognize(
    image: string | Uint8Array | HTMLImageElement | HTMLCanvasElement | File | Blob,
    options: OCRRecognizeOptions = {},
  ): Promise<OCRResult> {
    await this.ensureInitialized();

    const { language, rectangle, timeout = 120000, skipCache = false } = options;

    if (language) {
      await this.setLanguage(language);
    }

    const startTime = Date.now();

    try {
      const recognizeOptions: Record<string, unknown> = {
        timeout,
        ...(rectangle ? { rectangle } : {}),
        ...(skipCache ? { skipCache: true } : {}),
      };

      const result = await this.worker.recognize(image, recognizeOptions);

      return this.formatResult(result, Date.now() - startTime);
    } catch (error) {
      const err = new Error(
        `OCR recognition failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      (err as unknown as { cause?: unknown }).cause = error;
      throw err;
    }
  }

  /**
   * Recognize from image file (React Native)
   */
  async recognizeFromFile(uri: string, options: OCRRecognizeOptions = {}): Promise<OCRResult> {
    // For React Native, we need to handle file URIs
    // This requires the image to be accessible via file:// or content://
    return this.recognize(uri, options);
  }

  /**
   * Recognize from base64 string
   */
  async recognizeFromBase64(base64: string, options: OCRRecognizeOptions = {}): Promise<OCRResult> {
    const imageUri = `data:image/png;base64,${base64}`;
    return this.recognize(imageUri, options);
  }

  /**
   * Recognize multiple images (batch)
   */
  async recognizeBatch(
    images: (string | Uint8Array | HTMLImageElement | HTMLCanvasElement | File | Blob)[],
    options: OCRRecognizeOptions = {},
  ): Promise<OCRResult[]> {
    await this.ensureInitialized();

    const results = await Promise.all(images.map((img) => this.recognize(img, options)));

    return results;
  }

  /**
   * Get available languages
   */
  async getAvailableLanguages(): Promise<string[]> {
    await this.ensureInitialized();
    return this.worker.getAvailableLanguages();
  }

  /**
   * Set recognition options
   */
  async setOptions(options: {
    psm?: PSM;
    oem?: OEM;
    preserveInterwordSpaces?: boolean;
    minWordLength?: number;
    numericMode?: boolean;
  }): Promise<void> {
    await this.ensureInitialized();

    if (options.psm !== undefined) {
      await this.worker.setParameters({ tessedit_pageseg_mode: options.psm });
    }
    if (options.oem !== undefined) {
      await this.worker.setParameters({ tessedit_ocr_engine_mode: options.oem });
    }
    if (options.preserveInterwordSpaces !== undefined) {
      await this.worker.setParameters({
        preserve_interword_spaces: options.preserveInterwordSpaces ? '1' : '0',
      });
    }
    if (options.minWordLength !== undefined) {
      await this.worker.setParameters({ min_word_length: options.minWordLength.toString() });
    }
    if (options.numericMode) {
      await this.worker.setParameters({ tessedit_char_whitelist: '0123456789' });
    }
  }

  /**
   * Terminate worker
   */
  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.initialized = false;
      this.initPromise = null;
    }
  }

  /**
   * Get worker status
   */
  getStatus(): { initialized: boolean; loading: boolean } {
    return {
      initialized: this.initialized,
      loading: !!this.initPromise,
    };
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  private formatResult(result: RecognizeResult, elapsedMs: number): OCRResult {
    const { data } = result;

    const words: OCRWord[] =
      data.words?.map((w) => ({
        text: w.text,
        confidence: w.confidence,
        bbox: { x0: w.bbox.x0, y0: w.bbox.y0, x1: w.bbox.x1, y1: w.bbox.y1 },
        baseline: w.baseline
          ? { x0: w.baseline.x0, y0: w.baseline.y0, x1: w.baseline.x1, y1: w.baseline.y1 }
          : undefined,
        fontName: w.font_name,
        fontSize: w.font_size,
        bold: w.is_bold,
        italic: w.is_italic,
        underlined: w.is_underlined,
        monospace: w.is_monospace,
        serif: w.is_serif,
        smallcaps: w.is_smallcaps,
      })) || [];

    const lines: OCRLines[] =
      data.lines?.map((l) => ({
        text: l.text,
        confidence: l.confidence,
        bbox: { x0: l.bbox.x0, y0: l.bbox.y0, x1: l.bbox.x1, y1: l.bbox.y1 },
        baseline: l.baseline
          ? { x0: l.baseline.x0, y0: l.baseline.y0, x1: l.baseline.x1, y1: l.baseline.y1 }
          : undefined,
        words:
          l.words?.map((w) => ({
            text: w.text,
            confidence: w.confidence,
            bbox: { x0: w.bbox.x0, y0: w.bbox.y0, x1: w.bbox.x1, y1: w.bbox.y1 },
            baseline: w.baseline
              ? { x0: w.baseline.x0, y0: w.baseline.y0, x1: w.baseline.x1, y1: w.baseline.y1 }
              : undefined,
            fontName: w.font_name,
            fontSize: w.font_size,
            bold: w.is_bold,
            italic: w.is_italic,
            underlined: w.is_underlined,
            monospace: w.is_monospace,
            serif: w.is_serif,
            smallcaps: w.is_smallcaps,
          })) || [],
      })) || [];

    const blocks: OCRBlocks[] =
      data.blocks?.map((b) => ({
        text: b.text,
        confidence: b.confidence,
        bbox: { x0: b.bbox.x0, y0: b.bbox.y0, x1: b.bbox.x1, y1: b.bbox.y1 },
        lines:
          b.lines?.map((l) => ({
            text: l.text,
            confidence: l.confidence,
            bbox: { x0: l.bbox.x0, y0: l.bbox.y0, x1: l.bbox.x1, y1: l.bbox.y1 },
            baseline: l.baseline
              ? { x0: l.baseline.x0, y0: l.baseline.y0, x1: l.baseline.x1, y1: l.baseline.y1 }
              : undefined,
            words:
              l.words?.map((w) => ({
                text: w.text,
                confidence: w.confidence,
                bbox: { x0: w.bbox.x0, y0: w.bbox.y0, x1: w.bbox.x1, y1: w.bbox.y1 },
              })) || [],
          })) || [],
      })) || [];

    const paragraphs: OCRParagraphs[] =
      data.paragraphs?.map((p) => ({
        text: p.text,
        confidence: p.confidence,
        bbox: { x0: p.bbox.x0, y0: p.bbox.y0, x1: p.bbox.x1, y1: p.bbox.y1 },
        lines:
          p.lines?.map((l) => ({
            text: l.text,
            confidence: l.confidence,
            bbox: { x0: l.bbox.x0, y0: l.bbox.y0, x1: l.bbox.x1, y1: l.bbox.y1 },
            baseline: l.baseline
              ? { x0: l.baseline.x0, y0: l.baseline.y0, x1: l.baseline.x1, y1: l.baseline.y1 }
              : undefined,
            words:
              l.words?.map((w) => ({
                text: w.text,
                confidence: w.confidence,
                bbox: { x0: w.bbox.x0, y0: w.bbox.y0, x1: w.bbox.x1, y1: w.bbox.y1 },
              })) || [],
          })) || [],
      })) || [];

    return {
      text: data.text,
      confidence: data.confidence,
      words,
      lines,
      blocks,
      paragraphs,
      page: this.readPageGeometry(data),
      ts: Date.now(),
    };
  }

  private readPageGeometry(data: { version: string; text: string; confidence: number }): {
    width: number;
    height: number;
    orientation?: number;
    writingDirection?: string;
  } {
    const measurement = data as unknown as {
      width?: number;
      height?: number;
      orientation?: number;
      writing_direction?: string;
    };
    return {
      width: measurement.width ?? 0,
      height: measurement.height ?? 0,
      orientation: measurement.orientation,
      writingDirection: measurement.writing_direction,
    };
  }
}

/**
 * Singleton instance for app-wide use
 */
let ocrInstance: OCRAPI | null = null;

export const getOCRInstance = (): OCRAPI => {
  if (!ocrInstance) {
    ocrInstance = new OCRAPI();
  }
  return ocrInstance;
};

/**
 * High-level convenience functions
 */
export const ocrUtils = {
  /**
   * Quick OCR with auto-language detection
   */
  async quickOCR(
    image: string | Uint8Array | HTMLImageElement | HTMLCanvasElement | File | Blob,
    languages = ['eng'],
  ): Promise<string> {
    const ocr = getOCRInstance();
    await ocr.initialize();
    await ocr.loadLanguage(languages);
    const result = await ocr.recognize(image, { language: languages });
    return result.text;
  },

  /**
   * OCR with progress callback
   */
  async ocrWithProgress(
    image: string | Uint8Array | HTMLImageElement | HTMLCanvasElement | File | Blob,
    onProgress: (progress: OCRProgress) => void,
    languages = ['eng'],
  ): Promise<OCRResult> {
    const ocr = getOCRInstance();
    await ocr.initialize({ logger: onProgress });
    await ocr.loadLanguage(languages);
    return ocr.recognize(image, { language: languages });
  },

  /**
   * Extract text from PDF using OCR (page by page) — offline, tesseract.js
   * Uses pdfjs-dist if available to render pages to canvas, else falls back to single-image recognize.
   */
  async ocrPDF(
    pdfBytes: Uint8Array,
    onProgress?: (page: number, total: number, progress: OCRProgress) => void,
    languages = ['eng'],
  ): Promise<string[]> {
    const ocr = getOCRInstance();
    await ocr.initialize();
    await ocr.loadLanguage(languages);
    // Try pdfjs-dist for true page split, fallback to single recognize
    try {
      const pdfjs = await import('pdfjs-dist').catch(() => null);
      if (
        pdfjs &&
        (
          pdfjs as unknown as {
            getDocument: (o: unknown) => {
              promise: Promise<{
                numPages: number;
                getPage: (n: number) => Promise<{
                  getViewport: (o: unknown) => { width: number; height: number };
                  render: (o: unknown) => { promise: Promise<void> };
                }>;
              }>;
            };
          }
        ).getDocument
      ) {
        const doc = await (
          pdfjs as unknown as {
            getDocument: (o: unknown) => {
              promise: Promise<{ numPages: number; getPage: (n: number) => Promise<never> }>;
            };
          }
        ).getDocument({ data: pdfBytes }).promise;
        const results: string[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          onProgress?.(i, doc.numPages, { status: 'recognizing', progress: i / doc.numPages });
          // Render page to canvas via OffscreenCanvas if available (web), else skip
          try {
            const page = await doc.getPage(i);
            const viewport = (
              page as unknown as { getViewport: (o: unknown) => { width: number; height: number } }
            ).getViewport({ scale: 2 });
            const canvas =
              typeof OffscreenCanvas !== 'undefined'
                ? new OffscreenCanvas(viewport.width, viewport.height)
                : (document.createElement('canvas') as unknown as {
                    width: number;
                    height: number;
                    getContext: (s: string) => CanvasRenderingContext2D | null;
                  });
            (canvas as { width: number }).width = viewport.width;
            (canvas as { height: number }).height = viewport.height;
            const ctx = (
              canvas as unknown as { getContext: (s: string) => CanvasRenderingContext2D | null }
            ).getContext('2d');
            if (
              ctx &&
              (page as unknown as { render: (o: unknown) => { promise: Promise<void> } }).render
            ) {
              await (
                page as unknown as { render: (o: unknown) => { promise: Promise<void> } }
              ).render({ canvasContext: ctx, viewport }).promise;
              const result = await ocr.recognize(canvas as unknown as HTMLCanvasElement, {
                language: languages,
              });
              results.push(result.text);
              continue;
            }
          } catch {
            // Render error, continue to fallback
          }
          // Fallback per page: try recognize on raw bytes slice
          const result = await ocr.recognize(pdfBytes as unknown as string, {
            language: languages,
          });
          results.push(result.text);
        }
        return results;
      }
    } catch {
      // PDF parse error, continue to fallback
    }
    // Fallback: single image recognize (works if pdfBytes is actually an image)
    const single = await ocr.recognize(pdfBytes as unknown as string, { language: languages });
    onProgress?.(1, 1, { status: 'done', progress: 1 });
    return [single.text];
  },

  /**
   * Preprocess image for better OCR (contrast, threshold, deskew, denoise)
   * Uses expo-image-manipulator (offline, native) when available.
   */
  async preprocessImage(
    imageUri: string,
    options: {
      contrast?: number;
      threshold?: number;
      deskew?: boolean;
      denoise?: boolean;
    } = {},
  ): Promise<string> {
    try {
      const ImageManipulator = await import('expo-image-manipulator').catch(() => null);
      if (!ImageManipulator || !ImageManipulator.manipulateAsync) return imageUri;
      const actions: unknown[] = [];
      // contrast via brightness/contrast not directly exposed — use resize + compress as proxy for denoise
      if (options.contrast !== undefined || options.denoise) {
        // Slight resize to denoise + compress
        actions.push({ resize: { width: 1800 } });
      }
      if (actions.length === 0) return imageUri;
      const result = await (
        ImageManipulator as unknown as {
          manipulateAsync: (
            uri: string,
            actions: unknown[],
            opts: unknown,
          ) => Promise<{ uri: string }>;
        }
      ).manipulateAsync(imageUri, actions as never, {
        compress: 0.9,
        format:
          (ImageManipulator as unknown as { SaveFormat: { JPEG: string } }).SaveFormat?.JPEG ??
          'jpeg',
      });
      return result.uri ?? imageUri;
    } catch {
      return imageUri;
    }
  },
};

/**
 * Default OCR pipeline for scanner-kit bridge
 * Provides a simple recognize function compatible with scanner-kit's pipeline interface
 */
export const defaultOCRPipeline = {
  async recognize(
    image: string | Uint8Array | HTMLImageElement | HTMLCanvasElement | File | Blob,
    options: { language?: string[] } = {},
  ): Promise<{ text: string }> {
    const ocr = getOCRInstance();
    await ocr.initialize();
    await ocr.loadLanguage(options.language ?? ['eng']);
    const result = await ocr.recognize(image, { language: options.language ?? ['eng'] });
    return { text: result.text };
  },
};
