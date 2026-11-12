import type { SupabaseQueryError } from '@repo/core/adapters/supabaseIdentity.adapter';
import type {
  ConflictError,
  DatabaseQueryError,
  ForbiddenError,
  GuestStorageError,
  NetworkError,
  NotFoundError,
  RateLimitedError,
  UnavailableError,
  ValidationError,
  OfflineMutationError,
  SyncDelegateError,
  SyncOperationError,
  SyncTableError,
  UnauthorizedError,
} from '@repo/core/effect/Errors';
import { showToast } from '@repo/core/lib/feedback.adapter';
import type { InvalidAuthCallbackAttempt } from '@repo/core/logic/auth/authCallbackAttempt';
import type {
  DeepLinkForbiddenCharsError,
  DeepLinkHostOrSchemeError,
  DeepLinkLengthError,
  DeepLinkParseError,
  DeepLinkTraversalError,
  ReferrerForbiddenCharsError,
  ReferrerLengthError,
  ReferrerParseError,
} from '@repo/core/logic/deeplink/deepLinkPolicyPipeline';
import type {
  AgentDatabaseError,
  AgentSchemaError,
  AgentTimeoutError,
} from '@repo/core/logic/schemas/agentContracts.schema';
import { diagnoseFailure, type FailureDiagnosis } from '@repo/core/logic/failure/classifyFailure';
import { captureException } from '@repo/core/monitoring';
import i18next from 'i18next';

/**
 * What the person sees for each expected failure, in one table.
 *
 * Every `Schema.TaggedError` in @repo/core outside the pre-v1 client (`src/api`, except `src/api/v1`)
 * belongs to `ExpectedFailure`, and `FEEDBACK` is typed
 * as a complete record over its tags, so adding an error class without deciding its feedback
 * fails the typecheck. Anything that isn't an expected failure is a defect: it is reported and
 * the person sees one calm, generic message, never the technical text.
 * See docs/architecture/2026-11-11-product-shape-and-tool-ownership.md, section 4.
 */
export type ExpectedFailure =
  | OfflineMutationError
  | NetworkError
  | UnauthorizedError
  | DatabaseQueryError
  | SyncTableError
  | SyncDelegateError
  | SyncOperationError
  | ForbiddenError
  | NotFoundError
  | ConflictError
  | ValidationError
  | RateLimitedError
  | UnavailableError
  | DeepLinkLengthError
  | DeepLinkForbiddenCharsError
  | DeepLinkTraversalError
  | DeepLinkHostOrSchemeError
  | DeepLinkParseError
  | ReferrerLengthError
  | ReferrerForbiddenCharsError
  | ReferrerParseError
  | InvalidAuthCallbackAttempt
  | AgentDatabaseError
  | AgentTimeoutError
  | AgentSchemaError
  | GuestStorageError
  | SupabaseQueryError;

export type FailureTag = ExpectedFailure['_tag'];

/** What the person can do about it. The world decides how an action looks. */
export type Remedy = 'retry' | 'sign-in' | 'wait' | 'none';

export interface FailureFeedback {
  readonly remedy: Remedy;
  /** An `errors.*` key present in en, si and ta (checked by failureFeedback.test.ts). */
  readonly messageKey: string;
  readonly tone: 'error' | 'info';
  /** Report to telemetry: the person can't fix it, so we must. */
  readonly report: boolean;
}

const internal: FailureFeedback = {
  remedy: 'none',
  messageKey: 'errors.somethingWentWrong',
  tone: 'error',
  report: true,
};
const retryable: FailureFeedback = {
  remedy: 'retry',
  messageKey: 'errors.somethingWentWrong',
  tone: 'error',
  report: false,
};
const badLink: FailureFeedback = {
  remedy: 'none',
  messageKey: 'errors.linkNotValid',
  tone: 'error',
  report: false,
};

