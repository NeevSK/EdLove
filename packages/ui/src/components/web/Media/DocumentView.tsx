'use client';

import { useState } from 'react';
import type { DocumentContract, DocumentKind } from '../../../theme/contracts';
import { fileKindOf } from '../../shared/files';
import { useMediaAdapters } from './adapters';
import { FileCard } from './FileCard';

export type DocumentViewProps = DocumentContract;

const DOCUMENT_KINDS: readonly string[] = [
  'pdf',
  'document',
  'sheet',
  'slides',
  'markdown',
  'text',
];
const isDocumentKind = (kind: string): kind is DocumentKind => DOCUMENT_KINDS.includes(kind);

/**
 * A document shown in place by the adapter the app chose for its kind. With
 * none, or on failure, it is a file card that downloads or opens it.
 */
export function DocumentView({ file, onOpenElsewhere }: DocumentViewProps) {
  const { documents } = useMediaAdapters();
  const [failed, setFailed] = useState(false);
  const kind = fileKindOf(file);
  const Adapter = isDocumentKind(kind) ? documents?.[kind] : undefined;
  if (!Adapter || failed) {
    return (
      <FileCard
        file={file}
        onOpen={onOpenElsewhere}
        href={onOpenElsewhere ? undefined : file.uri}
      />
    );
  }
  return (
    <div className="gd-document" data-kind={kind}>
      <Adapter file={file} onError={() => setFailed(true)} />
    </div>
  );
}
