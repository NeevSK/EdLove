/**
 * Web shim for expo-sharing.
 *
 * expo-sharing is a native-only module with no web implementation.
 * On web, "sharing" means using the Web Share API (navigator.share) or
 * falling back to copying the URL to the clipboard.
 *
 * This shim provides a minimal web-aware implementation:
 *  - isAvailableAsync() returns true if the Web Share API is available
 *  - shareAsync(url) delegates to navigator.share or opens a new tab
 */

module.exports = {
    isAvailableAsync: async function () {
        return typeof navigator !== 'undefined' && !!navigator.share;
    },
    shareAsync: async function (url, _options) {
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({ url: url, title: _options?.dialogTitle });
                return;
            } catch {
                // user cancelled or API not available  fall through
            }
        }
        // Fallback: open in new tab
        if (typeof window !== 'undefined') {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    },
};
