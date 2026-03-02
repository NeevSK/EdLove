import { supabase } from '@repo/core';
import { knowledgeDB, KnowledgeNodeIndex } from './database';
import { LibraryResource } from '../types';
import { Platform } from 'react-native';

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
        if (Platform.OS === 'web') return;

        console.log('Starting Knowledge Sync...');

        try {
            // 1. Ensure DB is initialized
            await knowledgeDB.init();

            // 2. Get last sync timestamp
            const syncState = await knowledgeDB.db?.getFirstAsync<{ last_sync_timestamp: number }>(
                'SELECT last_sync_timestamp FROM sync_state WHERE key = ?',
                [SYNC_KEY]
            );

            const lastSync = syncState?.last_sync_timestamp || 0;

            // 3. Fetch changes from Supabase
            // We fetch any resource updated since the last sync
            const { data, error } = await supabase
                .from('library_resources')
                .select('id, title, type, subject, topics, tags, language, updated_at')
                .gt('updated_at', new Date(lastSync).toISOString())
                .order('updated_at', { ascending: true });

            if (error) throw error;

            if (!data || data.length === 0) {
                console.log('Knowledge Index is already up-to-date.');
                return;
            }

            console.log(`Received ${data.length} updates from server.`);

            // 4. Map and Upsert
            const nodesToUpsert: KnowledgeNodeIndex[] = data.map(res => {
                const node: KnowledgeNodeIndex = {
                    id: res.id,
                    type: 'resource',
                    content_type: res.type,
                    title_si: res.language === 'sinhala' ? res.title : null,
                    title_ta: res.language === 'tamil' ? res.title : null,
                    title_en: res.language === 'english' ? res.title : null,
                    tags: Array.isArray(res.tags) ? res.tags.join(', ') : (res.tags || ''),
                    map_x: 0, // In the future, these can come from the server or be computed
                    map_y: 0,
                    updated_at: new Date(res.updated_at).getTime()
                };
                return node;
            });

            await knowledgeDB.upsertNodes(nodesToUpsert);

            // 5. Update sync state
            const latestTimestamp = nodesToUpsert[nodesToUpsert.length - 1]!.updated_at;

            await knowledgeDB.db?.runAsync(
                'INSERT OR REPLACE INTO sync_state (key, last_sync_timestamp, sync_status) VALUES (?, ?, ?)',
                [SYNC_KEY, latestTimestamp, 'idle']
            );

            console.log('Knowledge Sync Completed Successfully');
        } catch (error) {
            console.error('Knowledge Sync Failed:', error);

            await knowledgeDB.db?.runAsync(
                'INSERT OR REPLACE INTO sync_state (key, sync_status) VALUES (?, ?)',
                [SYNC_KEY, 'error']
            ).catch(() => { });
        }
    }
};
