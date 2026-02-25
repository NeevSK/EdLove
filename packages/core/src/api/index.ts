import { authAPI } from './auth';
import { rewardsAPI } from './rewards';
import { trackingAPI } from './tracking';
import { tasksAPI, notesAPI } from './teacher';
import { lessonsAPI, studentsAPI } from './classroom';
import { gradingAPI } from './grading';
import { schoolAPI } from './school';
import { attendanceAPI } from './attendance';
import { resourcesAPI } from './resources';
import { groupsAPI } from './groups';
import { lessonMaterialsAPI } from './lessonMaterials';
import { assignmentsAPI } from './assignments';
import { classroomStudentsAPI } from './classroomStudents';
import { classroomsAPI } from './classrooms';
import { onboardingAPI } from './onboarding';
import { inventoryAPI } from './inventory';
import { dailyContentAPI } from './dailyContent';
import { thuthimalAPI } from './thuthimal';

export * from './mockData';
export * from './types';
export * from './thuthimal';

// Simplified named exports for direct access
export {
    authAPI,
    lessonsAPI,
    studentsAPI,
    tasksAPI,
    notesAPI,
    rewardsAPI,
    trackingAPI,
    inventoryAPI,
    classroomsAPI,
    gradingAPI,
    schoolAPI,
    attendanceAPI,
    resourcesAPI,
    groupsAPI,
    lessonMaterialsAPI,
    assignmentsAPI,
    classroomStudentsAPI,
    onboardingAPI,
    dailyContentAPI,
    thuthimalAPI,
};

/**
 * Unified API Object
 * 
 * IMPORTANT: This is defined as a plain object to ensure 
 * Hermes handles it as a non-writable module property.
 */
export const api = {
    auth: authAPI,
    tasks: tasksAPI,
    notes: notesAPI,
    lessons: lessonsAPI,
    students: studentsAPI,
    attendance: attendanceAPI,
    resources: resourcesAPI,
    groups: groupsAPI,
    lessonMaterials: lessonMaterialsAPI,
    assignments: assignmentsAPI,
    classroomStudents: classroomStudentsAPI,
    classrooms: classroomsAPI,
    grading: gradingAPI,
    school: schoolAPI,
    inventory: inventoryAPI,
    rewards: rewardsAPI,
    tracking: trackingAPI,
    onboarding: onboardingAPI,
    dailyContent: dailyContentAPI,
    thuthimal: thuthimalAPI,
};

export default api;
