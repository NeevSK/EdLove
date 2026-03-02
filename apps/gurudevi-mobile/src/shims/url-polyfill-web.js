/**
 * Web shim for react-native-url-polyfill.
 *
 * react-native-url-polyfill patches the global URL and URLSearchParams for
 * environments where they are missing or incomplete.  Modern browsers already
 * provide these globals natively, so importing this polyfill on web is
 * unnecessary and can cause ESM/CJS interop errors in Metro's web bundler.
 * This no-op shim prevents those errors.
 */

// No-op: browser URL and URLSearchParams are already standards-compliant.
