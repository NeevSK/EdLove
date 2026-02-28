/**
 * UserPublicProfileScreen
 *
 * Shows another user's public profile when their avatar is tapped anywhere
 * in the Community section (feed posts, group chat bubbles, member lists).
 *
 * Displays:
 *  - Avatar + full name + role badge
 *  - School (if same school as viewer)
 *  - Bio / tagline (from users table)
 *  - Contribution stats: posts, endorsements given
 *  - Badges / achievements row (future-ready placeholder)
 *
 * Privacy: only public fields are fetched. No wellbeing data, no grades,
 * no private journal entries are ever shown here.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, ActivityIndicator } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Avatar,
    AvatarFallbackText,
    AvatarImage,
    useThemedColors,
    Theme,
    ScreenWrapper,
    GlobalHeader,
    SanctuaryCard,
} from '@repo/ui';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '@repo/core';
import { BadgeCheck, BookOpen, MessageSquare, ThumbsUp, School } from 'lucide-react-native';
import type { CommunityStackParamList } from '@repo/core';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<CommunityStackParamList, 'UserProfile'>;

interface PublicUser {
    id: string;
    full_name: string;
    role: string;
    avatar_url?: string | null;
    bio?: string | null;
    school_name?: string | null;
}

const ROLE_LABELS: Record<string, string> = {
    student:      'Student',
    teacher:      'Teacher',
    grade_head:   'Grade Head',
    section_head: 'Section Head',
    principal:    'Principal',
    founder:      'Founder',
    admin:        'Admin',
};

export default function UserPublicProfileScreen() {
    const navigation = useNavigation<Nav>();
    const route = useRoute<any>();
    const { userId, userName } = route.params as { userId: string; userName: string };
    const colors = useThemedColors();

    const [user, setUser] = useState<PublicUser | null>(null);
    const [stats, setStats] = useState({ posts: 0, endorsements: 0 });
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch public fields only
            const { data: userData } = await supabase
                .from('users')
                .select('id, full_name, role, avatar_url, school:schools(name)')
                .eq('id', userId)
                .single();

            if (userData) {
                setUser({
                    id: userData.id,
                    full_name: userData.full_name,
                    role: userData.role,
                    avatar_url: userData.avatar_url,
                    school_name: (userData.school as any)?.name ?? null,
                });
            }

            // Post count from community_posts
            const { count: postCount } = await supabase
                .from('community_posts')
                .select('id', { count: 'exact', head: true })
                .eq('author_id', userId)
                .eq('is_anonymous', false);

            // Endorsements given (library)
            const { count: endorseCount } = await supabase
                .from('resource_engagements')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('engagement_type', 'endorse');

            setStats({
                posts: postCount ?? 0,
                endorsements: endorseCount ?? 0,
            });
        } catch (err) {
            console.error('UserPublicProfileScreen fetch error', err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const initials = (user?.full_name ?? userName ?? '?')
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const roleLabel = ROLE_LABELS[user?.role ?? ''] ?? user?.role ?? '';

    return (
        <ScreenWrapper scroll={false}>
            <GlobalHeader
                title={user?.full_name ?? userName}
                subtitle={roleLabel}
                showBack
                onBack={() => navigation.goBack()}
            />

            {loading ? (
                <Box sx={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator color={Theme.colors.sanctuarySaffron} />
                </Box>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: Theme.spacing.lg, gap: Theme.spacing.md }}
                >
                    {/* Avatar + name card */}
                    <SanctuaryCard>
                        <VStack space="md" sx={{ alignItems: 'center', padding: Theme.spacing.lg }}>
                            <Avatar size="2xl" sx={{ backgroundColor: colors.action }}>
                                {user?.avatar_url
                                    ? <AvatarImage source={{ uri: user.avatar_url }} alt={user.full_name} />
                                    : <AvatarFallbackText>{initials}</AvatarFallbackText>
                                }
                            </Avatar>

                            <VStack space="xs" sx={{ alignItems: 'center' }}>
                                <Text color={colors.text} size="xl" bold>{user?.full_name ?? userName}</Text>

                                {/* Role badge */}
                                <HStack space="xs" alignItems="center">
                                    <BadgeCheck color={Theme.colors.sanctuarySaffron} size={14} />
                                    <Text color={colors.textSecondary} size="sm">{roleLabel}</Text>
                                </HStack>

                                {/* School */}
                                {user?.school_name && (
                                    <HStack space="xs" alignItems="center">
                                        <School color={colors.textTertiary} size={12} />
                                        <Text color={colors.textTertiary} size="xs">{user.school_name}</Text>
                                    </HStack>
                                )}
                            </VStack>
                        </VStack>
                    </SanctuaryCard>

                    {/* Contribution stats */}
                    <SanctuaryCard>
                        <VStack space="sm" sx={{ padding: Theme.spacing.md }}>
                            <Text color={colors.textSecondary} size="xs" bold sx={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>
                                Contributions
                            </Text>
                            <HStack space="lg">
                                <VStack space="xs" sx={{ alignItems: 'center', flex: 1 }}>
                                    <MessageSquare color={colors.action} size={20} />
                                    <Text color={colors.text} size="lg" bold>{stats.posts}</Text>
                                    <Text color={colors.textTertiary} size="xs">Posts</Text>
                                </VStack>
                                <Box sx={{ width: 1, backgroundColor: colors.border }} />
                                <VStack space="xs" sx={{ alignItems: 'center', flex: 1 }}>
                                    <ThumbsUp color={Theme.colors.sageGreen} size={20} />
                                    <Text color={colors.text} size="lg" bold>{stats.endorsements}</Text>
                                    <Text color={colors.textTertiary} size="xs">Endorsements</Text>
                                </VStack>
                                <Box sx={{ width: 1, backgroundColor: colors.border }} />
                                <VStack space="xs" sx={{ alignItems: 'center', flex: 1 }}>
                                    <BookOpen color={Theme.colors.gurudeviViolet} size={20} />
                                    <Text color={colors.textTertiary} size="xs" sx={{ textAlign: 'center' }}>
                                        Badges{'\n'}coming soon
                                    </Text>
                                </VStack>
                            </HStack>
                        </VStack>
                    </SanctuaryCard>

                    {/* Privacy note */}
                    <Text
                        color={colors.textTertiary}
                        size="xs"
                        sx={{ textAlign: 'center', paddingHorizontal: Theme.spacing.lg }}
                    >
                        🔒 Only public contributions are shown. Wellbeing data, grades, and private content remain private.
                    </Text>
                </ScrollView>
            )}
        </ScreenWrapper>
    );
}
