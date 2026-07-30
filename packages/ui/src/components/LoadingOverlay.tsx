import type React from 'react';
import { Center, Modal, Spinner } from '@repo/ui/gluestack';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

/**
 * LoadingOverlay - Hardened v3 implementation.
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible }) => {
  return (
    <Modal isOpen={visible} onClose={() => {}}>
      <Center className="flex-1">
        <Spinner accessibilityLabel="Loading" size="large" className="text-phase-accent" />
      </Center>
    </Modal>
  );
};

export default LoadingOverlay;
