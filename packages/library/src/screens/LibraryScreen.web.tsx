import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
    ScrollView,
    ActivityIndicator,
    View,
    Text as RNText,
    StyleSheet,
    Pressable,
    TouchableOpacity,
    TextInput as RNTextInput,
} from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    useThemedColors,
    Theme,
    LibraryThumbnailCard,
    openExternalURL,
    LotusPetalFAB,
    useTheme,
} from '@repo/ui';
import { useNavigation } from '@react-navigation/native';
import AddResourceModal from '../components/AddResourceModal';
import {
    Map as MapIcon,
    Plus,
    Search,
    Layers,
    Flame,
    Bookmark,
    Clock,
    Globe,
    BookOpen,
    Video,
    FileText,
    Link as LinkIcon
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useLibrary } from '../hooks/useLibrary';
import { LibraryResource } from '../types';
import { useUserRole, useRoleFeatures, useStore } from '@repo/core';
import { LIBRARY_UI_CATEGORIES } from '../constants/categories';

const SIDEBAR_WIDTH = 280;

export default function LibraryScreen() {
    const searchInputRef = useRef<RNTextInput>(null);
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { role } = useUserRole();
    const { isGuest } = useRoleFeatures();
    const { gradientNodes, accent, glass, text, isDark } = useTheme();
    const { user } = useStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('All');
    const [selectedSort, setSelectedSort] = useState<'recent' | 'popular' | 'most_endorsed' | 'most_bookmarked'>('recent');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const isSearchMode = searchQuery.trim().length > 0 || selectedCategoryId !== 'All';
    const resourceTypeFilter = useMemo(() => {
        if (selectedCategoryId === 'All') return undefined;
        return selectedCategoryId as any;
    }, [selectedCategoryId]);

    const {
        resources,
        loading,
        fetchResources,
        fetchNextResources,
        hasNextResources,
        isFetchingNextResources,
    } = useLibrary(
        isSearchMode
            ? { type: resourceTypeFilter, search: searchQuery || undefined, sort_by: selectedSort }
            : { limit: 100 }
    );

    const handleOpenResource = useCallback((resource: LibraryResource) => {
        if (!resource.url) return;
        if (resource.type === 'pdf') {
            navigation.navigate('PDFViewer', { resourceId: resource.id, title: resource.title, url: resource.url });
            return;
        }
        if (resource.type === 'video' || resource.type === 'movie_trailer') {
            navigation.navigate('VideoPlayer', { resourceId: resource.id, title: resource.title, url: resource.url, creator: resource.creator_name });
            return;
        }
        openExternalURL(resource.url).catch(err => console.error("Couldn't load page", err));
    }, [navigation]);

    const handleAddResource = useCallback(async () => {
        try {
            await fetchResources();
        } catch (err) {
            console.error('Failed to refresh after add', err);
        }
    }, [fetchResources]);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <View style={{
            flex: 1,
            flexDirection: 'row',
            height: '100%',
            overflow: 'hidden',
            backgroundColor: gradientNodes[0],
            color: text.primary
        } as any}>
            {/* 1. Sidebar */}
            <View style={{
                width: 280,
                borderRightWidth: 1,
                borderRightColor: glass.surface.border,
                padding: 24,
                zIndex: 20,
                flexDirection: 'column',
                backgroundColor: glass.surface.bg,
                // @ts-ignore
                backdropFilter: `blur(${glass.surface.blur}px)`,
            }}>
                <VStack sx={{ gap: 24, flex: 1 }}>
                    <Box>
                        <Text sx={{ fontSize: 24, fontWeight: '900', color: text.primary, letterSpacing: -0.5 }}>
                            The Sanctuary
                        </Text>
                        <Text sx={{ fontSize: 13, color: text.secondary, marginTop: 4 }}>
                            Gurudevi Knowledge Hub
                        </Text>
                    </Box>

                    {/* Navigation Groups */}
                    <View style={{ flexDirection: 'column', gap: 8, marginTop: 16 }}>
                        {[
                            { id: 'All', label: 'All Resources', icon: Layers },
                            { id: 'trending', label: 'Trending', icon: Flame },
                            { id: 'bookmarks', label: 'My Vault', icon: Bookmark },
                            { id: 'activity', label: 'Recent Activity', icon: Clock },
                        ].map(item => (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => setSelectedCategoryId(item.id)}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 12,
                                    paddingHorizontal: 16,
                                    paddingVertical: 12,
                                    borderRadius: 12,
                                    backgroundColor: selectedCategoryId === item.id
                                        ? glass.interact.bg
                                        : 'transparent',
                                }}
                            >
                                <item.icon size={18} color={selectedCategoryId === item.id ? accent.action : text.secondary} />
                                <Text style={{
                                    fontSize: 14,
                                    fontWeight: '600',
                                    color: selectedCategoryId === item.id ? accent.action : text.secondary,
                                }}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={{ marginTop: 32 }}>
                        <Text sx={{ fontSize: 11, fontWeight: '800', color: text.secondary, px: 12, letterSpacing: 1, marginBottom: 12 }}>
                            CATEGORIES
                        </Text>
                        <ScrollView style={{ maxHeight: 400 } as any} contentContainerStyle={{ paddingRight: 8 }}>
                            {LIBRARY_UI_CATEGORIES.map(cat => (
                                <TouchableOpacity
                                    key={cat.id}
                                    onPress={() => setSelectedCategoryId(cat.id)}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 12,
                                        paddingHorizontal: 16,
                                        paddingVertical: 8,
                                        borderRadius: 8,
                                    }}
                                >
                                    <View style={{
                                        width: 4,
                                        height: 12,
                                        borderRadius: 2,
                                        backgroundColor: selectedCategoryId === cat.id ? accent.action : 'transparent',
                                    }} />
                                    <Text style={{
                                        fontSize: 13,
                                        fontWeight: selectedCategoryId === cat.id ? 'bold' : 'normal',
                                        color: selectedCategoryId === cat.id ? text.primary : text.secondary,
                                    }}>
                                        {cat.en}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Sidebar Footer */}
                    <View style={{ marginTop: 'auto', paddingTop: 24, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('MapUniverse')}
                            style={{
                                width: '100%',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 12,
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                                borderRadius: 12,
                                backgroundColor: 'rgba(255,255,255,0.03)',
                            }}
                        >
                            <Globe size={18} color={accent.action} />
                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: text.primary }}>
                                Knowledge Cosmos
                            </Text>
                        </TouchableOpacity>
                    </View>
                </VStack>
            </View>

            {/* 2. Main Content Area */}
            <ScrollView
                style={{ flex: 1, backgroundColor: gradientNodes[0] }}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Sticky Header */}
                <View style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 30,
                    flexDirection: 'row',
                    padding: 24,
                    alignItems: 'center',
                    gap: 24,
                    backgroundColor: glass.surface.bg,
                    // @ts-ignore
                    backdropFilter: `blur(${glass.surface.blur}px)`,
                    borderBottomWidth: 1,
                    borderBottomColor: glass.surface.border,
                } as any}>
                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderWidth: 1,
                        borderColor: glass.surface.border,
                    }}>
                        <Search size={18} color={text.secondary} />
                        <RNTextInput
                            ref={searchInputRef}
                            style={{ flex: 1, color: text.primary, fontSize: 14, outline: 'none' } as any}
                            placeholder="Explore the sanctuary... (Cmd+K)"
                            placeholderTextColor={text.secondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                        {role && ['teacher', 'principal', 'admin'].includes(role) && (
                            <TouchableOpacity
                                onPress={() => setIsAddModalOpen(true)}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 8,
                                    paddingHorizontal: 20,
                                    paddingVertical: 10,
                                    borderRadius: 12,
                                    backgroundColor: accent.action,
                                }}
                            >
                                <Plus size={18} strokeWidth={3} color={gradientNodes[0]} />
                                <Text style={{ color: gradientNodes[0], fontWeight: 'bold', fontSize: 14 }}>
                                    Share Wisdom
                                </Text>
                            </TouchableOpacity>
                        )}
                        <View style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: glass.interact.bg,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: accent.action,
                        }}>
                            <Text style={{ color: accent.action, fontWeight: '900', fontSize: 18 }}>
                                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'G'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Content Grid */}
                <View style={{ padding: 32 }}>
                    {loading && resources.length === 0 ? (
                        <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingVertical: 128, gap: 16 }}>
                            <ActivityIndicator color={Theme.colors.sanctuarySaffron} size="large" />
                            <Text style={{ color: 'var(--sanctuary-text-secondary)' }}>Assembling knowledge base...</Text>
                        </View>
                    ) : (
                        <View style={{ flexDirection: 'column', gap: 48 }}>
                            <View style={{ flexDirection: 'column', gap: 8 }}>
                                <Text style={{ fontSize: 30, fontWeight: '900', letterSpacing: -0.5, color: text.primary }}>
                                    {selectedCategoryId === 'All' ? 'Knowledge Sanctuary' : selectedCategoryId}
                                </Text>
                                <Text style={{ color: text.secondary }}>
                                    {resources.length} resources discovered in this stream
                                </Text>
                            </View>

                            <View style={{
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                                gap: 32,
                                justifyContent: 'flex-start',
                            }}>
                                {resources.map(res => (
                                    <View key={res.id} style={{ width: '23%', aspectRatio: 16 / 9 } as any}>
                                        <LibraryThumbnailCard
                                            title={res.title}
                                            type={res.type}
                                            subject={res.subject}
                                            thumbnailUrl={res.media?.url as string | undefined}
                                            endorsements={res.endorsements}
                                            verified={res.verified}
                                            onPress={() => handleOpenResource(res)}
                                            href={(res.type === 'pdf') ? `/app/library/pdf/${res.id}` :
                                                ((res.type === 'video' || res.type === 'movie_trailer') ? `/app/library/video/${res.id}` :
                                                    res.url || undefined)}
                                            target={(res.type !== 'pdf' && res.type !== 'video' && res.type !== 'movie_trailer') ? '_blank' : '_self'}
                                        />
                                    </View>
                                ))}
                            </View>

                            {hasNextResources && (
                                <TouchableOpacity
                                    onPress={() => fetchNextResources()}
                                    disabled={isFetchingNextResources}
                                    style={{
                                        alignSelf: 'center',
                                        paddingHorizontal: 40,
                                        paddingVertical: 16,
                                        borderRadius: 16,
                                        backgroundColor: glass.surface.bg,
                                        borderWidth: 1,
                                        borderColor: glass.surface.border,
                                        opacity: isFetchingNextResources ? 0.5 : 1,
                                    }}
                                >
                                    {isFetchingNextResources ? (
                                        <ActivityIndicator size="small" color={accent.action} />
                                    ) : (
                                        <Text style={{ fontWeight: 'bold', color: text.primary }}>
                                            Load More Findings
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            <AddResourceModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddResource}
            />

            <LotusPetalFAB
                currentTab="library"
                onPress={() => setIsAddModalOpen(true)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    // Keep styles object for components that still need it or for compatibility
    sidebarItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
    },
    actionBtn: {
        padding: 8,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
    }
});

