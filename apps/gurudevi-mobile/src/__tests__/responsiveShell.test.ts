import { describe, expect, it } from 'vitest';
import {
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
});
