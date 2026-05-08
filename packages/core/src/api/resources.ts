import { resolveResourceOwnerContext } from '../lib/inventoryScope';
import type { ClassroomResource, ResourceOwnerContext } from '../types';
import { APIError } from '../types/API';
import { educationalContract } from './educational.contract';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from './supabase';

export const resourcesAPI = {
  /**
   * @authority read Material
   */
  async getAll(classroomId: string): Promise<ClassroomResource[]> {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('classroom_resources')
      .select('*')
      .eq('classroom_id', classroomId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw new APIError('Failed to fetch resources', error.code, error);
    }

    return data || [];
  },

  /**
   * @authority create Material
   */
  async create(
    resource: Omit<ClassroomResource, 'id' | 'created_at' | 'updated_at'> & {
      owner_context?: ResourceOwnerContext;
    },
  ): Promise<ClassroomResource> {
    const ownerContext = resolveResourceOwnerContext({
      ownerContext: resource.owner_context,
      classroomId: resource.classroom_id,
    });

    if (ownerContext !== 'classroom') {
      throw new APIError(
        'Institution-owned items must be created through admin inventory, not classroom resources.',
        'INVALID_SCOPE',
      );
    }

    const { owner_context, ...classroomResource } = resource as any;
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('classroom_resources')
      .insert([classroomResource])
      .select()
      .single();

    if (error) {
      throw new APIError('Failed to create resource', error.code, error);
    }

    return data;
  },

  /**
   * @authority update Material
   */
  async update(id: string, updates: Partial<ClassroomResource>): Promise<ClassroomResource> {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('classroom_resources')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new APIError('Failed to update resource', error.code, error);
    }

    return data;
  },

  /**
   * Toggle pin status
   */
  async togglePin(id: string, isPinned: boolean): Promise<ClassroomResource> {
    return this.update(id, { is_pinned: isPinned });
  },

  /**
   * @authority delete Material
   */
  async delete(id: string): Promise<void> {
    const { error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.from('classroom_resources').delete().eq('id', id);

    if (error) {
      throw new APIError('Failed to delete resource', error.code, error);
    }
  },
};

void [educationalContract];
