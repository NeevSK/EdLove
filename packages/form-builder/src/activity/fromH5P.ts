import type { AttemptStep } from './journal';

/**
 * H5P activities into the same journal as native ones. The input is the shape of the H5P
 * player's events (`H5PEvent` in `@repo/library/h5p`), described here structurally so neither
 * pure core imports the other.
 *
 * What H5P tells us: an answer to a part (`answered`, keyed by `subContentId` inside a
 * composite) and the activity finishing (`completed` with no part). What it doesn't: hints or
 * tips opened, so H5P attempts show no assistance. Native activities record that.
 */
export interface H5PEventLike {
  readonly verb: string;
  readonly activityId: string;
  readonly subContentId?: string;
  readonly occurredAt: string;
  readonly result?: {
    readonly response?: string;
    readonly success?: boolean;
    readonly completion?: boolean;
  };
}

export type FromH5P =
  | { readonly kind: 'step'; readonly step: AttemptStep }
  /** The whole activity finished: the host submits the attempt. */
  | { readonly kind: 'finished'; readonly at: string; readonly success?: boolean }
  | { readonly kind: 'ignored' };

/** `stepId` is made by the caller (for example from the attempt id and a counter), so a resent event is kept once. */
export function fromH5PEvent(event: H5PEventLike, stepId: string): FromH5P {
  const part = event.subContentId;
  if (event.verb === 'answered') {
    return {
      kind: 'step',
      step: {
        id: stepId,
        at: event.occurredAt,
        kind: 'answered',
        part: part ?? event.activityId,
        response: event.result?.response ?? null,
      },
    };
  }
  if (event.verb === 'completed' && part === undefined) {
    return { kind: 'finished', at: event.occurredAt, success: event.result?.success };
  }
  return { kind: 'ignored' };
}
