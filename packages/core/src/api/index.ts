import { authAPI } from './auth';
import { rewardsAPI } from './rewards';
import { trackingAPI } from './tracking';
import { tasksAPI, notesAPI } from './teacher';
import { lessonsAPI, studentsAPI } from './classroom';
export { lessonsAPI, studentsAPI };
// import { selfAPI } from './self'; // Moved to @repo/self
import { gradingAPI } from './grading';
import { schoolAPI } from './school';
// import { communityAPI } from './community'; // Moved to @repo/community
// import { libraryAPI } from './library'; // Moved to @repo/library

// New Features from Mission 02 (maintained as separate modules for now)
import { attendanceAPI } from './attendance';
import { resourcesAPI } from './resources';
import { groupsAPI } from './groups';
import { lessonMaterialsAPI } from './lessonMaterials';
import { assignmentsAPI } from './assignments';
import { classroomStudentsAPI } from './classroomStudents';
import { classroomsAPI } from './classrooms';

import { inventoryAPI } from './inventory';
export * from './mockData';

// Re-export types for usage in app
export * from './types';
export * from './school';
// Note: Community types should be imported directly from '../../types/Community' to avoid circular dependencies
// Do not use "export * from" here as it can cause TypeScript recursion

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
                    const { processGhostData } = require('./demoProvider');
                    result = processGhostData(moduleName, prop, result);

                    return result;
                };
            }
            return originalMethod;
        }
    });
}

// Main API Object
export const api = {
    // Core Modules (Wrapped with Proxy)
    auth: authAPI, // Auth usually shouldn't be proxied if it handles sessions
    tasks: createDemoProxy('tasks', tasksAPI),
    notes: createDemoProxy('notes', notesAPI),
    lessons: createDemoProxy('lessons', lessonsAPI),
    students: createDemoProxy('students', studentsAPI),

    // New Features
    attendance: createDemoProxy('attendance', attendanceAPI),
    resources: createDemoProxy('resources', resourcesAPI),
    groups: createDemoProxy('groups', groupsAPI),
    lessonMaterials: createDemoProxy('lessonMaterials', lessonMaterialsAPI),
    assignments: createDemoProxy('assignments', assignmentsAPI),
    classroomStudents: createDemoProxy('classroomStudents', classroomStudentsAPI),
    classrooms: createDemoProxy('classrooms', classroomsAPI),

    // Community & Library
    // Community & Library - Moved to separate packages
    // community: createDemoProxy('community', communityAPI),
    // library: createDemoProxy('library', libraryAPI),

    // Other Modules
    // self: selfAPI, // Moved to @repo/self
    grading: createDemoProxy('grading', gradingAPI),
    school: createDemoProxy('school', schoolAPI),
    inventory: createDemoProxy('inventory', inventoryAPI),
    rewards: createDemoProxy('rewards', rewardsAPI),
    tracking: createDemoProxy('tracking', trackingAPI),
};

export default api;
