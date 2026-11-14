import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { STANDARD_ACCESS } from '../resolve';
import type { WorldAccess } from '../types';

/**
 * The person's system accessibility settings, as the world engine reads them.
 * Android: high text contrast. iOS: darker system colours and reduce
 * transparency. Each is read once and then followed as it changes.
 */
export function useSystemAccess(): WorldAccess {
  const [access, setAccess] = useState<WorldAccess>(STANDARD_ACCESS);
  useEffect(() => {
    let live = true;
    const setContrast = (more: boolean) =>
      live && setAccess((a) => ({ ...a, contrast: more ? 'more' : 'standard' }));
    const setTransparency = (reduced: boolean) =>
      live && setAccess((a) => ({ ...a, transparency: reduced ? 'reduced' : 'standard' }));

    const ios = Platform.OS === 'ios';
    const contrastQuery = ios
      ? AccessibilityInfo.isDarkerSystemColorsEnabled()
      : AccessibilityInfo.isHighTextContrastEnabled();
    // A setting that cannot be read is treated as off; the world stays standard.
    contrastQuery.then(setContrast, () => setContrast(false));
    const subs = [
      AccessibilityInfo.addEventListener(
        ios ? 'darkerSystemColorsChanged' : 'highTextContrastChanged',
        setContrast,
      ),
    ];
    if (ios) {
      AccessibilityInfo.isReduceTransparencyEnabled().then(setTransparency, () =>
        setTransparency(false),
      );
      subs.push(AccessibilityInfo.addEventListener('reduceTransparencyChanged', setTransparency));
    }
    return () => {
      live = false;
      for (const s of subs) s.remove();
    };
  }, []);
  return access;
}
