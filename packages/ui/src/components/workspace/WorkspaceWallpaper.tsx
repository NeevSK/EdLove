import { resolveRuntimeVisualBudget, resolveWallpaperPresentation } from '@repo/core/efficiency';
import { visualSignalsOf } from '@repo/core/governor';
import type { WorkspaceWallpaper as WorkspaceWallpaperAsset } from '@repo/core/types';
import { useRealityOptional } from '@repo/ui/context/RealityProvider';
import { useVisualCapabilities } from '@repo/ui/context/VisualCapabilities';
import { View } from '@repo/ui/primitives';
import { useVergerSnapshot } from '@repo/verger-react';
import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { AppState, Platform, StyleSheet, useWindowDimensions } from 'react-native';

export function WorkspaceWallpaper({
  wallpaper,
}: Readonly<{ wallpaper?: WorkspaceWallpaperAsset }>) {
  const { reality } = useRealityOptional();
  const visualCapabilities = useVisualCapabilities();
  const snapshot = useVergerSnapshot();
  const networkLimit = snapshot?.networkLimit;
  const powerSaver = snapshot?.powerSaver;
  const visibility = snapshot?.visibility;
  const { width } = useWindowDimensions();
  const [isAppVisible, setIsAppVisible] = useState(() => AppState.currentState === 'active');

  useEffect(() => {
    setIsAppVisible(AppState.currentState === 'active');
    const subscription = AppState.addEventListener('change', (state) => {
      setIsAppVisible(state === 'active');
    });
    return () => subscription.remove();
  }, []);

  const budget = useMemo(
    () =>
      // Inside verger's provider its readings decide; outside it, the old reality does.
      networkLimit !== undefined && powerSaver !== undefined && visibility !== undefined
        ? resolveRuntimeVisualBudget(
            visualSignalsOf({ networkLimit, powerSaver, visibility }, visualCapabilities),
          )
        : resolveRuntimeVisualBudget({
            deviceTier: reality.deviceTier,
            networkQuality: reality.networkQuality,
            isDataSaverMode: reality.isDataSaverMode,
            isBatterySaverMode: reality.isBatterySaverMode,
            isReducedMotionEnabled: reality.isReducedMotionEnabled,
            isDocumentVisible: isAppVisible,
          }),
    [
      networkLimit,
      powerSaver,
      visibility,
      visualCapabilities,
      isAppVisible,
      reality.deviceTier,
      reality.isBatterySaverMode,
      reality.isDataSaverMode,
      reality.isReducedMotionEnabled,
      reality.networkQuality,
    ],
  );
  const presentation = resolveWallpaperPresentation(wallpaper, budget, width);

  if (!presentation.enabled || !presentation.url || visualCapabilities.quality === 'essential') {
    return null;
  }

  return (
    <View
      accessible={false}
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      testID="workspace-wallpaper"
    >
      <Image
        allowDownscaling
        blurRadius={presentation.allowBlur ? 2 : 0}
        cachePolicy={visualCapabilities.imageCachePolicy}
        contentFit="cover"
        decodeFormat={Platform.OS === 'android' ? visualCapabilities.imageDecodeFormat : undefined}
        priority="low"
        source={{ uri: presentation.url }}
        style={[StyleSheet.absoluteFill, { opacity: presentation.opacity }]}
        transition={budget.allowAnimation ? 180 : 0}
      />
    </View>
  );
}
