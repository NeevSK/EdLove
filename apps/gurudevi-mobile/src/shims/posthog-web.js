/**
 * Web shim for posthog-react-native.
 *
 * posthog-react-native is native-only. On web Metro redirects every import of
 * 'posthog-react-native' to this file (see metro.config.js resolveRequest).
 * All methods are no-ops; PostHogProvider passes children straight through.
 */

const _React = require('react');

// No-op PostHog class  mirrors the subset of the API used in posthog.ts
class PostHog {
  capture() {
    return this;
  }
  identify() {
    return this;
  }
  reset() {
    return this;
  }
  alias() {
    return this;
  }
  group() {
    return this;
  }
  register() {
    return this;
  }
  unregister() {
    return this;
  }
  optOut() {
    return this;
  }
  optIn() {
    return this;
  }
  flush() {
    return Promise.resolve();
  }
  shutdown() {
    return Promise.resolve();
  }
}

// Pass-through provider so <PostHogProvider> works in App.tsx unchanged
function PostHogProvider({ children }) {
  return children;
}

module.exports = { PostHog, PostHogProvider };
module.exports.default = module.exports;
