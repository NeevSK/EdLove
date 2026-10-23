import { inventoryAPI } from '@repo/core/api/client';
import type { InventoryItem } from '@repo/core/types';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export function useInventory(classroomId: string) {
  const [items, setItems] = useState<InventoryItem[]>([]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['inventory', classroomId],
    queryFn: () => inventoryAPI.getAll(classroomId),
    enabled: Boolean(classroomId),
  });

  useEffect(() => {
    if (data) {
      setItems(data);
    }
  }, [data]);

  return {
    items,
    setItems,
    isLoading,
    refetch,
  };
}
