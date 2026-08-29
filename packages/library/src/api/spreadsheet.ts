import * as XLSX from 'xlsx';
import { bytesToBase64 } from '@repo/library/utils/bytes';

export interface SpreadsheetData {
  sheets: SpreadsheetSheet[];
  metadata?: SpreadsheetMetadata;
}

export interface SpreadsheetSheet {
  name: string;
  data: (string | number | boolean | null)[][];
  merges?: { s: { r: number; c: number }; e: { r: number; c: number } }[];
  colWidths?: number[];
  rowHeights?: number[];
  hiddenRows?: number[];
  hiddenCols?: number[];
}

export interface SpreadsheetMetadata {
  title?: string;
  author?: string;
  created?: Date;
  modified?: Date;
  company?: string;
  category?: string;
  keywords?: string[];
  comments?: string;
}

export interface ParseOptions {
  headerRow?: number; // 0-indexed, default 0
  range?: string; // e.g., 'A1:D10'
  dateFormat?: string; // e.g., 'YYYY-MM-DD'
  rawNumbers?: boolean; // true = keep as numbers, false = formatted strings
  cellDates?: boolean; // parse dates as Date objects
  sheetRows?: number; // max rows to parse
  defval?: string | number | boolean; // default value for empty cells
  blankrows?: boolean; // include blank rows
}

export interface WriteOptions {
  bookType?: 'xlsx' | 'xlsm' | 'xlsb' | 'csv' | 'txt' | 'ods' | 'fods' | 'html' | 'json';
  bookSST?: boolean;
  type?: 'base64' | 'binary' | 'buffer' | 'array' | 'file';
  cellDates?: boolean;
  compression?: boolean;
  Props?: SpreadsheetMetadata;
  sheet?: string;
}

export interface GridData {
  headers: string[];
  rows: (string | number | boolean | null)[][];
  meta: {
    sheetName: string;
    rowCount: number;
    colCount: number;
    merges: { s: { r: number; c: number }; e: { r: number; c: number } }[];
  };
}

export interface CellStyle {
  font?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    color?: string; // hex
    size?: number;
    name?: string;
  };
  fill?: {
    patternType?: 'solid' | 'none';
    fgColor?: string; // hex
    bgColor?: string; // hex
  };
  border?: {
    top?: { style: string; color: string };
    bottom?: { style: string; color: string };
    left?: { style: string; color: string };
    right?: { style: string; color: string };
  };
  alignment?: {
    horizontal?: 'left' | 'center' | 'right' | 'justify';
    vertical?: 'top' | 'center' | 'bottom';
    wrapText?: boolean;
    indent?: number;
    textRotation?: number;
  };
  numFmt?: string; // e.g., '0.00', 'mm/dd/yyyy', '@' (text)
  protection?: {
    locked?: boolean;
    hidden?: boolean;
  };
}

export interface ConditionalFormatRule {
  type: 'cellIs' | 'containsText' | 'notContainsText' | 'beginsWith' | 'endsWith' | 'timePeriod' | 'aboveAverage' | 'duplicateValues' | 'uniqueValues' | 'top10' | 'dataBar' | 'colorScale' | 'iconSet';
  range: string; // e.g., 'A1:A10'
  condition?: {
    operator?: 'between' | 'notBetween' | 'equal' | 'notEqual' | 'greaterThan' | 'lessThan' | 'greaterThanOrEqual' | 'lessThanOrEqual';
    value1?: string | number;
    value2?: string | number;
    text?: string;
  };
  format: CellStyle;
  priority: number;
}

/**
 * Spreadsheet API (SheetJS/xlsx)
 * Parse, generate, and manipulate spreadsheets offline-first
 */
export class SpreadsheetAPI {
  /**
   * Parse spreadsheet from bytes (XLSX, XLS, CSV, ODS, etc.)
   */
  static parse(buffer: Uint8Array | ArrayBuffer | string, options: ParseOptions = {}): SpreadsheetData {
    const opts: XLSX.ParsingOptions = {
      cellDates: options.cellDates ?? true,
      cellNF: true,
      cellText: true,
      cellStyles: true,
      sheetRows: options.sheetRows,
      raw: options.rawNumbers ?? false,
      dateNF: options.dateFormat || 'YYYY-MM-DD',
      // defval, blankrows not in xlsx ParsingOptions
    };

    let workbook: XLSX.WorkBook;
    
    if (typeof buffer === 'string') {
      workbook = XLSX.read(buffer, { ...opts, type: 'binary' });
    } else if (buffer instanceof Uint8Array) {
      workbook = XLSX.read(buffer, { ...opts, type: 'array' });
    } else {
      workbook = XLSX.read(buffer, { ...opts, type: 'array' });
    }

    const sheets: SpreadsheetSheet[] = [];
    
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) continue;
      const range = options.range || worksheet['!ref'];
      
