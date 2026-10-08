import { ScopeBootstrapSchema } from '@repo/core/api/identity.orpc.contract';
import { onboardingORPCContract } from '@repo/core/api/onboarding.orpc.contract';
import { orpcClient } from '@repo/core/api/orpcClient';
import { Effect, Schema } from 'effect';
import { z } from 'zod';

const initialBondResponseSchema = z.strictObject({
  success: z.literal(true),
  scopeBootstrap: ScopeBootstrapSchema,
});

const completeOnboardingResponseSchema = z.object({ success: z.boolean() });

export type InitialBondInput = z.infer<
  typeof onboardingORPCContract.createInitialBond.request.body
>;
export type InitialBondResult = z.infer<typeof initialBondResponseSchema>;
export type CompleteOnboardingResult = z.infer<typeof completeOnboardingResponseSchema>;

/**
 * Effect v4 error boundary for this command family.
 * The status is retained so existing web recovery copy remains compatible.
 */
export class OnboardingCommandError extends Schema.TaggedError<OnboardingCommandError>()(
  'OnboardingCommandError',
  {
    operation: Schema.String,
    cause: Schema.Unknown,
    status: Schema.optional(Schema.Number),
  },
) {}

function statusOf(cause: unknown): number | undefined {
  if (typeof cause !== 'object' || cause === null || !('status' in cause)) return undefined;
  const status = Reflect.get(cause, 'status');
  return typeof status === 'number' ? status : undefined;
}

function parseWithEffect<T>(
  operation: string,
  parse: () => T,
): Effect.Effect<T, OnboardingCommandError> {
  return Effect.try({
    try: parse,
    catch: (cause) => new OnboardingCommandError({ operation, cause, status: statusOf(cause) }),
  });
}

function requestWithEffect<T>(
  operation: string,
  request: () => Promise<T>,
): Effect.Effect<T, OnboardingCommandError> {
  return Effect.tryPromise({
    try: request,
    catch: (cause) => new OnboardingCommandError({ operation, cause, status: statusOf(cause) }),
  });
}

/** Effect v4 program for creating the authenticated user's initial bond. */
export function createInitialBondEffect(
  input: InitialBondInput,
): Effect.Effect<InitialBondResult, OnboardingCommandError> {
  return Effect.gen(function* () {
    const body = yield* parseWithEffect('createInitialBond.input', () =>
      onboardingORPCContract.createInitialBond.request.body.parse(input),
    );
    const result = yield* requestWithEffect('createInitialBond.request', () =>
      orpcClient.onboarding.createInitialBond({ body }),
    );
    return yield* parseWithEffect('createInitialBond.response', () =>
      initialBondResponseSchema.parse(result),
    );
  });
}

/** Effect v4 program for completing onboarding from authenticated request context. */
export function completeOnboardingEffect(): Effect.Effect<
  CompleteOnboardingResult,
  OnboardingCommandError
> {
  return Effect.gen(function* () {
    const result = yield* requestWithEffect('completeOnboarding.request', () =>
      orpcClient.onboarding.completeOnboarding({}),
    );
    return yield* parseWithEffect('completeOnboarding.response', () =>
      completeOnboardingResponseSchema.parse(result),
    );
  });
}

/** Canonical onboarding commands with legacy callers left untouched. */
export async function createInitialBond(input: InitialBondInput): Promise<InitialBondResult> {
  return Effect.runPromise(createInitialBondEffect(input));
}

/** Completion derives the account from the authenticated request context. */
export async function completeOnboarding(): Promise<CompleteOnboardingResult> {
  return Effect.runPromise(completeOnboardingEffect());
}
