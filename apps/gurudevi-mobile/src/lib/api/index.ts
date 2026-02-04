/**
 * GURUDEVI API CLIENT
 * 
 * Centralized Supabase API layer
 * All database operations go through here for consistency
 * 
 * Usage:
 *   import { api } from '@/lib/api';
 *   const tasks = await api.tasks.getAll();
 */

// Export error handling
export { APIError } from './errors';

// Export types
export type {
    Task,
    Lesson,
    Student,
    TeacherNote,
    AttendanceRecord,
    ClassroomResource,
    StudentGroup,
    ClassroomStudent,
} from './types';

// Import API modules
import { tasksAPI } from './tasks';
import { lessonsAPI } from './lessons';
import { studentsAPI } from './students';
import { notesAPI } from './notes';
import { authAPI } from './auth';
import { attendanceAPI } from './attendance';
import { resourcesAPI } from './resources';
import { groupsAPI } from './groups';
import { classroomStudentsAPI } from './classroomStudents';

// Main API export
export const api = {
    tasks: tasksAPI,
    lessons: lessonsAPI,
    students: studentsAPI,
    notes: notesAPI,
    auth: authAPI,
    attendance: attendanceAPI,
    resources: resourcesAPI,
    groups: groupsAPI,
    classroomStudents: classroomStudentsAPI,
};

export default api;
