import { coreRuntime, QRBuilder } from '@repo/core/logic';
import { Share2 } from 'lucide-react-native';
import { useCallback } from 'react';
import { Box, Text, VStack } from '../../primitives';
import QRCodeGenerator from '../QRCodeGenerator';
import { SanctuaryButton } from '../SanctuaryButton';
import SanctuaryModal from '../SanctuaryModal';

export interface AssetShareModalProps {
  visible: boolean;
  onClose: () => void;
  assetId: string;
  assetTitle: string;
  assetType: string;
  shareUrl: string;
  assetThumbnailUrl?: string;
  shareMessage?: string;
}

/**
 * AssetShareModal - Platform-wide share orchestrator.
 * Promoted from library to UI to handle QR generation and native sharing.
 */
export function AssetShareModal({
  visible,
  onClose,
  assetId,
  assetTitle,
  assetType,
  shareUrl,
  assetThumbnailUrl,
  shareMessage,
}: AssetShareModalProps) {
  const qrValue = QRBuilder.resource(assetId, assetType, assetTitle, assetThumbnailUrl);

  const handleShareLink = useCallback(async () => {
    await coreRuntime.share.share({
      message: shareMessage || `Explore "${assetTitle}" on the Polymath Platform\n${shareUrl}`,
      url: shareUrl,
      title: assetTitle,
    });
  }, [assetTitle, shareUrl, shareMessage]);

  const footer = (
    <SanctuaryButton onPress={handleShareLink} className="w-full" leftIcon={Share2}>
      Share External Link
    </SanctuaryButton>
  );

  return (
    <SanctuaryModal isOpen={visible} onClose={onClose} title="Share Asset" footer={footer}>
      <VStack className="items-center gap-4 py-2">
        <Text className="text-phaseText-primary text-lg font-bold text-center">{assetTitle}</Text>
        <Text className="text-phaseText-secondary text-sm text-center leading-5 px-2">
          Scan with a phone camera or the platform scanner to open this asset directly.
        </Text>

        <Box className="p-4 rounded-[32px] bg-white shadow-xl">
          <QRCodeGenerator
            value={qrValue}
            size={200}
            label="Platform Scan Ready"
            backgroundColor="#FFFFFF"
            color="#000000"
          />
        </Box>

        <VStack className="w-full gap-1 p-4 rounded-2xl bg-phase-accent/5 border border-phase-accent/10">
          <Text className="text-phase-accent text-[10px] uppercase font-bold tracking-widest">
            Asset Portal Link
          </Text>
          <Text className="text-phaseText-primary text-xs" numberOfLines={1}>
            {shareUrl}
          </Text>
        </VStack>
      </VStack>
    </SanctuaryModal>
  );
}

export { AssetShareModal as SharedShareModal };
export default AssetShareModal;
