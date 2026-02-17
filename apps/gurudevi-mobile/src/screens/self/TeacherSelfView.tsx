/**
 * TeacherSelfView Component
 * 
 * Teacher-focused wellbeing features with progressive disclosure
 * Core: Mood, Fire Journal, Daily Rhythm
 * More Tools: Joy Jar, Gratitude, Wisdom, Tomorrow's Prep, Energy, Wind-Down, Venting
 */

import React, { useState } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    ScrollView,
    Pressable,
    Center,
    Input,
    InputField,
    Button,
    ButtonText
} from "@/ui";
import { Mic, Send, MessageCircle, Repeat, Flower, Flame, Sparkles, Heart, Lightbulb, Calendar, Battery, Moon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '../../constants/Theme';
import { hapticLight } from '../../utils/haptics';
import DailyRhythm from '../../components/self/DailyRhythm';
import {
    MoodLotus,
    ShadowAgentDrawer,
    FireJournal,
    JoyJar,
    GratitudeGlimmers,
    WisdomSeeds,
    TomorrowPrep,
    EnergyForecast,
    WindDownRitual
} from '../../components/self';
import { supabase } from '../../lib/supabase';
import GlobalHeader from '../../components/shared/GlobalHeader';
import DailyContentCard from '../../components/self/DailyContentCard';
import ThuthimalBadge from '../../components/profile/ThuthimalBadge';
import WelcomeModal from '../../components/self/WelcomeModal';
import { useStore } from '../../store/useStore';
import { useThemedColors } from '../../hooks/useThemedColors';
import ScreenWrapper from '../../components/shared/ScreenWrapper';

// Progressive Architecture: Core features always visible, others in "More Tools"
const CORE_FEATURES = [
    { id: 'mood', icon: Flower, category: 'core' },
    { id: 'fire', icon: Flame, category: 'core' },
    { id: 'rhythm', icon: Repeat, category: 'core' },
];

const MORE_TOOLS_FEATURES = [
    { id: 'joyJar', icon: Sparkles, category: 'discover', eroi: 10 },
    { id: 'gratitude', icon: Heart, category: 'discover', eroi: 8 },
    { id: 'wisdom', icon: Lightbulb, category: 'discover', eroi: 7 },
    { id: 'tomorrowPrep', icon: Calendar, category: 'discover', eroi: 9 },
    { id: 'energyForecast', icon: Battery, category: 'contextual', eroi: 6 },
    { id: 'windDown', icon: Moon, category: 'contextual', eroi: 8 },
    { id: 'venting', icon: MessageCircle, category: 'discover', eroi: 10 },
];

export default function TeacherSelfView() {
    const { t } = useTranslation();
    const [activeFeature, setActiveFeature] = useState('mood');
    const [userId, setUserId] = useState<string | null>(null);
    const [showMoreTools, setShowMoreTools] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);
    const justFinishedOnboarding = useStore((state) => state.justFinishedOnboarding);
    const setJustFinishedOnboarding = useStore((state) => state.setJustFinishedOnboarding);
    const colors = useThemedColors();

    // Get current user and profile on mount
    React.useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);

                // Fetch full profile for Thuthimal status
                const { data: profile } = await supabase
                    .from('users')
                    .select('is_thuthimal, thuthimal_gifter, thuthimal_gifted_at')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setUserProfile(profile);
                }
            }
        };
        fetchUser();
    }, []);

    const renderFeature = () => {
        switch (activeFeature) {
            case 'mood':
                return <MoodLotus userId={userId ?? undefined} />;
            case 'fire':
                return <FireJournal userId={userId ?? undefined} />;
            case 'rhythm':
                return <DailyRhythm />;
            case 'joyJar':
                return <JoyJar userId={userId ?? undefined} />;
            case 'gratitude':
                return <GratitudeGlimmers userId={userId ?? undefined} />;
            case 'wisdom':
                return <WisdomSeeds userId={userId ?? undefined} />;
            case 'tomorrowPrep':
                return <TomorrowPrep userId={userId ?? undefined} />;
            case 'energyForecast':
                return <EnergyForecast userId={userId ?? undefined} />;
            case 'windDown':
                return <WindDownRitual userId={userId ?? undefined} />;
            case 'venting':
                return (
                    <VStack space="lg" sx={{ flex: 1 }}>
                        <VStack space="xs">
                            <Heading color={colors.text} size="lg">{t('self.venting')}</Heading>
                            <Text color={colors.textSecondary} size="sm">{t('self.ventingDesc')}</Text>
                        </VStack>

                        <Box
                            sx={{
                                flex: 1,
                                backgroundColor: colors.secondary,
                                borderRadius: Theme.corners.comfortable,
                                padding: Theme.spacing.md,
                                minHeight: 150
                            }}
                        >
                            <Input variant="outline" size="md" sx={{ borderWidth: 0, flex: 1 }}>
                                <InputField
                                    placeholder={t('self.speakTruth')}
                                    multiline
                                    color={colors.text}
                                    placeholderTextColor={colors.textTertiary}
                                    sx={{ textAlignVertical: 'top' }}
                                />
                            </Input>
                        </Box>

                        <HStack space="md" justifyContent="flex-end">
                            <Button
                                size="md"
                                variant="link"
                                action="primary"
                                onPress={hapticLight}
                                sx={{
                                    borderRadius: Theme.corners.full,
                                    width: 44,
                                    height: 44,
                                    backgroundColor: colors.tertiary
                                }}
                            >
                                <Mic color={colors.action} size={20} />
                            </Button>
                            <Button
                                size="md"
                                action="primary"
                                onPress={hapticLight}
                                sx={{
                                    borderRadius: Theme.corners.full,
                                    backgroundColor: colors.action,
                                    paddingHorizontal: Theme.spacing.md
                                }}
                            >
                                <ButtonText color={Theme.colors.white} mr="$2">{t('self.unburden')}</ButtonText>
                                <Send color={Theme.colors.white} size={16} />
                            </Button>
                        </HStack>
                    </VStack>
                );
            default:
                return <MoodLotus userId={userId ?? undefined} />;
        }
    };

    const allFeatures = showMoreTools ? [...CORE_FEATURES, ...MORE_TOOLS_FEATURES] : CORE_FEATURES;

    return (
        <ScreenWrapper>
            <GlobalHeader showGreeting={true} />
            <Box sx={{ flex: 1, backgroundColor: colors.primary }}>
                <ScrollView
                    sx={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100, paddingTop: Theme.spacing.lg }}
                >
                    {/* Thuthimal Badge (Compact) */}
                    {userProfile?.is_thuthimal && (
                        <Box px="$6" mb="$3" alignItems="flex-end">
                            <ThuthimalBadge
                                gifterName={userProfile.thuthimal_gifter}
                                giftedAt={userProfile.thuthimal_gifted_at}
                                compact={true}
                            />
                        </Box>
                    )}

                    {/* Daily Content Section */}
                    <Box mb="$4">
                        <DailyContentCard type="motivation" />
                        <DailyContentCard type="did_you_know" />
                    </Box>

                    {/* Sub-Feature Carousel */}
                    <Box sx={{ height: 100 }}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: Theme.spacing.md, gap: 12 }}
                        >
                            {allFeatures.map((feature) => (
                                <Pressable
                                    key={feature.id}
                                    onPress={() => {
                                        hapticLight();
                                        setActiveFeature(feature.id);
                                    }}
                                >
                                    <VStack
                                        alignItems="center"
                                        justifyContent="center"
                                        space="xs"
                                        sx={{
                                            width: 100,
                                            height: 80,
                                            borderRadius: Theme.corners.generous,
                                            backgroundColor: activeFeature === feature.id
                                                ? Theme.colors.sanctuarySaffron
                                                : colors.secondary,
                                            borderWidth: 1,
                                            borderColor: activeFeature === feature.id
                                                ? Theme.colors.sanctuarySaffron
                                                : colors.border,
                                        }}
                                    >
                                        <feature.icon
                                            color={activeFeature === feature.id ? Theme.colors.white : colors.textSecondary}
                                            size={24}
                                        />
                                        <Text
                                            size="xs"
                                            bold={activeFeature === feature.id}
                                            color={activeFeature === feature.id ? Theme.colors.white : colors.text}
                                            textAlign="center"
                                        >
                                            {t(`self.${feature.id}`)}
                                        </Text>
                                    </VStack>
                                </Pressable>
                            ))}

                            {/* More Tools Toggle Button */}
                            <Pressable
                                onPress={() => {
                                    hapticLight();
                                    setShowMoreTools(!showMoreTools);
                                }}
                            >
                                <VStack
                                    alignItems="center"
                                    justifyContent="center"
                                    space="xs"
                                    sx={{
                                        width: 100,
                                        height: 80,
                                        borderRadius: Theme.corners.generous,
                                        backgroundColor: showMoreTools
                                            ? Theme.colors.sanctuarySaffron
                                            : colors.secondary,
                                        borderWidth: 1,
                                        borderColor: showMoreTools
                                            ? Theme.colors.sanctuarySaffron
                                            : colors.border,
                                        borderStyle: 'dashed'
                                    }}
                                >
                                    <Text fontSize="$2xl" color={showMoreTools ? Theme.colors.white : colors.text}>
                                        {showMoreTools ? '−' : '+'}
                                    </Text>
                                    <Text
                                        size="xs"
                                        bold={showMoreTools}
                                        color={showMoreTools ? Theme.colors.white : colors.textSecondary}
                                        textAlign="center"
                                    >
                                        {showMoreTools ? t('self.lessTools') : t('self.moreTools')}
                                    </Text>
                                </VStack>
                            </Pressable>
                        </ScrollView>
                    </Box>

                    {/* Dynamic Content Workbench */}
                    <Box mt="$6">
                        <Box
                            p={Theme.spacing.xl}
                            sx={{
                                backgroundColor: colors.secondary,
                                borderRadius: Theme.corners.generous,
                                minHeight: 300
                            }}
                        >
                            {renderFeature()}
                        </Box>
                    </Box>
                </ScrollView>
            </Box>

            {/* Shadow Agent Drawer - Always present as a floating orb */}
            <ShadowAgentDrawer />
            <WelcomeModal
                isOpen={justFinishedOnboarding}
                onClose={() => setJustFinishedOnboarding(false)}
            />
        </ScreenWrapper>
    );
}