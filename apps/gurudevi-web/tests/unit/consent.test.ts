import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getClientConsentStatus,
  isTelemetryPermitted,
  parseConsentFromCookieHeader,
  PDPA_CONSENT_EVENT,
  PDPA_STORAGE_KEY,
  setClientConsentStatus,
} from '../../lib/privacy/consent';

describe('PDPA Privacy & Consent Gateway', () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = `${PDPA_STORAGE_KEY}=; max-age=0; path=/`;
    document.documentElement.removeAttribute('data-pdpa-consent');
    delete (window.navigator as unknown as { globalPrivacyControl?: boolean }).globalPrivacyControl;
    delete (window.navigator as unknown as { webdriver?: boolean }).webdriver;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns unset when no prior consent or signal exists', () => {
    expect(getClientConsentStatus()).toBe('unset');
    expect(isTelemetryPermitted()).toBe(false);
  });

  it('respects stored consent in localStorage', () => {
    localStorage.setItem(PDPA_STORAGE_KEY, 'granted');
    expect(getClientConsentStatus()).toBe('granted');
    expect(isTelemetryPermitted()).toBe(true);

    localStorage.setItem(PDPA_STORAGE_KEY, 'declined');
    expect(getClientConsentStatus()).toBe('declined');
    expect(isTelemetryPermitted()).toBe(false);
  });

  it('honors Global Privacy Control (GPC: navigator.globalPrivacyControl = true)', () => {
    Object.defineProperty(window.navigator, 'globalPrivacyControl', {
      value: true,
      configurable: true,
    });

    expect(getClientConsentStatus()).toBe('declined');
    expect(isTelemetryPermitted()).toBe(false);
  });

  it('honors automated browser agents (navigator.webdriver = true) without throwing', () => {
    Object.defineProperty(window.navigator, 'webdriver', {
      value: true,
      configurable: true,
    });

    expect(getClientConsentStatus()).toBe('declined');
    expect(isTelemetryPermitted()).toBe(false);
  });

  it('persists granted decision to localStorage, cookie, and dispatches event', () => {
    const listener = vi.fn();
    window.addEventListener(PDPA_CONSENT_EVENT, listener);

    const result = setClientConsentStatus(true);

    expect(result).toBe('granted');
    expect(localStorage.getItem(PDPA_STORAGE_KEY)).toBe('granted');
    expect(document.cookie).toContain(`${PDPA_STORAGE_KEY}=granted`);
    expect(document.documentElement.getAttribute('data-pdpa-consent')).toBe('granted');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0]?.[0]?.detail).toEqual({ status: 'granted' });

    window.removeEventListener(PDPA_CONSENT_EVENT, listener);
  });

  it('persists declined decision and revokes telemetry', () => {
    const listener = vi.fn();
    window.addEventListener(PDPA_CONSENT_EVENT, listener);

    const result = setClientConsentStatus(false);

    expect(result).toBe('declined');
    expect(localStorage.getItem(PDPA_STORAGE_KEY)).toBe('declined');
    expect(document.cookie).toContain(`${PDPA_STORAGE_KEY}=declined`);
    expect(document.documentElement.getAttribute('data-pdpa-consent')).toBe('declined');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0]?.[0]?.detail).toEqual({ status: 'declined' });
    expect(isTelemetryPermitted()).toBe(false);

    window.removeEventListener(PDPA_CONSENT_EVENT, listener);
  });

  it('parses consent correctly from raw cookie headers', () => {
    expect(parseConsentFromCookieHeader(null)).toBe('unset');
    expect(parseConsentFromCookieHeader('')).toBe('unset');
    expect(
      parseConsentFromCookieHeader('session_id=abc; gurudevi_pdpa_consent=granted; theme=dark'),
    ).toBe('granted');
    expect(
      parseConsentFromCookieHeader('gurudevi_pdpa_consent=declined; other=123'),
    ).toBe('declined');
    expect(
      parseConsentFromCookieHeader('random_cookie=value'),
    ).toBe('unset');
  });
});
