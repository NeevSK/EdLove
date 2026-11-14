import type { GroundStage } from '@repo/ui/theme/scene';

/**
 * Which ground stage a path is (room, screen, focus), for the shared ground
 * policy. How much of the world's ground shows is decided there, by the
 * person's Visual settings and by the phone's budget, never here.
 */
const FOCUS = ['/settings', '/notifications', '/reading', '/account-recovery', '/form-builder'];

export function groundStageForPath(
  pathname: string,
  { roomRoot }: { roomRoot: boolean },
): GroundStage {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (FOCUS.some((q) => path === q || path.startsWith(`${q}/`))) return 'focus';
  return roomRoot ? 'room' : 'screen';
}
