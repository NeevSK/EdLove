/**
 * Web shim for @react-native-community/netinfo
 * Assumes connected on web, or uses standard web APIs
 */

const NetInfo = {
  fetch: async () => ({
    type: 'wifi',
    isConnected: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isInternetReachable: typeof navigator !== 'undefined' ? navigator.onLine : true,
    details: {
      isConnectionExpensive: false,
    },
  }),
  addEventListener: (listener) => {
    if (typeof window !== 'undefined') {
      const handleOnline = () =>
        listener({
          type: 'wifi',
          isConnected: true,
          isInternetReachable: true,
          details: { isConnectionExpensive: false },
        });
      const handleOffline = () =>
        listener({ type: 'none', isConnected: false, isInternetReachable: false, details: null });
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      // Return an unsubscribe function
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
    return () => {};
  },
  useNetInfo: () => ({
    type: 'wifi',
    isConnected: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isInternetReachable: typeof navigator !== 'undefined' ? navigator.onLine : true,
    details: {
      isConnectionExpensive: false,
    },
  }),
};

module.exports = NetInfo;
module.exports.default = NetInfo;
module.exports.useNetInfo = NetInfo.useNetInfo;