      if (!range) {
        sheets.push({ name: sheetName, data: [] });
        continue;
      }

      // Get merges
      const merges = worksheet['!merges']?.map((m: { s: { r: number; c: number }; e: { r: number; c: number } }) => ({
        s: { r: m.s.r, c: m.s.c },
        e: { r: m.e.r, c: m.e.c },
      })) || [];

      // Get column widths
      const colWidths = worksheet['!cols']?.map((c: { wch?: number }) => c.wch || 10) || [];

      // Convert to JSON with header row
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false,
        dateNF: options.dateFormat || 'YYYY-MM-DD',
        defval: options.defval,
        blankrows: options.blankrows ?? false,
        range,
      }) as (string | number | boolean | null)[][];

      // If headerRow specified, use that row as headers
      let data = jsonData;
      if (options.headerRow !== undefined && options.headerRow > 0) {
        // Keep rows before headerRow as data too
        data = jsonData;
      }

      // Get column widths from !cols
      const cols = worksheet['!cols'];
      const colWidthsArr = cols ? cols.map((c: { wch?: number }) => c.wch || 10) : [];

      sheets.push({
        name: sheetName,
        data,
        merges,
        colWidths: colWidthsArr,
        rowHeights: [], // SheetJS doesn't store row heights by default
      });
    }

    // Extract metadata
    const props = workbook.Props;
    const metadata: SpreadsheetMetadata = {
      title: props?.Title,
      author: props?.Author,
      created: props?.CreatedDate ? new Date(props.CreatedDate) : undefined,
      modified: props?.ModifiedDate ? new Date(props.ModifiedDate) : undefined,
      company: props?.Company,
      category: props?.Category,
      keywords: props?.Keywords?.split(',').map((k: string) => k.trim()),
      comments: props?.Comments,
    };

    return { sheets, metadata };
  }

  /**
   * Parse spreadsheet from base64 string
   */
  static parseFromBase64(base64: string, options: ParseOptions = {}): SpreadsheetData {
    const buffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    return this.parse(buffer, options);
  }

  /**
   * Convert worksheet to grid data for UI rendering
   */
  static toGridData(sheet: SpreadsheetSheet): GridData {
    if (sheet.data.length === 0) {
      return { headers: [], rows: [], meta: { sheetName: sheet.name, rowCount: 0, colCount: 0, merges: [] } };
    }

    const headers = sheet.data[0]?.map((cell, i) => 
      cell !== null && cell !== undefined ? String(cell) : `Column ${i + 1}`
    ) || [];

    const rows = sheet.data.slice(1).map(row => 
      row.map(cell => cell === null || cell === undefined ? '' : cell)
    );

    return {
      headers,
      rows,
      meta: {
        sheetName: sheet.name,
        rowCount: sheet.data.length - 1,
        colCount: headers.length,
        merges: sheet.merges || [],
      },
    };
  }

  /**
   * Create new workbook from grid data
   */
  static createFromGrid(sheets: { name: string; headers: string[]; rows: any[][] }[]): XLSX.WorkBook {
    const workbook = XLSX.utils.book_new();

    for (const sheet of sheets) {
      const data = [sheet.headers, ...sheet.rows];
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
    }

    return workbook;
  }

  /**
   * Create workbook from JSON data
   */
  static createFromJSON(data: Record<string, any>[], sheetName = 'Sheet1'): XLSX.WorkBook {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    return workbook;
  }

  /**
   * Create workbook from array of arrays
   */
  static createFromArray(data: any[][], sheetName = 'Sheet1'): XLSX.WorkBook {
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    return workbook;
  }

  /**
   * Write workbook to buffer
   */
  static write(
    workbook: XLSX.WorkBook,
    options: WriteOptions = {}
  ): Uint8Array | string | ArrayBuffer {
    // xlsx bookType doesn't support 'json'; fall back to xlsx
    const bookType = options.bookType === 'json' ? 'xlsx' : (options.bookType || 'xlsx');
    const opts: XLSX.WritingOptions = {
      bookType,
      bookSST: options.bookSST ?? false,
      type: options.type || 'array',
      cellDates: options.cellDates ?? true,
      compression: options.compression ?? true,
      Props: options.Props as any, // xlsx Properties type differs
    };

    const output = XLSX.write(workbook, opts);
    
    if (options.type === 'base64') {
      return output as string;
    } else if (options.type === 'binary') {
      return output as string;
    } else if (options.type === 'buffer') {
      return Buffer.from(output as string, 'binary');
    } else if (options.type === 'file') {
      // Not applicable in this context
      return new Uint8Array();
    }
    
    // Default: return Uint8Array
    const str = output as string;
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Write workbook to base64
   */
  static writeBase64(workbook: XLSX.WorkBook, bookType: WriteOptions['bookType'] = 'xlsx'): string {
    const safeBookType = bookType === 'json' ? 'xlsx' : bookType;
    const output = XLSX.write(workbook, { bookType: safeBookType, type: 'base64' });
    return typeof output === 'string' ? output : bytesToBase64(output);
  }

  /**
   * Write workbook to file (Node/React Native with expo-file-system)
   */
  static async writeToFile(
    workbook: XLSX.WorkBook,
    filePath: string,
    bookType: WriteOptions['bookType'] = 'xlsx'
  ): Promise<void> {
    const bytes = this.write(workbook, { bookType, type: 'array' }) as Uint8Array;
    // This requires expo-file-system or similar
    const { writeAsStringAsync, EncodingType } = await import('expo-file-system');
    await writeAsStringAsync(filePath, bytesToBase64(bytes), {
      encoding: EncodingType.Base64,
    });
  }

  /**
   * Apply styles to a range
   */
  static applyStyle(
    worksheet: XLSX.WorkSheet,
    range: string,
    style: CellStyle
  ): void {
    const rangeObj = XLSX.utils.decode_range(range);
    
    for (let R = rangeObj.s.r; R <= rangeObj.e.r; R++) {
      for (let C = rangeObj.s.c; C <= rangeObj.e.c; C++) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cellRef]) {
          worksheet[cellRef] = { t: 'z', v: '' };
        }
        const cell = worksheet[cellRef];
        
        if (!cell.s) cell.s = {};
        
        const s = cell.s;
        
        if (style.font) {
          s.font = {
            bold: style.font.bold,
            italic: style.font.italic,
            underline: style.font.underline,
            strike: style.font.strike,
            color: style.font.color ? { rgb: style.font.color.replace('#', '') } : undefined,
            sz: style.font.size,
            name: style.font.name,
          };
        }
        
        if (style.fill) {
          s.fill = {
            patternType: style.fill.patternType || 'solid',
            fgColor: style.fill.fgColor ? { rgb: style.fill.fgColor.replace('#', '') } : undefined,
            bgColor: style.fill.bgColor ? { rgb: style.fill.bgColor.replace('#', '') } : undefined,
          };
        }
        
        if (style.border) {
          s.border = {};
          if (style.border.top) s.border.top = { style: style.border.top.style, color: { rgb: style.border.top.color.replace('#', '') } };
          if (style.border.bottom) s.border.bottom = { style: style.border.bottom.style, color: { rgb: style.border.bottom.color.replace('#', '') } };
          if (style.border.left) s.border.left = { style: style.border.left.style, color: { rgb: style.border.left.color.replace('#', '') } };
          if (style.border.right) s.border.right = { style: style.border.right.style, color: { rgb: style.border.right.color.replace('#', '') } };
        }
        
        if (style.alignment) {
          s.alignment = {
            horizontal: style.alignment.horizontal,
            vertical: style.alignment.vertical,
            wrapText: style.alignment.wrapText,
            indent: style.alignment.indent,
            textRotation: style.alignment.textRotation,
          };
        }
        
        if (style.numFmt) {
          s.numFmt = style.numFmt;
        }
        
        if (style.protection) {
          s.protection = {
            locked: style.protection.locked ?? true,
            hidden: style.protection.hidden ?? false,
          };
        }
      }
    }
  }

  /**
   * Add conditional formatting
   */
  static addConditionalFormat(
    worksheet: XLSX.WorkSheet,
    rule: ConditionalFormatRule
  ): void {
    if (!worksheet['!condfmt']) worksheet['!condfmt'] = [];
    worksheet['!condfmt'].push({
      type: rule.type,
      range: rule.range,
      condition: rule.condition,
      format: rule.format,
      priority: rule.priority,
    });
  }

  /**
   * Set column widths
   */
  static setColumnWidths(worksheet: XLSX.WorkSheet, widths: number[]): void {
    worksheet['!cols'] = widths.map(w => ({ wch: w }));
  }

  /**
   * Set row heights
   */
  static setRowHeights(worksheet: XLSX.WorkSheet, heights: number[]): void {
    // SheetJS doesn't directly support row heights in worksheet
    // This would require manual XML manipulation
    const rows = (worksheet['!rows'] = worksheet['!rows'] || []);
    heights.forEach((h, i) => {
      if (h > 0) rows[i] = { hpt: h };
    });
  }

  /**
   * Merge cells
   */
  static mergeCells(worksheet: XLSX.WorkSheet, range: string): void {
    if (!worksheet['!merges']) worksheet['!merges'] = [];
    worksheet['!merges'].push(XLSX.utils.decode_range(range));
  }

  /**
   * Add data validation
   */
  static addDataValidation(
    worksheet: XLSX.WorkSheet,
    range: string,
    validation: {
      type: 'list' | 'whole' | 'decimal' | 'date' | 'time' | 'textLength' | 'custom';
      operator?: 'between' | 'notBetween' | 'equal' | 'notEqual' | 'greaterThan' | 'lessThan' | 'greaterThanOrEqual' | 'lessThanOrEqual';
      formula1?: string;
      formula2?: string;
      allowBlank?: boolean;
      showErrorMessage?: boolean;
      errorTitle?: string;
      error?: string;
      showInputMessage?: boolean;
      promptTitle?: string;
      prompt?: string;
    }
  ): void {
    if (!worksheet['!data_validations']) worksheet['!data_validations'] = [];
    worksheet['!data_validations'].push({
      sqref: range,
      ...validation,
    });
  }

  /**
   * Add filter
   */
  static addAutoFilter(worksheet: XLSX.WorkSheet, range: string): void {
    worksheet['!autofilter'] = { ref: range };
  }

  /**
   * Freeze panes
   */
  static freezePanes(worksheet: XLSX.WorkSheet, range: string): void {
    // e.g., "A2" to freeze first row, "B1" to freeze first column
    worksheet['!freeze'] = range;
  }

  /**
   * Get cell value
   */
  static getCellValue(worksheet: XLSX.WorkSheet, address: string): unknown {
    const cell = worksheet[address];
    if (!cell) return null;
    return cell.v;
  }

  /**
   * Set cell value
   */
  static setCellValue(
    worksheet: XLSX.WorkSheet,
    address: string,
    value: string | number | boolean | Date | null
  ): void {
    if (value === null) {
      worksheet[address] = { t: 'z', v: null };
    } else if (typeof value === 'string') {
      worksheet[address] = { t: 's', v: value };
    } else if (typeof value === 'number') {
      worksheet[address] = { t: 'n', v: value };
    } else if (typeof value === 'boolean') {
      worksheet[address] = { t: 'b', v: value };
    } else {
      worksheet[address] = { t: 'd', v: value };
    }
  }
};

