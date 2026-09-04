import type { IFileStoragePort } from '@repo/core/logic/ports/storage.port';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * SupabaseStorageAdapter
 *
 * Concrete implementation of IFileStoragePort for Supabase Storage.
 */
export const createSupabaseStorageAdapter = (supabase: SupabaseClient): IFileStoragePort => ({
  async upload(fileUri, options) {
    const bucket = options?.resourceType === 'image' ? 'images' : 'files';
    const path = options?.path || `uploads/${Date.now()}`;

    // Note: In React Native, we would need to convert URI to Blob/File
    // This is a simplified version for the adapter pattern demonstration
    const { data, error } = await supabase.storage.from(bucket).upload(path, fileUri as any);

    if (error) throw error;
    return supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl;
  },

  async delete(identifier) {
    const bucket = identifier.includes('images') ? 'images' : 'files';
    await supabase.storage.from(bucket).remove([identifier]);
  },

  getPublicUrl(path) {
    return supabase.storage.from('files').getPublicUrl(path).data.publicUrl;
  },
});
