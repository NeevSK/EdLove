import { useStore } from '../store/useStore';

/**
 * Configuration for demo behavior
 */
const DEMO_CONFIG = {
    delay: 500, // Default simulated latency
    simulateWrites: true, // If true, POST/PATCH/DELETE return success without hitting DB
};

/**
 * Utility to check if demo mode is active
 */
export const isDemo = () => useStore.getState().isDemoMode;

/**
 * Intercepts a READ API call and returns mock data if demo mode is active.
 */
export async function withDemo<T>(
    originalCall: () => Promise<T>,
    mockData: T,
    options: { delay?: number } = {}
): Promise<T> {
    if (isDemo()) {
        const delay = options.delay !== undefined ? options.delay : DEMO_CONFIG.delay;
        if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        return mockData;
    }
    return originalCall();
}

/**
 * Intercepts a WRITE API call (POST/PATCH/DELETE).
 * In demo mode, it prevents the DB call and returns a simulated success.
 */
export async function withDemoWrite<T>(
    originalCall: () => Promise<T>,
    simulatedResponse?: T
): Promise<T> {
    if (isDemo()) {
        if (DEMO_CONFIG.delay > 0) {
            await new Promise(resolve => setTimeout(resolve, DEMO_CONFIG.delay));
        }
        // If simulatedResponse is not provided, we cast a generic success object
        // This is useful for deletions or simple status returns
        return (simulatedResponse ?? { success: true } as unknown as T);
    }
    return originalCall();
}

/**
 * Unified Demo API
 */
export const demoAPI = {
    isDemo,
    withDemo,
    withDemoWrite,
};
