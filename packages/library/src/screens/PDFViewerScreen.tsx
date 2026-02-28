import React, { useState } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Pressable,
    useThemedColors,
    Theme,
    ScreenWrapper,
    GlobalHeader,
    SanctuaryButton,
} from '@repo/ui';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Bookmark, Share2 } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface PDFViewerScreenProps {
    route: {
        params: {
            resourceId: string;
            title: string;
            url: string;
        };
    };
    navigation: any;
}

export default function PDFViewerScreen({ route }: PDFViewerScreenProps) {
    const { title, url } = route.params;
    const navigation = useNavigation();
    const colors = useThemedColors();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(12); // Simulated
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isBookmarked, setIsBookmarked] = useState(false);

    return (
        <ScreenWrapper scroll={false} style={{ backgroundColor: colors.secondary }}>
            <GlobalHeader
                title={title}
                subtitle="Institutional Document"
                showBack
                onBack={() => (navigation as any).goBack()}
            />

            <VStack sx={{ flex: 1, position: 'relative' }}>
                {/* PDF Placeholder / Canvas */}
                <Box
                    sx={{
                        flex: 1,
                        backgroundColor: '#F0F0F0',
                        margin: Theme.spacing.md,
                        borderRadius: Theme.corners.comfortable,
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        borderWidth: 1,
                        borderColor: colors.border
                    }}
                >
                    <Animated.View
                        entering={FadeIn}
                        style={[
                            styles.pdfPage,
                            { transform: [{ scale: zoomLevel }] }
                        ]}
                    >
                        {/* This represents the PDF content area */}
                        <VStack space="lg" p="$8" sx={{ width: '100%' }}>
                            <Box sx={{ height: 20, width: '60%', backgroundColor: '#DDD', borderRadius: 4 }} />
                            <Box sx={{ height: 12, width: '100%', backgroundColor: '#EEE', borderRadius: 2 }} />
                            <Box sx={{ height: 12, width: '100%', backgroundColor: '#EEE', borderRadius: 2 }} />
                            <Box sx={{ height: 12, width: '90%', backgroundColor: '#EEE', borderRadius: 2 }} />

                            <Box sx={{ height: 150, width: '100%', backgroundColor: '#E8E8E8', borderRadius: 8, marginVertical: 20, alignItems: 'center', justifyContent: 'center' }}>
                                <Text color="#AAA" italic>Diagram Placeholder</Text>
                            </Box>

                            <Box sx={{ height: 12, width: '100%', backgroundColor: '#EEE', borderRadius: 2 }} />
                            <Box sx={{ height: 12, width: '100%', backgroundColor: '#EEE', borderRadius: 2 }} />
                            <Box sx={{ height: 12, width: '40%', backgroundColor: '#EEE', borderRadius: 2 }} />
                        </VStack>
                    </Animated.View>
                </Box>

                {/* Controls Overlay */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 40,
                        left: 20,
                        right: 20,
                        backgroundColor: colors.secondary,
                        borderRadius: Theme.corners.comfortable,
                        padding: Theme.spacing.sm,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 10,
                        elevation: 5,
                        borderWidth: 1,
                        borderColor: colors.border
                    }}
                >
                    <HStack justifyContent="space-between" alignItems="center">
                        <HStack space="md" alignItems="center">
                            <SanctuaryButton
                                size="xs"
                                variant="ghost"
                                onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                leftIcon={ChevronLeft}
                                accessibilityLabel="Previous Page"
                            >
                                {''}
                            </SanctuaryButton>
                            <Text color={colors.text} size="sm" bold>
                                Page {currentPage} of {totalPages}
                            </Text>
                            <SanctuaryButton
                                size="xs"
                                variant="ghost"
                                onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                leftIcon={ChevronRight}
                                accessibilityLabel="Next Page"
                            >
                                {''}
                            </SanctuaryButton>
                        </HStack>

                        <HStack space="xs">
                            <SanctuaryButton
                                size="xs"
                                variant="ghost"
                                onPress={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.2))}
                                leftIcon={ZoomOut}
                                accessibilityLabel="Zoom Out"
                            >
                                {''}
                            </SanctuaryButton>
                            <SanctuaryButton
                                size="xs"
                                variant="ghost"
                                onPress={() => setZoomLevel(Math.min(3, zoomLevel + 0.2))}
                                leftIcon={ZoomIn}
                                accessibilityLabel="Zoom In"
                            >
                                {''}
                            </SanctuaryButton>
                        </HStack>
                    </HStack>
                </Box>
            </VStack>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    pdfPage: {
        width: width * 0.85,
        height: '90%',
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    }
});
