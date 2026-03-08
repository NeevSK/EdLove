import React from 'react';
import { StyleSheet } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Theme,
    useThemedColors
} from '@repo/ui';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();

    const achievements: Achievement[] = [
        {
            id: 'Sanctuary Seeker',
            title: t('achievements.sanctuarySeeker'),
            description: 'Visit all 4 main sections of the app',
            icon: Compass,
            unlocked: unlockedBadges.includes('Sanctuary Seeker'),
        },
        {
            id: 'Early Riser',
            title: t('achievements.earlyRiser'),
            description: 'Log mood or attendance before 8 AM',
            icon: Clock,
            unlocked: unlockedBadges.includes('Early Riser'),
        },
        {
            id: 'Energy Master',
            title: t('achievements.energyMaster'),
            description: 'Log energy levels 3 days in a row',
            icon: Zap,
            unlocked: unlockedBadges.includes('Energy Master'),
        },
        {
            id: 'Community Builder',
            title: t('achievements.communityBuilder'),
            description: 'Join your first group or post an announcement',
            icon: Users,
            unlocked: unlockedBadges.includes('Community Builder'),
        },
        {
            id: 'Wisdom Collector',
            title: t('achievements.wisdomCollector'),
            description: 'Save 5 items to your personal library',
            icon: BookOpen,
            unlocked: unlockedBadges.includes('Wisdom Collector'),
        },
        {
            id: 'QR Hunter',
            title: t('achievements.qrHunter'),
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
                    style={{
                        padding: Theme.spacing.md,
                        backgroundColor: achievement.unlocked
                            ? `${colors.action}15`
                            : `${colors.textTertiary}10`,
                        borderRadius: Theme.corners.full,
                        borderWidth: achievement.unlocked ? 1 : 0,
                        borderColor: `${colors.action}40`,
                    }}
                >
                    <Icon
                        size={24}
                        color={achievement.unlocked ? colors.action : colors.textTertiary}
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
        <VStack sx={{ mt: Theme.spacing.lg, px: Theme.spacing.md }}>
            <Box
                sx={{
                    backgroundColor: colors.secondary,
                    borderRadius: Theme.corners.generous,
                    padding: Theme.spacing.xl,
                    borderWidth: 1,
                    borderColor: colors.border,
                    shadowColor: colors.glow,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.5,
                    shadowRadius: 15,
                    elevation: 5,
                }}
            >
                <Heading
                    color={colors.textSecondary as any}
                    size="sm"
                    mt={Theme.spacing.sm}
                    mb={Theme.spacing.md}
                >
                    {t('achievements.title')}
                </Heading>
                <HStack style={styles.galleryGrid}>
                    {achievements.map((item) => (
                        <AchievementItem key={item.id} achievement={item} />
                    ))}
                </HStack>
            </Box>
        </VStack>
    );
}

const styles = StyleSheet.create({
    galleryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        gap: Theme.spacing.md,
    },
    itemContainer: {
        width: '28%',
        alignItems: 'center',
        marginBottom: Theme.spacing.xs,
    },
    unlockedIcon: {
        borderWidth: 1,
        borderColor: `${Theme.colors.sanctuarySaffron}40`, // sanctuarySaffron at ~25% opacity
    }
});
