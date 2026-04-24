import React from 'react';
import { View, Pressable } from 'react-native';

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
 * Hardened v3 implementation with NativeWind.
 */
export const UniversalModal = ({
  isOpen,
  onClose,
  children,
  hasBackdrop = true,
}: UniversalModalProps) => {
  if (!isOpen) return null;

  return (
    <View className="fixed top-0 left-0 right-0 bottom-0 z-[9999] justify-center items-center">
      {hasBackdrop && (
        <Pressable
          className="absolute top-0 left-0 right-0 bottom-0 bg-black/50"
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close modal"
        />
      )}
      <View className="z-[10000] w-full h-full justify-center items-center pointer-events-none">
        <View className="pointer-events-auto">{children}</View>
      </View>
    </View>
  );
};
