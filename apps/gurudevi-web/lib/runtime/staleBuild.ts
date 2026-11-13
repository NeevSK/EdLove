/**
 * After a release, a tab still running the previous build asks for code files that no longer
 * exist (each build's files are named by content). Loading the page again picks up the new build.
 * One reload per minute at most, so a file that is truly missing shows the error screen instead of
 * reloading forever.
 */
const RELOADED_AT = 'gurudevi_stale_build_reload';
const WINDOW_MS = 60_000;

const STALE_BUILD =
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/i;

export function isStaleBuildError(error: unknown): boolean {
  return error instanceof Error && STALE_BUILD.test(error.message);
}

/** Reloads once for a stale build; false when it already tried recently. */
export function reloadForNewBuild(
  now = Date.now(),
  storage: Storage = window.sessionStorage,
): boolean {
  try {
    const last = storage.getItem(RELOADED_AT);
    if (last !== null && now - Number(last) < WINDOW_MS) return false;
    storage.setItem(RELOADED_AT, String(now));
  } catch {
    // Without storage there is no loop guard; show the error screen instead.
    return false;
  }
  window.location.reload();
  return true;
}

/** Vite reports a failed preload of a split chunk as `vite:preloadError`. */
export function watchForNewBuild(): void {
  window.addEventListener('vite:preloadError', (event) => {
    if (reloadForNewBuild()) event.preventDefault();
  });
}
