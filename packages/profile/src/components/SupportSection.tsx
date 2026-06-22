import { Box, Heading, HStack, Pressable, Text, VStack } from '@repo/ui/primitives';
import { openExternalURL } from '@repo/ui/utils';

import {
  ChevronRight,
  Info,
  LifeBuoy,
  MessageCircle,
  Star,
  TriangleAlert,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

/**
 * SUPPORT SECTION
 * Sanctuary V3 standard for displaying support and feedback options.
 * Features ultra-clean list items and semantic interaction patterns.
 */
export default function SupportSection() {
  const { t } = useTranslation();

  const handleSupport = () => {
    openExternalURL('mailto:support@gurudevi.org', {
      title: 'Support',
      sourceLabel: 'Profile',
      sourceBadge: 'Support contact',
    }).catch(() => {
      // No email client available
    });
  };

  const SupportItem = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
  }: {
    icon: any;
    title: string;
    subtitle: string;
    onPress: () => void;
  }) => (
    <Pressable onPress={onPress} className="active:scale-[0.98] transition-all">
      <HStack className="items-center justify-between p-5 bg-phase-canvas rounded-3xl border border-phase-surface/60 mb-3 shadow-sm">
        <HStack space="md" className="items-center flex-1">
          <Box className="w-11 h-11 bg-phase-interactive/10 rounded-2xl items-center justify-center border border-phase-interactive/10">
            <Icon size={20} color="#4A90E2" strokeWidth={2.5} />
          </Box>
          <VStack className="flex-1 ml-1">
            <Text className="text-phase-text-primary text-base font-bold tracking-tight">
              {title}
            </Text>
            <Text className="text-phase-text-tertiary text-xs font-medium mt-0.5">{subtitle}</Text>
          </VStack>
        </HStack>
        <Box className="p-1 rounded-full bg-phase-surface/30">
          <ChevronRight size={18} color="#9DA1A3" strokeWidth={3} />
        </Box>
      </HStack>
    </Pressable>
  );

  return (
    <VStack space="md" className="mt-8 mb-10 px-4">
      <VStack space="xs" className="mb-2 px-1">
        <Heading size="sm" className="text-phase-text-primary font-bold tracking-tight">
          {t('support.title', 'Sovereign Assistance')}
        </Heading>
        <Text className="text-[10px] font-bold text-phase-text-tertiary uppercase tracking-widest">
          SUPPORT & FEEDBACK
        </Text>
      </VStack>

      <SupportItem
        icon={MessageCircle}
        title={t('support.contactSupport', 'Direct Support')}
        subtitle={t('support.contactSupportDesc', 'Dedicated assistance for your account')}
        onPress={handleSupport}
      />
      <SupportItem
        icon={LifeBuoy}
        title={t('support.faqs', 'Knowledge Core')}
        subtitle={t('support.faqsDesc', 'Find immediate answers to common paths')}
        onPress={() => {}}
      />
      <SupportItem
        icon={TriangleAlert}
        title={t('support.reportIssue', 'Signal Disruption')}
        subtitle={t('support.reportIssueDesc', 'Notify the architects of platform anomalies')}
        onPress={handleSupport}
      />
      <SupportItem
        icon={Info}
        title={t('support.about', 'Sanctuary Vision')}
        subtitle={t('support.aboutDesc', 'Discover the heart of our digital topology')}
        onPress={() => {}}
      />
      <SupportItem
        icon={Star}
        title={t('support.rateUs', 'Path Resonance')}
        subtitle={t('support.rateUsDesc', 'Share your reflection of this experience')}
        onPress={() => {}}
      />
    </VStack>
  );
}
