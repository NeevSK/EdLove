import React from 'react';
import { TouchableOpacity } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    openExternalURL,
} from '@repo/ui';
import { Theme } from '@repo/ui';
import { useThemedColors } from '@repo/ui';
import { LifeBuoy, MessageCircle, AlertTriangle, ChevronRight, Info, Star } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function SupportSection() {
    const colors = useThemedColors();
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

    const SupportItem = ({ icon: Icon, title, subtitle, onPress }: { icon: any, title: string, subtitle: string, onPress: () => void }) => (
        <TouchableOpacity onPress={onPress}>
            <HStack
                alignItems="center"
                justifyContent="space-between"
                sx={{
                    p: Theme.spacing.md,
                    bg: colors.secondary,
                    borderRadius: Theme.corners.comfortable,
                    mb: Theme.spacing.sm
                }}
            >
                <HStack space="md" alignItems="center">
                    <Box sx={{ p: 8, bg: `${colors.action}20`, borderRadius: 8 }}>
                        <Icon size={20} color={colors.action} />
                    </Box>
                    <VStack>
                        <Text color={colors.text} bold>{title}</Text>
                        <Text color={colors.textSecondary} size="xs">{subtitle}</Text>
                    </VStack>
                </HStack>
                <ChevronRight size={20} color={colors.textTertiary} />
            </HStack>
        </TouchableOpacity>
    );

    return (
        <VStack space="md" mt={Theme.spacing.lg}>
            <Heading color={colors.textSecondary as any} size="sm" mb="$2">
                {t('support.title', 'Support & Feedback')}
            </Heading>

            <SupportItem
                icon={MessageCircle}
                title={t('support.contactSupport', 'Contact Support')}
                subtitle={t('support.contactSupportDesc', 'Get help with your account')}
                onPress={handleSupport}
            />
            <SupportItem
                icon={LifeBuoy}
                title={t('support.faqs', 'FAQs')}
                subtitle={t('support.faqsDesc', 'Find answers to common questions')}
                onPress={() => { }}
            />
            <SupportItem
                icon={AlertTriangle}
                title={t('support.reportIssue', 'Report an Issue')}
                subtitle={t('support.reportIssueDesc', 'Let us know if something is broken')}
                onPress={handleSupport}
            />
            <SupportItem
                icon={Info}
                title={t('support.about', 'About')}
                subtitle={t('support.aboutDesc', 'Learn more about the platform')}
                onPress={() => { }}
            />
            <SupportItem
                icon={Star}
                title={t('support.rateUs', 'Rate Us')}
                subtitle={t('support.rateUsDesc', 'We love to hear your feedback')}
                onPress={() => { }}
            />
        </VStack>
    );
}
