import { libraryAPI as sanctuaryLibraryAPI } from '@repo/core/api/library';

import { type KnowledgeNodeIndex, knowledgeDB } from '@repo/library/api/database';

const SYNC_KEY = 'library_index_sync';

/**
 * Knowledge Sync Manager
 * Orchestrates the "Radio Broadcast" (Uni-directional) sync from Sovereign Sanctuary to Local SQLite.
 */
export const knowledgeSync = {
  /**
   * Perform a delta sync from Sanctuary API.
   */
  async performSync() {
    // High-fidelity un-shimming: enabled for all platforms including web (IndexedDB)

    console.log('Starting Knowledge Sync...');

    try {
      // 1. Ensure DB is initialized
      await knowledgeDB.init();

      // 2. Get last sync timestamp
      const syncState = await knowledgeDB.getFirstAsync<{
        last_sync_timestamp: number;
      }>('SELECT last_sync_timestamp FROM sync_state WHERE key = ?', [SYNC_KEY]);

      const lastSync = syncState?.last_sync_timestamp || 0;
      const lastSyncIso = new Date(lastSync).toISOString();

      // 3. Fetch resources from Sovereign Sanctuary API
      const resourceData = (await sanctuaryLibraryAPI.fetchSovereignResources({
        limit: 500,
        view_date: lastSyncIso,
      })) as any[];

      // 4. Fetch map layers from Sovereign Sanctuary API
      let layerData: any[] = [];
      try {
        const topology = await sanctuaryLibraryAPI.fetchMapTopology();
        layerData = (topology as any)?.layers || [];
      } catch (e) {
        console.warn('Map layers fetch skipped:', e);
      }

      console.log(
        `Sync status: ${resourceData?.length || 0} resources, ${layerData?.length || 0} layers.`,
      );

      let latestTimestamp = lastSync;

      // 5. Upsert Resources
      if (resourceData && resourceData.length > 0) {
        const nodesToUpsert: KnowledgeNodeIndex[] = resourceData.map((res) => ({
          id: res.id,
          type: 'resource',
          content_type: res.type || res.content_type || null,
          title_si: res.language === 'sinhala' ? res.title : res.title_si || null,
          title_ta: res.language === 'tamil' ? res.title : res.title_ta || null,
          title_en: res.language === 'english' ? res.title : res.title_en || res.title || null,
          tags: Array.isArray(res.tags) ? res.tags.join(', ') : res.tags || '',
          map_x: res.map_x || 0,
          map_y: res.map_y || 0,
          latitude: res.latitude ?? null,
          longitude: res.longitude ?? null,
          parent_id: res.parent_id ?? null,
          island_id: res.island_id ?? null,
          updated_at: res.updated_at ? new Date(res.updated_at).getTime() : Date.now(),
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
          updated_at: l.updated_at ? new Date(l.updated_at).getTime() : Date.now(),
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
