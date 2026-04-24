import { storage } from '@repo/core/native';
import { Linking, Platform } from 'react-native';

export type ExternalLinkTrustLevel = 'verified' | 'external' | 'broken';
export type WebExternalOpenMethod = 'new_tab' | 'same_tab';
export type NativeExternalOpenMethod = 'in_app_browser' | 'external_browser';
export type ExternalOpenMethod = WebExternalOpenMethod | NativeExternalOpenMethod;

export interface ExternalLinkOpenOptions {
  title?: string;
  sourceLabel?: string;
  sourceBadge?: string;
  trustLevel?: ExternalLinkTrustLevel;
  forcePrompt?: boolean;
}

interface ExternalLinkPromptRequest {
  url: string;
  options: ExternalLinkOpenOptions;
  platform: 'web' | 'native';
  defaultMethod: ExternalOpenMethod;
  currentPreference?: ExternalOpenMethod;
  domain: string;
  overrideCount: number;
}

interface ExternalLinkPromptResult {
  method: ExternalOpenMethod;
  persistPreference: boolean;
}

interface ExternalLinkRuntime {
  promptForChoice: (request: ExternalLinkPromptRequest) => Promise<ExternalLinkPromptResult | null>;
  isOnline: () => boolean;
  notifyOffline: (message: string) => void;
}

const WEB_PREFERENCE_KEY = 'external_link_preference_web';
const NATIVE_PREFERENCE_KEY = 'external_link_preference_native';
const WEB_OVERRIDE_COUNT_KEY = 'external_link_override_count_web';
const NATIVE_OVERRIDE_COUNT_KEY = 'external_link_override_count_native';

let runtime: ExternalLinkRuntime | null = null;

function isWebUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

function getPlatformKey() {
  return Platform.OS === 'web' ? WEB_PREFERENCE_KEY : NATIVE_PREFERENCE_KEY;
}

function getOverrideKey() {
  return Platform.OS === 'web' ? WEB_OVERRIDE_COUNT_KEY : NATIVE_OVERRIDE_COUNT_KEY;
}

function getPlatformMode(): 'web' | 'native' {
  return Platform.OS === 'web' ? 'web' : 'native';
}

export function getRecommendedExternalOpenMethod(): ExternalOpenMethod {
  return Platform.OS === 'web' ? 'new_tab' : 'in_app_browser';
}

export function getStoredExternalOpenPreference(): ExternalOpenMethod | undefined {
  return storage.getString(getPlatformKey()) as ExternalOpenMethod | undefined;
}

export function setStoredExternalOpenPreference(method: ExternalOpenMethod) {
  storage.set(getPlatformKey(), method);
}

export function clearStoredExternalOpenPreference() {
  storage.delete(getPlatformKey());
  storage.delete(getOverrideKey());
}

function getOverrideCount() {
  return storage.getNumber(getOverrideKey()) ?? 0;
}

function incrementOverrideCount() {
  storage.set(getOverrideKey(), getOverrideCount() + 1);
}

function getSafeDomain(url: string) {
  try {
    const parsed =
      typeof window !== 'undefined' ? new URL(url, window.location.href) : new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

async function openInAppBrowser(url: string) {
  try {
    const WebBrowser = await import('expo-web-browser');
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle?.PAGE_SHEET,
      showTitle: true,
    } as any);
  } catch {
    await Linking.openURL(url);
  }
}

async function executeExternalOpen(url: string, method: ExternalOpenMethod) {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') return;

    if (method === 'same_tab') {
      window.location.assign(url);
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  if (method === 'in_app_browser') {
    await openInAppBrowser(url);
    return;
  }

  await Linking.openURL(url);
}

async function resolveOpenMethod(
  url: string,
  options: ExternalLinkOpenOptions,
  forcePrompt = false,
) {
  const defaultMethod = getRecommendedExternalOpenMethod();
  const currentPreference = getStoredExternalOpenPreference();
  const shouldPrompt = forcePrompt || options.forcePrompt || !currentPreference;

  if (!shouldPrompt) {
    return {
      method: currentPreference,
      persistPreference: false,
    };
  }

  if (!runtime?.promptForChoice) {
    return {
      method: currentPreference ?? defaultMethod,
      persistPreference: false,
    };
  }

  return runtime.promptForChoice({
    url,
    options,
    platform: getPlatformMode(),
    defaultMethod,
    currentPreference,
    domain: getSafeDomain(url),
    overrideCount: getOverrideCount(),
  });
}

async function openExternalURLInternal(
  url: string,
  options: ExternalLinkOpenOptions = {},
  forcePrompt = false,
): Promise<boolean> {
  if (!url) return false;

  if (runtime && isWebUrl(url) && !runtime.isOnline()) {
    runtime.notifyOffline('No internet connection. Reconnect to open external links.');
    return false;
  }

  if (!isWebUrl(url)) {
    await Linking.openURL(url);
    return true;
  }

  const resolution = await resolveOpenMethod(url, options, forcePrompt);
  if (!resolution) return false;

  const previousPreference = getStoredExternalOpenPreference();

  if (resolution.persistPreference) {
    setStoredExternalOpenPreference(resolution.method);
  } else if (previousPreference && previousPreference !== resolution.method) {
    incrementOverrideCount();
  }

  await executeExternalOpen(url, resolution.method);
  return true;
}

export async function openExternalURL(
  url: string,
  options: ExternalLinkOpenOptions = {},
): Promise<boolean> {
  return openExternalURLInternal(url, options, false);
}

export async function showExternalLinkOptions(
  url: string,
  options: ExternalLinkOpenOptions = {},
): Promise<boolean> {
  return openExternalURLInternal(url, { ...options, forcePrompt: true }, true);
}

export function registerExternalLinkRuntime(nextRuntime: ExternalLinkRuntime | null) {
  runtime = nextRuntime;
}

export function getExternalLinkDomain(url: string) {
  return getSafeDomain(url);
}
