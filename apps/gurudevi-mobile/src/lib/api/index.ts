import { authAPI } from './auth';
import { tasksAPI, notesAPI } from './teacher';
import { lessonsAPI, studentsAPI } from './classroom';
import { selfAPI } from './self';
import { gradingAPI } from './grading';
import { schoolAPI } from './school';
import { communityAPI } from './community';

// Re-export types for usage in app
export * from './types';

// Main API Object
export const api = {
    auth: authAPI,
    tasks: tasksAPI,
    notes: notesAPI,
    lessons: lessonsAPI,
    students: studentsAPI,

    // New Modular Sections
    self: selfAPI,
    grading: gradingAPI,
    school: schoolAPI,
    community: communityAPI,
};

export default api;
