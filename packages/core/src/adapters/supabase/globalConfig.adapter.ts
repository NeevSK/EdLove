import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '../../api/supabase';
import type { GlobalConfig, IGlobalConfigPort } from '../../logic/ports/globalConfig.port';

export class SupabaseGlobalConfigAdapter implements IGlobalConfigPort {
  private get client() {
    return __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__;
  }

  async getConfigs(): Promise<GlobalConfig[]> {
    const { data, error } = await this.client
      .from('global_configs')
      .select('key, value, is_active');

    if (error) {
      console.error('❌ SupabaseGlobalConfigAdapter: Failed to fetch configs:', error);
      return [];
    }

    return data || [];
  }

  subscribeToChanges(callback: () => void): () => void {
    const channel = this.client
      .channel('global-config-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'global_configs' }, () => {
        callback();
      })
      .subscribe();

    return () => {
      this.client.removeChannel(channel);
    };
  }
}
