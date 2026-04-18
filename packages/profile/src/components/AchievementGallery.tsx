import React from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
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
    const { t } = useTranslation();

    const achievements: Achievement[] = [
        {
            id: 'Sanctuary Seeker',
            title: t('achievements.sanctuarySeeker', 'Sanctuary Seeker'),
            description: 'Visit all 4 main sections of the app',
            icon: Compass,
            unlocked: unlockedBadges.includes('Sanctuary Seeker'),
        },
        {
            id: 'Early Riser',
            title: t('achievements.earlyRiser', 'Early Riser'),
            description: 'Log mood or attendance before 8 AM',
            icon: Clock,
            unlocked: unlockedBadges.includes('Early Riser'),
        },
        {
            id: 'Energy Master',
            title: t('achievements.energyMaster', 'Energy Master'),
            description: 'Log energy levels 3 days in a row',
            icon: Zap,
            unlocked: unlockedBadges.includes('Energy Master'),
        },
        {
            id: 'Community Builder',
            title: t('achievements.communityBuilder', 'Community Builder'),
            description: 'Join your first group or post an announcement',
            icon: Users,
            unlocked: unlockedBadges.includes('Community Builder'),
        },
        {
            id: 'Wisdom Collector',
            title: t('achievements.wisdomCollector', 'Wisdom Collector'),
            description: 'Save 5 items to your personal library',
            icon: BookOpen,
            unlocked: unlockedBadges.includes('Wisdom Collector'),
        },
        {
            id: 'QR Hunter',
            title: t('achievements.qrHunter', 'QR Hunter'),
            description: 'Scan your first QR code',
            icon: QrCode,
            unlocked: unlockedBadges.includes('QR Hunter'),
        },
    ];

    const AchievementItem = ({ achievement }: { achievement: Achievement }) => {
        const IconComponent = achievement.icon;
        return (
            <VStack
                className={`items-center w-[28%] mb-xs ${!achievement.unlocked ? 'opacity-40' : ''}`}
            >
                <Box
                    className={`p-md rounded-full border ${
                        achievement.unlocked
                            ? 'bg-phase-interactive/15 border-phase-interactive/40'
                            : 'bg-phaseText-primary/10 border-transparent'
                    }`}
                >
                    <IconComponent
                        size={24}
                        className={achievement.unlocked ? 'text-phase-interactive' : 'text-phaseText-secondary'}
                    />
                </Box>
                <Text
                    size="xs"
                    className={`text-center mt-xs ${achievement.unlocked ? 'font-bold text-phaseText-primary' : 'text-phaseText-secondary'}`}
                    numberOfLines={1}
                >
                    {achievement.title}
                </Text>
            </VStack>
        );
    };

    return (
        <VStack className="mt-lg px-md">
            <Box
                className="bg-phase-canvas rounded-generous p-xl border border-phase-surface shadow-sm"
            >
                <Heading
                    size="sm"
                    className="text-phaseText-secondary mt-sm mb-md"
                >
                    {t('achievements.title', 'Achievements')}
                </Heading>
                <HStack className="flex-row flex-wrap justify-start gap-md">
                    {achievements.map((item) => (
                        <AchievementItem key={item.id} achievement={item} />
                    ))}
                </HStack>
            </Box>
        </VStack>
    );
}

