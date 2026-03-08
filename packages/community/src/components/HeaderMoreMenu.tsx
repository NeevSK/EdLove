import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    useThemedColors,
    Theme,
} from '@repo/ui';
import { MoreVertical, BellOff, Bell, UserX, ShieldAlert } from 'lucide-react-native';
import { useSocialShield } from '../hooks/useSocialShield';
import SocialShieldModal from './SocialShieldModal';
import { supabase } from '@repo/core';

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
    const colors = useThemedColors();
    const { toggleMute, blockUser } = useSocialShield();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    // Fetch initial mute state
    useEffect(() => {
        async function fetchMuteState() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('conversation_settings')
                .select('is_muted')
                .eq('user_id', user.id)
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
                <MoreVertical size={24} color={colors.text} />
            </TouchableOpacity>

            {isMenuOpen && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 35,
                        right: 0,
                        backgroundColor: colors.secondary,
                        borderRadius: Theme.corners.comfortable,
                        borderWidth: 1,
                        borderColor: colors.border,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 5,
                        minWidth: 180,
                        zIndex: 1000,
                        overflow: 'hidden',
                    }}
                >
                    <VStack>
                        <TouchableOpacity style={styles.menuItem} onPress={handleToggleMute}>
                            <HStack space="md" alignItems="center">
                                {isMuted ? <Bell size={18} color={colors.text} /> : <BellOff size={18} color={colors.text} />}
                                <Text size="sm" color={colors.text}>{isMuted ? 'Unmute Sanctuary' : 'Mute Sanctuary'}</Text>
                            </HStack>
                        </TouchableOpacity>

                        {targetUserId && (
                            <TouchableOpacity style={styles.menuItem} onPress={handleBlock}>
                                <HStack space="md" alignItems="center">
                                    <UserX size={18} color={Theme.colors.sanctuarySaffron} />
                                    <Text size="sm" color={Theme.colors.sanctuarySaffron}>Block User</Text>
                                </HStack>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => { setShowReportModal(true); setIsMenuOpen(false); }}>
                            <HStack space="md" alignItems="center">
                                <ShieldAlert size={18} color={colors.text} />
                                <Text size="sm" color={colors.text}>Report</Text>
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

const styles = StyleSheet.create({
    menuItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    }
});
