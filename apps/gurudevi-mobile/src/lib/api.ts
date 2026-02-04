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

import { supabase } from './supabase';
import type { User } from '../types/User';

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class APIError extends Error {
    constructor(
        message: string,
        public code?: string,
        public details?: any
    ) {
        super(message);
        this.name = 'APIError';
    }
}

// ============================================================================
// TYPES
// ============================================================================

export interface Task {
    id: string;
    title: string;
    description?: string;
    is_completed: boolean;
    teacher_id: string;
    created_at: string;
    updated_at: string;
}

export interface Lesson {
    id: string;
    title: string;
    description?: string;
    teacher_id: string;
    class_id?: string;
    date: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface Student {
    id: string;
    full_name: string;
    grade?: string;
    class_id?: string;
    notes?: string;
    created_at: string;
}

export interface TeacherNote {
    id: string;
    teacher_id: string;
    content: string;
    type: 'venting' | 'reflection' | 'note';
    created_at: string;
}

// ============================================================================
// TASKS API
// ============================================================================

export const tasksAPI = {
    /**
     * Get all tasks for a teacher
     */
    async getAll(teacherId: string): Promise<Task[]> {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('teacher_id', teacherId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new APIError('Failed to fetch tasks', error.code, error);
        }

        return data || [];
    },

    /**
     * Create a new task
     */
    async create(title: string, teacherId: string, description?: string): Promise<Task> {
        const { data, error } = await supabase
            .from('tasks')
            .insert([
                {
                    title,
                    description,
                    teacher_id: teacherId,
                    is_completed: false,
                },
            ])
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to create task', error.code, error);
        }

        return data;
    },

    /**
     * Update task completion status
     */
    async updateStatus(id: string, status: boolean): Promise<void> {
        const { error } = await supabase
            .from('tasks')
            .update({ is_completed: status })
            .eq('id', id);

        if (error) {
            throw new APIError('Failed to update task', error.code, error);
        }
    },

    /**
     * Update task details
     */
    async update(id: string, updates: Partial<Task>): Promise<Task> {
        const { data, error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to update task', error.code, error);
        }

        return data;
    },

    /**
     * Delete a task
     */
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);

        if (error) {
            throw new APIError('Failed to delete task', error.code, error);
        }
    },
};

// ============================================================================
// LESSONS API
// ============================================================================

export const lessonsAPI = {
    /**
     * Get all lessons for a teacher
     */
    async getAll(teacherId: string): Promise<Lesson[]> {
        const { data, error } = await supabase
            .from('lessons')
            .select('*')
            .eq('teacher_id', teacherId)
            .order('date', { ascending: false });

        if (error) {
            throw new APIError('Failed to fetch lessons', error.code, error);
        }

        return data || [];
    },

    /**
     * Get lessons for a specific date
     */
    async getByDate(teacherId: string, date: string): Promise<Lesson[]> {
        const { data, error } = await supabase
            .from('lessons')
            .select('*')
            .eq('teacher_id', teacherId)
            .eq('date', date);

        if (error) {
            throw new APIError('Failed to fetch lessons by date', error.code, error);
        }

        return data || [];
    },

    /**
     * Create a new lesson
     */
    async create(lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>): Promise<Lesson> {
        const { data, error } = await supabase
            .from('lessons')
            .insert([lesson])
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to create lesson', error.code, error);
        }

        return data;
    },

    /**
     * Update a lesson
     */
    async update(id: string, updates: Partial<Lesson>): Promise<Lesson> {
        const { data, error } = await supabase
            .from('lessons')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to update lesson', error.code, error);
        }

        return data;
    },

    /**
     * Delete a lesson
     */
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('lessons')
            .delete()
            .eq('id', id);

        if (error) {
            throw new APIError('Failed to delete lesson', error.code, error);
        }
    },
};

// ============================================================================
// STUDENTS API
// ============================================================================

export const studentsAPI = {
    /**
     * Get all students (optionally by class)
     */
    async getAll(classId?: string): Promise<Student[]> {
        let query = supabase
            .from('students')
            .select('*')
            .order('full_name', { ascending: true });

        if (classId) {
            query = query.eq('class_id', classId);
        }

        const { data, error } = await query;

        if (error) {
            throw new APIError('Failed to fetch students', error.code, error);
        }

        return data || [];
    },

    /**
     * Get a single student
     */
    async getById(id: string): Promise<Student> {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw new APIError('Failed to fetch student', error.code, error);
        }

        return data;
    },

    /**
     * Create a new student
     */
    async create(student: Omit<Student, 'id' | 'created_at'>): Promise<Student> {
        const { data, error } = await supabase
            .from('students')
            .insert([student])
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to create student', error.code, error);
        }

        return data;
    },

    /**
     * Update student information
     */
    async update(id: string, updates: Partial<Student>): Promise<Student> {
        const { data, error } = await supabase
            .from('students')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to update student', error.code, error);
        }

        return data;
    },

    /**
     * Delete a student
     */
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('students')
            .delete()
            .eq('id', id);

        if (error) {
            throw new APIError('Failed to delete student', error.code, error);
        }
    },
};

// ============================================================================
// NOTES API (Teacher venting, reflections)
// ============================================================================

export const notesAPI = {
    /**
     * Get all notes for a teacher
     */
    async getAll(teacherId: string, type?: TeacherNote['type']): Promise<TeacherNote[]> {
        let query = supabase
            .from('teacher_notes')
            .select('*')
            .eq('teacher_id', teacherId)
            .order('created_at', { ascending: false });

        if (type) {
            query = query.eq('type', type);
        }

        const { data, error } = await query;

        if (error) {
            throw new APIError('Failed to fetch notes', error.code, error);
        }

        return data || [];
    },

    /**
     * Create a new note
     */
    async create(
        teacherId: string,
        content: string,
        type: TeacherNote['type'] = 'note'
    ): Promise<TeacherNote> {
        const { data, error } = await supabase
            .from('teacher_notes')
            .insert([
                {
                    teacher_id: teacherId,
                    content,
                    type,
                },
            ])
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to create note', error.code, error);
        }

        return data;
    },

    /**
     * Delete a note
     */
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('teacher_notes')
            .delete()
            .eq('id', id);

        if (error) {
            throw new APIError('Failed to delete note', error.code, error);
        }
    },
};

// ============================================================================
// AUTH API
// ============================================================================

export const authAPI = {
    /**
     * Get current user session
     */
    async getSession() {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            throw new APIError('Failed to get session', error.code, error);
        }

        return data.session;
    },

    /**
     * Get current user
     */
    async getUser() {
        const { data, error } = await supabase.auth.getUser();

        if (error) {
            throw new APIError('Failed to get user', error.code, error);
        }

        return data.user;
    },

    /**
     * Sign in with email
     */
    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw new APIError('Failed to sign in', error.code, error);
        }

        return data;
    },

    /**
     * Sign up with email
     */
    async signUp(email: string, password: string, fullName?: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (error) {
            throw new APIError('Failed to sign up', error.code, error);
        }

        return data;
    },

    /**
     * Sign out
     */
    async signOut() {
        const { error } = await supabase.auth.signOut();

        if (error) {
            throw new APIError('Failed to sign out', error.code, error);
        }
    },
};

// ============================================================================
// MAIN API EXPORT
// ============================================================================

export const api = {
    tasks: tasksAPI,
    lessons: lessonsAPI,
    students: studentsAPI,
    notes: notesAPI,
    auth: authAPI,
};

export default api;
