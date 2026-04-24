/**
 * Web shim for react-native-get-random-values.
 *
 * react-native-get-random-values patches globalThis.crypto.getRandomValues for
 * native environments where it may be missing.  On web, the browser already
 * provides a standards-compliant crypto.getRandomValues, so this shim is a
 * safe no-op that prevents the native module from being included in the web
 * bundle (which would cause "Cannot set property default&" errors due to
 * ESM/CJS interop conflicts in Metro's web output).
 */

// No-op: the browser's native crypto.getRandomValues is already available.
