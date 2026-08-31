import { FireflyFeedbackScene } from '@repo/ui/components/FireflyFeedbackScene';
import { Center, Modal } from '@repo/ui/primitives';
import type React from 'react';

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
        <FireflyFeedbackScene
          accessibilityLabel={message ?? 'Loading'}
          state="loading"
          size={144}
          animate
        />
      </Center>
    </Modal>
  );
};

export default LoadingOverlay;
