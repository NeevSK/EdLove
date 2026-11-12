import type { ScreenKind } from '@repo/ui/theme/scene';

/**
 * What kind of screen a path is, for the ground policy (how much of the
 * world's ground shows is decided there, by the person's Visual settings and
 * by the phone's budget, never here). Focused work wants calm; a room's home is
 * its front floor; everything else is a page inside a room.
 */
const FOCUS = ['/settings', '/notifications', '/reading', '/account-recovery', '/form-builder'];

export function screenKindForPath(
  pathname: string,
  { roomRoot }: { roomRoot: boolean },
): ScreenKind {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (FOCUS.some((q) => path === q || path.startsWith(`${q}/`))) return 'focus';
  return roomRoot ? 'home' : 'inside';
}
