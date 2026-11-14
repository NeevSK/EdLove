/**
 * The floor tier's life: two or three soft shapes (a mist band, a glow) over the still picture,
 * moved by Reanimated CSS animations. The animation runs on the UI thread as a plain transform or
 * opacity, so a floor phone's scene breathes without a frame loop or a canvas redraw.
 */

import Animated from 'react-native-reanimated';
import { alpha } from '../../../theme/color';
import type { ArtMotion, ArtOverlay } from '../../../theme/scene/art/types';

function keyframes(motion: ArtMotion, peak: number) {
  switch (motion.kind) {
    case 'drift':
      return {
        from: { transform: [{ translateX: -motion.amount }] },
        to: { transform: [{ translateX: motion.amount }] },
      };
    case 'rise':
      return {
        from: { transform: [{ translateY: -motion.amount }] },
        to: { transform: [{ translateY: motion.amount }] },
      };
    case 'breathe':
      return {
        from: { transform: [{ scale: 1 - motion.amount }] },
        to: { transform: [{ scale: 1 + motion.amount }] },
      };
    default:
      return {
        from: { opacity: peak * (1 - motion.amount) },
        to: { opacity: peak },
      };
  }
}

export function FloorOverlays({ overlays }: { overlays: readonly ArtOverlay[] }) {
  return (
    <>
      {overlays.map((o) => {
        const glow = o.kind === 'glow';
        const fill = glow
          ? `radial-gradient(50% 50% at 50% 50%, ${alpha(o.colour, 0.9)}, ${alpha(o.colour, 0)})`
          : `linear-gradient(to bottom, ${alpha(o.colour, 0)} 0%, ${alpha(o.colour, 0.9)} 50%, ${alpha(o.colour, 0)} 100%)`;
        return (
          <Animated.View
            key={o.id}
            pointerEvents="none"
            style={
              {
                position: 'absolute',
                left: o.x,
                top: o.y,
                width: o.width,
                height: o.height,
                opacity: o.opacity,
                backgroundImage: fill,
                animationName: keyframes(o.motion, o.opacity),
                animationDuration: o.motion.periodMs / 2,
                animationDirection: 'alternate',
                animationIterationCount: 'infinite',
                animationTimingFunction: 'ease-in-out',
                // biome-ignore lint/suspicious/noExplicitAny: Reanimated's CSS animation props
              } as any
            }
          />
        );
      })}
    </>
  );
}
