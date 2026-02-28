/**
 * Web shim for @sentry/react-native.
 *
 * @sentry/react-native is native-only. On web Metro redirects every import of
 * '@sentry/react-native' to this file (see metro.config.js resolveRequest).
 * All functions are no-ops so the rest of the codebase (sentry.ts, App.tsx)
 * continues to compile and run unchanged on web.
 */

function noop() {}

const Sentry = {
    init: noop,
    wrap: function (component) { return component; },
    captureException: noop,
    captureMessage: noop,
    addBreadcrumb: noop,
    withScope: function (callback) {
        // Invoke the callback immediately with a no-op scope so that
        // Sentry.withScope(scope => { scope.setTag(...); Sentry.captureException(...); })
        // patterns continue to work without errors on web.
        if (typeof callback === 'function') {
            callback({
                setTag: noop,
                setExtra: noop,
                setUser: noop,
                setLevel: noop,
                setContext: noop,
                setFingerprint: noop,
                clear: noop,
            });
        }
    },
    setUser: noop,
    setTag: noop,
    setExtra: noop,
    setContext: noop,
    configureScope: noop,
    getCurrentHub: function () { return { setUser: noop, setTag: noop, setExtra: noop, configureScope: noop }; },
    // Allow `export default Sentry.wrap(App)` pattern
    default: null,
};

Sentry.default = Sentry;

module.exports = Sentry;
// Also handle ESM default import pattern
module.exports.default = Sentry;
