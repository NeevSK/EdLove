import { tokens } from '@repo/ui/tokens';
import type React from 'react';

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
    <div className="fixed top-0 left-0 right-0 bottom-0 z-[9999] flex justify-center items-center">
      {hasBackdrop && (
        <div
          className="absolute top-0 left-0 right-0 bottom-0"
          style={{ backgroundColor: tokens.colors.overlay, backdropFilter: 'blur(8px)' }}
          onClick={onClose}
          role="button"
          aria-label="Close modal"
        />
      )}
      <div
        className="z-[10000] w-full h-full flex justify-center items-center pointer-events-none"
        role="presentation"
      >
        <div className="pointer-events-auto" role="dialog">
          {children}
        </div>
      </div>
    </div>
  );
};
