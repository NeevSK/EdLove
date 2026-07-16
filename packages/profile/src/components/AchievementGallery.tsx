import { BookOpen, Clock, Compass, QrCode, Users, Zap } from '@repo/ui/icons';
import { Box, Heading, HStack, Text, VStack } from '@repo/ui/primitives';
import { useTranslation } from 'react-i18next';

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
      <VStack className={`items-center w-[30%] mb-4 ${!achievement.unlocked ? 'opacity-30' : ''}`}>
        <Box
          className={`p-4 rounded-full border ${
            achievement.unlocked
              ? 'bg-phase-interactive/10 border-phase-interactive/30'
              : 'bg-phase-surface border-transparent'
          }`}
        >
          <IconComponent size={24} color={achievement.unlocked ? '#4A90E2' : '#9DA1A3'} />
        </Box>
        <Text
          className={`text-center text-[10px] mt-2 px-1 ${achievement.unlocked ? 'font-bold text-phase-text-primary' : 'text-phase-text-tertiary'}`}
          numberOfLines={1}
        >
          {achievement.title}
        </Text>
      </VStack>
    );
  };

  return (
    <VStack className="mt-8 px-4">
      <Box
        className="bg-phase-canvas rounded-3xl p-6 border border-phase-surface shadow-md"
        style={{
          shadowColor: '#9DA1A3',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        }}
      >
        <Heading className="text-phase-text-secondary text-sm mb-6">
          {t('achievements.title', 'Achievements')}
        </Heading>
        <HStack className="flex-row flex-wrap justify-between">
          {achievements.map((item) => (
            <AchievementItem key={item.id} achievement={item} />
          ))}
          {/* Spacer for proper alignment */}
          <Box className="w-[30%]" />
        </HStack>
      </Box>
    </VStack>
  );
}