/**
 * High-level convenience functions
 */
export const spreadsheetUtils = {
  /**
   * Parse any spreadsheet file and return grid data for all sheets
   */
  async parseToGrids(fileBytes: Uint8Array, options: ParseOptions = {}): Promise<GridData[]> {
    const data = SpreadsheetAPI.parse(fileBytes, options);
    return data.sheets.map(sheet => SpreadsheetAPI.toGridData(sheet));
  },

  /**
   * Convert CSV string to grid data
   */
  parseCSV(csvString: string, delimiter = ','): GridData {
    const workbook = XLSX.read(csvString, { type: 'string', FS: delimiter });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) throw new Error('No sheets found in CSV');
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) throw new Error('Sheet not found');
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    
    return SpreadsheetAPI.toGridData({
      name: sheetName,
      data: json,
    });
  },

  /**
   * Generate CSV from grid data
   */
  generateCSV(grid: GridData): string {
    const workbook = SpreadsheetAPI.createFromGrid([{
      name: grid.meta.sheetName,
      headers: grid.headers,
      rows: grid.rows,
    }]);
    const output = XLSX.write(workbook, { bookType: 'csv', type: 'binary' });
    return typeof output === 'string' ? output : bytesToBase64(output);
  },

  /**
   * Generate XLSX from grid data
   */
  generateXLSX(grids: GridData[]): Uint8Array {
    const sheets = grids.map(g => ({
      name: g.meta.sheetName,
      headers: g.headers,
      rows: g.rows,
    }));
    const workbook = SpreadsheetAPI.createFromGrid(sheets);
    return SpreadsheetAPI.write(workbook, { bookType: 'xlsx', type: 'array' }) as Uint8Array;
  },

  /**
   * Create template spreadsheet
   */
  createTemplate(type: 'budget' | 'schedule' | 'inventory' | 'contacts'): Uint8Array {
    const templates: Record<string, { headers: string[]; rows: any[][] }> = {
      budget: {
        headers: ['Date', 'Category', 'Description', 'Amount', 'Notes'],
        rows: [
          ['2024-01-01', 'Income', 'Salary', 5000, 'Monthly salary'],
          ['2024-01-02', 'Expense', 'Rent', -1500, 'January rent'],
        ],
      },
      schedule: {
        headers: ['Date', 'Time', 'Event', 'Location', 'Notes'],
        rows: [
          ['2024-01-15', '09:00', 'Team Meeting', 'Conference Room A', 'Weekly sync'],
          ['2024-01-15', '14:00', 'Client Call', 'Zoom', 'Project kickoff'],
        ],
      },
      inventory: {
        headers: ['Item', 'SKU', 'Quantity', 'Unit Price', 'Total Value', 'Location'],
        rows: [
          ['Widget A', 'WGT-001', 100, 10.50, 1050, 'Warehouse A'],
          ['Widget B', 'WGT-002', 50, 25.00, 1250, 'Warehouse B'],
        ],
      },
      contacts: {
        headers: ['Name', 'Email', 'Phone', 'Company', 'Role', 'Notes'],
        rows: [
          ['John Doe', 'john@example.com', '+1-555-0100', 'Acme Corp', 'Manager', 'Key contact'],
          ['Jane Smith', 'jane@example.com', '+1-555-0101', 'Beta Inc', 'Director', 'Decision maker'],
        ],
      },
    };

    const DEFAULT_TEMPLATE = { headers: [] as string[], rows: [] as (string | number | boolean | null)[][] };
    const template = templates[type] ?? templates.budget ?? DEFAULT_TEMPLATE;
    const workbook = SpreadsheetAPI.createFromGrid([{
      name: type.charAt(0).toUpperCase() + type.slice(1),
      headers: template.headers,
      rows: template.rows,
    }]);
    
    return SpreadsheetAPI.write(workbook, { bookType: 'xlsx', type: 'array' }) as Uint8Array;
  },

  /**
   * Convert JSON array to XLSX
   */
  jsonToXLSX(jsonData: Record<string, any>[], sheetName = 'Data'): Uint8Array {
    const workbook = SpreadsheetAPI.createFromJSON(jsonData, sheetName);
    return SpreadsheetAPI.write(workbook, { bookType: 'xlsx', type: 'array' }) as Uint8Array;
  },

  /**
   * Convert XLSX to JSON
   */
  xlsxToJSON(fileBytes: Uint8Array, options: ParseOptions = {}): Record<string, any>[] {
    const data = SpreadsheetAPI.parse(fileBytes, { ...options, headerRow: 0 });
    const sheet = data.sheets[0];
    if (!sheet || sheet.data.length === 0) return [];

    const headerRow = sheet.data[0];
    if (!headerRow) return [];
    const headers: string[] = headerRow.map(cell => (cell === null || cell === undefined ? '' : String(cell)));
    return sheet.data.slice(1).map(row => {
      const obj: Record<string, any> = {};
      headers.forEach((header, i) => {
        obj[header] = row[i] ?? null;
      });
      return obj;
    });
  },

  /**
   * Merge multiple spreadsheets
   */
  mergeSpreadsheets(spreadsheets: Uint8Array[], options: { separateSheets?: boolean } = {}): Uint8Array {
    const mergedWorkbook = XLSX.utils.book_new();
    
    for (let i = 0; i < spreadsheets.length; i++) {
      const data = spreadsheets[i];
      if (!data) continue;
      const wb = XLSX.read(data, { type: 'array' });
      for (const sheetName of wb.SheetNames) {
        const ws = wb.Sheets[sheetName];
        if (!ws) continue;
        const newName = options.separateSheets ? `${sheetName}_${i + 1}` : sheetName;
        XLSX.utils.book_append_sheet(mergedWorkbook, ws, newName);
      }
    }
    
    return SpreadsheetAPI.write(mergedWorkbook, { bookType: 'xlsx', type: 'array' }) as Uint8Array;
  },
};