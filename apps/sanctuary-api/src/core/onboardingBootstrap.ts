const onboardingBootstrapProcedurePaths = new Set([
  '/api/onboarding/createInitialBond',
  '/api/onboarding/completeOnboarding',
  '/api/identity/resolveIdentity',
  '/api/identity/active-scope',
  '/api/capabilities/bootstrap/v1',
  '/api/identity/capabilityBootstrap',
  '/api/openapi/capabilities/bootstrap/v1',
]);

/**
 * Identity bootstrap and explicit scope selection must remain reachable when
 * there is no remembered valid scope; they validate any scope they establish.
 */
export function isOnboardingBootstrapProcedure(path: string): boolean {
  return onboardingBootstrapProcedurePaths.has(path);
}
