import { type FileKind, fileKindOf } from '@repo/core/logic/files/fileKind';

/**
 * One file policy: for each purpose a file is chosen for, which kinds and types it may be, how
 * large, how many, and how an image is prepared before it is kept or sent. Every picker, file
 * input, kit file field and upload reads its rules here, so a limit changes in one place.
 *
 * Values marked "policy default" had no limit anywhere before; they are the platform's choice and
 * can be changed here. The others are what the code already used (2026-11-13).
 */

export type FilePurpose = 'avatar' | 'wallpaper' | 'submission' | 'scan' | 'attachment';

/** How an image is prepared on the device before it is kept or sent. */
export interface ImagePreparation {
  /** Encoder quality, 0–1, whenever the image is encoded (picked, or downsampled). */
  readonly quality: number;
  /** Quality the picker captures at, when the image is downsampled afterwards. Default: `quality`. */
  readonly captureQuality?: number;
  /** Let the person crop before it is used. */
  readonly crop: boolean;
  /** Crop to a square. */
  readonly square?: boolean;
  /** Longest sides after downsampling. */
  readonly maxWidth?: number;
  readonly maxHeight?: number;
  /** Preferred encoding; JPEG where the platform cannot encode it. */
  readonly format?: 'webp' | 'jpeg';
}

export interface FilePolicy {
  /** Kinds a person may choose. Omitted: any. */
  readonly accept?: readonly FileKind[];
  /** Exact MIME types, where the kind is too broad (an avatar is an image, but not an SVG). */
  readonly mimeTypes?: readonly string[];
  /** Largest file, in bytes. Omitted: no limit. */
  readonly maxBytes?: number;
  /** Most files at once. */
  readonly maxFiles: number;
  /** Largest decoded image, in pixels. */
  readonly maxPixels?: number;
  /** Dimensions must be known before upload (so the pixel limit can be checked). */
  readonly requireDimensions?: boolean;
  readonly image?: ImagePreparation;
}

const MB = 1024 * 1024;
const RASTER_IMAGES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export const FILE_POLICY: Readonly<Record<FilePurpose, FilePolicy>> = {
  avatar: {
    accept: ['image'],
    mimeTypes: RASTER_IMAGES,
    maxBytes: 2 * MB,
    maxFiles: 1,
    image: { quality: 0.9, crop: true, square: true },
  },
  wallpaper: {
    accept: ['image'],
    mimeTypes: ['image/avif', ...RASTER_IMAGES],
    maxBytes: 8 * MB,
    maxFiles: 1,
    maxPixels: 16_000_000,
    requireDimensions: true,
    image: { quality: 0.82, crop: false, maxWidth: 1920, maxHeight: 1080, format: 'webp' },
  },
  submission: {
    accept: ['image', 'pdf', 'document', 'archive'],
    // Policy default: a phone photo of a page or a short document, not a video.
    maxBytes: 20 * MB,
    maxFiles: 5,
    image: { quality: 0.7, crop: true },
  },
  scan: {
    accept: ['image'],
    maxFiles: 1,
    // Captured at full quality, then downsampled for recognition (scanner-kit `preFlightImage`);
    // the person crops to the code or page.
    image: {
      captureQuality: 1,
      quality: 0.82,
      crop: true,
      maxWidth: 1600,
      maxHeight: 1600,
      format: 'jpeg',
    },
  },
  attachment: {
    maxFiles: 10,
    image: { quality: 0.7, crop: false },
  },
};

/** Why a file was refused. The codes are the ones uploads have used since the wallpaper policy. */
export type FileRefusal =
  | 'MEDIA_TYPE_UNSUPPORTED'
  | 'MEDIA_SIZE_EXCEEDED'
  | 'MEDIA_DIMENSIONS_REQUIRED'
  | 'MEDIA_DIMENSIONS_INVALID'
  | 'MEDIA_PIXELS_EXCEEDED'
  | 'MEDIA_COUNT_EXCEEDED';

export interface FileFacts {
  readonly name?: string;
  readonly mime?: string;
  /** Bytes, when known. */
  readonly size?: number;
  readonly width?: number;
  readonly height?: number;
}

export type FileCheck =
  | { readonly ok: true }
  | { readonly ok: false; readonly refusal: FileRefusal };

const policyOf = (purpose: FilePurpose | FilePolicy) =>
  typeof purpose === 'string' ? FILE_POLICY[purpose] : purpose;

