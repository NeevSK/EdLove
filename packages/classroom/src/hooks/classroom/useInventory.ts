import { useState, useEffect, useCallback } from 'react';
import { api, InventoryItem } from '@repo/core';

export const useInventory = (classroomId: string) => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.inventory.getAll(classroomId);
            setItems(data);
        } catch (err: any) {
            console.error('Failed to load inventory:', err);
            setError(err.message || 'Failed to load inventory');
        } finally {
            setIsLoading(false);
        }
    }, [classroomId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return {
        items,
        isLoading,
        error,
        setItems,
        refresh: loadData
    };
};
