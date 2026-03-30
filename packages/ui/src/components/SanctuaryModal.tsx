/**
 * SanctuaryModal  Phase-aware base modal for the Gurudevi ecosystem.
 *
 * Design laws enforced here:
 * - Backdrop uses Shadow Violet rgba(107,100,128,x)  NEVER black
 * - Background resolves from glass.modal tokens (phase + world aware)
 * - All text uses token-resolved colors  no hardcoded hex
 * - Border radius: Theme.corners.generous (24)  organic, never sharp
 * - Shadow: Shadow Violet only
 *
 * Usage:
 *   <SanctuaryModal isOpen={open} onClose={close} title="Confirm"
 *     <Text>Your content</Text
 *   </SanctuaryModal
 */

import React from 'react';
import {
    Modal,
    ModalBackdrop,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Heading,
    Text,
    Icon,
    CloseIcon,
    HStack,
    VStack,
} from '../gluestack';
import { useTheme } from '../hooks/useTheme';
import { Theme } from '../theme/Theme';

export interface SanctuaryModalProps {
    /** Controls visibility */
    isOpen: boolean;
    /** Called when the modal requests to close */
    onClose: () => void;
    /** Modal title  shown in header */
    title: string;
    /** Optional subtitle below the title */
    subtitle?: string;
    /** Optional leading icon element in the header */
    icon?: React.ReactNode;
    /** Modal body content */
    children: React.ReactNode;
    /** Optional footer content (action buttons live here) */
    footer?: React.ReactNode;
    /** Whether to show the top-right close button (default: true) */
    showCloseButton?: boolean;
    /** Gluestack size token */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'full';
}

export default function SanctuaryModal({
    isOpen,
    onClose,
    title,
    subtitle,
    icon,
    children,
    footer,
    showCloseButton = true,
    size = 'md',
}: SanctuaryModalProps) {
    const { scene, text, isDark } = useTheme();

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            {...({ size } as any)}
        
            {/* Backdrop: Shadow Violet  NEVER black */}
            <ModalBackdrop
                sx={{
                    backgroundColor: isDark
                        ? 'rgba(107,100,128,0.65)'
                        : 'rgba(107,100,128,0.45)',
                }}
            /

            <ModalContent
                sx={{
                    width: '90%',
                    backgroundColor: scene.elevated.bg,
                    borderColor: scene.elevated.border,
                    borderWidth: 1,
                    borderRadius: Theme.corners.generous,
                    // Shadow Violet only  never black
                    shadowColor: Theme.colors.shadowViolet,
                    shadowOffset: { width: 0, height: isDark ? 0 : 4 },
                    shadowOpacity: isDark ? 0.28 : 0.10,
                    shadowRadius: isDark ? 20 : 12,
                    elevation: 8,
                }}
            
                <ModalHeader
                    <HStack
                        {...({ space: 'sm', alignItems: 'center', flex: 1 } as any)}
                    
                        {icon && icon}
                        <VStack {...({ flex: 1 } as any)}
                            <Heading
                                size="md"
                                {...({ color: text.onElevated } as any)}
                            
                                {title}
                            </Heading
                            {subtitle ? (
                                <Text
                                    {...({ size: 'xs', color: text.secondary } as any)}
                                
                                    {subtitle}
                                </Text
                            ) : null}
                        </VStack
                    </HStack

                    {showCloseButton && (
                        <ModalCloseButton
                            <Icon
                                as={CloseIcon}
                                {...({ color: text.onElevated } as any)}
                            /
                        </ModalCloseButton
                    )}
                </ModalHeader

                <ModalBody>{children}</ModalBody

                {footer ? <ModalFooter>{footer}</ModalFooter> : null}
            </ModalContent
        </Modal
    );
}

