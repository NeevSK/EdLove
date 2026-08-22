/**
 * Transfers control from Expo's native splash to the already-committed React
 * shell. Scheduling on the next frame guarantees that hiding cannot reveal an
 * unpainted root view, while deliberately keeping auth and remote work out of
 * the decision.
 */
export interface NativeSplashHandoffDependencies {
  requestFrame: (callback: () => void) => number;
  cancelFrame: (handle: number) => void;
  hide: () => Promise<unknown>;
  onError: (error: unknown) => void;
}

export function scheduleNativeSplashHandoff({
  requestFrame,
  cancelFrame,
  hide,
  onError,
}: NativeSplashHandoffDependencies): () => void {
  let active = true;
  const frame = requestFrame(() => {
    if (!active) return;
    void hide().catch(onError);
  });

  return () => {
    active = false;
    cancelFrame(frame);
  };
}
