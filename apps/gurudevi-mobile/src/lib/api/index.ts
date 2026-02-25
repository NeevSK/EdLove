
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




// Combine APIs into a single object for backward compatibility
export const api = {
    // Core Modules
    auth: createDemoProxy('auth', coreAPI.auth),
    tasks: createDemoProxy('tasks', coreAPI.tasks),
    notes: createDemoProxy('notes', coreAPI.notes),
    lessons: createDemoProxy('lessons', coreAPI.lessons),
    students: createDemoProxy('students', coreAPI.students),
    attendance: createDemoProxy('attendance', coreAPI.attendance),
    resources: createDemoProxy('resources', coreAPI.resources),
    groups: createDemoProxy('groups', coreAPI.groups),
    lessonMaterials: createDemoProxy('lessonMaterials', coreAPI.lessonMaterials),
    assignments: createDemoProxy('assignments', coreAPI.assignments),
    classroomStudents: createDemoProxy('classroomStudents', coreAPI.classroomStudents),
    classrooms: createDemoProxy('classrooms', coreAPI.classrooms),
    grading: createDemoProxy('grading', coreAPI.grading),
    school: createDemoProxy('school', coreAPI.school),
    inventory: createDemoProxy('inventory', coreAPI.inventory),
    rewards: createDemoProxy('rewards', coreAPI.rewards),
    tracking: createDemoProxy('tracking', coreAPI.tracking),
    onboarding: createDemoProxy('onboarding', coreAPI.onboarding),

    // Package Modules
    library: createDemoProxy('library', libraryAPI),
    community: createDemoProxy('community', communityAPI),
    self: createDemoProxy('self', selfAPI),
};

export * from '@repo/core';
export default api;
