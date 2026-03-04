import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import {
    Box,
    Text,
    VStack,
    HStack,
    Heading,
    ScreenWrapper,
    useThemedColors,
    Theme,
    useTheme,
    SanctuaryBackground,
    GlobalHeader,
    PositiveInvitation,
    LotusPetalFAB
} from '@repo/ui';
import {
    Users,
    Search,
    Hash,
    MessageSquare,
    Trophy,
    Compass,
    Activity,
    Users2
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useUserRole, UserRole } from '@repo/core';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CommunityStackParamList } from '@repo/core';
import { useCommunity } from '../hooks/useCommunity';
import { useCommunityFilters } from '../hooks/useCommunityFilters';
import { useCommunityGroups } from '../hooks/useCommunityGroups';

/**
 * CommunityScreen.web
 * 
 * High-end 3-Column Layout for Desktop:
 * Left: Santuary Groups Explorer
 * Center: Main Community Stream
 * Right: Active Presence & Resonance
 */
export default function CommunityScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<CommunityStackParamList>>();
    const { role } = useUserRole();
    const { glass, text, accent } = useTheme();
    const colors = useThemedColors();

    const isEcosystemRole = role === 'founder' || role === 'admin' || role === 'developer';
    const [selectedGroupId, setSelectedGroupId] = useState('all');

    return (
        <View style={webStyles.container}>
            <SanctuaryBackground />

            <View style={webStyles.layout}>
                {/* 1. Left Sidebar: Sanctuary Explorer */}
                <View style={[webStyles.sidebar, {
                    backgroundColor: glass.surface.bg,
                    borderRightColor: glass.surface.border,
                    // @ts-ignore
                    backdropFilter: `blur(${glass.surface.blur}px)`
                }]}>
                    <VStack sx={{ gap: 24, padding: 24 }}>
                        <VStack sx={{ gap: 4 }}>
                            <Heading sx={{ fontSize: 20, fontWeight: '900', color: text.primary }}>The Heart</Heading>
                            <Text sx={{ fontSize: 13, color: text.secondary }}>Ecosystem Resonance</Text>
                        </VStack>

                        <VStack sx={{ gap: 8 }}>
                            <SidebarItem
                                icon={<Compass size={18} />}
                                label="Global Stream"
                                active={selectedGroupId === 'all'}
                                onPress={() => setSelectedGroupId('all')}
                            />
                            <SidebarItem
                                icon={<Users2 size={18} />}
                                label="My Sanctuaries"
                                active={selectedGroupId === 'my'}
                                onPress={() => setSelectedGroupId('my')}
                            />
                            <SidebarItem
                                icon={<Activity size={18} />}
                                label="Tide & Pulse"
                                active={selectedGroupId === 'pulse'}
                                onPress={() => setSelectedGroupId('pulse')}
                            />
                            <SidebarItem
                                icon={<MessageSquare size={18} />}
                                label="Messages"
                                active={selectedGroupId === 'messages'}
                                onPress={() => navigation.navigate('DirectMessagesList')}
                            />
                        </VStack>

                        <Box sx={{ marginTop: 12 }}>
                            <Text sx={{ fontSize: 11, fontWeight: '800', color: text.secondary, letterSpacing: 1, marginBottom: 12 }}>
                                TRENDING SANCTUARIES
                            </Text>
                            <VStack sx={{ gap: 4 }}>
                                {['Teachers Lounge', 'Physics Deep-dive', 'Principal Council'].map(g => (
                                    <TouchableOpacity key={g} style={webStyles.groupItem}>
                                        <Hash size={14} color={text.secondary} />
                                        <Text sx={{ fontSize: 14, color: text.secondary }}>{g}</Text>
                                    </TouchableOpacity>
                                ))}
                            </VStack>
                        </Box>
                    </VStack>
                </View>

                {/* 2. Center: Community Stream */}
                <View style={webStyles.feedContainer}>
                    <GlobalHeader
                        title="Community Feed"
                        subtitle={isEcosystemRole ? "Architect's Stream" : "Global Resonance"}
                    />

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={webStyles.feedScroll}
                    >
                        {/* 
                            IF GUEST AND NOT ECOSYSTEM ROLE: Show Invitation (Gate)
                            ELSE: Show Real Feed
                        */}
                        {!isEcosystemRole && (role as any) === 'guest' ? (
                            <Box sx={{ marginTop: 40, width: '100%', maxWidth: 600, alignSelf: 'center' }}>
                                <PositiveInvitation
                                    context="community"
                                    onAction={() => console.log('Nav to Auth')}
                                />
                            </Box>
                        ) : (
                            <VStack sx={{ gap: 24, maxWidth: 650, width: '100%', alignSelf: 'center' }}>
                                {/* Mock Feed Items for now - Placeholder */}
                                <FeedItem
                                    author="Arun Wijesinghe"
                                    role="Principal"
                                    content="Excited to announce our new Physics lab is now fully operational! Looking forward to seeing our students explore the wonders of the cosmos."
                                    timestamp="2h ago"
                                />
                                <FeedItem
                                    author="Nalini Perera"
                                    role="Teacher"
                                    content="The shared lesson plans for Grade 8 Mathematics have been updated with new interactive exercises. Please take a look!"
                                    timestamp="4h ago"
                                />
                                <FeedItem
                                    author="System Update"
                                    role="Gurudevi Admin"
                                    content="A new Sanctuary for Grade 12 Advanced Biology has been established. All students are encouraged to join."
                                    timestamp="Yesterday"
                                />
                            </VStack>
                        )}
                    </ScrollView>
                </View>

                {/* 3. Right Sidebar: Active Presence & Stats */}
                <View style={[webStyles.presenceSidebar, {
                    borderLeftColor: glass.surface.border,
                    backgroundColor: 'rgba(255,255,255,0.01)'
                }]}>
                    <VStack sx={{ gap: 32, padding: 24 }}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('DirectMessagesList')}
                            activeOpacity={0.7}
                        >
                            <Box sx={{
                                padding: 20,
                                borderRadius: 20,
                                backgroundColor: accent.action + '10',
                                borderWidth: 1,
                                borderColor: accent.action + '30',
                                '&:hover': { borderColor: accent.action + '60', backgroundColor: accent.action + '15' }
                            }}>
                                <HStack sx={{ gap: 12, alignItems: 'center' }}>
                                    <MessageSquare size={20} color={accent.action} />
                                    <VStack>
                                        <Text sx={{ fontSize: 16, fontWeight: '800', color: text.primary }}>Pulse: High</Text>
                                        <Text sx={{ fontSize: 12, color: text.secondary }}>View All Conversations</Text>
                                    </VStack>
                                </HStack>
                            </Box>
                        </TouchableOpacity>

                        <VStack sx={{ gap: 16 }}>
                            <Heading sx={{ fontSize: 16, fontWeight: '800', color: text.primary }}>Online Presence</Heading>
                            <VStack sx={{ gap: 12 }}>
                                <PresenceItem name="Arun W." status="online" role="Principal" />
                                <PresenceItem name="Deepika R." status="online" role="Admin" />
                            </VStack>
                        </VStack>

                        <Box sx={{
                            padding: 20,
                            borderRadius: 20,
                            borderWidth: 1,
                            borderColor: glass.surface.border,
                            backgroundColor: glass.surface.bg
                        }}>
                            <HStack sx={{ gap: 12, alignItems: 'center' }}>
                                <Trophy size={20} color={Theme.colors.sanctuarySaffron} />
                                <VStack>
                                    <Text sx={{ fontSize: 14, fontWeight: '800', color: text.primary }}>Top Resonator</Text>
                                    <Text sx={{ fontSize: 12, color: text.secondary }}>Nalini Perera (128 Hearts)</Text>
                                </VStack>
                            </HStack>
                        </Box>
                    </VStack>
                </View>
            </View>

            <LotusPetalFAB
                currentTab="community"
                onPress={() => console.log('Create Post')}
            />
        </View>
    );
}

