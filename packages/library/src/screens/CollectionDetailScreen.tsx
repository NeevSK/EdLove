import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { Text, Box, ScreenWrapper, Theme, useThemedColors } from '@repo/ui';
import { useStore } from '@repo/core';
import { useCollection } from '../hooks/useLibrary';
import { LibraryThumbnailCard } from '../components/LibraryThumbnailCard';
import type { LibraryResource } from '../types';

export default function CollectionDetailScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const colors = useThemedColors();
    const { user } = useStore();
    const { id } = route?.params || {};

    const { collection, isLoading, error, refetch } = useCollection(id, user?.id);

    const handleOpenResource = useCallback((resource: LibraryResource) => {
        navigation.navigate('ResourceHub', { resourceId: resource.id });
    }, [navigation]);

    const getYoutubeThumbnail = (url?: string) => {
        if (!url) return undefined;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]{11})/);
        return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : undefined;
    };

    if (isLoading) {
        return (
            <ScreenWrapper>
                <Box style={styles.centered}>
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>Loading collection...</Text>
                </Box>
            </ScreenWrapper>
        );
    }

    if (error || !collection) {
        return (
            <ScreenWrapper>
                <Box style={styles.centered}>
                    <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>Collection unavailable</Text>
                    <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
                        {String(error || 'We could not load this collection right now.')}
                    </Text>
                    <Box style={styles.buttonRow}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.button, { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' }]}>
                            <Text style={[styles.buttonText, { color: colors.textPrimary }]}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => refetch()} style={[styles.button, { backgroundColor: Theme.colors.sanctuarySaffron, borderColor: Theme.colors.sanctuarySaffron }]}>
                            <Text style={[styles.buttonText, { color: Theme.colors.sacredWhite }]}>Retry</Text>
                        </TouchableOpacity>
                    </Box>
                </Box>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper scroll={false}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Box style={styles.pagePadding}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ArrowLeft size={16} color={colors.textPrimary} />
                        <Text style={[styles.backButtonText, { color: colors.textPrimary }]}>Back to Library</Text>
                    </TouchableOpacity>
                </Box>

                <Box style={styles.pagePadding}>
                    <Box style={styles.heroCard}>
                        <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>{collection.name}</Text>
                        <Text style={[styles.heroDescription, { color: colors.textSecondary }]}>
                            {collection.description || 'Curated resources gathered into one place.'}
                        </Text>
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                            {collection.resources.length} resources
                            {collection.creator_name ? ` • Curated by ${collection.creator_name}` : ''}
                        </Text>
                    </Box>

                    <Box style={styles.resourceList}>
                        {collection.resources.map((resource) => (
                            <LibraryThumbnailCard key={resource.id} title={resource.title} type={resource.type} subject={resource.subjects?.[0] || 'General'} thumbnailUrl={ resource.media?.url || resource.thumbnail_url || (resource.type === 'video' || resource.type === 'movie_trailer' ? getYoutubeThumbnail(resource.url) : undefined) } endorsements={resource.endorsements} verified={resource.verified} onPress={() => handleOpenResource(resource)}
                            />
                        ))}
                    </Box>
                </Box>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: Theme.spacing.xl * 2,
    },
    pagePadding: {
        paddingHorizontal: Theme.spacing.md,
        paddingTop: Theme.spacing.md,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingHorizontal: Theme.spacing.lg,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    errorMessage: {
        textAlign: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 10,
    },
    button: {
        minHeight: 42,
        minWidth: 100,
        borderRadius: 14,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    buttonText: {
        fontWeight: '700',
    },
    backButton: {
        minHeight: 42,
        alignSelf: 'flex-start',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    backButtonText: {
        fontSize: 13,
        fontWeight: '700',
    },
    heroCard: {
        padding: Theme.spacing.lg,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: Theme.spacing.lg,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: '800',
        marginBottom: 10,
    },
    heroDescription: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 12,
    },
    metaText: {
        fontSize: 12,
    },
    resourceList: {
        gap: 14,
    },
});
