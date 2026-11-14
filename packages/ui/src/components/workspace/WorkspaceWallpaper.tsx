import type { WorkspaceWallpaper as WorkspaceWallpaperAsset } from '@repo/core/types';
import { type WallpaperReading, wallpaperOf } from '@repo/core/verger';
import { useVisualCapabilities } from '@repo/ui/context/VisualCapabilities';
import { View } from '@repo/ui/primitives';
import { useVergerSnapshot } from '@repo/verger-react';
import { Image } from 'expo-image';
import { Platform, StyleSheet, useWindowDimensions } from 'react-native';

const UNKNOWN_READING: WallpaperReading = {
  networkLimit: 'none',
  powerSaver: false,
  visibility: 'active',
};

export function WorkspaceWallpaper({
  wallpaper,
}: Readonly<{ wallpaper?: WorkspaceWallpaperAsset }>) {
  const visualCapabilities = useVisualCapabilities();
  const snapshot = useVergerSnapshot();
  const { width } = useWindowDimensions();
  // Verger's readings decide (its floors while it is off, which hear app state too); with no
  // verger bound nothing is known, so nothing is limited.
  const reading: WallpaperReading = snapshot ?? UNKNOWN_READING;
  const presentation = wallpaperOf(wallpaper, visualCapabilities, reading, width);

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
        transition={visualCapabilities.allowSubtleAnimation ? 180 : 0}
      />
    </View>
  );
}
