import type {
  FileKind,
  FileRef,
  FileRejection,
  FileRules,
  MediaLabels,
} from '../../theme/contracts';
import { fileKindOf, formatBytes, safeFileUrl } from './files';

/** English words for media pieces; screens pass their own for si and ta. */
export const MEDIA_ENGLISH: MediaLabels = {
  choose: 'Choose files',
  drop: 'or drop them here',
  rules: ({ maxFiles, maxSize, kinds }) =>
    [
      maxFiles === undefined ? null : maxFiles === 1 ? 'One file' : `Up to ${maxFiles} files`,
      maxSize ? `${maxSize} each` : null,
      kinds ?? null,
    ]
      .filter(Boolean)
      .join(', '),
  rejected: {
    type: (name) => `${name} is not a kind of file this takes.`,
    size: (name) => `${name} is too large.`,
    count: (name) => `${name} was not added: there are already as many files as allowed.`,
    unsafe: (name) => `${name} could not be read safely.`,
  },
  permission: {
    camera: 'The camera is off for Gurudevi. Turn it on in Settings to take a photo.',
    library: 'Photos are off for Gurudevi. Turn them on in Settings to choose one.',
    microphone: 'The microphone is off for Gurudevi. Turn it on in Settings to record.',
  },
  play: 'Play',
  pause: 'Pause',
  record: 'Record',
  stopRecording: 'Stop recording',
  recordAgain: 'Record again',
  recordingLength: (elapsed, max) => (max ? `${elapsed} of ${max}` : elapsed),
  takePhoto: 'Take a photo',
  choosePhoto: 'Choose a photo',
  retake: 'Take another',
  remove: 'Remove',
  transcript: 'Transcript',
  showTranscript: 'Show transcript',
  unavailable: 'This cannot be played here.',
  missingAlt: 'This image has no description yet.',
};

export interface FileCheck {
  accepted: FileRef[];
  rejected: { file: FileRef; reason: FileRejection }[];
}

/**
 * Sort chosen files into taken and refused, in order, counting what the field
 * already holds. Refused files keep their reason so each can be said.
 */
export function checkFiles(
  chosen: readonly FileRef[],
  rules: FileRules,
  alreadyHeld = 0,
): FileCheck {
  const out: FileCheck = { accepted: [], rejected: [] };
  for (const file of chosen) {
    const kind = fileKindOf(file);
    if (safeFileUrl(file.uri) === null) out.rejected.push({ file, reason: 'unsafe' });
    else if (rules.accept && !rules.accept.includes(kind))
      out.rejected.push({ file, reason: 'type' });
    else if (rules.maxBytes !== undefined && (file.size ?? 0) > rules.maxBytes)
      out.rejected.push({ file, reason: 'size' });
    else if (rules.maxFiles !== undefined && alreadyHeld + out.accepted.length >= rules.maxFiles)
      out.rejected.push({ file, reason: 'count' });
    else out.accepted.push(file);
  }
  return out;
}

/** The rules in words, said before choosing. */
export function rulesText(
  rules: FileRules,
  labels: MediaLabels,
  kindNames: Record<FileKind, string>,
  locale?: string,
): string {
  return labels.rules({
    maxFiles: rules.maxFiles,
    maxSize: rules.maxBytes === undefined ? undefined : formatBytes(rules.maxBytes, locale),
    kinds: rules.accept?.map((k) => kindNames[k]).join(', '),
  });
}

/** "0:42", "12:05". */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/** MIME patterns a browser file input accepts for these kinds. */
export function acceptAttribute(kinds: readonly FileKind[] | undefined): string | undefined {
  if (!kinds) return undefined;
  const map: Record<FileKind, string> = {
    image: 'image/*',
    audio: 'audio/*',
    video: 'video/*',
    pdf: 'application/pdf,.pdf',
    document: '.doc,.docx,.odt,.rtf',
    sheet: '.xls,.xlsx,.ods,.csv',
    slides: '.ppt,.pptx,.odp',
    markdown: '.md,.markdown',
    text: 'text/plain,.txt',
    archive: '.zip',
    other: '',
  };
  return kinds
    .map((k) => map[k])
    .filter(Boolean)
    .join(',');
}
