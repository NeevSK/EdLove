import React from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    openExternalURL,
    Pressable,
} from '@repo/ui';
import { LifeBuoy, MessageCircle, AlertTriangle, ChevronRight, Info, Star } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

/**
 * SUPPORT SECTION
 * Sanctuary V3 standard for displaying support and feedback options.
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
        onPress 
    }: { 
        icon: any, 
        title: string, 
        subtitle: string, 
        onPress: () => void 
    }) => (
        <Pressable onPress={onPress}>
            <HStack
                className="items-center justify-between p-4 bg-phase-canvas rounded-2xl border border-phase-surface mb-2"
            >
                <HStack space="md" className="items-center">
                    <Box className="p-2 bg-phase-interactive/10 rounded-lg">
                        <Icon size={20} color="#4A90E2" />
                    </Box>
                    <VStack>
                        <Text className="text-phase-text-primary font-bold">{title}</Text>
                        <Text className="text-phase-text-tertiary text-xs">{subtitle}</Text>
                    </VStack>
                </HStack>
                <ChevronRight size={20} color="#9DA1A3" />
            </HStack>
        </Pressable>
    );

    return (
        <VStack space="md" className="mt-6">
            <Heading className="text-phase-text-secondary text-sm mb-1 px-1">
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
