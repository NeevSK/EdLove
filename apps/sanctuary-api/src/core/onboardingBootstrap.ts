const onboardingBootstrapProcedurePaths = new Set([
  '/api/onboarding/createInitialBond',
  '/api/onboarding/completeOnboarding',
]);

/**
 * These authenticated procedures establish the first bond, so requiring an
 * existing active bond would make first-time onboarding impossible.
 */
export function isOnboardingBootstrapProcedure(path: string): boolean {
  return onboardingBootstrapProcedurePaths.has(path);
}
