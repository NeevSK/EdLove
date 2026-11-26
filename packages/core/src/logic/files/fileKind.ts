/**
 * What kind of file something is, from its type or name, so every surface (a chat attachment, a
 * file field, a library shelf, an upload check) treats it the same way. Platform-neutral.
 */

/** What kind of file something is. */
export type FileKind =
  | 'image'
  | 'audio'
  | 'video'
  | 'pdf'
  | 'document'
  | 'sheet'
  | 'slides'
  | 'markdown'
  | 'text'
  | 'archive'
  | 'other';

/** A file: where it is and what it is. */
export interface FileRef {
  name: string;
  uri: string;
  /** MIME type when known; otherwise the extension decides. */
  mime?: string;
  /** Bytes. */
  size?: number;
}

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
