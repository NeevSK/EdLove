import type { ScenePresence } from '@repo/ui/theme/scene';

/**
 * How loud the world's ground is behind a screen. Every screen stands on the
 * world's ground (the world or the room picks the picture); a screen only says
 * how much of it shows:
 * - full: a room's front floor, the ground in full;
 * - band: pages inside a room, the ground behind the header, veiled below;
 * - quiet: focused work (settings, notifications, forms, reading), a calm veil.
 * Comfort (sunlight, simpler look) and verger's tier calm it further on their own.
 */
const QUIET = ['/settings', '/notifications', '/reading', '/account-recovery', '/form-builder'];

export function presenceForPath(
  pathname: string,
  { roomRoot }: { roomRoot: boolean },
): ScenePresence {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (QUIET.some((q) => path === q || path.startsWith(`${q}/`))) return 'quiet';
  return roomRoot ? 'full' : 'band';
}
