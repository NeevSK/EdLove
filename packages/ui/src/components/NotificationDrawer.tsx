import React, { useMemo } from 'react';
import { StyleSheet, Dimensions, Pressable, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { Box, VStack, HStack, Text, Heading } from '../gluestack';
import { X, Bell, Info, CheckCircle, AlertCircle, Users, BookOpen, Check } from 'lucide-react-native';
import Animated, {
    SlideInLeft,
    SlideOutLeft,
    Easing
} from 'react-native-reanimated';
import { Theme } from '../theme/Theme';
import { useThemedColors } from '../hooks/useThemedColors';
import { hapticLight } from '../utils/haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.65;

interface NotificationDrawerProps {
    isVisible: boolean;
    onClose: () => void;
    notifications?: Array<{
        id: string;
        type: string;
        title: string;
        body: string | null;
        is_read: boolean;
        created_at: string;
    }>;
    unreadCount?: number;
    isLoading?: boolean;
    onMarkRead?: (id: string) => void;
    onMarkAllRead?: () => void;
}

function notificationIcon(type: string) {
    switch (type) {
        case 'new_submission': return BookOpen;
        case 'submission_graded': return CheckCircle;
        case 'new_post': return Users;
        case 'group_joined': return Users;
        case 'school_circular': return Bell;
        case 'system': return Info;
        default: return Info;
    }
}

function relativeTime(dateStr: string): string {
    const ts = new Date(dateStr).getTime();
    if (isNaN(ts)) return '';
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationDrawer({
    isVisible,
    onClose,
    notifications = [],
    unreadCount = 0,
    isLoading = false,
    onMarkRead,
    onMarkAllRead,
}: NotificationDrawerProps) {
    const colors = useThemedColors();
    const insets = useSafeAreaInsets();

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <Box
                sx={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                }}
            >
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={() => {
                        hapticLight();
                        onClose();
                    }}
                />

                <Animated.View
                    entering={SlideInLeft.duration(800).easing(Easing.out(Easing.exp))}
                    exiting={SlideOutLeft.duration(500)}
                    style={[
                        styles.drawer,
                        {
                            backgroundColor: colors.primary,
                            borderColor: colors.border,
                            paddingTop: insets.top,
                            paddingBottom: insets.bottom,
                        }
                    ]}
                >
                    <VStack sx={{ gap: '$md' as any, flex: 1, padding: Theme.spacing.lg }}>
                        {/* Header */}
                        <HStack justifyContent="space-between" alignItems="center" sx={{ height: 60 }}>
                            <HStack sx={{ gap: '$sm' as any, alignItems: 'center' }}>
                                <Bell size={24} color={colors.action} />
                                <Heading color={colors.text} sx={{ fontSize: '$lg' as any }}>
                                    Notifications
                                </Heading>
                                {unreadCount > 0 && (
                                    <Box sx={{
                                        backgroundColor: colors.action,
                                        borderRadius: 10,
                                        minWidth: 20,
                                        height: 20,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        paddingHorizontal: 4,
                                    }}>
                                        <Text sx={{ color: Theme.colors.sacredWhite, fontSize: 11, fontWeight: '700' }}>
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </Text>
                                    </Box>
                                )}
                            </HStack>
                            <HStack sx={{ gap: '$sm' as any, alignItems: 'center' }}>
                                {unreadCount > 0 && onMarkAllRead && (
                                    <Pressable
                                        onPress={() => { hapticLight(); onMarkAllRead(); }}
                                        hitSlop={10}
                                    >
                                        <Check size={18} color={colors.action} />
                                    </Pressable>
                                )}
                                <Pressable
                                    onPress={() => { hapticLight(); onClose(); }}
                                    hitSlop={10}
                                >
                                    <X size={28} color={colors.textSecondary} />
                                </Pressable>
                            </HStack>
                        </HStack>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: Theme.spacing.xl }}
                        >
                            {isLoading ? (
                                <Box sx={{ alignItems: 'center', paddingVertical: Theme.spacing.xl }}>
                                    <ActivityIndicator color={colors.action} />
                                </Box>
                            ) : notifications.length === 0 ? (
                                <VStack sx={{ alignItems: 'center', paddingVertical: Theme.spacing.xl, gap: 8 }}>
                                    <Bell size={40} color={colors.textTertiary} />
                                    <Text color={colors.textTertiary} sx={{ textAlign: 'center', fontSize: '$sm' as any }}>
                                        You're all caught up 🙏
                                    </Text>
                                </VStack>
                            ) : (
                                <VStack sx={{ gap: '$sm' as any, marginTop: '$4' as any }}>
                                    {notifications.map((n) => {
                                        const Icon = notificationIcon(n.type);
                                        return (
                                            <Pressable
                                                key={n.id}
                                                onPress={() => {
                                                    hapticLight();
                                                    if (!n.is_read && onMarkRead) onMarkRead(n.id);
                                                }}
                                            >
                                                <Box sx={{
                                                    padding: Theme.spacing.md,
                                                    borderRadius: Theme.corners.comfortable,
                                                    backgroundColor: n.is_read ? colors.tertiary : `${colors.action}14`,
                                                    borderWidth: 1,
                                                    borderColor: n.is_read ? colors.border : `${colors.action}40`,
                                                }}>
                                                    <HStack sx={{ gap: '$sm' as any, alignItems: 'flex-start' }}>
                                                        <Box sx={{
                                                            padding: 8,
                                                            borderRadius: 20,
                                                            backgroundColor: colors.secondary
                                                        }}>
                                                            <Icon size={16} color={n.is_read ? colors.textTertiary : colors.action} />
                                                        </Box>
                                                        <VStack sx={{ flex: 1, gap: 2 }}>
                                                            <Text color={colors.text} sx={{ fontWeight: n.is_read ? '400' : '700', fontSize: '$sm' as any }}>
                                                                {n.title}
                                                            </Text>
                                                            {n.body ? (
                                                                <Text color={colors.textSecondary} sx={{ fontSize: '$xs' as any }} numberOfLines={2}>
                                                                    {n.body}
                                                                </Text>
                                                            ) : null}
                                                            <Text color={colors.textTertiary} sx={{ fontSize: 10 }}>
                                                                {relativeTime(n.created_at)}
                                                            </Text>
                                                        </VStack>
                                                    </HStack>
                                                </Box>
                                            </Pressable>
                                        );
                                    })}
                                </VStack>
                            )}
                        </ScrollView>

                        <Text
                            color={colors.textTertiary}
                            textAlign="center"
                            sx={{ fontSize: '$xs' as any, fontStyle: 'italic', marginBottom: Theme.spacing.sm }}
                        >
                            Your sanctuary stays updated.
                        </Text>
                    </VStack>
                </Animated.View>
            </Box>
        </Modal>
    );
}

const styles = StyleSheet.create({
    drawer: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: DRAWER_WIDTH,
        borderRightWidth: 1,
        shadowColor: Theme.colors.shadowViolet,
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
        elevation: 10,
    }
});
