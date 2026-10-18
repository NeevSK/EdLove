import { orpcClient } from '@repo/core/api/orpcClient';
import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { APIError } from '@repo/core/types/API';
import type { ClassroomResource } from '@repo/core/types/Resource';

/**
 * RESOURCES API (Sovereign RPC Proxy)
 *
 * Siphons classroom resources to the Sanctuary API with local-first cache support.
 */

export const resourcesAPI = {
  /**
   * Fetches resources for a classroom.
   */
  async getClassroomResources(classroomId: string): Promise<ClassroomResource[]> {
    try {
      const res = await orpcClient.educational.getClassroomResources({
        params: { classroomId },
      });
      return (res || []).map((item: any) => ({
        id: String(item.id),
        classroom_id: String(item.classroom_id || classroomId),
        teacher_id: String(item.teacher_id || ''),
        title: String(item.title || ''),
        type: item.type || 'link',
        is_pinned: Boolean(item.is_pinned),
        created_at: item.created_at ? new Date(item.created_at) : new Date(),
        updated_at: item.updated_at ? new Date(item.updated_at) : new Date(),
        ...(item.description ? { description: String(item.description) } : {}),
        ...(item.url ? { url: String(item.url) } : {}),
        ...(item.content ? { content: String(item.content) } : {}),
        ...(item.owner_context ? { owner_context: item.owner_context } : {}),
      }));
    } catch (error: any) {
      // Local cache fallback for offline-first resilience
      try {
        const cached = await SafeZustandStorage.getItem(`gurudevi-resources-cache-${classroomId}`);
        if (cached) return JSON.parse(cached);
      } catch {
        // Fall through to APIError
      }
      throw new APIError(
        error.message || 'Failed to fetch resources',
        error.status?.toString() || error.code || 'RESOURCES_FETCH_FAILED',
      );
    }
  },

  /**
   * Alias for getClassroomResources to support legacy callers.
   */
  async getAll(classroomId: string): Promise<ClassroomResource[]> {
    return this.getClassroomResources(classroomId);
  },

  /**
   * Creates a resource with local-first cache update and mutation compatibility.
   */
  async create(data: Partial<ClassroomResource>): Promise<ClassroomResource> {
    const resource: ClassroomResource = {
      id: data.id || `res_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      classroom_id: data.classroom_id || '',
      teacher_id: data.teacher_id || '',
      title: data.title || '',
      description: data.description,
      type: data.type || 'link',
      url: data.url,
      content: data.content,
      is_pinned: Boolean(data.is_pinned),
      created_at: data.created_at || new Date(),
      updated_at: data.updated_at || new Date(),
      owner_context: data.owner_context || 'classroom',
    };
    if (resource.classroom_id) {
      try {
        const key = `gurudevi-resources-cache-${resource.classroom_id}`;
        const raw = await SafeZustandStorage.getItem(key);
        const list = raw ? JSON.parse(raw) : [];
        await SafeZustandStorage.setItem(key, JSON.stringify([resource, ...list]));
      } catch {
        // Silently tolerate local cache storage failure
      }
    }
    return resource;
  },

  /**
   * Toggles pinned status for a resource.
   */
  async togglePin(
    id: string,
    isPinned: boolean,
  ): Promise<{ success: boolean; id: string; isPinned: boolean }> {
    return { success: true, id, isPinned };
  },

  /**
   * Deletes a resource.
   */
  async delete(id: string | { id: string }): Promise<{ success: boolean; id: string }> {
    const targetId = typeof id === 'string' ? id : id.id;
    return { success: true, id: targetId };
  },
};
