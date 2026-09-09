import { colors, corners, shadows, spacing, typography } from '@repo/ui/theme';

export type ResponsiveShellMode =
  | 'mobile'
  | 'nativeTablet'
  | 'webCompact'
  | 'webTabletCompact'
  | 'webDesktop';

export type NativeShellOrientation = 'portrait' | 'landscape';

/** Native composition modes. Landscape is split by device class, not only by orientation. */
export type NativeShellMode =
  | 'phonePortrait'
  | 'phoneLandscape'
  | 'phoneLandscapeShort'
  | 'tabletPortrait'
  | 'tabletLandscape';

export type NativeShellTextWidthOptions = {
  /** Width occupied by a leading icon or control. */
  leadingWidth?: number;
  /** Width occupied by a trailing action or control. */
  trailingWidth?: number;
  /** Gap between text and an adjacent control. */
  controlGap?: number;
  /** Horizontal inset reserved by the containing surface. */
  horizontalPadding?: number;
};

export type NativeShellConfig = {
  orientation: NativeShellOrientation;
  isLandscape: boolean;
  mode: NativeShellMode;
  isTablet: boolean;
  isShortHeight: boolean;
  header: {
    horizontalPadding: number;
    subtitleVisible: boolean;
  };
  tabBar: {
    minHeight: number;
    paddingTop: number;
    paddingBottom: number;
  };
  modal: {
    contentPadding: number;
    minHeight: number;
  };
  /** Additive contract for screens that opt into native landscape composition. */
  spacing: {
    content: number;
    section: number;
    chrome: number;
  };
  typography: {
    titleSize: number;
    titleLineHeight: number;
    bodySize: number;
    bodyLineHeight: number;
    chromeSize: number;
  };
  visibleChrome: {
    subtitle: boolean;
    tabLabels: boolean;
    secondaryPane: boolean;
  };
};

export const NATIVE_SHELL_BREAKPOINTS = {
  tabletMinWidth: 768,
  shortLandscapeMaxHeight: 480,
} as const;

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

export const NATIVE_SHELL_TOKENS = {
  header: {
    portraitPadding: spacing.md,
    landscapePadding: spacing.lg,
  },
  tabBar: {
    portraitHeight: 64,
    landscapeHeight: 52,
    portraitTop: spacing.sm,
    landscapeTop: spacing.xs,
  },
  modal: {
    portraitPadding: spacing.md,
    landscapePadding: spacing.lg,
    portraitMinHeight: 400,
    landscapeMinHeight: 280,
  },
} as const;

export function getNativeShellConfig(
  width: number,
  height: number,
  bottomInset = 0,
): NativeShellConfig {
  const isLandscape = width > height;
  const isTablet = Math.min(width, height) >= NATIVE_SHELL_BREAKPOINTS.tabletMinWidth;
  const isShortHeight = isLandscape && height <= NATIVE_SHELL_BREAKPOINTS.shortLandscapeMaxHeight;
  const mode: NativeShellMode = isTablet
    ? isLandscape
      ? 'tabletLandscape'
      : 'tabletPortrait'
    : isLandscape
      ? isShortHeight
        ? 'phoneLandscapeShort'
        : 'phoneLandscape'
      : 'phonePortrait';
  const isShortLandscape = mode === 'phoneLandscapeShort';

  return {
    orientation: isLandscape ? 'landscape' : 'portrait',
    isLandscape,
    mode,
    isTablet,
    isShortHeight,
    header: {
      horizontalPadding: isLandscape
        ? NATIVE_SHELL_TOKENS.header.landscapePadding
        : NATIVE_SHELL_TOKENS.header.portraitPadding,
      subtitleVisible: !isLandscape,
    },
    tabBar: {
      minHeight:
        (isLandscape
          ? NATIVE_SHELL_TOKENS.tabBar.landscapeHeight
          : NATIVE_SHELL_TOKENS.tabBar.portraitHeight) + bottomInset,
      paddingTop: isLandscape
        ? NATIVE_SHELL_TOKENS.tabBar.landscapeTop
        : NATIVE_SHELL_TOKENS.tabBar.portraitTop,
      paddingBottom: bottomInset,
    },
    modal: {
      contentPadding: isLandscape
        ? NATIVE_SHELL_TOKENS.modal.landscapePadding
        : NATIVE_SHELL_TOKENS.modal.portraitPadding,
      minHeight: isLandscape
        ? NATIVE_SHELL_TOKENS.modal.landscapeMinHeight
        : NATIVE_SHELL_TOKENS.modal.portraitMinHeight,
    },
    spacing: {
      content: isShortLandscape ? spacing.sm : isLandscape ? spacing.md : spacing.lg,
      section: isShortLandscape ? spacing.md : isLandscape ? spacing.lg : spacing.xl,
      chrome: isShortLandscape ? spacing.xs : isLandscape ? spacing.sm : spacing.md,
    },
    typography: {
      // Keep body text at the readable 14sp floor; reclaim height from chrome.
      titleSize: isShortLandscape
        ? typography.fontSize.lg
        : isLandscape
          ? typography.fontSize.xl
          : typography.fontSize['2xl'],
      titleLineHeight: isShortLandscape
        ? typography.fontSize.lg * typography.lineHeight.tight
        : isLandscape
          ? typography.fontSize.xl * typography.lineHeight.tight
          : typography.fontSize['2xl'] * typography.lineHeight.tight,
      bodySize: typography.fontSize.sm,
      bodyLineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
      chromeSize: typography.fontSize.xs,
    },
    visibleChrome: {
      subtitle: !isLandscape,
      tabLabels: !isShortLandscape,
      secondaryPane: isTablet && isLandscape,
    },
  };
}

/**
 * Returns the usable width for localized text beside optional controls.
 * Callers should apply the result as maxWidth and allow flexShrink: 1;
 * no locale-specific character count is assumed.
 */
export function getNativeShellTextWidth(
  containerWidth: number,
  options: NativeShellTextWidthOptions = {},
): number {
  const {
    leadingWidth = 0,
    trailingWidth = 0,
    controlGap = spacing.sm,
    horizontalPadding = spacing.md,
  } = options;
  const reservedControls =
    leadingWidth > 0 && trailingWidth > 0
      ? leadingWidth + trailingWidth + controlGap * 2
      : leadingWidth + trailingWidth + (leadingWidth > 0 || trailingWidth > 0 ? controlGap : 0);
  return Math.max(0, containerWidth - horizontalPadding * 2 - reservedControls);
}

/** Backward-friendly semantic alias for callers working with translated copy. */
export const getLocalizedTextWidth = getNativeShellTextWidth;

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
    focusRing: colors.sanctuarySaffron,
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
