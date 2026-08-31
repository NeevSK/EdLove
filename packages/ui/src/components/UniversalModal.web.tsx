import React from 'react';
import { StyleSheet, View, Pressable, Modal } from 'react-native';

export interface UniversalModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  transparent?: boolean;
  /** Whether to show a backdrop that closes on press */
  hasBackdrop?: boolean;
}

/**
 * UniversalModal.web - Web-compatible overlay using React Native primitives.
 * Keeps React Native Web's synthetic responder event chain intact so all clicks,
 * touch gestures, and mouse interactions work seamlessly.
 */
export const UniversalModal = ({
  isOpen,
  onClose,
  children,
  hasBackdrop = true,
}: UniversalModalProps) => {
  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      onRequestClose={onClose}
      animationType="fade"
    >
      <View style={styles.modalRoot}>
        {hasBackdrop && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close modal"
            style={styles.backdrop}
            onPress={onClose}
          />
        )}
        <View style={styles.contentContainer}>
          {children}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(20, 16, 11, 0.70)',
  },
  contentContainer: {
    zIndex: 10000,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
  },
});
