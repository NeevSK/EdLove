import { describe, expect, it } from 'vitest';
import { screenNameOf } from './screens';

describe('screenNameOf', () => {
  it('folds record ids into one screen name', () => {
    expect(screenNameOf('/class/123')).toBe('/class/:id');
    expect(screenNameOf('/class/456/attendance')).toBe('/class/:id/attendance');
    expect(screenNameOf('/reflect/3f2504e0-4f89-11d3-9a0c-0305e82c3301')).toBe('/reflect/:id');
    expect(screenNameOf('/share/AbC123xyz789QRst00')).toBe('/share/:id');
  });

  it('keeps screen words, drops query and fragment, and names the root', () => {
    expect(screenNameOf('/workspace?tab=notes#top')).toBe('/workspace');
    expect(screenNameOf('/settings/notifications')).toBe('/settings/notifications');
    expect(screenNameOf('/')).toBe('/');
    expect(screenNameOf('')).toBe('/');
    expect(screenNameOf('/onboarding-introduction')).toBe('/onboarding-introduction');
  });
});
