export type DocumentFormat =
  | 'pdf'
  | 'xlsx'
  | 'xlsm'
  | 'xls'
  | 'xlsb'
  | 'ods'
  | 'csv'
  | 'tsv'
  | 'txt'
  | 'docx'
  | 'doc'
  | 'odt'
  | 'rtf'
  | 'pptx'
  | 'ppt'
  | 'odp'
  | 'epub'
  | 'zip'
  | 'json'
  | 'html'
  | 'xml'
  | 'md'
  | 'png'
  | 'jpg'
  | 'webp'
  | 'heic'
  | 'tiff'
  | 'bmp'
  | 'gif'
  | 'svg'
  | 'unknown';

export interface DetectedFormat {
  format: DocumentFormat;
  confidence: number;
  mimeType: string;
  extension: string;
}

const EXTENSION_TO_FORMAT: Record<string, DocumentFormat> = {
  pdf: 'pdf',
  xlsx: 'xlsx',
  xlsm: 'xlsm',
  xls: 'xls',
  xlsb: 'xlsb',
  ods: 'ods',
  csv: 'csv',
  tsv: 'tsv',
  txt: 'txt',
  log: 'txt',
  text: 'txt',
  docx: 'docx',
  doc: 'doc',
  odt: 'odt',
  rtf: 'rtf',
  pptx: 'pptx',
  ppt: 'ppt',
  odp: 'odp',
  epub: 'epub',
  zip: 'zip',
  json: 'json',
  html: 'html',
  htm: 'html',
  xml: 'xml',
  md: 'md',
  markdown: 'md',
  png: 'png',
  jpg: 'jpg',
  jpeg: 'jpg',
  webp: 'webp',
  heic: 'heic',
  heif: 'heic',
  tiff: 'tiff',
  tif: 'tiff',
  bmp: 'bmp',
  gif: 'gif',
  svg: 'svg',
};

const FORMAT_TO_MIME: Record<DocumentFormat, string> = {
  pdf: 'application/pdf',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xlsm: 'application/vnd.ms-excel.sheet.macroEnabled.12',
  xls: 'application/vnd.ms-excel',
  xlsb: 'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  csv: 'text/csv',
  tsv: 'text/tab-separated-values',
  txt: 'text/plain',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  odt: 'application/vnd.oasis.opendocument.text',
  rtf: 'application/rtf',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ppt: 'application/vnd.ms-powerpoint',
  odp: 'application/vnd.oasis.opendocument.presentation',
  epub: 'application/epub+zip',
  zip: 'application/zip',
  json: 'application/json',
  html: 'text/html',
  xml: 'application/xml',
  md: 'text/markdown',
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  heic: 'image/heic',
  tiff: 'image/tiff',
  bmp: 'image/bmp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  unknown: 'application/octet-stream',
};

const FORMAT_TO_EXTENSION: Record<DocumentFormat, string> = {
  pdf: 'pdf',
  xlsx: 'xlsx',
  xlsm: 'xlsm',
  xls: 'xls',
  xlsb: 'xlsb',
  ods: 'ods',
  csv: 'csv',
  tsv: 'tsv',
  txt: 'txt',
  docx: 'docx',
  doc: 'doc',
  odt: 'odt',
  rtf: 'rtf',
  pptx: 'pptx',
  ppt: 'ppt',
  odp: 'odp',
  epub: 'epub',
  zip: 'zip',
  json: 'json',
  html: 'html',
  xml: 'xml',
  md: 'md',
  png: 'png',
  jpg: 'jpg',
  webp: 'webp',
  heic: 'heic',
  tiff: 'tiff',
  bmp: 'bmp',
  gif: 'gif',
  svg: 'svg',
  unknown: 'bin',
};

const MIME_TO_FORMAT: Record<string, DocumentFormat> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel.sheet.macroEnabled.12': 'xlsm',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.ms-excel.sheet.binary.macroEnabled.12': 'xlsb',
  'application/vnd.oasis.opendocument.spreadsheet': 'ods',
  'text/csv': 'csv',
  'text/tab-separated-values': 'tsv',
  'text/plain': 'txt',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
  'application/vnd.oasis.opendocument.text': 'odt',
  'application/rtf': 'rtf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.oasis.opendocument.presentation': 'odp',
  'application/epub+zip': 'epub',
  'application/zip': 'zip',
  'application/json': 'json',
  'text/html': 'html',
  'application/xml': 'xml',
  'text/xml': 'xml',
  'text/markdown': 'md',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heic',
  'image/tiff': 'tiff',
  'image/bmp': 'bmp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

export function extensionToFormat(extension: string): DocumentFormat {
  const ext = extension.replace(/^\./, '').toLowerCase();
  return EXTENSION_TO_FORMAT[ext] ?? 'unknown';
}

export function mimeToFormat(mimeType: string): DocumentFormat {
  const mime = mimeType.split(';')[0]?.trim().toLowerCase() ?? '';
  return MIME_TO_FORMAT[mime] ?? 'unknown';
}

export function formatToMime(format: DocumentFormat): string {
  return FORMAT_TO_MIME[format];
}

export function formatToExtension(format: DocumentFormat): string {
  return FORMAT_TO_EXTENSION[format];
}

export function formatFromDataUri(uri: string): DetectedFormat | null {
  const match = /^data:([^;,]+);base64,/.exec(uri);
  if (!match) return null;
  const mimeType = match[1];
  if (!mimeType) return null;
  const format = mimeToFormat(mimeType);
  return {
    format,
    confidence: 1,
    mimeType,
    extension: formatToExtension(format),
  };
}

