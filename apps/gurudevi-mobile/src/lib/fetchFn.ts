import { useFeatureStore } from "@repo/core/store/useFeatureStore";
import { Platform } from "react-native";

type FetchFn = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

type PrefetchFn = (url: string, options?: { headers?: Record<string, string> }) => Promise<void>;

type PrefetchOnAppStartFn = (
  input: RequestInfo | URL,
  init?: RequestInit & { prefetchKey?: string },
) => Promise<void>;

let nitroFetchImpl: FetchFn | null = null;
let nitroPrefetchImpl: PrefetchFn | null = null;
let nitroPrefetchOnAppStartImpl: PrefetchOnAppStartFn | null = null;
let nitroModulesLoaded = false;

async function loadNitroModules() {
  if (nitroModulesLoaded) return;

  try {
    const nitroFetchModule = await import("react-native-nitro-fetch");
    nitroFetchImpl = nitroFetchModule.fetch;
    nitroPrefetchImpl = nitroFetchModule.prefetch;
    nitroPrefetchOnAppStartImpl = nitroFetchModule.prefetchOnAppStart;
  } catch {
    nitroFetchImpl = globalThis.fetch.bind(globalThis);
    nitroPrefetchImpl = async () => {};
    nitroPrefetchOnAppStartImpl = async () => {};
  } finally {
    nitroModulesLoaded = true;
  }
}

function getNitroFetchFlag(): boolean {
  // Check global override first (for testing/debugging)
  if (globalThis.__NITRO_FETCH_ENABLED__ === true) return true;
  // Then check feature flag store
  try {
    const state = useFeatureStore.getState();
    return state.flags.isNitroFetchEnabled === true;
  } catch {
    return false;
  }
}

function getComposerPasteFlag(): boolean {
  try {
    const state = useFeatureStore.getState();
    return state.flags.isComposerPasteEnabled === true;
  } catch {
    return false;
  }
}

export async function getFetchFn(): Promise<FetchFn> {
  if (Platform.OS === "web") {
    return globalThis.fetch.bind(globalThis);
  }

  await loadNitroModules();

  const flagEnabled = getNitroFetchFlag();

  if (!flagEnabled) {
    return globalThis.fetch.bind(globalThis);
  }

  return (input: RequestInfo | URL, init?: RequestInit) => {
    const { signal, ...restInit } = init ?? {};

    if (signal?.aborted) {
      return Promise.reject(new DOMException("Aborted", "AbortError"));
    }

    const abortPromise = new Promise<never>((_, reject) => {
      if (signal) {
        signal.addEventListener("abort", () => {
          reject(new DOMException("Aborted", "AbortError"));
        });
      }
    });

    const fetchPromise = nitroFetchImpl!(input, {
      ...restInit,
      signal: undefined,
    });

    return Promise.race([fetchPromise, abortPromise]);
  };
}

export async function getPrefetchFn(): Promise<PrefetchFn> {
  if (Platform.OS === "web") {
    return async () => {};
  }

  await loadNitroModules();

  const flagEnabled = getNitroFetchFlag();

  if (!flagEnabled || !nitroPrefetchImpl) {
    return async () => {};
  }

  return nitroPrefetchImpl;
}

export async function getPrefetchOnAppStartFn(): Promise<PrefetchOnAppStartFn> {
  if (Platform.OS === "web") {
    return async () => {};
  }

  await loadNitroModules();

  const flagEnabled = getNitroFetchFlag();

  if (!flagEnabled || !nitroPrefetchOnAppStartImpl) {
    return async () => {};
  }

  return nitroPrefetchOnAppStartImpl;
}

export function setNitroFetchEnabled(enabled: boolean) {
  globalThis.__NITRO_FETCH_ENABLED__ = enabled;
}

export function isNitroFetchEnabled(): boolean {
  return getNitroFetchFlag();
}

export function isComposerPasteEnabled(): boolean {
  return getComposerPasteFlag();
}

declare global {
  var __NITRO_FETCH_ENABLED__: boolean | undefined;
}
