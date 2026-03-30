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
            // No email client available  nothing actionable to show without a toast context here
        });
    };

    const SupportItem = ({ icon: Icon, title, subtitle, onPress }: { icon: any, title: string, subtitle: string, onPress: () => void }) => (
        <TouchableOpacity onPress={onPress}
            <HStack
                alignItems="center"
                justifyContent="space-between"
                sx={{
                    p: Theme.spacing.md,
                    bg: colors.secondary,
                    borderRadius: Theme.corners.comfortable,
                    mb: Theme.spacing.sm
                }}
            
                <HStack space="md" alignItems="center"
                    <Box sx={{ p: 8, bg: `${colors.action}20`, borderRadius: 8 }}
                        <Icon size={20} color={colors.action} /
                    </Box
                    <VStack
                        <Text color={colors.text} bold>{title}</Text
                        <Text color={colors.textSecondary} size="xs">{subtitle}</Text
                    </VStack
                </HStack
                <ChevronRight size={20} color={colors.textTertiary} /
            </HStack
        </TouchableOpacity
    );

    return (
        <VStack space="md" mt={Theme.spacing.lg}
            <Heading color={colors.textSecondary as any} size="sm" mb="$2"
                {t('support.title')}
            </Heading

            <SupportItem
                icon={MessageCircle}
                title={t('support.contactSupport')}
                subtitle={t('support.contactSupportDesc')}
                onPress={handleSupport}
            /
            <SupportItem
                icon={LifeBuoy}
                title={t('support.faqs')}
                subtitle={t('support.faqsDesc')}
                onPress={() => { }}
            /
            <SupportItem
                icon={AlertTriangle}
                title={t('support.reportIssue')}
                subtitle={t('support.reportIssueDesc')}
                onPress={handleSupport}
            /
            <SupportItem
                icon={Info}
                title={t('support.about')}
                subtitle={t('support.aboutDesc')}
                onPress={() => { }}
            /
            <SupportItem
                icon={Star}
                title={t('support.rateUs')}
                subtitle={t('support.rateUsDesc')}
                onPress={() => { }}
            /
        </VStack
    );
}
