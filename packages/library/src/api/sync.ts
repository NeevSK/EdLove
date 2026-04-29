import { supabase } from '@repo/core/api';;
import { type KnowledgeNodeIndex, knowledgeDB } from './database';

const SYNC_KEY = 'library_index_sync';

/**
 * Knowledge Sync Manager
 * Orchestrates the "Radio Broadcast" (Uni-directional) sync from Supabase to Local SQLite.
 */
export const knowledgeSync = {
  /**
   * Perform a delta sync from Supabase.
   */
  async performSync() {
    // High-fidelity un-shimming: enabled for all platforms including web (IndexedDB)

    console.log('Starting Knowledge Sync...');

    try {
      // 1. Ensure DB is initialized
      await knowledgeDB.init();

      // 2. Get last sync timestamp
      const syncState = await knowledgeDB.getFirstAsync<{ last_sync_timestamp: number }>(
        'SELECT last_sync_timestamp FROM sync_state WHERE key = ?',
        [SYNC_KEY],
      );

      const lastSync = syncState?.last_sync_timestamp || 0;
      const lastSyncIso = new Date(lastSync).toISOString();

      // 3. Fetch resources from Supabase
      const { data: resourceData, error: resourceError } = await supabase
        .from('nodes')
        .select(
          'id, title, type, subjects, topics, tags, language, map_x, map_y, latitude, longitude, parent_id:parent_node_id, island_id, updated_at',
        )
        .gt('updated_at', lastSyncIso)
        .order('updated_at', { ascending: true });

      if (resourceError) {
        console.error('Fetch resources from Supabase failed:', resourceError);
        throw resourceError;
      }

      // 4. Fetch map layers from Supabase
      const { data: layerData, error: layerError } = await supabase
        .from('map_layers')
        .select('id, name, category, is_geographic, updated_at')
        .gt('updated_at', lastSyncIso)
        .order('updated_at', { ascending: true });

      if (layerError) throw layerError;

      console.log(
        `Sync status: ${resourceData?.length || 0} resources, ${layerData?.length || 0} layers.`,
      );

      let latestTimestamp = lastSync;

      // 5. Upsert Resources
      if (resourceData && resourceData.length > 0) {
        const nodesToUpsert: KnowledgeNodeIndex[] = resourceData.map((res) => ({
          id: res.id,
          type: 'resource',
          content_type: res.type,
          title_si: res.language === 'sinhala' ? res.title : null,
          title_ta: res.language === 'tamil' ? res.title : null,
          title_en: res.language === 'english' ? res.title : null,
          tags: Array.isArray(res.tags) ? res.tags.join(', ') : res.tags || '',
          map_x: res.map_x || 0,
          map_y: res.map_y || 0,
          latitude: res.latitude,
          longitude: res.longitude,
          parent_id: res.parent_id,
          island_id: res.island_id,
          updated_at: new Date(res.updated_at).getTime(),
        }));
        await knowledgeDB.upsertNodes(nodesToUpsert);
        latestTimestamp = Math.max(
          latestTimestamp,
          nodesToUpsert[nodesToUpsert.length - 1]!.updated_at,
        );
      }

      // 6. Upsert Layers
      if (layerData && layerData.length > 0) {
        const layersToUpsert = layerData.map((l) => ({
          ...l,
          updated_at: new Date(l.updated_at).getTime(),
        }));
        await knowledgeDB.upsertLayers(layersToUpsert);
        latestTimestamp = Math.max(
          latestTimestamp,
          layersToUpsert[layersToUpsert.length - 1]!.updated_at,
        );
      }

      // 7. Update sync state
      if (latestTimestamp > lastSync) {
        await knowledgeDB.runAsync(
          'INSERT OR REPLACE INTO sync_state (key, last_sync_timestamp, sync_status) VALUES (?, ?, ?)',
          [SYNC_KEY, latestTimestamp, 'idle'],
        );
      }

      console.log('Knowledge Sync Completed Successfully');
    } catch (error) {
      console.error('Knowledge Sync Failed:', error);
      await knowledgeDB
        .runAsync('INSERT OR REPLACE INTO sync_state (key, sync_status) VALUES (?, ?)', [
          SYNC_KEY,
          'error',
        ])
        .catch(() => {});
    }
  },
};
