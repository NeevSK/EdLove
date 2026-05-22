import type React from 'react';

interface NoiseOverlayProps {
  opacity?: number;
  warm?: boolean;
  frequency?: number;
}

export const NoiseOverlay: React.FC<NoiseOverlayProps> = ({
  opacity = 0.05,
  warm = false,
  frequency = 0.8,
}) => {
  // Sleekness Guard: Remove grainy noise filters on web as they conflict with high-fidelity sleekness.
  // We return null here to completely eliminate the hurting grain while keeping the component interface stable.
  return null;
};
