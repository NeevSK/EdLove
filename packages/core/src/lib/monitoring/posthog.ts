// Local tracking implementation to avoid circular dependency with analytics package
let posthogInstance: any = null;

export const initPostHog = async () => {
    // Mock implementation - analytics package should handle actual initialization
    console.log('PostHog initialization delegated to analytics package');
};

export const trackEvent = (event: string, properties?: any) => {
    // Mock implementation - analytics package should handle actual tracking
    console.log('Event tracked (mock):', event, properties);
};

export const identifyUser = (userId: string, properties?: any) => {
    // Mock implementation - analytics package should handle actual identification
    console.log('User identified (mock):', userId, properties);
};

export const resetUser = () => {
    // Mock implementation - analytics package should handle actual reset
    console.log('User reset (mock)');
};
