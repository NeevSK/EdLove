declare global {
  // The native shell or a remote-config bridge may set this emergency override.
  var __GURUDEVI_VISUAL_SAFE_MODE__: boolean | undefined;
}

export function isVisualSafeModeEnabled(): boolean {
  return (
    globalThis.__GURUDEVI_VISUAL_SAFE_MODE__ === true ||
    process.env.EXPO_PUBLIC_GURUDEVI_VISUAL_SAFE_MODE === 'true'
  );
}
