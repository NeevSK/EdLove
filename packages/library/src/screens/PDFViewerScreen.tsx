import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
    Box,
    VStack,
    HStack,
    Text,
    useThemedColors,
    Theme,
    ScreenWrapper,
    GlobalHeader,
    SanctuaryButton,
} from '@repo/ui';
import { useNavigation } from '@react-navigation/native';
import { Bookmark, Download, ExternalLink } from 'lucide-react-native';

interface PDFViewerScreenProps {
    route: {
        params: {
            resourceId: string;
            title: string;
            url: string;
            creator?: string;
        };
    };
    navigation: any;
}

type DownloadState = 'idle' | 'downloading' | 'ready' | 'error';

export default function PDFViewerScreen({ route }: PDFViewerScreenProps) {
    const { title, url } = route.params;
    const navigation = useNavigation();
    const colors = useThemedColors();
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [downloadState, setDownloadState] = useState<DownloadState>('idle');
    const [progress, setProgress] = useState(0);
    const [localUri, setLocalUri] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const fileName = `gurudevi_${route.params.resourceId}.pdf`;
    const localPath = FileSystem.cacheDirectory + fileName;

    const checkCached = useCallback(async () => {
        try {
            const info = await FileSystem.getInfoAsync(localPath);
            if (info.exists) {
                setLocalUri(localPath);
                setDownloadState('ready');
            }
        } catch {
            // not cached — that's fine
        }
    }, [localPath]);

    useEffect(() => {
        checkCached();
    }, [checkCached]);

    const startDownload = useCallback(async () => {
        if (!url) {
            setErrorMsg('No URL provided for this document.');
            setDownloadState('error');
            return;
        }
        setDownloadState('downloading');
        setProgress(0);
        setErrorMsg(null);
        try {
            const downloadResumable = FileSystem.createDownloadResumable(
                url,
                localPath,
                {},
                ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
                    if (totalBytesExpectedToWrite > 0) {
                        setProgress(totalBytesWritten / totalBytesExpectedToWrite);
                    }
                },
            );
            const result = await downloadResumable.downloadAsync();
            if (result?.uri) {
                setLocalUri(result.uri);
                setDownloadState('ready');
                // Auto-open after download completes
                openNative(result.uri);
            } else {
                throw new Error('Download returned no URI');
            }
        } catch (e: any) {
            setErrorMsg(e?.message ?? 'Download failed');
            setDownloadState('error');
        }
    }, [url, localPath]);

    const openNative = useCallback(async (uri?: string) => {
        const target = uri ?? localUri;
        if (!target) return;
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
            await Sharing.shareAsync(target, { mimeType: 'application/pdf' });
        }
    }, [localUri]);

    return (
        <ScreenWrapper scroll={false} style={{ backgroundColor: colors.secondary }}>
            <GlobalHeader
                title={title}
                subtitle="Institutional Document"
                showBack
                onBack={() => (navigation as any).goBack()}
                rightActions={[
                    {
                        icon: Bookmark,
                        onPress: () => setIsBookmarked(b => !b),
                        accessibilityLabel: isBookmarked ? 'Remove bookmark' : 'Bookmark document',
                        active: isBookmarked,
                    },
                ]}
            />

            <VStack sx={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: Theme.spacing.xl }}>
                {/* Icon area */}
                <Box
                    sx={{
                        width: 120,
                        height: 120,
                        borderRadius: Theme.corners.generous,
                        backgroundColor: colors.primary + '22',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: Theme.spacing.xl,
                        borderWidth: 2,
                        borderColor: colors.border,
                    }}
                >
                    <Download size={48} color={colors.action} />
                </Box>

                <Text size="xl" bold color={colors.text} style={{ textAlign: 'center', marginBottom: Theme.spacing.sm }}>
                    {title}
                </Text>
                <Text size="sm" color={colors.textSecondary} style={{ textAlign: 'center', marginBottom: Theme.spacing.xl }}>
                    Open this document in your device's native PDF viewer.
                </Text>

                {/* Progress bar — shown while downloading */}
                {downloadState === 'downloading' && (
                    <Box sx={{ width: '100%', marginBottom: Theme.spacing.lg }}>
                        <View style={styles.progressTrack}>
                            <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%`, backgroundColor: colors.action }]} />
                        </View>
                        <Text size="xs" color={colors.textSecondary} style={{ textAlign: 'center', marginTop: 6 }}>
                            Downloading… {Math.round(progress * 100)}%
                        </Text>
                    </Box>
                )}

                {errorMsg && (
                    <Text size="sm" color={Theme.colors.error ?? '#E53E3E'} style={{ textAlign: 'center', marginBottom: Theme.spacing.md }}>
                        {errorMsg}
                    </Text>
                )}

                {/* Action buttons */}
                {downloadState === 'idle' || downloadState === 'error' ? (
                    <SanctuaryButton
                        onPress={startDownload}
                        leftIcon={Download}
                        accessibilityLabel="Download and open PDF"
                    >
                        Download & Open
                    </SanctuaryButton>
                ) : downloadState === 'ready' ? (
                    <HStack space="md">
                        <SanctuaryButton
                            onPress={() => openNative()}
                            leftIcon={ExternalLink}
                            accessibilityLabel="Open in native viewer"
                        >
                            Open in Native Viewer
                        </SanctuaryButton>
                        <SanctuaryButton
                            variant="outline"
                            onPress={startDownload}
                            leftIcon={Download}
                            accessibilityLabel="Re-download PDF"
                        >
                            Re-download
                        </SanctuaryButton>
                    </HStack>
                ) : null}
            </VStack>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    progressTrack: {
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(0,0,0,0.1)',
        overflow: 'hidden',
        width: '100%',
    },
    progressFill: {
        height: 6,
        borderRadius: 3,
    },
});
