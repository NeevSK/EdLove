import {
  formatDeveloperOnboardingPrompt,
  isDeveloperShortcutEnabled,
  parseDeveloperOnboardingTemplate,
  shouldUseDeveloperSandbox,
} from '../devOnboardingFastTrack';

describe('dev onboarding fast track', () => {
  it('keeps the shortcut hidden unless dev mode is enabled', () => {
    expect(isDeveloperShortcutEnabled(false, 'dev::menu')).toBe(false);
    expect(isDeveloperShortcutEnabled(true, 'normal name')).toBe(false);
    expect(shouldUseDeveloperSandbox(false)).toBe(false);
  });

  it('recognizes the hidden dev console trigger', () => {
    expect(parseDeveloperOnboardingTemplate('dev::menu')).toEqual({ kind: 'menu' });
    expect(parseDeveloperOnboardingTemplate('dev::sandbox')).toEqual({ kind: 'menu' });
  });

  it('parses inline dev templates into real onboarding account data', () => {
    expect(
      parseDeveloperOnboardingTemplate(
        'dev::name:Naween,role:principal,pricing:pro,citizenship:first_class,school:abc-123',
      ),
    ).toEqual({
      kind: 'template',
      template: {
        name: 'Naween',
        role: 'principal',
        pricing: 'PRO',
        citizenship: 'FIRST_CLASS',
        schoolId: 'abc-123',
      },
    });
  });

  it('provides a canonical template prompt for devs', () => {
    expect(formatDeveloperOnboardingPrompt()).toContain('dev::name:Naween');
  });
});
