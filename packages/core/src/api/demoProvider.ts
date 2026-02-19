import { Alert } from 'react-native';
import { isDemo } from './demo';
import * as MOCK from './mockData';
// hapticWarning removed to avoid core -> ui circular dependency
import i18n from 'i18next';
import { useStore } from '../store/useStore';

/**
 * Registry of mock data getters.
 * This allows us to decouple the production API modules from the mock data.
 */
const MOCK_DATA_REGISTRY: Record<string, () => any> = {
    'classrooms.getByTeacher': () => MOCK.MOCK_CLASSROOMS,
    'classrooms.getByStudent': () => MOCK.MOCK_CLASSROOMS,
    'school.getSchoolStats': () => MOCK.MOCK_SCHOOL_STATS,
    'lessons.getAll': () => MOCK.MOCK_LESSONS,
    'students.getAll': () => MOCK.MOCK_STUDENTS,
    'assignments.getAll': () => MOCK.MOCK_ASSIGNMENTS,
    'resources.getAll': () => MOCK.MOCK_RESOURCES,

    // Library
    'library.getResources': () => MOCK.MOCK_LIBRARY_RESOURCES,
    'library.getCollections': () => MOCK.MOCK_LIBRARY_COLLECTIONS,
    'library.getResourceById': () => MOCK.MOCK_LIBRARY_RESOURCES[0],

    // Community
    'community.getGroups': () => MOCK.MOCK_COMMUNITY_GROUPS,
    'community.getPosts': () => MOCK.MOCK_COMMUNITY_POSTS,
    'community.getComments': () => [],
};

/**
 * Handles the interception logic for the API Proxy.
 */
export function interceptApiCall(moduleName: string, methodName: string, originalArgs: any[]) {
    const registryKey = `${moduleName}.${methodName}`;
    const state = useStore.getState();

    const isExplorer = state.isExplorerMode;
    const dismissedIds = state.dismissedSampleIds;

    // If we are currently bridging demo data to reality, DO NOT intercept.
    if (state.isBridging) {
        return null;
    }

    // GHOST SEEDING: Proactive injection for Classrooms
    if (registryKey === 'classrooms.getByTeacher' || registryKey === 'classrooms.getByStudent') {
        // We let the original call proceed to check for real data
        return null;
    }

    // Traditional isDemoMode (Global Sandbox Toggle)
    if (isDemo()) {
        const mockGetter = MOCK_DATA_REGISTRY[registryKey];
        if (mockGetter && (methodName.startsWith('get') || methodName.startsWith('list') || methodName === 'getAll')) {
            return Promise.resolve(mockGetter());
        }

        if (methodName.startsWith('create') || methodName.startsWith('update') || methodName.startsWith('delete') || methodName.startsWith('add')) {
            // Block write operations in demo mode
            console.log(`[DEMO MODE] Blocked write operation: ${registryKey}.${methodName}`);
            // Return a successful mock response without executing real DB writes
            return Promise.resolve({
                success: true,
                message: 'Demo mode: Operation simulated successfully',
                data: null
            });
        }
    }

    return null;
}

/**
 * Enhanced Proxy specifically for "Ghost" merging.
 * This can be called after a real API result to inject samples if needed.
 */
export function processGhostData(moduleName: string, methodName: string, realData: any) {
    const state = useStore.getState();
    const isExplorer = state.isExplorerMode;
    const dismissedIds = state.dismissedSampleIds;

    if (!isExplorer) return realData;

    // 1. GHOST CLASSROOMS
    if (moduleName === 'classrooms' && (methodName.startsWith('get')) && Array.isArray(realData) && realData.length === 0) {
        const registryKey = `${moduleName}.${methodName}`;
        const mockGetter = MOCK_DATA_REGISTRY[registryKey];

        if (mockGetter) {
            const rawMocks = mockGetter();
            return rawMocks.filter((m: any) => !dismissedIds.includes(m.id))
                .map((m: any) => ({ ...m, is_sample: true }));
        }
    }

    // 2. GHOST SCHOOL STATS
    if (moduleName === 'school' && methodName === 'getSchoolStats') {
        const stats = realData;
        const isEmpty = stats.total_students === 0 && stats.total_teachers === 0 && stats.total_classrooms === 0;

        if (isEmpty) {
            const mockGetter = MOCK_DATA_REGISTRY['school.getSchoolStats'];
            if (mockGetter) {
                const mockStats = mockGetter();
                return { ...mockStats, is_sample: true };
            }
        }
    }

    // 3. GHOST SECTIONS
    if (moduleName === 'school' && methodName === 'getSections' && Array.isArray(realData) && realData.length === 0) {
        // We might want to inject mock sections here if we had some in registry
        // For now, classrooms is the primary focus, but let's be ready
        const registryKey = `${moduleName}.${methodName}`;
        const mockGetter = MOCK_DATA_REGISTRY[registryKey];
        if (mockGetter) {
            return mockGetter().map((m: any) => ({ ...m, is_sample: true }));
        }
    }

    return realData;
}
