import type React from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

type SupportedOrientation =
  | 'portrait'
  | 'landscape-left'
  | 'landscape-right'
  | 'portrait-upside-down'
  | 'landscape';

export interface UniversalModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  transparent?: boolean;
  /** Whether to show a backdrop that closes on press */
  hasBackdrop?: boolean;
  /** Whether to trap accessibility focus within the modal (default: true) */
  trapFocus?: boolean;
}

/**
 * UniversalModal (Native)
 * Uses standard portaled Modals for mobile.
 */
export const UniversalModal = ({
  isOpen,
  onClose,
  children,
  transparent = true,
  hasBackdrop = true,
  trapFocus = true,
}: UniversalModalProps) => {
  // React Native Web can retain a transparent Modal host after `visible`
  // becomes false. Its absolute-fill backdrop then sits above the route and
  // captures every pointer event. Do not mount the host at all when closed.
  if (!isOpen) {
    return null;
  }

  const supportedOrientations: SupportedOrientation[] | undefined = Platform.select({
    ios: ['portrait', 'landscape-left', 'landscape-right', 'portrait-upside-down'],
    android: ['portrait', 'landscape'],
    web: undefined,
  });

  return (
    <Modal
      visible={isOpen}
      transparent={transparent}
      onRequestClose={onClose}
      animationType="fade"
      statusBarTranslucent
      accessibilityViewIsModal={trapFocus}
      accessibilityElementsHidden={!isOpen}
      supportedOrientations={supportedOrientations}
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : undefined}
    >
      <View style={styles.root}>
        {hasBackdrop ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close modal"
            onPress={onClose}
            style={styles.backdrop}
          />
        ) : null}
        <View style={styles.content}>{children}</View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(20, 16, 11, 0.70)',
  },
  content: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
