import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../lib/runtime/useBrowserVisualBudget', () => ({
  useBrowserVisualBudget: () => ({
    quality: 'balanced',
    allowBlur: false,
    particleCount: 0,
    minFrameIntervalMs: 50,
    maxCanvasPixels: 1_000_000,
    maxDevicePixelRatio: 1,
  }),
}));

import { WorkspaceWallpaperLayer } from '../../app/(sanctuary)/components/WorkspaceWallpaperLayer';

describe('WorkspaceWallpaperLayer', () => {
  it('uses the shared balanced wallpaper presentation policy', () => {
    render(
      <WorkspaceWallpaperLayer
        wallpaper={{
          provider: 'cloudinary',
          url: 'https://res.cloudinary.com/example/image/upload/wallpaper.jpg',
          publicId: 'gurudevi/user/wallpapers/example',
          width: 1600,
          height: 900,
        }}
      />,
    );

    const layer = screen.getByTestId('workspace-wallpaper');
    expect(layer.getAttribute('aria-hidden')).toBe('true');
    expect((layer as HTMLDivElement).style.opacity).toBe('0.12');
    expect((layer as HTMLDivElement).style.backgroundSize).toBe('cover');
    expect(layer.getAttribute('style')).toContain('c_limit,w_1024,q_auto,f_auto');
  });
});
