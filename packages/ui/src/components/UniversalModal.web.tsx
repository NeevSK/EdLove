import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';

export interface UniversalModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    transparent?: boolean;
    /** Whether to show a backdrop that closes on press */
    hasBackdrop?: boolean;
}

/**
 * UniversalModal.web - Web-optimized overlay.
 * 
 * Uses fixed-positioning instead of native Modals to ensure
 * reliable rendering in nested layouts and portal-like behavior.
 */
export const UniversalModal = ({
    isOpen,
    onClose,
    children,
    hasBackdrop = true
}: UniversalModalProps) => {
    if (!isOpen) return null;

    return (
        <View style={styles.webOverlay}>
            {hasBackdrop && (
                <Pressable
                    style={styles.webBackdrop}
                    onPress={onClose}
                    accessibilityRole="button"
                    accessibilityLabel="Close modal"
                />
            )}
            <View style={styles.webContent}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    webOverlay: {
        position: 'fixed' as any,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    webBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    webContent: {
        zIndex: 10000,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
