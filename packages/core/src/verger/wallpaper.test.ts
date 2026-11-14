import { describe, expect, it } from 'vitest';
import { buildResponsiveWallpaperUrl, type WallpaperReading, wallpaperOf } from './wallpaper';

const wallpaper = {
  provider: 'cloudinary' as const,
  url: 'https://res.cloudinary.com/example/image/upload/wallpaper.jpg',
  publicId: 'gurudevi/user/wallpapers/example',
  width: 1600,
  height: 900,
};

const calm: WallpaperReading = { networkLimit: 'none', powerSaver: false, visibility: 'active' };
const high = { deviceTier: 'high', effectiveFidelity: 'high', allowBlur: true } as const;
const mid = { deviceTier: 'medium', effectiveFidelity: 'high', allowBlur: false } as const;
const low = { deviceTier: 'low', effectiveFidelity: 'low', allowBlur: false } as const;
const OFF = { enabled: false, allowBlur: false, opacity: 0, url: null };

describe('the wallpaper, as verger allows it', () => {
  it('derives a bounded Cloudinary transform without accepting another host', () => {
    expect(buildResponsiveWallpaperUrl(wallpaper.url, 1280)).toContain(
      '/image/upload/c_limit,w_1280,q_auto,f_auto/',
    );
    expect(buildResponsiveWallpaperUrl('https://example.com/wallpaper.jpg', 1280)).toBe(
      'https://example.com/wallpaper.jpg',
    );
  });

  it('removes wallpaper work where fidelity is low (a low phone)', () => {
    expect(wallpaperOf(wallpaper, low, calm)).toEqual(OFF);
  });

  it('keeps a static low-opacity image for mid phones', () => {
    expect(wallpaperOf(wallpaper, mid, calm)).toMatchObject({
      enabled: true,
      allowBlur: false,
      opacity: 0.12,
      url: expect.stringContaining('c_limit,w_1280,q_auto,f_auto'),
    });
  });

  it('gives a high phone the sharp image, blurred only when the blur lever allows', () => {
    expect(wallpaperOf(wallpaper, high, calm)).toMatchObject({
      enabled: true,
      allowBlur: true,
      opacity: 0.2,
    });
    expect(wallpaperOf(wallpaper, { ...high, allowBlur: false }, calm).allowBlur).toBe(false);
  });

  it('waits whenever data, energy or attention is short', () => {
    for (const networkLimit of ['offline', 'data-saver', 'slow', 'unstable'] as const)
      expect(wallpaperOf(wallpaper, high, { ...calm, networkLimit })).toEqual(OFF);
    expect(wallpaperOf(wallpaper, high, { ...calm, powerSaver: true })).toEqual(OFF);
    expect(wallpaperOf(wallpaper, high, { ...calm, visibility: 'background' })).toEqual(OFF);
  });

  it('scales the requested asset width to the viewport and pixel-ratio budget', () => {
    expect(wallpaperOf(wallpaper, mid, calm, 390).url).toContain('c_limit,w_390,q_auto,f_auto');
    expect(wallpaperOf(wallpaper, high, calm, 390).url).toContain('c_limit,w_585,q_auto,f_auto');
  });
});
