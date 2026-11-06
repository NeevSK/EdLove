import { usePermissions } from '@repo/core/logic';
import { startPresenceSession } from '@repo/self/data/selfInsights.data';
import { useEffect, useMemo, useState } from 'react';

interface UseCommunityPresenceOptions {
  userId: string;
  userVibe?: string;
}

export function useCommunityPresence({ userId, userVibe = 'active' }: UseCommunityPresenceOptions) {
  const { can, context } = usePermissions();
  const userRole = context.activeBond?.capacity || 'guest';
  const [onlineCount, setOnlineCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const presenceConfig = useMemo(() => {
    if (can('read', 'PrincipalPulse') || can('manage', 'PrincipalDashboard')) {
      return {
        channelName: 'presence:school',
        perspective: 'principal' as const,
      };
    }

    if (can('read', 'TeacherPulse') || can('manage', 'TeacherDashboard')) {
      return {
        channelName: 'presence:educators',
        perspective: 'teacher' as const,
      };
    }

    return {
      channelName: 'presence:students',
      perspective: 'student' as const,
    };
  }, [can]);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      setOnlineCount(0);
      return;
    }

    const cleanupSession = startPresenceSession({
      userId,
      userRole,
      userVibe,
      channelName: presenceConfig.channelName,
      onCountChange: setOnlineCount,
      onOfflineChange: setIsOffline,
    });
    setIsLoading(false);

    return () => {
      cleanupSession();
    };
  }, [presenceConfig.channelName, userId, userRole, userVibe]);

  return {
    onlineCount,
    isLoading,
    isOffline,
    perspective: presenceConfig.perspective,
  };
}
