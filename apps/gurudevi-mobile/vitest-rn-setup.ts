// isomorphic-webcrypto's fallback gathers entropy through XMLHttpRequest when it loads.
// The native engine has none, and these tests make no network calls.
globalThis.MutationObserver ??= class {
  observe() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
} as unknown as typeof MutationObserver;

globalThis.XMLHttpRequest ??= class {
  open() {}
  send() {}
  setRequestHeader() {}
  getAllResponseHeaders() {
    return '';
  }
  getResponseHeader() {
    return null;
  }
} as unknown as typeof XMLHttpRequest;
