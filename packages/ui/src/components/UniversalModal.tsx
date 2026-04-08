import React from 'react';
import { Modal } from 'react-native';

export interface UniversalModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    transparent?: boolean;
    /** Whether to show a backdrop that closes on press */
    hasBackdrop?: boolean;
}

/**
 * UniversalModal (Native)
 * Uses standard portaled Modals for mobile.
 */
export const UniversalModal = ({
    isOpen,
    onClose,
    children,
    transparent = true
}: UniversalModalProps) => {
    return (
        <Modal
            visible={isOpen}
            transparent={transparent}
            onRequestClose={onClose}
            animationType="fade"
            statusBarTranslucent
        >
            {children}
        </Modal>
    );
};
