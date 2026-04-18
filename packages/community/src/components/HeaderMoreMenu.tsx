import React, { useState, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
} from '@repo/ui';
import { MoreVertical, BellOff, Bell, UserX, ShieldAlert } from 'lucide-react-native';
import { useSocialShield } from '../hooks/useSocialShield';
import SocialShieldModal from './SocialShieldModal';
import { supabase, identityAPI } from '@repo/core';

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
    targetUserName
}: HeaderMoreMenuProps) {
    const { toggleMute, blockUser } = useSocialShield();
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
                    group_id: groupId || null
                })
                .single();

            if (data) setIsMuted(data.is_muted);
        }
        fetchMuteState();
    }, [conversationId, groupId]);

    const handleToggleMute = async () => {
        const newState = !isMuted;
        await toggleMute({ conversationId, groupId, isMuted: newState });
        setIsMuted(newState);
        setIsMenuOpen(false);
    };

    const handleBlock = async () => {
        if (targetUserId) {
            await blockUser(targetUserId);
            setIsMenuOpen(false);
        }
    };

    return (
        <Box>
            <TouchableOpacity onPress={() => setIsMenuOpen(!isMenuOpen)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <MoreVertical size={24} className="text-foreground" />
            </TouchableOpacity>

            {isMenuOpen && (
                <Box
                    className="absolute top-8 right-0 bg-surface-lowest rounded-comfortable border border-outline-variant shadow-lg min-w-[180px] z-[1000] overflow-hidden"
                >
                    <VStack>
                        <TouchableOpacity className="p-3 border-b border-outline-variant/50" onPress={handleToggleMute}>
                            <HStack space="md" className="items-center">
                                {isMuted ? <Bell size={18} className="text-foreground" /> : <BellOff size={18} className="text-foreground" />}
                                <Text className="text-sm text-foreground">{isMuted ? 'Unmute' : 'Mute'} Sanctuary</Text>
                            </HStack>
                        </TouchableOpacity>

                        {targetUserId && (
                            <TouchableOpacity className="p-3 border-b border-outline-variant/50" onPress={handleBlock}>
                                <HStack space="md" className="items-center">
                                    <UserX size={18} className="text-primary-500" />
                                    <Text className="text-sm text-primary-500">Block User</Text>
                                </HStack>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity className="p-3" onPress={() => { setShowReportModal(true); setIsMenuOpen(false); }}>
                            <HStack space="md" className="items-center">
                                <ShieldAlert size={18} className="text-foreground" />
                                <Text className="text-sm text-foreground">Report</Text>
                            </HStack>
                        </TouchableOpacity>
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
