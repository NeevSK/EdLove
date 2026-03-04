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
};

// Export as a plain CJS module.
// Metro's interop layer will synthesise the `default` property automatically
// when an `import * as Sentry` or `import Sentry` call resolves this shim.
// Adding `Sentry.default = Sentry` here creates a circular reference that can
// confuse Metro's namespace-import handling on web builds.
module.exports = Sentry;
