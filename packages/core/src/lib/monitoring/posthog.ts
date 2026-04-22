// Local tracking implementation to avoid circular dependency with analytics package
const _posthogInstance: any = null;

export const initPostHog = async () => {
  // Mock implementation - analytics package should handle actual initialization
  if (__DEV__) {
    console.log('PostHog initialization delegated to analytics package');
  }
};

export const trackEvent = (event: string, properties?: any) => {
  // Mock implementation - analytics package should handle actual tracking
  if (__DEV__) {
    console.log('Event tracked (mock):', event, properties);
  }
};

export const identifyUser = (userId: string, properties?: any) => {
  // Mock implementation - analytics package should handle actual identification
  if (__DEV__) {
    console.log('User identified (mock):', userId, properties);
  }
};

export const resetUser = () => {
  // Mock implementation - analytics package should handle actual reset
  if (__DEV__) {
    console.log('User reset (mock)');
  }
};
