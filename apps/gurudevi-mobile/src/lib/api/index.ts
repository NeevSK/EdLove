import { authAPI } from './auth';
import { tasksAPI, notesAPI } from './teacher';
import { lessonsAPI, studentsAPI } from './classroom';
import { selfAPI } from './self';
import { gradingAPI } from './grading';
import { schoolAPI } from './school';
import { communityAPI } from './community';

// New Features from Mission 02 (maintained as separate modules for now)
import { attendanceAPI } from './attendance';
import { resourcesAPI } from './resources';
import { groupsAPI } from './groups';
import { classroomStudentsAPI } from './classroomStudents';
import { classroomsAPI } from './classrooms';

// Re-export types for usage in app
export * from './types';

// Main API Object
export const api = {
    // Core Modules (Grouped)
    auth: authAPI,
    tasks: tasksAPI,
    notes: notesAPI,
    lessons: lessonsAPI,
    students: studentsAPI,

    // New Features
    attendance: attendanceAPI,
    resources: resourcesAPI,
    groups: groupsAPI,
    classroomStudents: classroomStudentsAPI,
    classrooms: classroomsAPI,

    // Placeholders / Future Modules
    self: selfAPI,
    grading: gradingAPI,
    school: schoolAPI,
    community: communityAPI,
};

export default api;