const refused = (refusal: FileRefusal): FileCheck => ({ ok: false, refusal });
const isPositiveInteger = (n: number) => Number.isSafeInteger(n) && n > 0;

/** Checks one file against a purpose's policy. Unknown size or dimensions pass unless required. */
export function checkFile(file: FileFacts, purpose: FilePurpose | FilePolicy): FileCheck {
  const policy = policyOf(purpose);
  const mime = file.mime?.toLowerCase();
  if (policy.mimeTypes && !(mime && policy.mimeTypes.includes(mime))) {
    return refused('MEDIA_TYPE_UNSUPPORTED');
  }
  if (policy.accept && !policy.accept.includes(fileKindOf({ name: file.name ?? '', mime }))) {
    return refused('MEDIA_TYPE_UNSUPPORTED');
  }
  if (file.size !== undefined) {
    if (!isPositiveInteger(file.size)) return refused('MEDIA_SIZE_EXCEEDED');
    if (policy.maxBytes !== undefined && file.size > policy.maxBytes)
      return refused('MEDIA_SIZE_EXCEEDED');
  }
  const { width, height } = file;
  if (width === undefined || height === undefined) {
    return policy.requireDimensions ? refused('MEDIA_DIMENSIONS_REQUIRED') : { ok: true };
  }
  if (!isPositiveInteger(width) || !isPositiveInteger(height))
    return refused('MEDIA_DIMENSIONS_INVALID');
  if (policy.maxPixels !== undefined && width * height > policy.maxPixels) {
    return refused('MEDIA_PIXELS_EXCEEDED');
  }
  return { ok: true };
}

/** Checks a batch being added to `existing` files already chosen. */
export function checkFiles(
  files: readonly FileFacts[],
  purpose: FilePurpose | FilePolicy,
  existing = 0,
): FileCheck {
  const policy = policyOf(purpose);
  if (existing + files.length > policy.maxFiles) return refused('MEDIA_COUNT_EXCEEDED');
  for (const file of files) {
    const check = checkFile(file, policy);
    if (!check.ok) return check;
  }
  return { ok: true };
}

/** The kit's file field rules for a purpose (`FileField` says them and refuses breaks). */
export function fileRulesFor(purpose: FilePurpose) {
  const { accept, maxBytes, maxFiles } = FILE_POLICY[purpose];
  return { accept, maxBytes, maxFiles };
}

const EXTENSIONS: Partial<Record<FileKind, readonly string[]>> = {
  image: ['.png', '.jpg', '.jpeg', '.webp'],
  pdf: ['.pdf'],
  document: ['.doc', '.docx', '.odt', '.rtf'],
  archive: ['.zip'],
};

/**
 * Camera and library picker settings for a purpose, in expo-image-picker's option names (plain
 * values, so core stays platform-neutral). Spread into `launchCameraAsync` / `launchImageLibraryAsync`.
 */
export function imagePickerOptionsFor(purpose: FilePurpose) {
  const image = FILE_POLICY[purpose].image ?? { quality: 1, crop: false };
  return {
    mediaTypes: ['images'] as ['images'],
    quality: image.captureQuality ?? image.quality,
    allowsEditing: image.crop,
    ...(image.square ? { aspect: [1, 1] as [number, number] } : {}),
  };
}

/** The value for a browser `<input type="file" accept>` for a purpose. */
export function acceptAttributeFor(purpose: FilePurpose): string | undefined {
  const policy = FILE_POLICY[purpose];
  if (policy.mimeTypes) return policy.mimeTypes.join(',');
  return policy.accept?.flatMap((kind) => EXTENSIONS[kind] ?? []).join(',') || undefined;
}

/**
 * A refused upload, for code that must throw (an upload command). Screens use `checkFile` and say
 * the reason; this carries the same code.
 */
export class MediaUploadValidationError extends Error {
  readonly code: FileRefusal;
  constructor(code: FileRefusal, message = `File refused: ${code}`) {
    super(message);
    this.name = 'MediaUploadValidationError';
    this.code = code;
  }
}

/** Throws `MediaUploadValidationError` when the file breaks the purpose's policy. */
export function assertFileAllowed(file: FileFacts, purpose: FilePurpose | FilePolicy): void {
  const check = checkFile(file, purpose);
  if (!check.ok) throw new MediaUploadValidationError(check.refusal);
}
