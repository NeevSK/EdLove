import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Share, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, Globe, PlayCircle, QrCode, Share2, Sparkles } from 'lucide-react-native';
import { Text, Box, ScreenWrapper, Theme, openExternalURL, useThemedColors } from '@repo/ui';
import { useStore } from '@repo/core';
import { libraryAPI } from '../api/library';
import type { LibraryResource } from '../types';
import { ResourceShareQRModal } from '../components/ResourceShareQRModal';
import { buildLibraryExternalLinkOptions } from '../utils/externalLinks';
import { buildLibraryResourceShareUrl, buildResourceCompanionLinks, type ResourceCompanionLink } from '../utils/resourceLinks';

function ActionButton({
    label,
    icon,
    onPress,
    accent = false,
    textColor,
}: {
    label: string;
    icon: React.ReactNode;
    onPress: () => void;
    accent?: boolean;
    textColor?: string;
}) {
    return (
        <TouchableOpacity onPress={onPress} style={[ styles.actionButton, accent ? styles.actionButtonAccent : styles.actionButtonMuted, ]}>
            {icon}
            <Text style={[styles.actionButtonText, textColor ? { color: textColor } : undefined]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

function CompanionLinkCard({
    link,
    onPress,
    textColor,
    secondaryTextColor,
}: {
    link: ResourceCompanionLink;
    onPress: (link: ResourceCompanionLink) => void;
    textColor: string;
    secondaryTextColor: string;
}) {
    return (
        <TouchableOpacity onPress={() => onPress(link)} style={styles.card}>
            <Box style={styles.cardRow}>
                <Box style={styles.cardContent}>
                    <Text style={[styles.cardTitle, { color: textColor }]}>{link.label}</Text>
                    <Text style={[styles.cardDescription, { color: secondaryTextColor }]}>{link.description}</Text>
                </Box>
                <ExternalLink size={18} color={secondaryTextColor} />
            </Box>
        </TouchableOpacity>
    );
}

export default function ResourceHubScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const colors = useThemedColors();
    const { user } = useStore();
    const [qrVisible, setQrVisible] = useState(false);

    const resourceId = route?.params?.resourceId as string | undefined;

    const { data: resource, isLoading, error, refetch } = useQuery({
        queryKey: ['library', 'resource-hub', resourceId, user?.id || 'guest'],
        queryFn: () => libraryAPI.getResourceById(resourceId!, user?.id),
        enabled: !!resourceId,
    });

    const primaryContext = useMemo(() => {
        if (!resource) return null;
        return resource.topics?.[0] || resource.subjects?.[0] || resource.tags?.[0] || resource.title;
    }, [resource]);

    const { data: relatedResources } = useQuery({
        queryKey: ['library', 'resource-hub', 'related', resourceId, primaryContext],
        enabled: !!resourceId && !!primaryContext,
        queryFn: async () => {
            if (!resource) return [] as LibraryResource[];

            let related = await libraryAPI.getResources({
                topic: resource.topics?.[0],
                subject: resource.topics?.[0] ? undefined : resource.subjects?.[0],
                limit: 8,
            });

            if (related.length <= 1) {
                related = await libraryAPI.searchLibrary({
                    query: primaryContext || resource.title,
                    limit: 8,
                });
            }

            return related.filter((item) => item.id !== resource.id).slice(0, 6);
        },
    });

    const companionLinks = useMemo(
        () => (resource ? buildResourceCompanionLinks(resource) : []),
        [resource]
    );

    const handleBack = useCallback(() => {
        if (navigation.canGoBack()) {
            navigation.goBack();
            return;
        }
        navigation.navigate('Main', {
            screen: 'Library',
            params: { screen: 'LibraryHome' },
        });
    }, [navigation]);

    const navigateIntoLibrary = useCallback((screen: string, params: Record<string, unknown>) => {
        const rootState = navigation.getState?.();
        const hasMainRoute = rootState?.routeNames?.includes('Main');

        if (!hasMainRoute) {
            if (screen === 'ResourceHub') {
                navigation.navigate('LibraryResourceHub', params);
            }
            return;
        }

        navigation.navigate('Main', {
            screen: 'Library',
            params: {
                screen,
                params,
            },
        });
    }, [navigation]);

    const handlePrimaryAction = useCallback((item: LibraryResource) => {
        if (!item.url) return;

        const rootState = navigation.getState?.();
        const hasMainRoute = rootState?.routeNames?.includes('Main');

        if (hasMainRoute && item.type === 'pdf') {
            navigateIntoLibrary('PDFViewer', {
                resourceId: item.id,
                title: item.title,
                url: item.url,
                creator: item.creator_name,
            });
            return;
        }

        if (hasMainRoute && (item.type === 'video' || item.type === 'movie_trailer')) {
            navigateIntoLibrary('VideoPlayer', {
                resourceId: item.id,
                title: item.title,
                url: item.url,
                creator: item.creator_name,
            });
            return;
        }

        openExternalURL(item.url, buildLibraryExternalLinkOptions(item, 'Resource hub')).catch((err) =>
            console.error("Couldn't open resource source", err)
        );
    }, [navigateIntoLibrary, navigation]);

    const handleCompanionOpen = useCallback((link: ResourceCompanionLink) => {
        openExternalURL(link.url, {
            title: link.label,
            sourceLabel: 'Resource hub',
            sourceBadge: 'External context',
            trustLevel: link.kind === 'primary' ? 'verified' : 'external',
        }).catch((err) => console.error("Couldn't open companion link", err));
    }, []);

    const handleShare = useCallback(async (item: LibraryResource) => {
        const shareUrl = buildLibraryResourceShareUrl(item.id);
        await Share.share({
            message: `Explore "${item.title}" on Gurudevi\n${shareUrl}`,
            url: shareUrl,
            title: item.title,
        });
    }, []);

    if (!resourceId) {
        return (
            <ScreenWrapper>
                <Box style={styles.centered}>
                    <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>Resource not found</Text>
                    <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
                        This link does not include a valid Gurudevi resource id.
                    </Text>
                    <ActionButton label="Back to Library" icon={<ArrowLeft size={16} color={Theme.colors.sacredWhite} />}
                        onPress={handleBack}
                        accent
                        textColor={Theme.colors.sacredWhite}
                    />
                </Box>
            </ScreenWrapper>
        );
    }

    if (isLoading) {
        return (
            <ScreenWrapper>
                <Box style={styles.centered}>
                    <ActivityIndicator size="large" color={Theme.colors.sanctuarySaffron} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>Loading resource hub...</Text>
                </Box>
            </ScreenWrapper>
        );
    }

    if (error || !resource) {
        return (
            <ScreenWrapper>
                <Box style={styles.centered}>
                    <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>We couldn't load this resource</Text>
                    <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
                        {String((error as Error)?.message || 'The resource may have moved or been removed.')}
                    </Text>
                    <Box style={styles.buttonRow}>
                        <ActionButton label="Back" icon={<ArrowLeft size={16} color={colors.textPrimary} />}
                            onPress={handleBack}
                            textColor={colors.textPrimary}
                        />
                        <ActionButton label="Retry" icon={<Sparkles size={16} color={Theme.colors.sacredWhite} />}
                            onPress={() => refetch()}
                            accent
                            textColor={Theme.colors.sacredWhite}
                        />
                    </Box>
                </Box>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper scroll={false}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Box style={styles.pagePadding}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <ArrowLeft size={16} color={colors.textPrimary} />
                        <Text style={[styles.backButtonText, { color: colors.textPrimary }]}>Back to Library</Text>
                    </TouchableOpacity>
                </Box>

                <Box style={styles.pagePadding}>
                    <Box style={styles.heroCard}>
                        <Box style={styles.badgeRow}>
                            <Box style={styles.hubBadge}>
                                <Text style={styles.hubBadgeText}>Resource hub</Text>
                            </Box>
                            {resource.verified ? (
                                <Box style={styles.verifiedBadge}>
                                    <Text style={styles.verifiedBadgeText}>Verified</Text>
                                </Box>
                            ) : null}
                        </Box>

                        <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>{resource.title}</Text>
                        {resource.description ? (
                            <Text style={[styles.heroDescription, { color: colors.textSecondary }]}>
                                {resource.description}
                            </Text>
                        ) : null}

                        <Box style={styles.chipRow}>
                            {resource.subjects?.slice(0, 3).map((subject) => (
                                <Box key={subject} style={styles.chip}>
                                    <Text style={[styles.chipText, { color: colors.textSecondary }]}>{subject}</Text>
                                </Box>
                            ))}
                            {resource.topics?.slice(0, 2).map((topic) => (
                                <Box key={topic} style={styles.chip}>
                                    <Text style={[styles.chipText, { color: colors.textSecondary }]}>{topic}</Text>
                                </Box>
                            ))}
                        </Box>

                        <Box style={styles.actionRow}>
                            <ActionButton label={resource.type === 'movie_trailer' || resource.type === 'video' ? 'Open player' : 'Open source'} icon={ resource.type === 'movie_trailer' || resource.type === 'video' ? <PlayCircle size={16} color={Theme.colors.sacredWhite} />
                                        : <ExternalLink size={16} color={Theme.colors.sacredWhite} />
                                }
                                onPress={() => handlePrimaryAction(resource)}
                                accent
                                textColor={Theme.colors.sacredWhite}
                            />
                            <ActionButton label="Share link" icon={<Share2 size={16} color={colors.textPrimary} />}
                                onPress={() => handleShare(resource)}
                                textColor={colors.textPrimary}
                            />
                            <ActionButton label="Show QR" icon={<QrCode size={16} color={colors.textPrimary} />}
                                onPress={() => setQrVisible(true)}
                                textColor={colors.textPrimary}
                            />
                        </Box>
                    </Box>

                    {companionLinks.length > 0 ? (
                        <Box style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Entry points around this resource</Text>
                            <Box style={styles.stack}>
                                {companionLinks.map((link) => (
                                    <CompanionLinkCard key={link.id} link={link} onPress={handleCompanionOpen} textColor={colors.textPrimary} secondaryTextColor={colors.textSecondary} />
                                ))}
                            </Box>
                        </Box>
                    ) : null}

                    {resource.copyright_notice ? (
                        <Box style={styles.noticeCard}>
                            <Box style={styles.noticeRow}>
                                <Globe size={18} color={Theme.colors.sanctuarySaffron} />
                                <Box style={styles.noticeCopy}>
                                    <Text style={[styles.noticeTitle, { color: colors.textPrimary }]}>Usage notice</Text>
                                    <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
                                        {resource.copyright_notice}
                                    </Text>
                                </Box>
                            </Box>
                        </Box>
                    ) : null}

                    <Box style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Related inside Gurudevi</Text>
                        {relatedResources && relatedResources.length > 0 ? (
                            <Box style={styles.stack}>
                                {relatedResources.map((item) => (
                                    <TouchableOpacity key={item.id} onPress={() => navigateIntoLibrary('ResourceHub', { resourceId: item.id })}
                                        style={styles.card}
                                    >
                                        <Box style={styles.cardRow}>
                                            <Box style={styles.cardContent}>
                                                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                                                <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
                                                    {(item.topics?.[0] || item.subjects?.[0] || 'Related resource')}
                                                </Text>
                                            </Box>
                                            <Sparkles size={18} color={Theme.colors.sanctuarySaffron} />
                                        </Box>
                                    </TouchableOpacity>
                                ))}
                            </Box>
                        ) : (
                            <Box style={styles.emptyCard}>
                                <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
                                    We don't have companion Gurudevi resources clustered around this one yet. As the library grows, this hub will deepen.
                                </Text>
                            </Box>
                        )}
                    </Box>
                </Box>
            </ScrollView>

            <ResourceShareQRModal 
                visible={qrVisible} 
                onClose={() => setQrVisible(false)}
                resourceId={resource.id}
                resourceTitle={resource.title}
                resourceType={resource.type}
                resourceThumbnailUrl={resource.url}
            />
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
        gap: 14,
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
    metaText: {
        fontSize: 13,
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
        borderRadius: 28,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
        marginBottom: Theme.spacing.lg,
        paddingHorizontal: Theme.spacing.lg,
        paddingTop: Theme.spacing.lg,
        paddingBottom: Theme.spacing.lg,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 12,
    },
    hubBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: Theme.colors.sanctuarySaffron + '22',
    },
    hubBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: Theme.colors.sanctuarySaffron,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    verifiedBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: Theme.colors.sageGreen + '22',
    },
    verifiedBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: Theme.colors.sageGreen,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '800',
        lineHeight: 34,
        marginBottom: 10,
    },
    heroDescription: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 14,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: '#F9FAFB',
    },
    chipText: {
        fontSize: 12,
    },
    actionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 16,
    },
    actionButton: {
        minHeight: 44,
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    actionButtonAccent: {
        backgroundColor: Theme.colors.sanctuarySaffron,
        borderColor: Theme.colors.sanctuarySaffron,
    },
    actionButtonMuted: {
        backgroundColor: '#F9FAFB',
        borderColor: '#E5E7EB',
    },
    actionButtonText: {
        fontSize: 13,
        fontWeight: '800',
    },
    section: {
        marginBottom: Theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: 19,
        fontWeight: '800',
        marginBottom: 12,
    },
    stack: {
        gap: 12,
    },
    card: {
        borderRadius: 22,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        padding: 16,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    cardContent: {
        flex: 1,
        gap: 4,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '800',
    },
    cardDescription: {
        fontSize: 13,
        lineHeight: 20,
    },
    noticeCard: {
        marginBottom: Theme.spacing.lg,
        padding: Theme.spacing.md,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    noticeRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    noticeCopy: {
        flex: 1,
        gap: 4,
    },
    noticeTitle: {
        fontSize: 14,
        fontWeight: '800',
    },
    noticeText: {
        fontSize: 13,
        lineHeight: 20,
    },
    emptyCard: {
        padding: Theme.spacing.md,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
});
