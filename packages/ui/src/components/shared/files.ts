/**
 * What kind of file something is, from its type or name, so every surface
 * (a chat attachment, a file field, a library shelf) treats it the same way.
 * Platform-neutral: no rendering here.
 */

import type { FileCardLabels, FileKind, FileRef } from '../../theme/contracts';

export type { FileKind, FileRef };

const BY_EXTENSION: Record<string, FileKind> = {
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  gif: 'image',
  webp: 'image',
  heic: 'image',
  avif: 'image',
  svg: 'image',
  mp3: 'audio',
  m4a: 'audio',
  aac: 'audio',
  wav: 'audio',
  ogg: 'audio',
  opus: 'audio',
  webm: 'video',
  mp4: 'video',
  mov: 'video',
  m4v: 'video',
  mkv: 'video',
  pdf: 'pdf',
  doc: 'document',
  docx: 'document',
  odt: 'document',
  rtf: 'document',
  pages: 'document',
  xls: 'sheet',
  xlsx: 'sheet',
  ods: 'sheet',
  csv: 'sheet',
  numbers: 'sheet',
  ppt: 'slides',
  pptx: 'slides',
  odp: 'slides',
  key: 'slides',
  md: 'markdown',
  markdown: 'markdown',
  mdx: 'markdown',
  txt: 'text',
  json: 'text',
  html: 'text',
  htm: 'text',
  zip: 'archive',
  rar: 'archive',
  '7z': 'archive',
  tar: 'archive',
  gz: 'archive',
};

const BY_MIME: [RegExp, FileKind][] = [
  [/^image\//, 'image'],
  [/^audio\//, 'audio'],
  [/^video\//, 'video'],
  [/^application\/pdf$/, 'pdf'],
  [/wordprocessingml|msword|opendocument\.text|rtf/, 'document'],
  [/spreadsheetml|ms-excel|opendocument\.spreadsheet|text\/csv/, 'sheet'],
  [/presentationml|ms-powerpoint|opendocument\.presentation/, 'slides'],
  [/^text\/markdown$/, 'markdown'],
  [/^text\/|json$/, 'text'],
  [/zip|x-rar|x-7z|x-tar|gzip/, 'archive'],
];

export function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot > 0 && dot < name.length - 1 ? name.slice(dot + 1).toLowerCase() : '';
}

export function fileKindOf(file: Pick<FileRef, 'name' | 'mime'>): FileKind {
  // A specific MIME type wins; a generic one (octet-stream) defers to the name.
  if (file.mime && file.mime !== 'application/octet-stream') {
    for (const [pattern, kind] of BY_MIME) if (pattern.test(file.mime)) return kind;
  }
  return BY_EXTENSION[extensionOf(file.name)] ?? 'other';
}

/** "820 KB", "4.2 MB". Uses the reader's locale for the digits. */
export function formatBytes(bytes: number, locale?: string): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  const digits = unit === 0 || value >= 10 ? 0 : 1;
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value)} ${units[unit]}`;
}

/** English names for file kinds and file actions; screens pass their own for si and ta. */
export const FILE_CARD_ENGLISH: FileCardLabels = {
  kinds: {
    image: 'Image',
    audio: 'Audio',
    video: 'Video',
    pdf: 'PDF',
    document: 'Document',
    sheet: 'Spreadsheet',
    slides: 'Slides',
    markdown: 'Markdown',
    text: 'Text',
    archive: 'Archive',
    other: 'File',
  },
  open: 'Open',
  retry: 'Try again',
  remove: 'Remove',
  progress: (percent) => `${percent}% uploaded`,
};

/**
 * The file's address if it is safe to use as a link or frame source: web,
 * blob, file or relative addresses. Anything else (javascript:, data: HTML)
 * returns null and the file shows without a link.
 */
export function safeFileUrl(uri: string): string | null {
  const value = uri.trim();
  // Browsers drop tabs, newlines and other control characters inside a URL
  // ("java\tscript:" runs as javascript:), so any such address is refused.
  if (value === '' || /[\u0000-\u001F\u007F\s]/.test(value)) return null;
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(value)?.[1]?.toLowerCase();
  if (scheme === undefined) {
    // Relative addresses only: "//host" would be another site, and a colon
    // before any slash could still be read as a scheme.
    if (value.startsWith('//') || /^[^/?#]*:/.test(value)) return null;
    return value;
  }
  return ['https', 'http', 'blob', 'file'].includes(scheme) ? value : null;
}
