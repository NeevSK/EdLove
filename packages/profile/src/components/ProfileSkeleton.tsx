import React from 'react';
import { View, Dimensions } from 'react-native';
import { Box, VStack, HStack, Center, Theme, useThemedColors } from '@repo/ui';
import { SkeletonLoader, SkeletonCard, SkeletonAvatar, SkeletonTextLine } from '@repo/ui';

const { width } = Dimensions.get('window');

export default function ProfileSkeleton() {
    const colors = useThemedColors();

    return (
        <Box sx={{ flex: 1, backgroundColor: colors.primary, padding: Theme.spacing.md }}
            <VStack space="2xl"
                {/* Identity Card Placeholder */}
                <Center
                    <SkeletonLoader
                        width={width - 48}
                        height={200}
                        borderRadius={Theme.corners.generous}
                    /
                </Center

                {/* Stats Card Placeholder */}
                <Box
                    <SkeletonCard height={120} /
                </Box

                {/* Achievements Placeholder */}
                <Box
                    <SkeletonTextLine width={150} mb={12} /
                    <HStack space="md"
                        <SkeletonAvatar size={60} /
                        <SkeletonAvatar size={60} /
                        <SkeletonAvatar size={60} /
                        <SkeletonAvatar size={60} /
                    </HStack
                </Box

                {/* Contact Info Placeholder */}
                <Box sx={{ padding: Theme.spacing.lg, borderRadius: Theme.corners.comfortable, borderWidth: 1, borderColor: colors.border }}
                    <SkeletonTextLine width={100} mb={16} /
                    <VStack space="md"
                        <HStack space="md" alignItems="center"
                            <SkeletonAvatar size={18} /
                            <VStack flex={1}
                                <SkeletonTextLine width={60} mb={4} /
                                <SkeletonTextLine width="80%" /
                            </VStack
                        </HStack
                        <HStack space="md" alignItems="center"
                            <SkeletonAvatar size={18} /
                            <VStack flex={1}
                                <SkeletonTextLine width={60} mb={4} /
                                <SkeletonTextLine width="60%" /
                            </VStack
                        </HStack
                    </VStack
                </Box
            </VStack
        </Box
    );
}
