import UICommunityPresence from '@repo/ui/components/social/CommunityPresence';
import { useCommunityPresence } from '@/hooks/useCommunityPresence';

interface CommunityPresenceProps {
  compact?: boolean;
  hidePadding?: boolean;
  userVibe?: string;
  userId: string;
}

export default function CommunityPresence({
  compact = false,
  hidePadding = false,
  userVibe = 'active',
  userId,
}: CommunityPresenceProps) {
  const { onlineCount, isLoading, isOffline, perspective } = useCommunityPresence({
    userId,
    userVibe,
  });

  return (
    <UICommunityPresence
      compact={compact}
      hidePadding={hidePadding}
      userVibe={userVibe}
      onlineCount={onlineCount}
      isLoading={isLoading}
      isOffline={isOffline}
      perspective={perspective}
    />
  );
}
