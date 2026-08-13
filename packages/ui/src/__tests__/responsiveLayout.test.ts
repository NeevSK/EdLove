import {
  isTabletViewport,
  resolveNativeRendererWidth,
  resolveOrientation,
  responsiveBreakpoints,
} from '@repo/ui/components/layout';

describe('orientation-aware responsive layout', () => {
  test('keeps portrait phone and tablet classification stable', () => {
    expect(resolveOrientation(390, 844)).toBe('portrait');
    expect(isTabletViewport(390, 844)).toBe(false);
    expect(isTabletViewport(responsiveBreakpoints.tabletMinWidth, 1024)).toBe(true);
  });

  test('does not promote a landscape phone into the tablet renderer', () => {
    expect(resolveOrientation(812, 375)).toBe('landscape');
    expect(isTabletViewport(812, 375)).toBe(false);
    expect(resolveNativeRendererWidth(812, 375)).toBe(responsiveBreakpoints.mobileMaxWidth);
  });

  test('recognizes a landscape tablet by its named short-edge threshold', () => {
    expect(isTabletViewport(1024, responsiveBreakpoints.tabletLandscapeMinHeight)).toBe(true);
    expect(isTabletViewport(800, responsiveBreakpoints.tabletLandscapeMinHeight - 1)).toBe(false);
    expect(resolveNativeRendererWidth(1024, 600)).toBe(1024);
  });
});
