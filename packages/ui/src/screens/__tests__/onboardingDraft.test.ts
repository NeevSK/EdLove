import { describe, expect, it } from 'vitest';
import {
  getOnboardingProgressKey,
  parseOnboardingDraft,
  serializeOnboardingDraft,
} from '../onboardingDraft';

describe('onboarding draft storage', () => {
  it('uses a distinct storage key for each identity', () => {
    expect(getOnboardingProgressKey('account-a')).toBe('onboarding_progress:account-a');
    expect(getOnboardingProgressKey('account-a')).not.toBe(getOnboardingProgressKey('account-b'));
  });

  it('restores a draft only for its owning account, including the historical capacity shape', () => {
    const raw = JSON.stringify({
      user_id: 'account-a',
      step: 2,
      name: 'Asha',
      capacity: 'student',
      schoolId: 'school-1',
    });

    expect(parseOnboardingDraft(raw, 'account-a')).toEqual({
      userId: 'account-a',
      step: 2,
      name: 'Asha',
      selectedCapacity: 'student',
      schoolId: 'school-1',
    });
    expect(parseOnboardingDraft(raw, 'account-b')).toBeNull();
  });

  it('rejects corrupted drafts instead of partially applying them', () => {
    expect(parseOnboardingDraft('{bad json', 'account-a')).toBeNull();
    expect(
      parseOnboardingDraft(
        JSON.stringify({ user_id: 'account-a', step: 99, name: 'Asha', capacity: 'student' }),
        'account-a',
      ),
    ).toBeNull();
  });

  it('writes one canonical draft shape', () => {
    expect(
      serializeOnboardingDraft({
        userId: 'account-a',
        state: { currentStep: 1, name: 'Asha', selectedCapacity: 'principal', schoolId: null },
      }),
    ).toBe('{"user_id":"account-a","step":1,"name":"Asha","capacity":"principal","schoolId":null}');
  });
});
