import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    SanctuaryCard,
    Theme,
    useThemedColors
} from '@repo/ui';
import { Trophy, Compass, Clock, Zap, Users, BookOpen, QrCode } from 'lucide-react-native';

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: any;
    unlocked: boolean;
}

interface AchievementGalleryProps {
    unlockedBadges: string[];
}

export default function AchievementGallery({ unlockedBadges = [] }: AchievementGalleryProps) {
    const colors = useThemedColors();

    const achievements: Achievement[] = [
        {
            id: 'Sanctuary Seeker',
            title: 'Sanctuary Seeker',
            description: 'Visit all 4 main sections of the app',
            icon: Compass,
            unlocked: unlockedBadges.includes('Sanctuary Seeker'),
        },
        {
            id: 'Early Riser',
            title: 'Early Riser',
            description: 'Log mood or attendance before 8 AM',
            icon: Clock,
            unlocked: unlockedBadges.includes('Early Riser'),
        },
        {
            id: 'Energy Master',
            title: 'Energy Master',
            description: 'Log energy levels 3 days in a row',
            icon: Zap,
            unlocked: unlockedBadges.includes('Energy Master'),
        },
        {
            id: 'Community Builder',
            title: 'Community Builder',
            description: 'Join your first group or post an announcement',
            icon: Users,
            unlocked: unlockedBadges.includes('Community Builder'),
        },
        {
            id: 'Wisdom Collector',
            title: 'Wisdom Collector',
            description: 'Save 5 items to your personal library',
            icon: BookOpen,
            unlocked: unlockedBadges.includes('Wisdom Collector'),
        },
        {
            id: 'QR Hunter',
            title: 'QR Hunter',
            description: 'Scan your first QR code',
            icon: QrCode,
            unlocked: unlockedBadges.includes('QR Hunter'),
        },
    ];

    const AchievementItem = ({ achievement }: { achievement: Achievement }) => {
        const Icon = achievement.icon;
        return (
            <VStack
                alignItems="center"
                space="xs"
                style={[
                    styles.itemContainer,
                    !achievement.unlocked && { opacity: 0.4 }
                ]}
            >
                <Box
                    p={Theme.spacing.md}
                    bg={achievement.unlocked ? `${colors.primary}20` : `${colors.textTertiary}10`}
                    borderRadius={Theme.corners.full}
                    style={achievement.unlocked && styles.unlockedIcon}
                >
                    <Icon
                        size={24}
                        color={achievement.unlocked ? colors.primary : colors.textTertiary}
                    />
                </Box>
                <Text
                    size="xs"
                    bold={achievement.unlocked}
                    textAlign="center"
                    color={achievement.unlocked ? colors.text : colors.textTertiary}
                    numberOfLines={1}
                >
                    {achievement.title}
                </Text>
            </VStack>
        );
    };

    return (
        <VStack space="md" mt={Theme.spacing.lg}>
            <Heading color={colors.textSecondary as any} size="sm">
                Sanctuary Achievements
            </Heading>
            <SanctuaryCard variant="glass">
                <HStack style={styles.galleryGrid}>
                    {achievements.map((item) => (
                        <AchievementItem key={item.id} achievement={item} />
                    ))}
                </HStack>
            </SanctuaryCard>
        </VStack>
    );
}

const styles = StyleSheet.create({
    galleryGrid: {
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingVertical: Theme.spacing.sm,
    },
    itemContainer: {
        width: '30%',
        marginBottom: Theme.spacing.md,
    },
    unlockedIcon: {
        borderWidth: 1,
        borderColor: '#E67E2240', // Semi-transparent primary
    }
});
