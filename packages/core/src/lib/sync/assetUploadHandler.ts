import type { FilePurpose } from '@repo/core/logic/files/filePolicy';

export interface AssetUploadIntent {
  readonly assetId: string;
  readonly sha256: string;
  readonly bytes: number;
  readonly mime: string;
  readonly fileName: string;
  readonly purpose: FilePurpose;
  readonly visibility: 'public' | 'institution' | 'private';
  readonly targetKind: 'library_work' | 'classroom_material' | 'submission';
  readonly targetId?: string;
  readonly title?: string;
}

export interface LocalAssetBlobStore {
  getPendingBlob(assetId: string): Promise<Blob | undefined>;
  removePendingBlob(assetId: string): Promise<void>;
}

export interface PresignedUploadGrant {
  readonly objectKey: string;
  readonly uploadUrl: string | null;
  readonly headers?: Readonly<Record<string, string>>;
  readonly deduplicated?: boolean;
}

export interface AssetUploadTransport {
  createUploadUrl(intent: AssetUploadIntent): Promise<PresignedUploadGrant>;
  putBlob(
    uploadUrl: string,
    blob: Blob,
    headers?: Readonly<Record<string, string>>,
  ): Promise<void>;
  confirmUpload(input: {
    assetId: string;
    objectKey: string;
    sha256: string;
    bytes: number;
    mime: string;
    intent: AssetUploadIntent;
  }): Promise<{ assetUrl: string }>;
}

/**
 * Outbox replay handler for binary asset uploads.
 * Keeps `useMutationQueue` JSON-only by reading the raw `Blob` from `LocalAssetBlobStore`
 * (IndexedDB on web) at replay time, uploading directly to object storage via presigned PUT,
 * and confirming metadata before cleaning up the pending local blob.
 */
export function createAssetUploadReplayHandler(deps: {
  blobStore: LocalAssetBlobStore;
  transport: AssetUploadTransport;
}) {
  return async (intent: AssetUploadIntent): Promise<{ assetUrl: string }> => {
    const grant = await deps.transport.createUploadUrl(intent);

    if (!grant.deduplicated && grant.uploadUrl) {
      const blob = await deps.blobStore.getPendingBlob(intent.assetId);
      if (!blob) {
        throw new Error(`Pending local asset "${intent.assetId}" is missing from device store.`);
      }
      await deps.transport.putBlob(grant.uploadUrl, blob, grant.headers);
    }

    const confirmed = await deps.transport.confirmUpload({
      assetId: intent.assetId,
      objectKey: grant.objectKey,
      sha256: intent.sha256,
      bytes: intent.bytes,
      mime: intent.mime,
      intent,
    });

    await deps.blobStore.removePendingBlob(intent.assetId);
    return confirmed;
  };
}
