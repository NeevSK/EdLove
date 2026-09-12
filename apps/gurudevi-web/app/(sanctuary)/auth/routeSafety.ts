const sanctuaryPath = '/sanctuary';

export function safeReturnPath(candidate: string | null): string {
  if (!candidate?.startsWith('/') || candidate.startsWith('//')) return sanctuaryPath;
  return candidate;
}

export function signInPath(returnPath = sanctuaryPath): string {
  return `/sign-in?returnTo=${encodeURIComponent(safeReturnPath(returnPath))}`;
}
