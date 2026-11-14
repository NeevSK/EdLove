/**
 * The focus ring for a hardware keyboard (a tablet with a keyboard case, a Chromebook) and for
 * switch access: the element that has focus gets a clear outline in the world's focus colour,
 * a little outside its edge so its own shape stays visible. Touch never shows it.
 */

import { type NativeSyntheticEvent, type TargetedEvent, type ViewStyle } from 'react-native';
import { useCallback, useState } from 'react';
import { useWorld } from './WorldContext';

type FocusHandler = ((e: NativeSyntheticEvent<TargetedEvent>) => void) | null | undefined;

export function useFocusRing(onFocus?: FocusHandler, onBlur?: FocusHandler) {
  const t = useWorld().tokens;
  const [on, setOn] = useState(false);
  const focus = useCallback(
    (e: NativeSyntheticEvent<TargetedEvent>) => {
      setOn(true);
      onFocus?.(e);
    },
    [onFocus],
  );
  const blur = useCallback(
    (e: NativeSyntheticEvent<TargetedEvent>) => {
      setOn(false);
      onBlur?.(e);
    },
    [onBlur],
  );
  const ring: ViewStyle | null = on
    ? { outlineWidth: 2, outlineStyle: 'solid', outlineColor: t.focus, outlineOffset: 3 }
    : null;
  return { onFocus: focus, onBlur: blur, ring };
}
