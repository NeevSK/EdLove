import { v7 as uuidv7 } from 'uuid';
import { spreadsheetUtils, type GridData } from '@repo/library/api/spreadsheet';
import { ImageToPDFAPI, type ImageSource } from '@repo/library/api/image-to-pdf';
import { ocrUtils } from '@repo/library/api/ocr';
import {
  detectFormat,
  isSpreadsheetFormat,
  isImageFormat,
  type DocumentFormat,
} from '@repo/library/utils/format-detection';
import { bytesToDataUri } from '@repo/library/utils/bytes';

export type ConversionTarget = DocumentFormat | 'txt';

export interface ConversionOptions {
  targetFormat: ConversionTarget;
  filename?: string;
  mimeType?: string;
  pdf?: {
    pageSize?: [number, number];
    fitMode?: 'contain' | 'cover' | 'fill';
  };
  spreadsheet?: {
    sheetName?: string;
  };
}

export interface ConversionResult {
  success: boolean;
  id: string;
  sourceFormat: DocumentFormat;
  targetFormat: ConversionTarget;
  output: Uint8Array;
  asText?: string;
  metadata: {
    sourceSize: number;
    outputSize: number;
    processingTimeMs: number;
    pageCount?: number;
  };
  requiresCloud: boolean;
  error?: string;
}

export interface BatchConversionItem {
  id: string;
  input: Uint8Array;
  targetFormat: ConversionTarget;
  filename?: string;
}

export interface BatchConversionResult {
  results: ConversionResult[];
  successful: number;
  failed: number;
  totalTimeMs: number;
}

const OFFICE_FORMATS: DocumentFormat[] = ['docx', 'doc', 'odt', 'rtf', 'pptx', 'ppt', 'odp'];

/**
 * Format conversion orchestration.
 * Local-first routing: spreadsheets and images convert fully offline;
 * office documents and PDF→text require a cloud / reader pipeline fallback.
 */
export class ConversionAPI {
  static async convert(
    input: Uint8Array,
    options: ConversionOptions
  ): Promise<ConversionResult> {
    const startTime = Date.now();
    const detected = detectFormat(input, { filename: options.filename, mimeType: options.mimeType });
    const sourceFormat = detected.format;
    const targetFormat = options.targetFormat;

    const result: ConversionResult = {
      success: false,
      id: uuidv7(),
      sourceFormat,
      targetFormat,
      output: new Uint8Array(),
      metadata: { sourceSize: input.length, outputSize: 0, processingTimeMs: 0 },
      requiresCloud: false,
    };

    if (this.requiresCloud(sourceFormat, targetFormat)) {
      result.requiresCloud = true;
      result.error = `'${sourceFormat}' → '${targetFormat}' requires cloud fallback (Google Docs / Microsoft Graph / OnlyOffice)`;
      return result;
    }

    try {
      if (sourceFormat === 'unknown' || sourceFormat === 'zip') {
        throw new Error(`Cannot convert unrecognized format '${sourceFormat}'`);
      }

      if (isSpreadsheetFormat(sourceFormat)) {
        result.output = this.convertSpreadsheet(input, sourceFormat, targetFormat, options.spreadsheet?.sheetName);
      } else if (isImageFormat(sourceFormat) && targetFormat === 'pdf') {
        const pdfResult = await this.convertImageToPDF(input, detected.mimeType, options);
        result.output = pdfResult.output;
        result.metadata.pageCount = pdfResult.pageCount;
      } else if (isImageFormat(sourceFormat) && (targetFormat === 'txt' || targetFormat === 'md' || targetFormat === 'json')) {
        const text = await ocrUtils.quickOCR(bytesToDataUri(input, detected.mimeType), ['eng']);
        result.output = new TextEncoder().encode(text);
        result.asText = text;
      } else if (sourceFormat === targetFormat) {
        result.output = input;
      } else {
        throw new Error(`Conversion from '${sourceFormat}' to '${targetFormat}' is not supported offline`);
      }

      result.success = true;
      result.metadata.outputSize = result.output.length;
      result.metadata.processingTimeMs = Date.now() - startTime;
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown conversion error';
      result.error = message;
      return result;
    }
  }

  private static convertSpreadsheet(
    input: Uint8Array,
    sourceFormat: DocumentFormat,
    targetFormat: ConversionTarget,
    sheetName?: string
  ): Uint8Array {
    const name = sheetName ?? 'Sheet1';
    const json = spreadsheetUtils.xlsxToJSON(input);

    switch (targetFormat) {
      case 'json':
        return new TextEncoder().encode(JSON.stringify(json, null, 2));
      case 'csv':
      case 'tsv': {
        const grid = this.jsonToGrid(json, name);
        const csv = spreadsheetUtils.generateCSV(grid);
        return new TextEncoder().encode(targetFormat === 'tsv' ? csv.replace(/,/g, '\t') : csv);
      }
      case 'html':
        return new TextEncoder().encode(this.jsonToHtml(json));
      case 'xlsx':
        return spreadsheetUtils.jsonToXLSX(json, name);
      case 'txt': {
        const grid = this.jsonToGrid(json, name);
        return new TextEncoder().encode(this.gridToText(grid));
      }
      default:
        throw new Error(`Spreadsheet → '${targetFormat}' is not supported offline`);
    }
  }

