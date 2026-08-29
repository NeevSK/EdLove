/**
 * Generic thinking-trap catalog helpers for the guided-reflection engine.
 * Functions operate on an explicit ThinkingTrap[] so each domain owns its
 * catalog content (e.g. @repo/self's TRAP_CATALOG) while sharing one engine.
 * Clean-room pattern (concepts from classic cognitive-distortion families;
 * all labels/copy authored for the Gurudevi audience).
 */
import type { ThinkingTrap, TrapSlope } from './types';

/** Resolve a trap by id within the given catalog. */
export function findTrapById(traps: ThinkingTrap[], id: string): ThinkingTrap | undefined {
  return traps.find((trap) => trap.id === id);
}

/** Filter a catalog to a single slope ('general' or 'learning'). */
export function filterTrapsBySlope(traps: ThinkingTrap[], slope: TrapSlope): ThinkingTrap[] {
  return traps.filter((trap) => trap.slope === slope);
}

/**
 * Classify a user-written thinking pattern as 'learning' when it is about
 * academic context words, otherwise 'general'.
 */
export function classifyCustomTrapSlope(text: string): TrapSlope {
  return /\b(study|exam|test|grade|homework|class|subject|doubt)\b/i.test(text)
    ? 'learning'
    : 'general';
}

/**
 * Resolve a set of trap ids against a catalog, ignoring unknown ids, and
 * optionally append a fully-built custom trap (content supplied by the owner).
 */
export function resolveTraps(
  traps: ThinkingTrap[],
  trapIds: string[],
  customTrap?: ThinkingTrap,
): ThinkingTrap[] {
  const matched = trapIds
    .map((id) => findTrapById(traps, id))
    .filter((trap): trap is ThinkingTrap => trap !== undefined);
  if (customTrap) {
    matched.push(customTrap);
  }
  return matched;
}
