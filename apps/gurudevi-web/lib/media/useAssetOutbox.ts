'use client';

import type { AssetUploadIntent } from '@repo/core/lib/sync/assetUploadHandler';
import { useMutationQueue } from '@repo/core/lib/sync/mutationQueue.store';
import { checkFile, type FilePurpose } from '@repo/core/logic/files/filePolicy';
import { useCallback, useState } from 'react';
import { hashBlobSha256, putPendingUpload } from '../storage/assetIndexedDb';

export interface EnqueueAssetResult {
  readonly ok: true;
  readonly assetId: string;
  readonly sha256: string;
  readonly bytes: number;
  readonly localUri: string;
}

export interface EnqueueAssetError {
  readonly ok: false;
  readonly reason: string;
}

/**
 * Queues a file upload into the offline-first outbox:
 * 1. Validates against `FILE_POLICY` (`checkFile`).
 * 2. Computes WebCrypto SHA-256 and stores the `Blob` in IndexedDB (`pending_uploads`).
 * 3. Enqueues a compact JSON `AssetUploadIntent` into `useMutationQueue` (never raw bytes).
 * 4. Returns a local `blob:` URI so the UI can preview immediately while offline.
 */
export function useAssetOutbox() {
  const addToQueue = useMutationQueue((s) => s.addToQueue);
  const queue = useMutationQueue((s) => s.queue);
  const [busy, setBusy] = useState(false);

  const pendingAssetCount = queue.filter((m) => m.name === 'uploadAsset').length;

  const enqueueAsset = useCallback(
    async (
      file: File,
      options: {
        readonly purpose: FilePurpose;
        readonly visibility: 'public' | 'institution' | 'private';
        readonly targetKind: AssetUploadIntent['targetKind'];
        readonly targetId?: string;
        readonly title?: string;
      },
    ): Promise<EnqueueAssetResult | EnqueueAssetError> => {
      const check = checkFile(
        { name: file.name, mime: file.type || undefined, size: file.size },
        options.purpose,
      );
      if (!check.ok) {
        return { ok: false, reason: `File rejected by policy: ${check.refusal}` };
      }

      setBusy(true);
      try {
        const sha256 = await hashBlobSha256(file);
        const assetId = `asset-${sha256.slice(0, 12)}-${Date.now()}`;

        await putPendingUpload({
          assetId,
          sha256,
          name: file.name,
          mime: file.type || 'application/octet-stream',
          bytes: file.size,
          blob: file,
          createdAt: Date.now(),
        });

        const intent: AssetUploadIntent = {
          assetId,
          sha256,
          bytes: file.size,
          mime: file.type || 'application/octet-stream',
          fileName: file.name,
          purpose: options.purpose,
          visibility: options.visibility,
          targetKind: options.targetKind,
          targetId: options.targetId,
          title: options.title,
        };

        await addToQueue({
          type: 'CREATE',
          scope: 'library',
          name: 'uploadAsset',
          variables: intent,
        });

        return {
          ok: true,
          assetId,
          sha256,
          bytes: file.size,
          localUri: URL.createObjectURL(file),
        };
      } finally {
        setBusy(false);
      }
    },
    [addToQueue],
  );

  return {
    enqueueAsset,
    pendingAssetCount,
    busy,
  };
}
