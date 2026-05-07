import { coreRuntime } from '@repo/core/logic';

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

function getPlatform() {
  return coreRuntime.device.getMetadata().platform;
}

function getPlatformKey() {
  return getPlatform() === 'web' ? WEB_PREFERENCE_KEY : NATIVE_PREFERENCE_KEY;
}

function getOverrideKey() {
  return getPlatform() === 'web' ? WEB_OVERRIDE_COUNT_KEY : NATIVE_OVERRIDE_COUNT_KEY;
}

function getPlatformMode(): 'web' | 'native' {
  return getPlatform() === 'web' ? 'web' : 'native';
}

export function getRecommendedExternalOpenMethod(): ExternalOpenMethod {
  return getPlatform() === 'web' ? 'new_tab' : 'in_app_browser';
}

export async function getStoredExternalOpenPreference(): Promise<ExternalOpenMethod | undefined> {
  const val = await coreRuntime.storage.getItem(getPlatformKey());
  return val as ExternalOpenMethod | undefined;
}

export async function setStoredExternalOpenPreference(method: ExternalOpenMethod) {
  await coreRuntime.storage.setItem(getPlatformKey(), method);
}

export async function clearStoredExternalOpenPreference() {
  await coreRuntime.storage.removeItem(getPlatformKey());
  await coreRuntime.storage.removeItem(getOverrideKey());
}

async function getOverrideCount() {
  const val = await coreRuntime.storage.getItem(getOverrideKey());
  return val ? parseInt(val, 10) : 0;
}

async function incrementOverrideCount() {
  const count = await getOverrideCount();
  await coreRuntime.storage.setItem(getOverrideKey(), String(count + 1));
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

async function executeExternalOpen(url: string, method: ExternalOpenMethod) {
  const platform = getPlatform();
  if (platform === 'web') {
    if (typeof window === 'undefined') return;

    if (method === 'same_tab') {
      window.location.assign(url);
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  // Note: For in_app_browser on native, we'd traditionally use WebBrowser.
  // We'll trust the coreRuntime.linking to handle URLs appropriately or extend the LinkingProvider.
  // For now, satisfy the abstract requirement.
  await coreRuntime.linking.openURL(url);
}

async function resolveOpenMethod(
  url: string,
  options: ExternalLinkOpenOptions,
  forcePrompt = false,
) {
  const defaultMethod = getRecommendedExternalOpenMethod();
  const currentPreference = await getStoredExternalOpenPreference();
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
    overrideCount: await getOverrideCount(),
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
    await coreRuntime.linking.openURL(url);
    return true;
  }

  const resolution = await resolveOpenMethod(url, options, forcePrompt);
  if (!resolution) return false;

  const previousPreference = await getStoredExternalOpenPreference();

  if (resolution.persistPreference) {
    await setStoredExternalOpenPreference(resolution.method);
  } else if (previousPreference && previousPreference !== resolution.method) {
    await incrementOverrideCount();
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
