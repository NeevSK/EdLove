import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const verger = vi.hoisted(() => ({
  snapshot: null as null | Record<string, unknown>,
}));
vi.mock('@repo/verger-react', () => ({ useVergerSnapshot: () => verger.snapshot }));

// Verger's reading for a mid device on a fast, steady link, in the foreground.
const MID_DEVICE = {
  levels: { blur: 1 },
  capacityClass: 'mid',
  networkLimit: 'none',
  powerSaver: false,
  visibility: 'active',
};

import { WorkspaceWallpaperLayer } from '../../app/(sanctuary)/components/WorkspaceWallpaperLayer';

const WALLPAPER = {
  provider: 'cloudinary' as const,
  url: 'https://res.cloudinary.com/example/image/upload/wallpaper.jpg',
  publicId: 'gurudevi/user/wallpapers/example',
  width: 1600,
  height: 900,
};

describe('WorkspaceWallpaperLayer', () => {
  it('requests no wallpaper until verger is known (server render, hydration)', () => {
    verger.snapshot = null;
    render(<WorkspaceWallpaperLayer wallpaper={WALLPAPER} />);
    expect(screen.queryByTestId('workspace-wallpaper')).toBeNull();
  });

  it("shows a mid device the balanced wallpaper, as verger's view allows", () => {
    verger.snapshot = MID_DEVICE;
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
