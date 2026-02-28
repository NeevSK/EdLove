import { useState, useEffect } from 'react';
import { api, InventoryItem } from '@repo/core';
import { useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * useInventory Hook
 * 
 * Manages classroom inventory with a "Local-First" approach.
 * Loads instantly from cache, background fetches from API.
 */
export function useInventory(classroomId: string) {
    const queryClient = useQueryClient();
    const [items, setItems] = useState<InventoryItem[]>([]);

    const { data, isLoading } = useQuery({
        queryKey: ['inventory', classroomId],
        queryFn: () => api.inventory.getAll(classroomId),
        enabled: !!classroomId,
    });

    useEffect(() => {
        if (data) {
            setItems(data);
        }
    }, [data]);

    return {
        items,
        setItems,
        isLoading
    };
}
