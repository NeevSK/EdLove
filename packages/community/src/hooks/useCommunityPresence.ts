import { usePermissions } from '@repo/core/logic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchPresenceFallbackCount, startPresenceSession } from '@repo/community/api/presence';

interface UseCommunityPresenceOptions {
  userId: string;
  userVibe?: string;
}

export function useCommunityPresence({ userId, userVibe = 'active' }: UseCommunityPresenceOptions) {
  const { can, context } = usePermissions();
  const userCapacity = context.activeBond?.capacity ?? context.primaryCapacity ?? 'guest';
  const [onlineCount, setOnlineCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const presenceConfig = useMemo(() => {
    if (can('read', 'PrincipalPulse') || can('manage', 'PrincipalDashboard')) {
      return {
        targetCapacities: [
          'teacher',
          'student',
          'section_head',
          'grade_head',
          'principal',
          'developer',
        ],
        channelName: 'presence:school',
        isCumulative: true,
        perspective: 'principal' as const,
      };
    }

    if (can('read', 'TeacherPulse') || can('manage', 'TeacherDashboard')) {
      return {
        targetCapacities: ['teacher', 'section_head', 'grade_head', 'principal'],
        channelName: 'presence:educators',
        isCumulative: false,
        perspective: 'teacher' as const,
      };
    }

    return {
      targetCapacities: ['student'],
      channelName: 'presence:students',
      isCumulative: false,
      perspective: 'student' as const,
    };
  }, [can]);

  const refreshFallbackCount = useCallback(async () => {
    try {
      const count = await fetchPresenceFallbackCount({
        targetCapacities: presenceConfig.targetCapacities,
        isCumulative: presenceConfig.isCumulative,
        userId,
      });
      setOnlineCount(count);
      setIsOffline(false);
    } catch (error) {
      console.error('[CommunityPresence] Error fetching online users:', error);
      setIsOffline(true);
    } finally {
      setIsLoading(false);
    }
  }, [presenceConfig.isCumulative, presenceConfig.targetCapacities, userId]);

  useEffect(() => {
    void refreshFallbackCount();
    if (!userId) return;

    const cleanupSession = startPresenceSession({
      userId,
      userCapacity,
      userVibe,
      channelName: presenceConfig.channelName,
      onCountChange: setOnlineCount,
      onOfflineChange: setIsOffline,
    });

    const heartbeat = setInterval(() => {
      void refreshFallbackCount();
    }, 30000);

    return () => {
      cleanupSession();
      clearInterval(heartbeat);
    };
  }, [presenceConfig.channelName, refreshFallbackCount, userId, userCapacity, userVibe]);

  return {
    onlineCount,
    isLoading,
    isOffline,
    perspective: presenceConfig.perspective,
  };
}
