'use client';

import { fileKindOf } from '@repo/core/logic/files/fileKind';
import { useCallback, useState } from 'react';

export type OcrLanguage = 'eng' | 'sin' | 'tam';

export interface DocumentOcrResult {
  readonly text: string;
  readonly method: 'pdf_text' | 'tesseract_ocr' | 'mixed';
  readonly language: OcrLanguage;
  readonly pagesProcessed: number;
}

const OCR_CACHE_KEY = 'gurudevi_ocr_cas_cache_v1';

function readCachedOcr(sha256: string, language: OcrLanguage): DocumentOcrResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(OCR_CACHE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, DocumentOcrResult>;
    return map[`${sha256}:${language}`] ?? null;
  } catch {
    return null;
  }
}

function writeCachedOcr(sha256: string, language: OcrLanguage, result: DocumentOcrResult): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(OCR_CACHE_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, DocumentOcrResult>) : {};
    map[`${sha256}:${language}`] = result;
    window.localStorage.setItem(OCR_CACHE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Browser-native OCR & text-extraction pipeline for Images and PDFs (including scanned PDFs).
 * Results are cached by content-addressed `sha256` + `language` so identical bytes are never OCR'd twice.
 */
export function useDocumentOcr() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<DocumentOcrResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runOcr = useCallback(
    async (input: {
      readonly uri: string;
      readonly name: string;
      readonly mime?: string;
      readonly sha256?: string;
      readonly language?: OcrLanguage;
      readonly maxPdfPages?: number;
    }): Promise<DocumentOcrResult | null> => {
      const language = input.language ?? 'eng';
      if (input.sha256) {
        const cached = readCachedOcr(input.sha256, language);
        if (cached) {
          setResult(cached);
          setProgress(100);
          return cached;
        }
      }

      setRunning(true);
      setProgress(5);
      setError(null);

      try {
        const kind = fileKindOf({ name: input.name, mime: input.mime });

        if (kind === 'image') {
          const { createWorker } = await import('tesseract.js');
          const worker = await createWorker(language, undefined, {
            logger: (m) => {
              if (typeof m.progress === 'number') setProgress(Math.round(m.progress * 100));
            },
          });
          try {
            const { data } = await worker.recognize(input.uri);
            const out: DocumentOcrResult = {
              text: data.text.normalize('NFC').trim(),
              method: 'tesseract_ocr',
              language,
              pagesProcessed: 1,
            };
            if (input.sha256) writeCachedOcr(input.sha256, language, out);
            setResult(out);
            setProgress(100);
            return out;
          } finally {
            await worker.terminate();
          }
        }

        if (kind === 'pdf') {
          const pdfjsLib = await import('pdfjs-dist');
          pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.min.mjs',
            import.meta.url,
          ).toString();
          const cleanUri = input.uri.split('#')[0] ?? input.uri;
          const pdfDoc = await pdfjsLib.getDocument({ url: cleanUri }).promise;
          const total = Math.min(pdfDoc.numPages, input.maxPdfPages ?? 8);
          const pageTexts: string[] = [];
          let usedOcr = false;
          let usedEmbedded = false;

          let worker: Awaited<ReturnType<typeof import('tesseract.js')['createWorker']>> | null =
            null;

          try {
            for (let p = 1; p <= total; p++) {
              const page = await pdfDoc.getPage(p);
              const textContent = await page.getTextContent();
              const embedded = textContent.items
                .map((it) => ('str' in it ? it.str : ''))
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim();

              if (embedded.length >= 12) {
                usedEmbedded = true;
                pageTexts.push(`[Page ${p}]\n${embedded}`);
              } else {
                usedOcr = true;
                if (!worker) {
                  const { createWorker } = await import('tesseract.js');
                  worker = await createWorker(language);
                }
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                canvas.width = Math.floor(viewport.width);
                canvas.height = Math.floor(viewport.height);
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
                  const { data } = await worker.recognize(canvas);
                  pageTexts.push(`[Page ${p} OCR]\n${data.text.trim()}`);
                }
              }
              setProgress(Math.round((p / total) * 100));
            }
          } finally {
            await worker?.terminate();
            await pdfDoc.cleanup?.();
          }

          const out: DocumentOcrResult = {
            text: pageTexts.join('\n\n').normalize('NFC'),
            method: usedOcr && usedEmbedded ? 'mixed' : usedOcr ? 'tesseract_ocr' : 'pdf_text',
            language,
            pagesProcessed: total,
          };
          if (input.sha256) writeCachedOcr(input.sha256, language, out);
          setResult(out);
          return out;
        }

        throw new Error(`OCR is supported for PDF and image files (got "${kind}").`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'OCR extraction failed.');
        return null;
      } finally {
        setRunning(false);
      }
    },
    [],
  );

  return { runOcr, running, progress, result, error };
}
