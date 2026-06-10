import { APIError } from '../types/API';
import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from './base';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ as supabase } from './supabase';

/**
 * CLASSROOMS API (Sovereign RPC Proxy)
 *
 * This module siphons Classroom structural requests to the Sanctuary API.
 */

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

export const classroomsAPI = {
  async getTeacherClassrooms(teacher_id: string) {
    return this.getByTeacher(teacher_id);
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('classrooms')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new APIError('Failed to update classroom', error.code);
    }
    return data;
  },

  async create(classroom: any) {
    const { data, error } = await supabase.from('classrooms').insert([classroom]).select().single();

    if (error) {
      throw new APIError('Failed to create classroom', error.code);
    }
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('classrooms').delete().eq('id', id);

    if (error) {
      throw new APIError('Failed to delete classroom', error.code);
    }
  },
  async getByTeacher(teacher_id: string, params: { limit?: number; offset?: number } = {}) {
    const res = await (client.api as any).educational.classrooms['by-teacher'].$get({
      query: {
        teacher_id,
        limit: params.limit?.toString(),
        offset: params.offset?.toString(),
      },
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch classrooms by teacher', res.status.toString());
    }

    return await res.json();
  },

  async getByStudent(student_id: string) {
    const res = await (client.api as any).educational.classrooms['by-student'].$get({
      query: { student_id },
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch classrooms by student', res.status.toString());
    }

    return await res.json();
  },

  async getTeacherStats(id: string) {
    const res = await (client.api as any).educational.classrooms.stats.teacher[':id'].$get({
      param: { id },
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch teacher statistics', res.status.toString());
    }

    return await res.json();
  },

  async getById(id: string) {
    const res = await (client.api as any).educational.classrooms[':id'].$get({
      param: { id },
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new APIError('Failed to fetch classroom', res.status.toString());
    }

    return await res.json();
  },
};
