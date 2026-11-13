import { z } from 'zod';

/**
 * H5P reports what a learner does as xAPI statements. This turns one statement into an event
 * the host can use: which activity, which part of it, what happened, and the result. The raw
 * statement is kept so it can be exported as xAPI 2.0 later without loss.
 *
 * H5P statements usually have no timestamp, so the host stamps the time it received them.
 */

const ADL = 'http://adlnet.gov/expapi/verbs/';
const KNOWN_VERBS = [
  'attempted',
  'answered',
  'completed',
  'interacted',
  'progressed',
  'experienced',
  'passed',
  'failed',
  'scored',
] as const;
export type H5PVerb = (typeof KNOWN_VERBS)[number] | 'other';

const SUB_CONTENT_ID = 'http://h5p.org/x-api/h5p-subContentId';
const LIBRARY_PREFIX = 'http://h5p.org/libraries/';

const Score = z
  .object({
    raw: z.number().finite().optional(),
    min: z.number().finite().optional(),
    max: z.number().finite().optional(),
    scaled: z.number().min(-1).max(1).optional(),
  })
  .refine((s) => s.min === undefined || s.max === undefined || s.min <= s.max)
  .refine(
    (s) => s.raw === undefined || ((s.min ?? -Infinity) <= s.raw && s.raw <= (s.max ?? Infinity)),
  );

const activity = z.object({ id: z.string().min(1) }).loose();

export const XAPIStatement = z
  .object({
    verb: z.object({ id: z.string().min(1) }).loose(),
    object: z
      .object({
        id: z.string().min(1),
        definition: z
          .object({
            interactionType: z.string().optional(),
            extensions: z.record(z.string(), z.unknown()).optional(),
          })
          .loose()
          .optional(),
      })
      .loose(),
    result: z
      .object({
        score: z.unknown().optional(),
        success: z.boolean().optional(),
        completion: z.boolean().optional(),
        duration: z.string().optional(),
        response: z.string().optional(),
      })
      .loose()
      .optional(),
    context: z
      .object({
        contextActivities: z
          .object({ parent: z.array(activity).optional(), category: z.array(activity).optional() })
          .loose()
          .optional(),
      })
      .loose()
      .optional(),
    timestamp: z.iso.datetime({ offset: true }).optional(),
  })
  .loose();
export type XAPIStatement = z.infer<typeof XAPIStatement>;

export interface H5PResult {
  readonly score?: z.infer<typeof Score>;
  readonly success?: boolean;
  readonly completion?: boolean;
  readonly durationMs?: number;
  readonly response?: string;
}

export interface H5PEvent {
  readonly verb: H5PVerb;
  readonly verbId: string;
  readonly activityId: string;
  /** The question or part inside a compound activity; absent for the activity as a whole. */
  readonly subContentId?: string;
  /** The H5P library that produced the event, such as `H5P.MultiChoice-1.16`. */
  readonly library?: string;
  readonly interactionType?: string;
  readonly result?: H5PResult;
  readonly occurredAt: string;
  readonly statement: XAPIStatement;
}

const DURATION =
  /^P(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;

/** ISO 8601 duration to milliseconds, for the day-and-time forms xAPI uses. */
export function durationToMs(duration: string): number | undefined {
  const match = DURATION.exec(duration);
  if (match === null || duration === 'P' || duration.endsWith('T')) return undefined;
  const [, d, h, m, s] = match;
  const n = (v: string | undefined) => (v === undefined ? 0 : Number(v));
  return Math.round((((n(d) * 24 + n(h)) * 60 + n(m)) * 60 + n(s)) * 1000);
}

const verbOf = (id: string): H5PVerb => {
  if (!id.startsWith(ADL)) return 'other';
  const name = id.slice(ADL.length);
  return (KNOWN_VERBS as readonly string[]).includes(name) ? (name as H5PVerb) : 'other';
};

export type ReadEventResult =
  | { readonly ok: true; readonly event: H5PEvent }
  | { readonly ok: false; readonly reason: string };

const libraryOf = (statement: XAPIStatement): string | undefined =>
  statement.context?.contextActivities?.category
    ?.map((c) => c.id)
    .find((id) => id.startsWith(LIBRARY_PREFIX))
    ?.slice(LIBRARY_PREFIX.length);

const subContentOf = (statement: XAPIStatement): string | undefined => {
  const id = statement.object.definition?.extensions?.[SUB_CONTENT_ID];
  return typeof id === 'string' && id.length > 0 ? id : undefined;
};

// An inconsistent score is dropped; the rest of the result still counts.
function resultOf(raw: NonNullable<XAPIStatement['result']>): H5PResult {
  const score = raw.score === undefined ? undefined : Score.safeParse(raw.score);
  return {
    score: score?.success ? score.data : undefined,
    success: raw.success,
    completion: raw.completion,
    durationMs: raw.duration === undefined ? undefined : durationToMs(raw.duration),
    response: raw.response,
  };
}

/** Reads one statement the player sent. `now` stamps statements that carry no time. */
export function readH5PEvent(raw: unknown, now: () => Date): ReadEventResult {
  const parsed = XAPIStatement.safeParse(raw);
  if (!parsed.success) return { ok: false, reason: parsed.error.message };
  const statement = parsed.data;
  return {
    ok: true,
    event: {
      verb: verbOf(statement.verb.id),
      verbId: statement.verb.id,
      activityId: statement.object.id,
      subContentId: subContentOf(statement),
      library: libraryOf(statement),
      interactionType: statement.object.definition?.interactionType,
      result: statement.result === undefined ? undefined : resultOf(statement.result),
      occurredAt: statement.timestamp ?? now().toISOString(),
      statement,
    },
  };
}
