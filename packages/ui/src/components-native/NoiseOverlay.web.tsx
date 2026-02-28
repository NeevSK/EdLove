/**
 * Web fallback for NoiseOverlay.
 *
 * On native, NoiseOverlay uses @shopify/react-native-skia to render a subtle
 * film-grain texture over the entire screen.  On web this layer is purely
 * decorative and not critical to the UI, so we render nothing.
 *
 * A CSS-based grain could be added here in a future iteration.
 */
import React from 'react';

export const NoiseOverlay: React.FC<{
    opacity?: number;
    warm?: boolean;
    frequency?: number;
}> = () => null;
