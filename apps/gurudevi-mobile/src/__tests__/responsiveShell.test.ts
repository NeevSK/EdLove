import { describe, expect, it } from 'vitest';
import {
  getNativeShellConfig,
  getNativeShellTextWidth,
  getResponsiveShellConfig,
  resolveResponsiveShellMode,
  WEB_SHELL_BREAKPOINTS,
} from '@/lib/responsiveShell';

describe('responsive web shell', () => {
  it('keeps the three web bands explicit at their boundaries', () => {
    expect(resolveResponsiveShellMode('web', WEB_SHELL_BREAKPOINTS.compactMaxWidth - 1)).toBe(
      'webCompact',
    );
    expect(resolveResponsiveShellMode('web', WEB_SHELL_BREAKPOINTS.compactMaxWidth)).toBe(
      'webTabletCompact',
    );
    expect(resolveResponsiveShellMode('web', WEB_SHELL_BREAKPOINTS.tabletMaxWidth - 1)).toBe(
      'webTabletCompact',
    );
    expect(resolveResponsiveShellMode('web', WEB_SHELL_BREAKPOINTS.tabletMaxWidth)).toBe(
      'webDesktop',
    );
  });

  it('keeps native resolution independent from web shell bands', () => {
    expect(resolveResponsiveShellMode('ios', 390)).toBe('mobile');
    expect(resolveResponsiveShellMode('android', 768)).toBe('nativeTablet');
  });

  it('uses top navigation for compact web and an icon rail for tablet web', () => {
    const compact = getResponsiveShellConfig('webCompact');
    const tablet = getResponsiveShellConfig('webTabletCompact');
    const desktopCollapsed = getResponsiveShellConfig('webDesktop', false);
    const desktopExpanded = getResponsiveShellConfig('webDesktop', true);

    expect(compact.navigation).toMatchObject({
      layout: 'topbar',
      railWidth: '100%',
      labelsVisible: false,
      canToggleRail: false,
    });
    expect(tablet.navigation).toMatchObject({
      layout: 'rail',
      labelsVisible: false,
      canToggleRail: false,
    });
    expect(desktopCollapsed.navigation.railWidth).toBeLessThan(
      desktopExpanded.navigation.railWidth as number,
    );
    expect(desktopExpanded.navigation.labelsVisible).toBe(true);
  });

  it('gives landscape native shells less vertical chrome while preserving the safe area', () => {
    const portrait = getNativeShellConfig(390, 844, 34);
    const landscape = getNativeShellConfig(844, 500, 21);

    expect(portrait).toMatchObject({
      orientation: 'portrait',
      header: { subtitleVisible: true },
      tabBar: { minHeight: 98, paddingBottom: 34 },
      modal: { minHeight: 400 },
    });
    expect(landscape).toMatchObject({
      orientation: 'landscape',
      mode: 'phoneLandscape',
      isShortHeight: false,
      header: { subtitleVisible: false },
      tabBar: { minHeight: 73, paddingBottom: 21 },
      modal: { minHeight: 280 },
    });
  });

  it('defines compact chrome and readable type for short-height phone landscape', () => {
    const shell = getNativeShellConfig(844, 390, 21);

    expect(shell).toMatchObject({
      mode: 'phoneLandscapeShort',
      isTablet: false,
      isShortHeight: true,
      visibleChrome: {
        subtitle: false,
        tabLabels: false,
        secondaryPane: false,
      },
      typography: {
        titleSize: 18,
        bodySize: 14,
      },
    });
    expect(shell.spacing.content).toBeLessThan(shell.spacing.section);
  });

  it('keeps tablet landscape explicit and permits a secondary pane', () => {
    const shell = getNativeShellConfig(1024, 768, 0);

    expect(shell).toMatchObject({
      mode: 'tabletLandscape',
      isTablet: true,
      isShortHeight: false,
      visibleChrome: { secondaryPane: true, tabLabels: true },
    });
  });

  it('derives localization-safe text width from available space and controls', () => {
    expect(
      getNativeShellTextWidth(390, {
        leadingWidth: 24,
        trailingWidth: 40,
      }),
    ).toBe(278);
    expect(getNativeShellTextWidth(200, { trailingWidth: 220 })).toBe(0);
  });
});
