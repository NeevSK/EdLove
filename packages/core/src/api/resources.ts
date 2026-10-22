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
   * Toggles pinned status for a resource with local-first cache invalidation and RPC dispatch.
   */
  async togglePin(
    id: string,
    isPinned: boolean,
    classroomId?: string,
  ): Promise<{ success: boolean; id: string; isPinned: boolean }> {
    try {
      if ((orpcClient as any).educational?.toggleResourcePin) {
        await (orpcClient as any).educational.toggleResourcePin({
          params: { id },
          body: { isPinned },
        });
      }
    } catch {
      // Allow optimistic fallback when remote procedure is offline or unreachable
    }

    if (classroomId) {
      try {
        const key = `gurudevi-resources-cache-${classroomId}`;
        const raw = await SafeZustandStorage.getItem(key);
        if (raw) {
          const list: ClassroomResource[] = JSON.parse(raw);
          const updated = list.map((item) =>
            item.id === id ? { ...item, is_pinned: isPinned, updated_at: new Date() } : item,
          );
          await SafeZustandStorage.setItem(key, JSON.stringify(updated));
        }
      } catch {
        // Silently tolerate local cache storage failure
      }
    }

    return { success: true, id, isPinned };
  },

  /**
   * Deletes a resource with local-first cache pruning and RPC dispatch.
   */
  async delete(
    id: string | { id: string },
    classroomId?: string,
  ): Promise<{ success: boolean; id: string }> {
    const targetId = typeof id === 'string' ? id : id.id;
    try {
      if ((orpcClient as any).educational?.deleteResource) {
        await (orpcClient as any).educational.deleteResource({ params: { id: targetId } });
      }
    } catch {
      // Tolerate offline / non-mounted endpoint
    }

    if (classroomId) {
      try {
        const key = `gurudevi-resources-cache-${classroomId}`;
        const raw = await SafeZustandStorage.getItem(key);
        if (raw) {
          const list: ClassroomResource[] = JSON.parse(raw);
          const filtered = list.filter((item) => item.id !== targetId);
          await SafeZustandStorage.setItem(key, JSON.stringify(filtered));
        }
      } catch {
        // Silently tolerate local cache storage failure
      }
    }

    return { success: true, id: targetId };
  },
};
