import { describe, expect, it } from 'vitest';
import {
  detectFormat,
  extensionToFormat,
  formatFromDataUri,
  formatToExtension,
  formatToMime,
  isDocumentFormat,
  isImageFormat,
  isSpreadsheetFormat,
  mimeToFormat,
} from './format-detection';

function bytes(head: number[]): Uint8Array {
  return new Uint8Array(head);
}

describe('format-detection', () => {
  it('sniffs PDF magic bytes', () => {
    expect(detectFormat(bytes([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]))).toMatchObject({
      format: 'pdf',
      mimeType: 'application/pdf',
      extension: 'pdf',
    });
  });

  it('sniffs PNG magic bytes', () => {
    const png = detectFormat(bytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    expect(png.format).toBe('png');
    expect(isImageFormat(png.format)).toBe(true);
  });

  it('sniffs OLE2 workbooks as xls family', () => {
    const xls = detectFormat(bytes([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
    expect(xls.format).toBe('xls');
    expect(isSpreadsheetFormat(xls.format)).toBe(true);
  });

  it('uses the extension hint for text formats without magic bytes', () => {
    const csv = detectFormat(bytes(Array.from({ length: 32 }, (_, i) => 0x30 + (i % 10))), {
      filename: 'grades.CSV',
    });
    expect(csv.format).toBe('csv');
  });

  it('lets an explicit mime hint override a weak txt sniff', () => {
    const md = detectFormat(new Uint8Array([0x23, 0x20, 0x48, 0x65, 0x6c, 0x6c, 0x6f]), {
      mimeType: 'text/markdown',
    });
    expect(md.format).toBe('md');
  });

  it('returns unknown for empty input without hints', () => {
    expect(detectFormat(new Uint8Array(0))).toMatchObject({ format: 'unknown', confidence: 0 });
  });

  it('parses data URIs', () => {
    expect(formatFromDataUri('data:application/pdf;base64,JVBERg==')).toMatchObject({
      format: 'pdf',
      mimeType: 'application/pdf',
    });
    expect(formatFromDataUri('not a data uri')).toBeNull();
  });

  it('maps extensions and mimes consistently', () => {
    expect(extensionToFormat('.XLSX')).toBe('xlsx');
    expect(extensionToFormat('markdown')).toBe('md');
    expect(mimeToFormat('TEXT/PLAIN')).toBe('txt');
    expect(formatToMime('docx')).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    expect(formatToExtension('epub')).toBe('epub');
  });

  it('classifies format families', () => {
    expect(isDocumentFormat('pdf')).toBe(true);
    expect(isSpreadsheetFormat('ods')).toBe(true);
    expect(isImageFormat('webp')).toBe(true);
    expect(isSpreadsheetFormat('png')).toBe(false);
  });
});