import type React from 'react';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { Center, Modal } from '@repo/ui/primitives';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

/**
 * LoadingOverlay - Hardened v3 implementation.
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible, message }) => {
  return (
    <Modal isOpen={visible} onClose={() => {}}>
      <Center className="flex-1">
        <BrandPulse accessibilityLabel={message ?? 'Loading'} size={36} />
      </Center>
    </Modal>
  );
};

export default LoadingOverlay;
