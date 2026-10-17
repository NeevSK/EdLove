import type { WorkspaceWallpaper as WorkspaceWallpaperAsset } from '@repo/core/types';
import { WorkspaceWallpaper } from '@repo/ui/components/workspace/WorkspaceWallpaper';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

const runtime = vi.hoisted(() => ({
  reality: {
    deviceTier: 'medium' as 'low' | 'medium' | 'high',
    totalMemoryGB: 4,
    networkQuality: 'good' as 'good' | 'fair' | 'poor' | 'offline' | 'excellent',
    isDataSaverMode: false,
    isBatterySaverMode: false,
    isReducedMotionEnabled: false,
  },
  imageCapabilities: {
    quality: 'reduced' as 'full' | 'reduced' | 'essential',
    imageCachePolicy: 'disk' as 'disk' | 'memory-disk',
    imageDecodeFormat: 'rgb' as 'rgb' | 'argb',
  },
}));

vi.mock('@repo/ui/context/RealityProvider', () => ({
  useRealityOptional: () => ({ reality: runtime.reality }),
}));

vi.mock('@repo/ui/context/VisualCapabilities', () => ({
  useVisualCapabilities: () => runtime.imageCapabilities,
}));

vi.mock('@repo/ui/primitives', () => ({ View: 'View' }));

vi.mock('expo-image', () => ({ Image: 'Image' }));

vi.mock('react-native', () => ({
  AppState: {
    currentState: 'active',
    addEventListener: () => ({ remove: () => undefined }),
  },
  Platform: { OS: 'android' },
  StyleSheet: { absoluteFill: { position: 'absolute' } },
  useWindowDimensions: () => ({ width: 400, height: 800, scale: 1, fontScale: 1 }),
}));

const wallpaper: WorkspaceWallpaperAsset = {
  provider: 'cloudinary',
  url: 'https://res.cloudinary.com/example/image/upload/wallpaper.jpg',
  publicId: 'gurudevi/user/wallpapers/example',
  width: 1200,
  height: 800,
};

describe('WorkspaceWallpaper native budget integration (G3)', () => {
  let renderer: ReactTestRenderer | undefined;

  afterEach(() => {
    act(() => renderer?.unmount());
    renderer = undefined;
    runtime.reality.deviceTier = 'medium';
    runtime.reality.networkQuality = 'good';
    runtime.reality.isBatterySaverMode = false;
    runtime.reality.isDataSaverMode = false;
    runtime.reality.isReducedMotionEnabled = false;
    runtime.imageCapabilities.quality = 'reduced';
  });

  it('requests a viewport-sized, low-priority image under the balanced budget', () => {
    act(() => {
      renderer = create(<WorkspaceWallpaper wallpaper={wallpaper} />);
    });

    const image = renderer?.root.find((node) => node.props.priority === 'low');
    expect(image?.props.source.uri).toContain('c_limit,w_400');
    expect(image?.props.priority).toBe('low');
    expect(image?.props.blurRadius).toBe(0);
    expect(image?.props.transition).toBe(180);
  });

  it('removes wallpaper rendering for a low-memory device', () => {
    runtime.reality.deviceTier = 'low';

    act(() => {
      renderer = create(<WorkspaceWallpaper wallpaper={wallpaper} />);
    });

    expect(renderer?.root.findAll((node) => node.props.priority === 'low')).toHaveLength(0);
  });

  it('removes wallpaper rendering while battery saver is active', () => {
    runtime.reality.isBatterySaverMode = true;

    act(() => {
      renderer = create(<WorkspaceWallpaper wallpaper={wallpaper} />);
    });

    expect(renderer?.root.findAll((node) => node.props.priority === 'low')).toHaveLength(0);
  });
});
