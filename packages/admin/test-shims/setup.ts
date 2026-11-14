if (typeof (globalThis as any).ErrorUtils === 'undefined') {
  (globalThis as any).ErrorUtils = {
    setGlobalHandler: () => {},
    getGlobalHandler: () => () => {},
    reportFatalError: () => {},
  };
}
