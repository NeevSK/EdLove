
import { api as coreAPI } from '@repo/core';
import { libraryAPI } from '@repo/library';
import { communityAPI } from '@repo/community';
import { selfAPI } from '@repo/self';
import { interceptApiCall } from './demoProvider';

// Helper to wrap API modules with a demo-aware proxy
function createDemoProxy<T extends object>(moduleName: string, target: T): T {
    return new Proxy(target, {
        get(obj: any, prop: string) {
            const originalMethod = obj[prop];
            if (typeof originalMethod === 'function') {
                return async (...args: any[]) => {
                    const intercepted = interceptApiCall(moduleName, prop, args);
                    if (intercepted) return intercepted;

                    let result = await originalMethod.apply(obj, args);

                    // Ghost Seeding: Post-process results for specific modules
                    // const { processGhostData } = require('./demoProvider');
                    // result = processGhostData(moduleName, prop, result);

                    return result;
                };
            }
            return originalMethod;
        }
    });
}


const wrappedLibraryAPI = createDemoProxy('library', libraryAPI);
const wrappedCommunityAPI = createDemoProxy('community', communityAPI);

// Combine APIs into a single object for backward compatibility
export const api = {
    ...coreAPI,
    library: wrappedLibraryAPI,
    community: wrappedCommunityAPI,
    self: selfAPI,
};

export * from '@repo/core';
export default api;
