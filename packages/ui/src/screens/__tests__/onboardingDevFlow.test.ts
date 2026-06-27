import { getDevOnboardingTemplateLabel, resolveOnboardingDevIntent } from '../onboardingDevFlow';

describe('onboarding dev flow resolver', () => {
  it('stays hidden for standard users', () => {
    expect(
      resolveOnboardingDevIntent({
        isDevMode: false,
        input: 'dev::menu',
      }),
    ).toEqual({ kind: 'none' });
  });

  it('opens the hidden console only for dev mode menu input', () => {
    expect(
      resolveOnboardingDevIntent({
        isDevMode: true,
        input: 'dev::menu',
      }),
    ).toEqual({ kind: 'menu' });
  });

  it('returns a template intent for inline dev profiles', () => {
    const result = resolveOnboardingDevIntent({
      isDevMode: true,
      input: 'dev::name:Naween,role:teacher,pricing:pro,citizenship:wandering,school:abc',
    });

    expect(result.kind).toBe('template');
    if (result.kind === 'template') {
      expect(result.intent.template.role).toBe('teacher');
      expect(result.intent.template.name).toBe('Naween');
    }
  });

  it('formats a success label for dev accounts', () => {
    expect(
      getDevOnboardingTemplateLabel({
        name: 'Naween',
        role: 'principal',
      }),
    ).toContain('principal');
  });
});
