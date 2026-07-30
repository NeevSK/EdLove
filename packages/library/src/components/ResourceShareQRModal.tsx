import { SharedShareModal } from '@repo/ui/components/media/AssetShareModal';
import { buildLibraryResourceShareUrl } from '@repo/library/utils/resourceLinks';

interface ResourceShareQRModalProps {
  visible: boolean;
  onClose: () => void;
  resourceId: string;
  resourceTitle: string;
  resourceType: string;
  resourceThumbnailUrl?: string;
}

/**
 * ResourceShareQRModal - Library Wrapper
 * Delegates to the shared AssetShareModal.
 */
export function ResourceShareQRModal({
  visible,
  onClose,
  resourceId,
  resourceTitle,
  resourceType,
  resourceThumbnailUrl,
}: ResourceShareQRModalProps) {
  const shareUrl = buildLibraryResourceShareUrl(resourceId);

  return (
    <SharedShareModal
      visible={visible}
      onClose={onClose}
      assetId={resourceId}
      assetTitle={resourceTitle}
      assetType={resourceType}
      shareUrl={shareUrl}
      assetThumbnailUrl={resourceThumbnailUrl}
      shareMessage={`Explore "${resourceTitle}" on Gurudevi\n${shareUrl}`}
    />
  );
}

export default ResourceShareQRModal;
