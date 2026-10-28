import { randomUUID } from 'expo-crypto';

// getRandomValues is installed earlier by the entry point, but it does not
// provide randomUUID on Hermes. Local guest sessions require both capabilities.
if (typeof globalThis.crypto.randomUUID !== 'function') {
  Object.defineProperty(globalThis.crypto, 'randomUUID', {
    configurable: true,
    writable: true,
    value: randomUUID,
  });
}
