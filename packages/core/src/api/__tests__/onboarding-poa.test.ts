import { describe, expect, test } from 'vitest';
import { onboardingContract } from '../onboarding.contract';

describe('onboarding POA coverage', () => {
  test('createInitialBond route carries policy metadata', () => {
    expect(onboardingContract.createInitialBond.metadata?.policy).toEqual({
      action: 'update',
      subject: 'User',
    });
  });

  test('completeOnboarding route carries policy metadata', () => {
    expect(onboardingContract.completeOnboarding.metadata?.policy).toEqual({
      action: 'update',
      subject: 'User',
    });
  });

  test('onboardingContract exposes exactly the expected routes', () => {
    // Route inventory is asserted exhaustively: adding or removing a route
    // must update this list so POA coverage is never silently skipped.
    expect(Object.keys(onboardingContract)).toEqual([
      'createInitialBond',
      'completeOnboarding',
      'createFounderSchoolBond',
      'revokeSchoolBond',
    ]);
    expect(onboardingContract.createInitialBond).toBeDefined();
    expect(onboardingContract.completeOnboarding).toBeDefined();
  });

  test('newer bond routes carry policy metadata', () => {
    expect(onboardingContract.createFounderSchoolBond.metadata?.policy).toEqual({
      action: 'update',
      subject: 'User',
    });
    expect(onboardingContract.revokeSchoolBond.metadata?.policy).toEqual({
      action: 'update',
      subject: 'User',
    });
  });

  test('createInitialBond route definition is valid', () => {
    const route = onboardingContract.createInitialBond;
    expect(route.method).toBe('post');
    expect(route.path).toBe('/identity/initial-bond');
    expect(route.responses[200]).toBeDefined();
    expect(route.request?.body).toBeDefined();
  });

  test('completeOnboarding route definition is valid', () => {
    const route = onboardingContract.completeOnboarding;
    expect(route.method).toBe('post');
    expect(route.path).toBe('/identity/complete-onboarding');
    expect(route.responses[200]).toBeDefined();
    expect(route.request).toBeUndefined();
  });
});
