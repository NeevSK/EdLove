import { supabase } from '../supabase';
import { APIError, Lesson, Student } from './types';

// ============================================================================
// LESSONS API
// ============================================================================

export const lessonsAPI = {
    /**
     * Get all lessons for a classroom
     */
    async getAll(classroomId: string): Promise<Lesson[]> {
        const { data, error } = await supabase
            .from('lessons')
            .select('*')
            .eq('classroom_id', classroomId)
            .order('order_index', { ascending: true });

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
