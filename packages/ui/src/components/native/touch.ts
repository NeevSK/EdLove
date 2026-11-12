import { type Insets, Platform } from 'react-native';
import { slopToReach, touchTarget } from '../../tokens/sizes';

/** The smallest a pressable thing may be to a finger on this platform: 48 on Android, 44 elsewhere. */
export const TOUCH_MIN: number = Platform.OS === 'android' ? touchTarget.android : touchTarget.min;

/**
 * Extra touch area for a control drawn smaller than the platform's minimum, so
 * the finger still gets `TOUCH_MIN` (above and below; beside too when `width` is given).
 * Returns undefined when the control is already big enough.
 */
export function slopFor(height: number, width?: number): Insets | undefined {
  const v = slopToReach(height, TOUCH_MIN);
  const h = width === undefined ? 0 : slopToReach(width, TOUCH_MIN);
  if (v === 0 && h === 0) return undefined;
  return { top: v, bottom: v, left: h, right: h };
}
