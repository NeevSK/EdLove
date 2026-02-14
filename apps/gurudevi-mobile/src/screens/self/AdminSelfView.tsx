/**
 * AdminSelfView Component
 * 
 * Sanctuary for the Admin - focus on System Balance and Operational Harmony
 */

import React, { useState } from 'react';
import {
    Box,
    VStack,
    Text,
    Heading,
    ScrollView,
    Pressable
} from "@/ui";
import { useTranslation } from 'react-i18next';
import { Shield, Settings, Activity, Database, Layout, Heart } from 'lucide-react-native';
import { Theme } from '../../constants/Theme';
import { hapticLight } from '../../utils/haptics';
import { MoodLotus, ShadowAgentDrawer } from '../../components/self';
import { supabase } from '../../lib/supabase';
import GlobalHeader from '../../components/shared/GlobalHeader';
import DailyContentCard from '../../components/self/DailyContentCard';
import WelcomeModal from '../../components/self/WelcomeModal';
import { useStore } from '../../store/useStore';
import { useThemedColors } from '../../hooks/useThemedColors';
import ScreenWrapper from '../../components/shared/ScreenWrapper';

const ADMIN_CORE_FEATURES = [
    { id: 'balance', icon: Activity, category: 'core' },
    { id: 'mood', icon: Heart, category: 'core' },
    { id: 'config', icon: Settings, category: 'core' },
];

const ADMIN_MORE_TOOLS = [
    { id: 'security', icon: Shield, category: 'discover' },
    { id: 'data', icon: Database, category: 'discover' },
    { id: 'ui', icon: Layout, category: 'discover' },
];

export default function AdminSelfView() {
    const { t } = useTranslation();
    const [activeFeature, setActiveFeature] = useState('balance');
    const [userId, setUserId] = useState<string | null>(null);
    const [showMoreTools, setShowMoreTools] = useState(false);
    const justFinishedOnboarding = useStore((state) => state.justFinishedOnboarding);
    const setJustFinishedOnboarding = useStore((state) => state.setJustFinishedOnboarding);
    const colors = useThemedColors();

    React.useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        fetchUser();
    }, []);

    const renderFeature = () => {
        switch (activeFeature) {
            case 'balance':
                return (
                    <VStack space="lg" sx={{ flex: 1 }}>
                        <VStack space="xs">
                            <Heading color={colors.text} size="lg">{t('admin.balance')}</Heading>
                            <Text color={colors.textSecondary} size="sm">Monitoring the stability of the Educational Ecology.</Text>
                        </VStack>
                        <Box p={Theme.spacing.md} sx={{ backgroundColor: colors.tertiary, borderRadius: Theme.corners.comfortable, minHeight: 150 }}>
                            <Text color={colors.textSecondary} size="md" textAlign="center">
                                {t('common.comingSoon')}
                            </Text>
                        </Box>
                    </VStack>
                );
            case 'mood':
                return <MoodLotus userId={userId ?? undefined} />;
                return (
                    <Box p={Theme.spacing.md}>
                        <Text color={colors.textSecondary} textAlign="center">{t('common.comingSoon')}</Text>
                    </Box>
                );
        }
    };

    const allFeatures = showMoreTools ? [...ADMIN_CORE_FEATURES, ...ADMIN_MORE_TOOLS] : ADMIN_CORE_FEATURES;

    return (
        <ScreenWrapper>
            <GlobalHeader
                showGreeting={true}
                subtitle={t('self.adminSubtitle') || 'System Architect'}
            />
            <ScrollView
                sx={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 100, paddingTop: Theme.spacing.lg }}
                showsVerticalScrollIndicator={false}
            >
                <Box mb="$4">
                    <DailyContentCard type="motivation" />
                    <DailyContentCard type="did_you_know" />
                </Box>

                <Box sx={{ height: 100 }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Theme.spacing.md, gap: 12 }}>
                        {allFeatures.map((feature) => (
                            <Pressable
                                key={feature.id}
                                onPress={() => { hapticLight(); setActiveFeature(feature.id); }}
                            >
                                <VStack
                                    alignItems="center"
                                    justifyContent="center"
                                    space="xs"
                                    sx={{
                                        width: 100, height: 80, borderRadius: Theme.corners.generous,
                                        backgroundColor: activeFeature === feature.id ? colors.action : colors.secondary,
                                        borderWidth: 1, borderColor: activeFeature === feature.id ? colors.action : colors.border,
                                    }}
                                >
                                    <feature.icon color={activeFeature === feature.id ? Theme.colors.white : colors.textSecondary} size={24} />
                                    <Text size="xs" bold={activeFeature === feature.id} color={activeFeature === feature.id ? Theme.colors.white : colors.text} textAlign="center">
                                        {t(`admin.${feature.id}`)}
                                    </Text>
                                </VStack>
                            </Pressable>
                        ))}
                        <Pressable onPress={() => { hapticLight(); setShowMoreTools(!showMoreTools); }}>
                            <VStack alignItems="center" justifyContent="center" space="xs" sx={{ width: 100, height: 80, borderRadius: Theme.corners.generous, backgroundColor: colors.secondary, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed' }}>
                                <Text fontSize="$2xl" color={colors.text}>{showMoreTools ? '−' : '+'}</Text>
                                <Text size="xs" color={colors.textSecondary}>{showMoreTools ? t('self.lessTools') : t('self.moreTools')}</Text>
                            </VStack>
                        </Pressable>
                    </ScrollView>
                </Box>

                <Box mt="$6">
                    <Box p={Theme.spacing.xl} sx={{ backgroundColor: colors.secondary, borderRadius: Theme.corners.generous, minHeight: 300 }}>
                        {renderFeature()}
                    </Box>
                </Box>
            </ScrollView>

            <ShadowAgentDrawer />
            <WelcomeModal isOpen={justFinishedOnboarding} onClose={() => setJustFinishedOnboarding(false)} />
        </ScreenWrapper>
    );
}