interface SniffRule {
  format: DocumentFormat;
  confidence: number;
  test: (bytes: Uint8Array) => boolean;
}

const SNIFF_RULES: SniffRule[] = [
  {
    format: 'pdf',
    confidence: 1,
    test: b => b.length >= 4 && b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46, // %PDF
  },
  {
    format: 'zip',
    confidence: 0.9,
    test: b => b.length >= 4 && b[0] === 0x50 && b[1] === 0x4b && (b[2] === 0x03 || b[2] === 0x05 || b[2] === 0x07), // PK\x03/\x05/\x07
  },
  {
    format: 'xls',
    confidence: 0.95,
    test: b => b.length >= 8 && b[0] === 0xd0 && b[1] === 0xcf && b[2] === 0x11 && b[3] === 0xe0, // OLE2 (CFB): xls/doc/ppt
  },
  {
    format: 'png',
    confidence: 1,
    test: b => b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47, // \x89PNG
  },
  {
    format: 'jpg',
    confidence: 1,
    test: b =>
      b.length >= 3 &&
      b[0] === 0xff &&
      (b[1] === 0xd8) &&
      b[2] === 0xff, // \xFF\xD8\xFF
  },
  {
    format: 'gif',
    confidence: 1,
    test: b => b.length >= 6 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38, // GIF8
  },
  {
    format: 'webp',
    confidence: 1,
    test: b =>
      b.length >= 12 &&
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 && // RIFF
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50, // WEBP
  },
  {
    format: 'tiff',
    confidence: 1,
    test: b =>
      b.length >= 4 &&
      ((b[0] === 0x49 && b[1] === 0x49 && b[2] === 0x2a && b[3] === 0x00) ||
        (b[0] === 0x4d && b[1] === 0x4d && b[2] === 0x00 && b[3] === 0x2a)),
  },
  {
    format: 'bmp',
    confidence: 1,
    test: b => b.length >= 2 && b[0] === 0x42 && b[1] === 0x4d, // BM
  },
  {
    format: 'html',
    confidence: 0.7,
    test: b => {
      const head = decodePrefix(b, 512).trimStart().toLowerCase();
      return head.startsWith('<!doctype html') || head.startsWith('<html');
    },
  },
  {
    format: 'txt',
    confidence: 0.5,
    test: b => {
      const sample = decodePrefix(b, 4096);
      return isProbablyText(sample, 4096);
    },
  },
];

function decodePrefix(bytes: Uint8Array, length: number): string {
  const slice = bytes.slice(0, Math.min(length, bytes.length));
  // Prefer utf-8; fall back to latin-1 so any byte sequence decodes
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(slice);
  } catch {
    return String.fromCharCode(...slice);
  }
}

function isProbablyText(sample: string, sampleLength: number): boolean {
  if (sample.length === 0) return false;
  let printable = 0;
  for (let i = 0; i < sample.length; i++) {
    const code = sample.charCodeAt(i);
    if ((code >= 0x20 && code <= 0x7e) || code === 0x09 || code === 0x0a || code === 0x0d || code > 0x7f) {
      printable++;
    }
  }
  return printable / sample.length > 0.9;
}

function sniffFormat(bytes: Uint8Array): { format: DocumentFormat; confidence: number } {
  for (const rule of SNIFF_RULES) {
    if (rule.test(bytes)) {
      return { format: rule.format, confidence: rule.confidence };
    }
  }
  return { format: 'unknown', confidence: 0 };
}

export function detectFormat(
  input: Uint8Array,
  hint: { filename?: string; mimeType?: string } = {}
): DetectedFormat {
  const extension = hint.filename?.split('.').pop() ?? '';
  const extFormat = extension ? extensionToFormat(extension) : 'unknown';
  const mimeFormat = hint.mimeType ? mimeToFormat(hint.mimeType) : 'unknown';

  let best = sniffFormat(input);

  // Extension is a strong signal for text-like formats with only generic text magic,
  // and the only signal for formats with no magic bytes at all.
  if (extFormat !== 'unknown' && best.confidence < 0.7) {
    best = { format: extFormat, confidence: 0.9 };
  }
  // Mime overrides a weak magic-byte guess (e.g. generic text sniff)
  if (mimeFormat !== 'unknown' && best.confidence < 0.9) {
    best = { format: mimeFormat, confidence: 0.95 };
  }

  const mimeType = formatToMime(best.format);
  const detectedExtension = formatToExtension(best.format);

  return {
    format: best.format,
    confidence: best.confidence,
    mimeType,
    extension: detectedExtension,
  };
}

export function isImageFormat(format: DocumentFormat): boolean {
  return ['png', 'jpg', 'webp', 'heic', 'tiff', 'bmp', 'gif', 'svg'].includes(format);
}

export function isSpreadsheetFormat(format: DocumentFormat): boolean {
  return ['xlsx', 'xlsm', 'xls', 'xlsb', 'ods', 'csv', 'tsv'].includes(format);
}

export function isDocumentFormat(format: DocumentFormat): boolean {
  return ['docx', 'doc', 'odt', 'rtf', 'pdf', 'txt', 'md'].includes(format);
}

export function isPresentationFormat(format: DocumentFormat): boolean {
  return ['pptx', 'ppt', 'odp'].includes(format);
}