/**
 * PDFViewerScreen.web.tsx  Pattern A: full web replacement
 *
 * On native, PDFViewerScreen uses expo-file-system + expo-sharing to download
 * and open PDFs via the device's native viewer.  Neither package ships a web
 * implementation, so importing them in the Metro web bundle crashes the build.
 *
 * On web, Metro resolves this file instead.  We use two browser-native APIs:
 *   1. <iframe> embed  shows the PDF inline without any download.
 *   2. window.open()   opens the PDF in a new tab as a fallback.
 *
 * No expo-file-system or expo-sharing imports here.
 */
import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
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
import { Bookmark, ExternalLink, RefreshCw } from 'lucide-react-native';

interface PDFViewerScreenProps {
    route: {
        params: {
            resourceId: string;
            title: string;
            url: string;
            creator?: string;
        };
    };
    navigation?: any;
}

export default function PDFViewerScreen({ route }: PDFViewerScreenProps) {
    const { title, url } = route.params;
    const navigation = useNavigation();
    const colors = useThemedColors();
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [iframeKey, setIframeKey] = useState(0); // bump to reload iframe

    const openInNewTab = () => {
        if (typeof window !== 'undefined') {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <ScreenWrapper scroll={false} style={{ backgroundColor: colors.secondary, flex: 1 }}>
            <GlobalHeader
                title={title}
                subtitle="Document Viewer"
                showBack
                onBack={() => (navigation as any).goBack()}
                rightAction={
                    <Box sx={{ backgroundColor: isBookmarked ? colors.primary + '22' : 'transparent', borderRadius: 20 }}>
                        <SanctuaryButton
                            variant="ghost"
                            size="sm"
                            leftIcon={Bookmark}
                            onPress={() => setIsBookmarked(b => !b)}
                            accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Bookmark document'}
                        >
                            {''}
                        </SanctuaryButton>
                    </Box>
                }
            />

            {/* Inline iframe viewer */}
            <View style={styles.iframeContainer}>
                {/* @ts-ignore - 'iframe' is valid in react-native-web */}
                <iframe
                    key={iframeKey}
                    src={url}
                    title={title}
                    style={styles.iframe as any}
                    allowFullScreen
                />
            </View>

            {/* Action bar below the iframe */}
            <HStack
                sx={{
                    padding: Theme.spacing.md,
                    gap: Theme.spacing.sm,
                    justifyContent: 'center',
                    backgroundColor: colors.secondary,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                }}
            >
                <SanctuaryButton
                    variant="outline"
                    size="sm"
                    leftIcon={RefreshCw}
                    onPress={() => setIframeKey(k => k + 1)}
                    accessibilityLabel="Reload document"
                >
                    Reload
                </SanctuaryButton>
                <SanctuaryButton
                    size="sm"
                    leftIcon={ExternalLink}
                    onPress={openInNewTab}
                    accessibilityLabel="Open PDF in new tab"
                >
                    Open in New Tab
                </SanctuaryButton>
            </HStack>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    iframeContainer: {
        flex: 1,
        overflow: 'hidden',
    } as any,
    iframe: {
        width: '100%',
        height: '100%',
        border: 'none',
        display: 'block',
    } as any,
});
