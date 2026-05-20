import { identityAPI, supabase } from '@repo/core/api';
import { usePermissions } from '@repo/core/logic';

import { useLotusToast } from '@repo/ui/hooks';
import { Bell, BellOff, MoreVertical, ShieldAlert, UserX } from '@repo/ui/icons';
import { Box, HStack, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';
import { hapticError, hapticSuccess } from '@repo/ui/utils';
import { useEffect, useState } from 'react';
import { useSocialShield } from '../hooks/useSocialShield';
import SocialShieldModal from './SocialShieldModal';

interface HeaderMoreMenuProps {
  conversationId?: string;
  groupId?: string;
  targetUserId?: string;
  targetUserName?: string;
}

export default function HeaderMoreMenu({
  conversationId,
  groupId,
  targetUserId,
  targetUserName,
}: HeaderMoreMenuProps) {
  const { toggleMute, blockUser } = useSocialShield();
  const { showToast } = useLotusToast();
  const { flags } = usePermissions();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Fetch initial mute state
  useEffect(() => {
    async function fetchMuteState() {
      const userId = await identityAPI.getMyInternalId();
      if (!userId) return;

      const { data } = await supabase
        .from('conversation_settings')
        .select('is_muted')
        .eq('user_id', userId)
        .match({
          conversation_id: conversationId || null,
          group_id: groupId || null,
        })
        .single();

      if (data) setIsMuted(data.is_muted);
    }
    fetchMuteState();
  }, [conversationId, groupId]);

  const handleToggleMute = async () => {
    const newState = !isMuted;
    const result = await toggleMute({
      conversationId,
      groupId,
      isMuted: newState,
    });
    if (result?.success) {
      hapticSuccess();
      showToast({
        message: newState
          ? 'Notifications silenced for this sanctuary.'
          : 'Notifications restored.',
        type: 'success',
      });
      setIsMuted(newState);
    } else {
      hapticError();
      showToast({ message: 'Failed to update mute settings.', type: 'error' });
    }
    setIsMenuOpen(false);
  };

  const handleBlock = async () => {
    if (targetUserId) {
      const result = await blockUser(targetUserId);
      if (result?.success) {
        hapticSuccess();
        showToast({
          message: 'User has been blocked. They can no longer see your content or message you.',
          type: 'success',
        });
      } else {
        hapticError();
        showToast({ message: 'Failed to block user.', type: 'error' });
      }
      setIsMenuOpen(false);
    }
  };

  return (
    <Box>
      <Pressable
        onPress={() => setIsMenuOpen(!isMenuOpen)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon as={MoreVertical} size="lg" color="rgba(255,255,255,0.9)" />
      </Pressable>

      {isMenuOpen && (
        <Box className="absolute top-8 right-0 bg-surface-lowest rounded-xl border border-outline-variant shadow-lg min-w-[180px] z-[1000] overflow-hidden">
          <VStack>
            <Pressable
              className="p-3 border-b border-outline-variant/50 active:bg-white/5"
              onPress={handleToggleMute}
            >
              <HStack className="items-center gap-3">
                <Icon as={isMuted ? Bell : BellOff} size="sm" color="rgba(255,255,255,0.9)" />
                <Text className="text-sm text-foreground">
                  {isMuted ? 'Unmute' : 'Mute'} Sanctuary
                </Text>
              </HStack>
            </Pressable>

            {targetUserId && flags.isSocialShieldEnabled && (
              <Pressable
                className="p-3 border-b border-outline-variant/50 active:bg-white/5"
                onPress={handleBlock}
              >
                <HStack className="items-center gap-3">
                  <Icon as={UserX} size="sm" color="#E67E22" />
                  <Text className="text-sm text-primary-500">Block User</Text>
                </HStack>
              </Pressable>
            )}

            {flags.isSocialShieldEnabled && (
              <Pressable
                className="p-3 active:bg-white/5"
                onPress={() => {
                  setShowReportModal(true);
                  setIsMenuOpen(false);
                }}
              >
                <HStack className="items-center gap-3">
                  <Icon as={ShieldAlert} size="sm" color="rgba(255,255,255,0.9)" />
                  <Text className="text-sm text-foreground">Report</Text>
                </HStack>
              </Pressable>
            )}
          </VStack>
        </Box>
      )}

      <SocialShieldModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetUserId={targetUserId}
        targetUserName={targetUserName}
        groupId={groupId}
      />
    </Box>
  );
}
