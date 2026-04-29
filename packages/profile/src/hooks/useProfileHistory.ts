import { identityAPI } from '@repo/core/api';

import { useCallback, useEffect, useState } from 'react';
import { profileAPI } from '../api/profile';
import type { ProfileHistoryEntry } from '../domains/profile/ports';

export function useProfileHistory(userId?: string, limit = 20) {
  const [history, setHistory] = useState<ProfileHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const targetId = userId || (await identityAPI.getMyInternalId());
      if (!targetId) {
        setHistory([]);
        return;
      }

      const data = await profileAPI.getUserProfileHistory(targetId, limit);
      setHistory(data);
    } finally {
      setLoading(false);
    }
  }, [limit, userId]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  return { history, loading, refresh: loadHistory };
}
