import React, { useCallback } from 'react';
import { Share } from 'react-native';
import { 
    QRCodeGenerator, 
    Box, 
    VStack, 
    HStack, 
    Text, 
    Pressable, 
    Heading,
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    ButtonText,
    ButtonIcon,
    Icon,
} from '@repo/ui';
import { QRBuilder } from '@repo/core';
import { QrCode, Share2, X } from 'lucide-react-native';
import { buildLibraryResourceShareUrl } from '../utils/resourceLinks';

interface ResourceShareQRModalProps {
    visible: boolean;
    onClose: () => void;
    resourceId: string;
    resourceTitle: string;
}

export function ResourceShareQRModal({
    visible,
    onClose,
    resourceId,
    resourceTitle,
}: ResourceShareQRModalProps) {
    const shareUrl = buildLibraryResourceShareUrl(resourceId);
    const qrValue = QRBuilder.resource(resourceId);

    const handleShareLink = useCallback(async () => {
        await Share.share({
            message: `Explore "${resourceTitle}" on Gurudevi\n${shareUrl}`,
            url: shareUrl,
            title: resourceTitle,
        });
    }, [resourceTitle, shareUrl]);

    return (
        <Modal isOpen={visible} onClose={onClose}>
            <ModalBackdrop />
            <ModalContent className="bg-phase-surface border border-white/10 max-w-[420px]">
                <ModalHeader className="border-b border-white/5 p-4">
                    <HStack className="gap-2 items-center">
                        <Icon as={QrCode} size="sm" className="text-[#f59e0b]" />
                        <Heading className="text-white text-base">Share via QR</Heading>
                    </HStack>
                    <ModalCloseButton>
                        <Icon as={X} size="sm" className="text-[#94a3b8]" />
                    </ModalCloseButton>
                </ModalHeader>

                <ModalBody className="p-5">
                    <VStack className="items-center gap-4">
                        <Text className="text-white text-lg font-bold text-center">
                            {resourceTitle}
                        </Text>
                        <Text className="text-phaseText-secondary text-sm text-center leading-5">
                            Scan inside Gurudevi or with a phone camera to jump straight into this resource hub.
                        </Text>
                        
                        <Box className="p-4 rounded-generous bg-white border border-white/10">
                            <QRCodeGenerator value={qrValue} size={210} label="Scan in Gurudevi or camera" backgroundColor="#FFFFFF" className="text-[#8b5cf6]" />
                        </Box>

                        <VStack className="w-full gap-1 p-3 rounded-comfortable bg-black/20 border border-white/5">
                            <Text className="text-phaseText-muted text-[10px] uppercase font-bold">
                                Share link
                            </Text>
                            <Text className="text-white text-xs" numberOfLines={2}>
                                {shareUrl}
                            </Text>
                        </VStack>
                    </VStack>
                </ModalBody>

                <ModalFooter className="p-4 border-t border-white/5">
                    <Button onPress={handleShareLink} className="w-full bg-phase-accent h-12 rounded-comfortable">
                        <ButtonIcon as={Share2} className="text-#0f172a mr-2" />
                        <ButtonText className="text-phaseText-onAccent font-bold">
                            Share link
                        </ButtonText>
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default ResourceShareQRModal;
