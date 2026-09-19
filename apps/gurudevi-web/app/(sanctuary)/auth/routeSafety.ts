const sanctuaryPath = '/self';

export function safeReturnPath(candidate: string | null): string {
  if (!candidate) return sanctuaryPath;
  try {
    const origin = 'https://gurudevi.invalid';
    const destination = new URL(candidate, origin);
    if (destination.origin !== origin || !destination.pathname.startsWith('/'))
      return sanctuaryPath;
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return sanctuaryPath;
  }
}

export function signInPath(returnPath = sanctuaryPath): string {
  return `/sign-in?returnTo=${encodeURIComponent(safeReturnPath(returnPath))}`;
}