  private static async convertImageToPDF(
    input: Uint8Array,
    mimeType: string,
    options: ConversionOptions
  ): Promise<{ output: Uint8Array; pageCount: number }> {
    const source: ImageSource = {
      uri: bytesToDataUri(input, mimeType),
      mimeType,
    };
    const result = await ImageToPDFAPI.convertImagesToPDF([source], {
      pageSize: options.pdf?.pageSize,
      fitMode: options.pdf?.fitMode,
    });
    return { output: result.pdfBytes, pageCount: result.pageCount };
  }

  private static jsonToGrid(json: Record<string, unknown>[], sheetName: string): GridData {
    const first = json[0];
    const headers = first ? Object.keys(first) : [];
    const rows = json.map(row => headers.map(h => {
      const value = row[h];
      if (value === null || value === undefined) return null;
      return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
        ? value
        : String(value);
    }));
    return {
      headers,
      rows,
      meta: { sheetName, rowCount: rows.length, colCount: headers.length, merges: [] },
    };
  }

  private static jsonToHtml(json: Record<string, unknown>[]): string {
    const first = json[0];
    if (!first) return '<table></table>';
    const headers = Object.keys(first);
    const headerCells = headers.map(h => `<th>${h}</th>`).join('');
    const bodyRows = json
      .map(row => `<tr>${headers.map(h => `<td>${String(row[h] ?? '')}</td>`).join('')}</tr>`)
      .join('');
    return `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
  }

  private static gridToText(grid: GridData): string {
    const lines = [grid.headers.join('\t')];
    for (const row of grid.rows) {
      lines.push(row.map(v => (v === null ? '' : String(v))).join('\t'));
    }
    return lines.join('\n');
  }

  static async batchConvert(items: BatchConversionItem[]): Promise<BatchConversionResult> {
    const startTime = Date.now();
    let successful = 0;
    let failed = 0;
    const results: ConversionResult[] = [];

    for (const item of items) {
      const result = await this.convert(item.input, { targetFormat: item.targetFormat, filename: item.filename });
      if (result.success) successful++;
      else failed++;
      results.push(result);
    }

    return { results, successful, failed, totalTimeMs: Date.now() - startTime };
  }

  static supportedOfflineTargets(sourceFormat: DocumentFormat): ConversionTarget[] {
    if (isSpreadsheetFormat(sourceFormat)) {
      return ['xlsx', 'csv', 'tsv', 'json', 'html', 'txt'];
    }
    if (isImageFormat(sourceFormat)) {
      return ['pdf', 'txt', 'json'];
    }
    if (sourceFormat === 'pdf') {
      return ['pdf'];
    }
    return [];
  }

  static requiresCloud(sourceFormat: DocumentFormat, targetFormat: ConversionTarget): boolean {
    const needsCloudTarget = targetFormat === 'pdf';
    return (OFFICE_FORMATS.includes(sourceFormat) || isSpreadsheetFormat(sourceFormat)) && needsCloudTarget
      ? true
      : sourceFormat === 'pdf' && targetFormat === 'txt';
  }
}

export const conversionUtils = {
  async toPDF(input: Uint8Array, filename?: string): Promise<Uint8Array> {
    const result = await ConversionAPI.convert(input, { targetFormat: 'pdf', filename });
    if (!result.success || result.requiresCloud) {
      throw new Error(result.error ?? 'Conversion to PDF failed');
    }
    return result.output;
  },

  async extractText(input: Uint8Array, filename?: string): Promise<string> {
    const result = await ConversionAPI.convert(input, { targetFormat: 'txt', filename });
    if (!result.success || result.requiresCloud) {
      throw new Error(result.error ?? 'Text extraction failed');
    }
    return result.asText ?? new TextDecoder().decode(result.output);
  },

  async spreadsheetToJSON(input: Uint8Array): Promise<Record<string, unknown>[]> {
    const result = await ConversionAPI.convert(input, { targetFormat: 'json' });
    if (!result.success) {
      throw new Error(result.error ?? 'Spreadsheet → JSON failed');
    }
    return JSON.parse(new TextDecoder().decode(result.output)) as Record<string, unknown>[];
  },

  async csvToXLSX(csvString: string, sheetName?: string): Promise<Uint8Array> {
    const input = new TextEncoder().encode(csvString);
    const result = await ConversionAPI.convert(input, { targetFormat: 'xlsx', mimeType: 'text/csv', spreadsheet: { sheetName } });
    if (!result.success) {
      throw new Error(result.error ?? 'CSV → XLSX failed');
    }
    return result.output;
  },
};