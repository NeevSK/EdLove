import { describe, expect, it } from 'vitest';
import {
  getGuestEntryErrorMessage,
  isAnonymousAuthDisabledError,
  isNetworkOrOfflineError,
  isRateLimitError,
  isServerError,
} from '../welcomeFlow';

describe('welcomeFlow error handling', () => {
  it('detects network or offline errors accurately', () => {
    expect(isNetworkOrOfflineError(new Error('Network request failed'))).toBe(true);
    expect(isNetworkOrOfflineError(new Error('TypeError: Failed to fetch'))).toBe(true);
    expect(isNetworkOrOfflineError(new Error('User is offline'))).toBe(true);
    expect(isNetworkOrOfflineError('The internet connection appears to be offline.')).toBe(true);
    expect(isNetworkOrOfflineError(new Error('Invalid credentials'))).toBe(false);
  });

  it('detects rate limit errors accurately', () => {
    expect(isRateLimitError({ status: 429, message: 'Too Many Requests' })).toBe(true);
    expect(isRateLimitError(new Error('Rate limit exceeded'))).toBe(true);
    expect(isRateLimitError(new Error('Normal error'))).toBe(false);
  });

  it('detects anonymous sign in disabled errors', () => {
    expect(isAnonymousAuthDisabledError(new Error('anonymous_provider_disabled'))).toBe(true);
    expect(isAnonymousAuthDisabledError(new Error('Anonymous sign-in is disabled in project'))).toBe(true);
    expect(isAnonymousAuthDisabledError(new Error('Invalid password'))).toBe(false);
  });

  it('detects 5xx server and maintenance errors', () => {
    expect(isServerError({ status: 503, message: 'Service Unavailable' })).toBe(true);
    expect(isServerError(new Error('Internal Server Error 500'))).toBe(true);
    expect(isServerError(new Error('Bad Gateway'))).toBe(true);
    expect(isServerError({ status: 400 })).toBe(false);
  });

  it('returns offline message when network error occurs', () => {
    const offlineMsg = 'You are currently offline.';
    const fallbackMsg = 'Something went wrong.';

    const result = getGuestEntryErrorMessage(
      new Error('Failed to fetch'),
      fallbackMsg,
      offlineMsg,
    );

    expect(result).toBe(offlineMsg);
  });

  it('returns friendly rate limit message when 429 occurs', () => {
    const result = getGuestEntryErrorMessage(
      { status: 429, message: 'rate limit' },
      'Fallback',
    );
    expect(result).toContain('Too many attempts');
  });

  it('returns guidance when anonymous login is disabled', () => {
    const result = getGuestEntryErrorMessage(
      new Error('anonymous_provider_disabled'),
      'Fallback',
    );
    expect(result).toContain('Guest access is currently unavailable');
  });

  it('returns maintenance guidance when 500/503 occurs', () => {
    const result = getGuestEntryErrorMessage(
      { status: 503, message: 'service unavailable' },
      'Fallback',
    );
    expect(result).toContain('temporary maintenance');
  });

  it('returns custom error message if error is descriptive and not unknown', () => {
    const result = getGuestEntryErrorMessage(
      new Error('Account disabled'),
      'Fallback',
      'Offline',
    );

    expect(result).toBe('Account disabled');
  });

  it('returns fallback message if error has no readable message', () => {
    const result = getGuestEntryErrorMessage(
      {},
      'Fallback error message',
      'Offline',
    );

    expect(result).toBe('Fallback error message');
  });
});

