import type { TemporalIntent } from '@repo/core/types/Workbench';
import { z } from 'zod';

/**
 * Time lens for features: how a feature behaves when its room looks at the
 * past (review), today (current) or the future (plan). School work runs in a
 * loop (plan, do, look back), so one feature can serve all three instead of
 * three separate screens. See the "Time lens" section of the Floor System doc
 * and docs/architecture/2026-10-18-universal-temporal-substrate-and-history-architecture.md.
 *
 * This is a different axis from the floor engine's time band (now, later,
 * anytime): the lens is which day you look at, the band is how urgent a piece
 * is within that day.
 */

export const TimeModeSchema = z.enum(['review', 'current', 'plan']);
export type TimeMode = z.infer<typeof TimeModeSchema> & TemporalIntent;

/**
 * What may happen to a past record when the lens looks back.
 * - sealed: read only; any new word is a note written today about that day
 * - append: add to it, never rewrite it (journals)
 * - editable: may be changed (drafts, logs filled in late)
 */
export const PastRuleSchema = z.enum(['sealed', 'append', 'editable']);
export type PastRule = z.infer<typeof PastRuleSchema>;

export const TimeProfileSchema = z
  .object({
    /** Modes the feature supports; empty means timeless (it ignores the lens). */
    modes: z.array(TimeModeSchema),
    /** Where the feature mostly lives; it gets more weight when the lens is here. */
    home: z.union([TimeModeSchema, z.literal('timeless')]),
    /** Rule for past records; required when the feature supports review. */
    past: PastRuleSchema.optional(),
  })
  .refine((p) => (p.home === 'timeless' ? p.modes.length === 0 : p.modes.includes(p.home)), {
    message: 'A time profile’s home mode must be one of its modes (or timeless with no modes).',
  })
  .refine((p) => !p.modes.includes('review') || p.past !== undefined, {
    message: 'A feature that supports review must say what happens to past records.',
  });

export type TimeProfile = z.infer<typeof TimeProfileSchema>;

export const TIMELESS: TimeProfile = { modes: [], home: 'timeless' };

/** Build a time profile and check it. */
export function timeProfile(
  home: TimeMode,
  modes: readonly TimeMode[],
  past?: PastRule,
): TimeProfile {
  return TimeProfileSchema.parse({ modes: [...modes], home, ...(past ? { past } : {}) });
}

/**
 * How a feature meets the room's lens:
 * - home: this is where it mostly lives (weigh it up)
 * - supported: it has something for this mode
 * - absent: it has nothing for this mode (step back quietly)
 * - timeless: the lens does not apply
 */
export type LensFit = 'home' | 'supported' | 'absent' | 'timeless';

export function lensFit(profile: TimeProfile, lens: TemporalIntent): LensFit {
  if (profile.home === 'timeless') return 'timeless';
  if (profile.home === lens) return 'home';
  return profile.modes.includes(lens) ? 'supported' : 'absent';
}

/** Whether a feature may change a record when the lens looks at the past. */
export function canEditPast(profile: TimeProfile): 'no' | 'add-only' | 'yes' {
  if (!profile.modes.includes('review')) return 'no';
  if (profile.past === 'editable') return 'yes';
  return 'add-only';
}

/** Bridge for registries that only say whether review and plan exist. */
export function timeProfileFromCapabilities(
  caps: { hasReview: boolean; hasPlan: boolean },
  home: TimeMode = 'current',
  past: PastRule = 'sealed',
): TimeProfile {
  const modes: TimeMode[] = [];
  if (caps.hasReview) modes.push('review');
  modes.push('current');
  if (caps.hasPlan) modes.push('plan');
  return timeProfile(
    modes.includes(home) ? home : 'current',
    modes,
    caps.hasReview ? past : undefined,
  );
}
