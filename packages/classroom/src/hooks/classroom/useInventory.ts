import { useState, useEffect, useCallback } from 'react';
import { api, InventoryItem, InventoryRequest, useStore, SafeZustandStorage } from '@repo/core';

// Key for persisting inventory in the low-level storage
const INVENTORY_CACHE_KEY = 'gurudevi-inventory-cache';
const REQUESTS_CACHE_KEY = 'gurudevi-inventory-requests-cache';

/**
 * useInventory Hook
 * 
 * Manages classroom inventory with a "Local-First" feel.
 * - Loads instantly from persistent cache.
 * - Background fetches from API to stay fresh.
 */
export const useInventory = (classroomId: string) => {
    const isOnline = useStore(state => state.isOnline);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [requests, setRequests] = useState<InventoryRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initial load from cache
    useEffect(() => {
        const loadCache = async () => {
            try {
                const [cachedItems, cachedRequests] = await Promise.all([
                    SafeZustandStorage.getItem(`${INVENTORY_CACHE_KEY}-${classroomId}`),
                    SafeZustandStorage.getItem(`${REQUESTS_CACHE_KEY}-${classroomId}`)
                ]);

                if (cachedItems) setItems(JSON.parse(cachedItems));
                if (cachedRequests) setRequests(JSON.parse(cachedRequests));
            } catch (e) {
                console.warn('Failed to load inventory cache', e);
            } finally {
                setIsLoading(false);
            }
        };
        loadCache();
    }, [classroomId]);

    // Refresh from API
    const refreshData = useCallback(async () => {
        if (!isOnline) return;

        setError(null);
        try {
            const [fetchedItems, fetchedRequests] = await Promise.all([
                api.inventory.getAll(classroomId),
                api.inventory.getRequests(classroomId)
            ]);

            setItems(fetchedItems);
            setRequests(fetchedRequests);

            // Persist to cache
            await Promise.all([
                SafeZustandStorage.setItem(`${INVENTORY_CACHE_KEY}-${classroomId}`, JSON.stringify(fetchedItems)),
                SafeZustandStorage.setItem(`${REQUESTS_CACHE_KEY}-${classroomId}`, JSON.stringify(fetchedRequests))
            ]);
        } catch (err: any) {
            console.error('Failed to refresh inventory:', err);
            setError(err.message || 'Failed to load inventory');
        }
    }, [classroomId, isOnline]);

    // Fetch on mount/online change
    useEffect(() => {
        refreshData();
    }, [refreshData, isOnline]);

    return {
        items,
        requests,
        isLoading,
        error,
        refreshData,
        setItems
    };
};
