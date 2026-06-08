export type ResponsiveShellMode =
  | 'mobile'
  | 'nativeTablet'
  | 'webCompact'
  | 'webTabletCompact'
  | 'webDesktop';

export function resolveResponsiveShellMode(platform: string, width: number): ResponsiveShellMode {
  const isWeb = platform === 'web';

  if (isWeb) {
    if (width < 1180) return 'webCompact';
    if (width < 1440) return 'webTabletCompact';
    return 'webDesktop';
  }

  if (width >= 768) return 'nativeTablet';
  return 'mobile';
}

export function isWebLikeTabletMode(mode: ResponsiveShellMode) {
  return mode === 'webTabletCompact' || mode === 'webDesktop';
}
