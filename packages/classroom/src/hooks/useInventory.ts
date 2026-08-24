import { api } from '@repo/core/api/client';
import type { InventoryItem } from '@repo/core/types';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export function useInventory(classroomId: string) {
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
    isLoading,
  };
}
