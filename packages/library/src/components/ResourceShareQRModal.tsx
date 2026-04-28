import { coreRuntime, QRBuilder } from '@repo/core';
import {
  Box,
  HStack,
  QRCodeGenerator,
  SanctuaryButton,
  SanctuaryModal,
  Text,
  VStack,
} from '@repo/ui';
import { Share2 } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { buildLibraryResourceShareUrl } from '../utils/resourceLinks';

interface ResourceShareQRModalProps {
  visible: boolean;
  onClose: () => void;
  resourceId: string;
  resourceTitle: string;
  resourceType: string;
  resourceThumbnailUrl?: string;
}

export function ResourceShareQRModal({
  visible,
  onClose,
  resourceId,
  resourceTitle,
  resourceType,
  resourceThumbnailUrl,
}: ResourceShareQRModalProps) {
  const shareUrl = buildLibraryResourceShareUrl(resourceId);
  const qrValue = QRBuilder.resource(resourceId, resourceType, resourceTitle, resourceThumbnailUrl);

  const handleShareLink = useCallback(async () => {
    await coreRuntime.share.share({
      message: `Explore "${resourceTitle}" on Gurudevi\n${shareUrl}`,
      url: shareUrl,
      title: resourceTitle,
    });
  }, [resourceTitle, shareUrl]);

  const footer = (
    <SanctuaryButton onPress={handleShareLink} className="w-full" leftIcon={Share2}>
      Share link
    </SanctuaryButton>
  );

  return (
    <SanctuaryModal isOpen={visible} onClose={onClose} title="Share via QR" footer={footer}>
      <VStack className="items-center gap-4 py-2">
        <Text className="text-phaseText-primary text-lg font-bold text-center">
          {resourceTitle}
        </Text>
        <Text className="text-phaseText-secondary text-sm text-center leading-5">
          Scan inside Gurudevi or with a phone camera to jump straight into this resource hub.
        </Text>

        <Box className="p-4 rounded-3xl bg-white">
          <QRCodeGenerator
            value={qrValue}
            size={210}
            label="Scan in Gurudevi or camera"
            backgroundColor="#FFFFFF"
            color="#000000"
          />
        </Box>

        <VStack className="w-full gap-1 p-3 rounded-2xl bg-black/20 border border-white/5">
          <Text className="text-phaseText-tertiary text-[10px] uppercase font-bold">
            Share link
          </Text>
          <Text className="text-phaseText-primary text-xs" numberOfLines={2}>
            {shareUrl}
          </Text>
        </VStack>
      </VStack>
    </SanctuaryModal>
  );
}

export default ResourceShareQRModal;
