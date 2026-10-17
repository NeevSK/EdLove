import { describe, expect, it } from 'vitest';
import { buildResponsiveWallpaperUrl, resolveWallpaperPresentation } from './wallpaper';

const wallpaper = {
  provider: 'cloudinary' as const,
  url: 'https://res.cloudinary.com/example/image/upload/wallpaper.jpg',
  publicId: 'gurudevi/user/wallpapers/example',
  width: 1600,
  height: 900,
};

describe('wallpaper visual policy', () => {
  it('derives a bounded Cloudinary transform without accepting another host', () => {
    expect(buildResponsiveWallpaperUrl(wallpaper.url, 1280)).toContain(
      '/image/upload/c_limit,w_1280,q_auto,f_auto/',
    );
    expect(buildResponsiveWallpaperUrl('https://example.com/wallpaper.jpg', 1280)).toBe(
      'https://example.com/wallpaper.jpg',
    );
  });
  it('removes wallpaper work from the essential budget', () => {
    expect(
      resolveWallpaperPresentation(wallpaper, {
        quality: 'essential',
        allowAnimation: false,
        allowBlur: false,
        maxCanvasPixels: 0,
        maxDevicePixelRatio: 1,
        particleCount: 0,
        minFrameIntervalMs: 1000,
      }),
    ).toEqual({ enabled: false, allowBlur: false, opacity: 0, url: null });
  });

  it('keeps a static low-opacity image for balanced devices', () => {
    expect(
      resolveWallpaperPresentation(wallpaper, {
        quality: 'balanced',
        allowAnimation: true,
        allowBlur: false,
        maxCanvasPixels: 1_500_000,
        maxDevicePixelRatio: 1,
        particleCount: 12,
        minFrameIntervalMs: 50,
      }),
    ).toMatchObject({
      enabled: true,
      allowBlur: false,
      opacity: 0.12,
      url: expect.stringContaining('c_limit,w_1280,q_auto,f_auto'),
    });
  });

  it('keeps a still wallpaper when the visual budget disables animation', () => {
    expect(
      resolveWallpaperPresentation(wallpaper, {
        quality: 'rich',
        allowAnimation: false,
        allowBlur: true,
        maxCanvasPixels: 3_000_000,
        maxDevicePixelRatio: 1.5,
        particleCount: 30,
        minFrameIntervalMs: 1000,
      }),
    ).toMatchObject({ enabled: true, allowBlur: true, opacity: 0.2 });
  });

  it('scales the requested asset width to the viewport and pixel-ratio budget', () => {
    expect(
      resolveWallpaperPresentation(
        wallpaper,
        {
          quality: 'balanced',
          allowAnimation: true,
          allowBlur: false,
          maxCanvasPixels: 1_500_000,
          maxDevicePixelRatio: 1,
          particleCount: 12,
          minFrameIntervalMs: 50,
        },
        390,
      ).url,
    ).toContain('c_limit,w_390,q_auto,f_auto');
    expect(
      resolveWallpaperPresentation(
        wallpaper,
        {
          quality: 'rich',
          allowAnimation: true,
          allowBlur: true,
          maxCanvasPixels: 3_000_000,
          maxDevicePixelRatio: 1.5,
          particleCount: 30,
          minFrameIntervalMs: 33,
        },
        390,
      ).url,
    ).toContain('c_limit,w_585,q_auto,f_auto');
  });
});
