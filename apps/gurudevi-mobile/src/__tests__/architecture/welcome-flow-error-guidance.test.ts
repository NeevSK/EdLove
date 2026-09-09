import { getGuestEntryErrorMessage } from '@repo/ui/screens/welcomeFlow';
import { describe, expect, it } from 'vitest';

describe('welcome flow error guidance', () => {
  it('prefers a real error message and falls back to guidance text', () => {
    expect(getGuestEntryErrorMessage(new Error('database unavailable'), 'fallback')).toBe(
      'database unavailable',
    );
    expect(getGuestEntryErrorMessage('plain failure', 'fallback')).toBe('plain failure');
    expect(getGuestEntryErrorMessage(null, 'fallback')).toBe('fallback');
  });
});