function SidebarItem({ icon, label, active, onPress }: { icon: any, label: string, active: boolean, onPress: () => void }) {
    const { text, glass, accent } = useTheme();
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                webStyles.sidebarItem,
                active && { backgroundColor: glass.interact.bg }
            ]}
        >
            {React.cloneElement(icon, { color: active ? accent.action : text.secondary })}
            <Text sx={{
                fontSize: 14,
                fontWeight: active ? '700' : '500',
                color: active ? accent.action : text.secondary
            }}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

function FeedItem({ author, role, content, timestamp }: { author: string, role: string, content: string, timestamp: string }) {
    const { text, glass } = useTheme();
    const colors = useThemedColors();
    return (
        <Box sx={{
            padding: 24,
            borderRadius: 24,
            backgroundColor: glass.surface.bg,
            borderWidth: 1,
            borderColor: glass.surface.border,
            transition: 'transform 0.2s ease',
            '&:hover': {
                transform: 'translateY(-2px)',
                borderColor: Theme.colors.sanctuarySaffron + '40'
            }
        }}>
            <VStack sx={{ gap: 12 }}>
                <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <HStack sx={{ gap: 12, alignItems: 'center' }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Theme.colors.sanctuarySaffron + '20', alignItems: 'center', justifyContent: 'center' }}>
                            <Text sx={{ fontSize: 16, fontWeight: '800', color: Theme.colors.sanctuarySaffron }}>{author[0]}</Text>
                        </Box>
                        <VStack>
                            <Text sx={{ fontSize: 15, fontWeight: '700', color: text.primary }}>{author}</Text>
                            <Text sx={{ fontSize: 12, color: text.secondary }}>{role}</Text>
                        </VStack>
                    </HStack>
                    <Text sx={{ fontSize: 12, color: text.secondary }}>{timestamp}</Text>
                </HStack>
                <Text sx={{ fontSize: 15, lineHeight: 22, color: text.primary }}>{content}</Text>
                <HStack sx={{ gap: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: glass.surface.border }}>
                    <HStack sx={{ gap: 6, alignItems: 'center' }}>
                        <HeartIcon active={false} />
                        <Text sx={{ fontSize: 13, color: text.secondary }}>12 Hearts</Text>
                    </HStack>
                    <HStack sx={{ gap: 6, alignItems: 'center' }}>
                        <MessageSquare size={16} color={text.secondary} />
                        <Text sx={{ fontSize: 13, color: text.secondary }}>4 Reflections</Text>
                    </HStack>
                </HStack>
            </VStack>
        </Box>
    );
}

