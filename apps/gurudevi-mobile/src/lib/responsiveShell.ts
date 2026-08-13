import { colors, corners, shadows, spacing, typography } from '@repo/ui/theme';

export type ResponsiveShellMode =
  | 'mobile'
  | 'nativeTablet'
  | 'webCompact'
  | 'webTabletCompact'
  | 'webDesktop';

/**
 * Web shell bands are deliberately about available composition space, not
 * device names. The compact band keeps navigation horizontal, the middle
 * band reserves room for an icon rail, and desktop gets the full sanctuary
 * rail with optional labels.
 */
export const WEB_SHELL_BREAKPOINTS = {
  compactMaxWidth: 920,
  tabletMaxWidth: 1280,
} as const;

function withAlpha(hexColor: string, alpha: number) {
  const value = hexColor.replace('#', '');
  const normalized =
    value.length === 3
      ? value
          .split('')
          .map((part) => `${part}${part}`)
          .join('')
      : value;
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

/** Semantic values shared by every web shell band. */
export const webShellTokens = {
  color: {
    canvas: colors.vellum,
    canvasWarm: colors.dawnWhite,
    chrome: colors.ink,
    chromeDeep: colors.obsidian,
    chromeRaised: colors.shroud,
    chromeText: colors.sacredWhite,
    chromeTextMuted: colors.starlightGray,
    chromeBorder: withAlpha(colors.sacredWhite, 0.12),
    surface: colors.silk,
    surfaceWarm: colors.dawnWhite,
    surfaceBorder: colors.glass.light.border,
    text: colors.inkTruth,
    textSecondary: colors.bark,
    active: colors.sageGreen,
    activeSurface: withAlpha(colors.sageGreen, 0.16),
    activeBorder: withAlpha(colors.sageGreen, 0.5),
    controlSurface: withAlpha(colors.inkTruth, 0.08),
    badge: colors.templeGold,
    badgeText: colors.ink,
    scrim: withAlpha(colors.ink, 0.58),
    transparent: colors.transparent,
  },
  size: {
    railExpanded: 248,
    railCollapsed: 84,
    control: 40,
    navItem: 48,
    modalMaxWidth: 500,
    modalMinHeight: 400,
    contentMaxWidth: 1280,
  },
  space: {
    compactOuter: spacing.md,
    tabletOuter: spacing.lg,
    desktopOuter: spacing.xl,
    compactGap: spacing.md,
    shellGap: spacing.lg,
    navGap: spacing.sm,
    contentGap: spacing.lg,
  },
  radius: {
    control: corners.full,
    navItem: corners.comfortable,
    surface: corners.generous,
  },
  type: {
    brand: typography.fontSize.lg,
    pageTitleCompact: typography.fontSize.xl,
    pageTitleWide: typography.fontSize['2xl'],
    navLabel: typography.fontSize.sm,
    caption: typography.fontSize.xs,
  },
  elevation: shadows.sm,
} as const;

export type ResponsiveShellConfig = {
  mode: ResponsiveShellMode;
  isCompact: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  navigation: {
    layout: 'topbar' | 'rail';
    railWidth: number | '100%';
    labelsVisible: boolean;
    canToggleRail: boolean;
  };
  content: {
    outerPadding: number;
    gap: number;
    maxWidth: number | '100%';
    surfacePadding: number;
    surfaceRadius: number;
    surfaceBackground: string;
    titleSize: number;
  };
};

export function resolveResponsiveShellMode(platform: string, width: number): ResponsiveShellMode {
  const isWeb = platform === 'web';

  if (isWeb) {
    if (width < WEB_SHELL_BREAKPOINTS.compactMaxWidth) return 'webCompact';
    if (width < WEB_SHELL_BREAKPOINTS.tabletMaxWidth) return 'webTabletCompact';
    return 'webDesktop';
  }

  if (width >= 768) return 'nativeTablet';
  return 'mobile';
}

export function getResponsiveShellConfig(
  mode: ResponsiveShellMode,
  railExpanded = true,
): ResponsiveShellConfig {
  const isCompact = mode === 'webCompact';
  const isTablet = mode === 'webTabletCompact';
  const isDesktop = mode === 'webDesktop';

  return {
    mode,
    isCompact,
    isTablet,
    isDesktop,
    navigation: getNavigationConfig(mode, railExpanded),
    content: getContentConfig(mode),
  };
}

function getNavigationConfig(
  mode: ResponsiveShellMode,
  railExpanded: boolean,
): ResponsiveShellConfig['navigation'] {
  if (mode === 'webCompact') {
    return {
      layout: 'topbar',
      railWidth: '100%',
      labelsVisible: false,
      canToggleRail: false,
    };
  }

  if (mode === 'webTabletCompact') {
    return {
      layout: 'rail',
      railWidth: webShellTokens.size.railCollapsed,
      labelsVisible: false,
      canToggleRail: false,
    };
  }

  return {
    layout: 'rail',
    railWidth: railExpanded ? webShellTokens.size.railExpanded : webShellTokens.size.railCollapsed,
    labelsVisible: railExpanded,
    canToggleRail: true,
  };
}

function getContentConfig(mode: ResponsiveShellMode): ResponsiveShellConfig['content'] {
  const isCompact = mode === 'webCompact';
  const isTablet = mode === 'webTabletCompact';
  const isDesktop = mode === 'webDesktop';
  const outerPadding = isCompact
    ? webShellTokens.space.compactOuter
    : isTablet
      ? webShellTokens.space.tabletOuter
      : webShellTokens.space.desktopOuter;

  return {
    outerPadding,
    gap: isCompact ? webShellTokens.space.compactGap : webShellTokens.space.contentGap,
    maxWidth: isDesktop ? webShellTokens.size.contentMaxWidth : '100%',
    surfacePadding: isCompact ? 0 : outerPadding,
    surfaceRadius: isCompact ? 0 : webShellTokens.radius.surface,
    surfaceBackground: isCompact ? webShellTokens.color.transparent : webShellTokens.color.surface,
    titleSize: isCompact ? webShellTokens.type.pageTitleCompact : webShellTokens.type.pageTitleWide,
  };
}

export function isWebLikeTabletMode(mode: ResponsiveShellMode) {
  return mode === 'webTabletCompact' || mode === 'webDesktop';
}
