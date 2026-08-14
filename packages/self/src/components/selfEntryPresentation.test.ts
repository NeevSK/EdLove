import { describe, expect, it } from 'vitest';
import { getCalmFeatureLabel, getHistoryNotice, getShortcutToastMessage } from './selfEntryPresentation';

describe('Self entry presentation', () => {
  it('uses short labels without changing feature identity', () => {
    expect(getCalmFeatureLabel({ id: 'daily_pulse', label: 'Daily Pulse Sanctuary' })).toBe('Pulse');
    expect(getCalmFeatureLabel({ id: 'unknown', label: 'Quiet Overview' })).toBe('Quiet');
  });

  it('keeps shortcut feedback brief and directional', () => {
    expect(getShortcutToastMessage({ id: 'joy_jar', label: 'Joy Jar' }, false)).toBe('Joy saved to your shortcuts.');
    expect(getShortcutToastMessage({ id: 'joy_jar', label: 'Joy Jar' }, true)).toBe('Joy removed from your shortcuts.');
  });

  it('describes history state once', () => {
    expect(getHistoryNotice('week')).toBe('History is read-only for the week view.');
  });
});