function HeartIcon({ active }: { active: boolean }) {
    const { accent, text } = useTheme();
    return (
        <View style={{ opacity: 0.8 }}>
            <Text style={{ fontSize: 16 }}>❤️</Text>
        </View>
    );
}

function PresenceItem({ name, status, role }: { name: string, status: 'online' | 'away', role: string }) {
    const { text } = useTheme();
    return (
        <HStack sx={{ gap: 10, alignItems: 'center' }}>
            <View style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: status === 'online' ? '#10b981' : '#f59e0b'
            }} />
            <VStack>
                <Text sx={{ fontSize: 13, fontWeight: '600', color: text.primary }}>{name}</Text>
                <Text sx={{ fontSize: 11, color: text.secondary }}>{role}</Text>
            </VStack>
        </HStack>
    );
}

const webStyles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    layout: {
        flex: 1,
        flexDirection: 'row',
    },
    sidebar: {
        width: 300,
        height: '100%',
        borderRightWidth: 1,
    },
    feedContainer: {
        flex: 1,
        height: '100%',
    },
    feedScroll: {
        padding: 32,
    },
    presenceSidebar: {
        width: 320,
        height: '100%',
        borderLeftWidth: 1,
    },
    sidebarItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 12,
    },
    groupItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 10,
    }
});
