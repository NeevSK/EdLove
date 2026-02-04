/**
 * Tasks API
 * 
 * API methods for managing teacher tasks
 */

import { supabase } from '../supabase';
import { APIError } from './errors';
import type { Task } from './types';

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
