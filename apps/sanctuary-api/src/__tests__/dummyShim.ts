export const Platform = { OS: 'node', select: (obj: any) => obj.default || obj.node };
export const captureException = () => {};
export const initSentry = () => {};
export const logBreadcrumb = () => {};
export const setSentryUser = () => {};
export const clearSentryUser = () => {};

export const requireNativeModule = () => ({});
export const requireOptionalNativeModule = () => ({});
export class EventEmitter {
  addListener() {
    return { remove: () => {} };
  }
  removeAllListeners() {}
  emit() {}
}

export const Casing = { camelCase: (s: string) => s };
export const locale = 'en-US';
export const getCalendars = () => [{ calendarType: 'gregorian' }];
export const getLocales = () => [{ languageTag: 'en-US', textDirection: 'ltr' }];

// React Navigation Mock
export const useNavigation = () => ({
  navigate: () => {},
  goBack: () => {},
  addListener: () => () => {},
});

export default {
  manifest: {},
  expoVersion: '1.0.0',
};
