/**
 * Sri Lanka Personal Data Protection Act (PDPA No. 9 of 2022) Consent & Privacy Gateway.
 *
 * Provides unified, client/server safe consent resolution with support for:
 * - Dual persistence (localStorage + 1-year SameSite=Lax cookie)
 * - Global Privacy Control (GPC: navigator.globalPrivacyControl)
 * - Automated Agent / Web Bot detection (navigator.webdriver)
 * - Reactive state synchronization via custom DOM events
 */

export const PDPA_STORAGE_KEY = 'gurudevi_pdpa_consent';
export const PDPA_CONSENT_EVENT = 'gurudevi:consent-change';

export type PDPAConsentStatus = 'granted' | 'declined' | 'unset';

/**
 * Resolves the client-side consent status, taking into account user storage,
 * Global Privacy Control (GPC), and automated browser agent environments.
 */
export function getClientConsentStatus(): PDPAConsentStatus {
  if (typeof window === 'undefined') {
    return 'unset';
  }

  try {
    // 1. Explicit user preference in local storage
    const stored = window.localStorage.getItem(PDPA_STORAGE_KEY);
    if (stored === 'granted' || stored === 'declined') {
      return stored;
    }

    // 2. Global Privacy Control (GPC) signal: if explicitly active, default to declined
    const nav = window.navigator as unknown as { globalPrivacyControl?: boolean; webdriver?: boolean };
    if (nav?.globalPrivacyControl === true) {
      return 'declined';
    }

    // 3. Automated agent / headless runner (e.g. Playwright, Puppeteer, Antigravity)
    if (nav?.webdriver === true) {
      return 'declined';
    }
  } catch {
    // Local storage inaccessible (e.g. private sandboxed frame)
    return 'unset';
  }

  return 'unset';
}

/**
 * Persists the user's consent decision across localStorage and first-party cookie,
 * and notifies active components of the change.
 */
export function setClientConsentStatus(granted: boolean): PDPAConsentStatus {
  const status: PDPAConsentStatus = granted ? 'granted' : 'declined';

  if (typeof window === 'undefined') {
    return status;
  }

  try {
    window.localStorage.setItem(PDPA_STORAGE_KEY, status);
    // 1-year cookie for SSR and server middleware awareness
    document.cookie = `${PDPA_STORAGE_KEY}=${status}; path=/; max-age=31536000; SameSite=Lax`;
    // Update data attribute on root HTML for zero-CLS styling awareness
    document.documentElement.setAttribute('data-pdpa-consent', status);

    // Notify listeners (e.g. SettingsFloor, banner)
    window.dispatchEvent(
      new CustomEvent(PDPA_CONSENT_EVENT, { detail: { status } }),
    );
  } catch {
    // Ignore storage errors in private browsing modes
  }

  return status;
}

/**
 * Helper to check whether optional telemetry & analytics are legally permitted.
 */
export function isTelemetryPermitted(): boolean {
  return getClientConsentStatus() === 'granted';
}

/**
 * Extracts PDPA consent status from a raw HTTP Cookie header string.
 */
export function parseConsentFromCookieHeader(cookieHeader?: string | null): PDPAConsentStatus {
  if (!cookieHeader) return 'unset';

  const matches = cookieHeader.match(new RegExp(`(?:^|;\\s*)${PDPA_STORAGE_KEY}=([^;]*)`));
  if (!matches || !matches[1]) return 'unset';

  const value = decodeURIComponent(matches[1]);
  if (value === 'granted' || value === 'declined') {
    return value;
  }

  return 'unset';
}
