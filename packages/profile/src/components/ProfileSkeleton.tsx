import React from 'react';
import { useWindowDimensions } from 'react-native';
import { Box, VStack, HStack, Center } from '@repo/ui';
import { SkeletonLoader, SkeletonCard, SkeletonAvatar, SkeletonTextLine } from '@repo/ui';

/**
 * PROFILE SKELETON
 * Sanctuary V3 standard for profile loading states.
 */
export default function ProfileSkeleton() {
    const { width } = useWindowDimensions();

    return (
        <Box className="flex-1 bg-phase-canvas p-4">
            <VStack space="2xl">
                {/* Identity Card Placeholder */}
                <Center>
                    <SkeletonLoader
                        width={width - 48}
                        height={200}
                        borderRadius={24}
                    />
                </Center>

                {/* Stats Card Placeholder */}
                <Box>
                    <SkeletonCard height={120} />
                </Box>

                {/* Achievements Placeholder */}
                <Box>
                    <SkeletonTextLine width={150} className="mb-3" />
                    <HStack space="md">
                        <SkeletonAvatar size={60} />
                        <SkeletonAvatar size={60} />
                        <SkeletonAvatar size={60} />
                        <SkeletonAvatar size={60} />
                    </HStack>
                </Box>

                {/* Contact Info Placeholder */}
                <Box className="p-5 rounded-2xl border border-phase-surface">
                    <SkeletonTextLine width={100} className="mb-4" />
                    <VStack space="md">
                        <HStack space="md" className="items-center">
                            <SkeletonAvatar size={18} />
                            <VStack className="flex-1">
                                <SkeletonTextLine width={60} className="mb-1" />
                                <SkeletonTextLine width="80%" />
                            </VStack>
                        </HStack>
                        <HStack space="md" className="items-center">
                            <SkeletonAvatar size={18} />
                            <VStack className="flex-1">
                                <SkeletonTextLine width={60} className="mb-1" />
                                <SkeletonTextLine width="60%" />
                            </VStack>
                        </HStack>
                    </VStack>
                </Box>
            </VStack>
        </Box>
    );
}
