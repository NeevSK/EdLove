import { resolveRuntimeVisualBudget, resolveWallpaperPresentation } from '@repo/core/efficiency';
import { visualSignalsOf } from '@repo/core/governor';
import type { WorkspaceWallpaper as WorkspaceWallpaperAsset } from '@repo/core/types';
import { useVisualCapabilities } from '@repo/ui/context/VisualCapabilities';
import { View } from '@repo/ui/primitives';
import { useVergerSnapshot } from '@repo/verger-react';
import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { AppState, Platform, StyleSheet, useWindowDimensions } from 'react-native';

export function WorkspaceWallpaper({
  wallpaper,
}: Readonly<{ wallpaper?: WorkspaceWallpaperAsset }>) {
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

  // Outside verger's provider nothing is known but what the app sees: no network or power limit.
  const budget = useMemo(
    () =>
      resolveRuntimeVisualBudget(
        visualSignalsOf(
          {
            networkLimit: networkLimit ?? 'none',
            powerSaver: powerSaver ?? false,
            visibility: visibility ?? (isAppVisible ? 'active' : 'background'),
          },
          visualCapabilities,
        ),
      ),
    [networkLimit, powerSaver, visibility, visualCapabilities, isAppVisible],
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
