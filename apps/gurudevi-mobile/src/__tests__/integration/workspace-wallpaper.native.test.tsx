import type { WorkspaceWallpaper as WorkspaceWallpaperAsset } from '@repo/core/types';
import { WorkspaceWallpaper } from '@repo/ui/components/workspace/WorkspaceWallpaper';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

const runtime = vi.hoisted(() => ({
  snapshot: {
    networkLimit: 'none' as 'none' | 'slow' | 'unstable' | 'data-saver' | 'offline',
    powerSaver: false,
    visibility: 'active' as 'active' | 'inactive' | 'background',
  },
  imageCapabilities: {
    deviceTier: 'medium' as 'low' | 'medium' | 'high',
    effectiveFidelity: 'high' as 'low' | 'high',
    allowBlur: false,
    allowSubtleAnimation: true,
    quality: 'reduced' as 'full' | 'reduced' | 'essential',
    imageCachePolicy: 'disk' as 'disk' | 'memory-disk',
    imageDecodeFormat: 'rgb' as 'rgb' | 'argb',
  },
}));

vi.mock('@repo/verger-react', () => ({
  useVergerSnapshot: () => runtime.snapshot,
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
    runtime.snapshot.networkLimit = 'none';
    runtime.snapshot.powerSaver = false;
    runtime.snapshot.visibility = 'active';
    runtime.imageCapabilities.deviceTier = 'medium';
    runtime.imageCapabilities.effectiveFidelity = 'high';
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
    // A low phone's fidelity is low under verger.
    runtime.imageCapabilities.deviceTier = 'low';
    runtime.imageCapabilities.effectiveFidelity = 'low';

    act(() => {
      renderer = create(<WorkspaceWallpaper wallpaper={wallpaper} />);
    });

    expect(renderer?.root.findAll((node) => node.props.priority === 'low')).toHaveLength(0);
  });

  it('removes wallpaper rendering while battery saver is active', () => {
    runtime.snapshot.powerSaver = true;

    act(() => {
      renderer = create(<WorkspaceWallpaper wallpaper={wallpaper} />);
    });

    expect(renderer?.root.findAll((node) => node.props.priority === 'low')).toHaveLength(0);
  });
});