export const FEEDBACK: { readonly [Tag in FailureTag]: FailureFeedback } = {
  OfflineMutationError: {
    remedy: 'wait',
    messageKey: 'errors.savedForLater',
    tone: 'info',
    report: false,
  },
  NetworkError: retryable,
  UnauthorizedError: {
    remedy: 'sign-in',
    messageKey: 'errors.signInAgain',
    tone: 'error',
    report: false,
  },
  DatabaseQueryError: internal,
  SyncTableError: internal,
  SyncDelegateError: internal,
  SyncOperationError: internal,
  // The next four reuse existing messages until they get their own copy in en, si and ta
  // (client runtime plan, L7): no access, no longer available, changed elsewhere, check the form.
  ForbiddenError: internal,
  NotFoundError: {
    remedy: 'none',
    messageKey: 'errors.fetchFailed',
    tone: 'error',
    report: false,
  },
  ConflictError: {
    remedy: 'retry',
    messageKey: 'errors.tryAgain',
    tone: 'info',
    report: false,
  },
  ValidationError: internal,
  RateLimitedError: {
    remedy: 'wait',
    messageKey: 'errors.tryAgain',
    tone: 'info',
    report: false,
  },
  UnavailableError: {
    remedy: 'retry',
    messageKey: 'errors.tryAgain',
    tone: 'error',
    report: false,
  },
  DeepLinkLengthError: badLink,
  DeepLinkForbiddenCharsError: badLink,
  DeepLinkTraversalError: badLink,
  DeepLinkHostOrSchemeError: badLink,
  DeepLinkParseError: badLink,
  ReferrerLengthError: badLink,
  ReferrerForbiddenCharsError: badLink,
  ReferrerParseError: badLink,
  InvalidAuthCallbackAttempt: badLink,
  AgentDatabaseError: internal,
  AgentTimeoutError: retryable,
  AgentSchemaError: internal,
  GuestStorageError: internal,
  SupabaseQueryError: retryable,
};

/** Shown for defects and anything unrecognised. */
export const DEFECT_FEEDBACK: FailureFeedback = internal;

const ENGLISH_FALLBACK: Readonly<Record<string, string>> = {
  'errors.somethingWentWrong': 'Something went wrong',
  'errors.savedForLater': "Saved. It will be sent when you're back online.",
  'errors.signInAgain': 'Please sign in again.',
  'errors.linkNotValid': "This link can't be opened.",
  'errors.fetchFailed': 'Failed to fetch data',
  'errors.tryAgain': 'Try again',
};

function tagOf(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('_tag' in error)) return undefined;
  const tag = error._tag;
  return typeof tag === 'string' ? tag : undefined;
}

function isFailureTag(tag: string): tag is FailureTag {
  return Object.hasOwn(FEEDBACK, tag);
}

/** Pure: which feedback an error gets. */
export function feedbackFor(error: unknown): FailureFeedback {
  const tag = tagOf(error);
  return tag !== undefined && isFailureTag(tag) ? FEEDBACK[tag] : DEFECT_FEEDBACK;
}

/** The person's message for a feedback entry, in the active language. */
export function messageFor(feedback: FailureFeedback): string {
  const fallback =
    ENGLISH_FALLBACK[feedback.messageKey] ?? ENGLISH_FALLBACK['errors.somethingWentWrong'] ?? '';
  // Before i18next is initialised (early boot, workers, tests) t() returns '' rather than the
  // default value; a blank toast is worse than English.
  if (!i18next.isInitialized) return fallback;
  const message = i18next.t(feedback.messageKey, { defaultValue: fallback });
  return message && message !== feedback.messageKey ? message : fallback;
}

/**
 * Shows a failure to the person through the world's toast host, and reports it when they can't
 * act on it. The report carries the developer and agent view (`diagnoseFailure`), never the
 * person's message. Returns both views so a caller can render the remedy inline and a developer
 * surface can show the diagnosis.
 */
export function presentFailure(
  error: unknown,
  operation?: string,
): { readonly feedback: FailureFeedback; readonly diagnosis: FailureDiagnosis } {
  const feedback = feedbackFor(error);
  const diagnosis = diagnoseFailure(error, operation);
  if (feedback.report) {
    captureException(error, { boundary: 'failure-feedback', remedy: feedback.remedy, ...diagnosis });
  }
  showToast(messageFor(feedback), feedback.tone);
  return { feedback, diagnosis };
}
