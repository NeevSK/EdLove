import React, { createContext, type ReactNode, useContext, useState } from 'react';
import { SanctuaryPulseOverlay } from './SanctuaryPulseOverlay';
import { useSomaticShake } from './useSomaticShake';

export interface SomaticPulseContextValue {
  /** Whether the decompression breathing overlay is currently visible. */
  isPulseActive: boolean;
  /** Manually trigger the Sanctuary Somatic Pulse. */
  triggerPulse: () => void;
  /** Dismiss the overlay and restore previous screen state. */
  dismissPulse: () => void;
  /** Whether physical shake detection is active. */
  isEnabled: boolean;
  /** Toggle shake detection on or off. */
  setIsEnabled: (enabled: boolean) => void;
  /** Whether playful tone ("It's the timeee 🌿") or serene tone is active. */
  isPlayfulMode: boolean;
  /** Toggle playful vs serene copy tone. */
  setIsPlayfulMode: (playful: boolean) => void;
}

const SomaticPulseContext = createContext<SomaticPulseContextValue | null>(null);

export interface SomaticPulseProviderProps {
  children: ReactNode;
  /** Initial enabled state. Defaults to true. */
  initialEnabled?: boolean;
  /** Initial playful tone. Defaults to true ("It's the timeee 🌿"). */
  initialPlayfulMode?: boolean;
}

/**
 * SomaticPulseProvider
 *
 * App-wide provider for the Sanctuary Somatic Pulse.
 * Listens for physical shake gestures and renders the decompression overlay.
 */
export function SomaticPulseProvider({
  children,
  initialEnabled = true,
  initialPlayfulMode = true,
}: SomaticPulseProviderProps) {
  const [isPulseActive, setIsPulseActive] = useState<boolean>(false);
  const [isEnabled, setIsEnabled] = useState<boolean>(initialEnabled);
  const [isPlayfulMode, setIsPlayfulMode] = useState<boolean>(initialPlayfulMode);

  const triggerPulse = () => {
    setIsPulseActive(true);
  };

  const dismissPulse = () => {
    setIsPulseActive(false);
  };

  // Wire up the physical sensor hook.
  // Disabled automatically while the overlay is already active to prevent loop triggers.
  useSomaticShake({
    enabled: isEnabled && !isPulseActive,
    onShake: triggerPulse,
  });

  return (
    <SomaticPulseContext.Provider
      value={{
        isPulseActive,
        triggerPulse,
        dismissPulse,
        isEnabled,
        setIsEnabled,
        isPlayfulMode,
        setIsPlayfulMode,
      }}
    >
      {children}
      <SanctuaryPulseOverlay
        visible={isPulseActive}
        onDismiss={dismissPulse}
        isPlayfulMode={isPlayfulMode}
      />
    </SomaticPulseContext.Provider>
  );
}

/**
 * useSomaticPulse
 *
 * Access the somatic decompression context from any screen or component.
 */
export function useSomaticPulse(): SomaticPulseContextValue {
  const context = useContext(SomaticPulseContext);
  if (!context) {
    throw new Error('useSomaticPulse must be used within a <SomaticPulseProvider>');
  }
  return context;
}
