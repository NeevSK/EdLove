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
import { classroomNotesAPI } from './classroomNotes';
import { principalNotesAPI } from './principalNotes';
import { communityAPI } from './community';
import { staffManagementAPI } from './staffManagement';
import { ReliefCoordinator, TimetableScheduler } from './agents';
import { sacredMissionsAPI } from './sacredMissions';
import { isDemo, demoAPI } from './demo';

export * from './mockData';
export * from './types';
export * from './thuthimal'; // Restore types and thuthimalAPI
export * from './sacredMissions'; // Export mission types
export * from './agents'; // Export agent types
export * from './resonantProxy';
export * from './classroomNotes';
export * from './principalNotes';
export * from './community'; // Export community types/API
export * from './staffManagement'; // Export staff management types/API

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
    classroomNotesAPI,
    principalNotesAPI,
    communityAPI,
    staffManagementAPI,
    ReliefCoordinator,
    TimetableScheduler,
    sacredMissionsAPI,
    demoAPI,
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
    classroomNotes: classroomNotesAPI,
    principalNotes: principalNotesAPI,
    community: communityAPI,
    staffManagement: staffManagementAPI,
    relief: ReliefCoordinator,
    scheduler: TimetableScheduler,
    missions: sacredMissionsAPI,
    demo: demoAPI,
};

export default api;

