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
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {hasBackdrop && (
        <div
          className="absolute inset-0"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(20, 16, 11, 0.70)',
          }}
          onClick={onClose}
          role="button"
          aria-label="Close modal"
        />
      )}
      <div
        className="relative z-[10000] w-full h-full flex items-center justify-center pointer-events-none p-4"
        style={{
          position: 'relative',
          zIndex: 10000,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          padding: '1rem',
        }}
        role="presentation"
      >
        <div
          className="pointer-events-auto"
          style={{ pointerEvents: 'auto' }}
          role="dialog"
        >
          {children}
        </div>
      </div>
    </div>
  );
};
