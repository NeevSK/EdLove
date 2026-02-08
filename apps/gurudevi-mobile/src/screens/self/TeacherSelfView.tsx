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
} from "@gluestack-ui/themed";
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

// Progressive Architecture: Core features always visible, others in "More Tools"
const CORE_FEATURES = [
    { id: 'mood', label: 'Mood Check-in', icon: Flower, category: 'core' },
    { id: 'fire', label: 'Fire Journal', icon: Flame, category: 'core' },
    { id: 'rhythm', label: 'Daily Rhythm', icon: Repeat, category: 'core' },
];

const MORE_TOOLS_FEATURES = [
    { id: 'joyJar', label: 'Joy Jar', icon: Sparkles, category: 'discover', eroi: 10 },
    { id: 'gratitude', label: 'Daily Glimmers', icon: Heart, category: 'discover', eroi: 8 },
    { id: 'wisdom', label: 'Wisdom Seeds', icon: Lightbulb, category: 'discover', eroi: 7 },
    { id: 'tomorrowPrep', label: "Tomorrow's Prep", icon: Calendar, category: 'discover', eroi: 9 },
    { id: 'energyForecast', label: 'Energy Check', icon: Battery, category: 'contextual', eroi: 6 },
    { id: 'windDown', label: 'Wind Down', icon: Moon, category: 'contextual', eroi: 8 },
    { id: 'venting', label: 'Venting Space', icon: MessageCircle, category: 'discover', eroi: 10 },
];

export default function TeacherSelfView() {
    const { t } = useTranslation();
    const [activeFeature, setActiveFeature] = useState('mood');
    const [userId, setUserId] = useState<string | null>(null);
    const [showMoreTools, setShowMoreTools] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);

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
                            <Heading color={Theme.colors.sacredWhite} size="lg">{t('self.venting')}</Heading>
                            <Text color={Theme.colors.mistGray} size="sm">{t('self.ventingDesc')}</Text>
                        </VStack>

                        <Box
                            sx={{
                                flex: 1,
                                backgroundColor: Theme.colors.deepIndigo,
                                borderRadius: Theme.corners.comfortable,
                                padding: Theme.spacing.md,
                                minHeight: 150
                            }}
                        >
                            <Input variant="outline" size="md" sx={{ borderWidth: 0, flex: 1 }}>
                                <InputField
                                    placeholder={t('self.speakTruth')}
                                    multiline
                                    color={Theme.colors.sacredWhite}
                                    placeholderTextColor={Theme.colors.dimGray}
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
                                    backgroundColor: Theme.colors.deepIndigo
                                }}
                            >
                                <Mic color={Theme.colors.sanctuarySaffron} size={20} />
                            </Button>
                            <Button
                                size="md"
                                action="primary"
                                onPress={hapticLight}
                                sx={{
                                    borderRadius: Theme.corners.full,
                                    backgroundColor: Theme.colors.sanctuarySaffron,
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
        <Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>
            <GlobalHeader showGreeting={true} />
            <ScrollView sx={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100, paddingTop: Theme.spacing.lg }}>
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
                <Box px="$6" mb="$4">
                    <DailyContentCard type="motivation" />
                    <DailyContentCard type="did_you_know" />
                </Box>

                {/* Sub-Feature Carousel */}
                <Box sx={{ height: 100 }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
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
                                            : Theme.colors.deepIndigo,
                                        borderWidth: 1,
                                        borderColor: activeFeature === feature.id
                                            ? Theme.colors.sanctuarySaffron
                                            : Theme.colors.transparent,
                                    }}
                                >
                                    <feature.icon
                                        color={activeFeature === feature.id ? Theme.colors.white : Theme.colors.dimGray}
                                        size={24}
                                    />
                                    <Text
                                        size="xs"
                                        bold={activeFeature === feature.id}
                                        color={activeFeature === feature.id ? Theme.colors.white : Theme.colors.mistGray}
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
                                        : Theme.colors.deepIndigo,
                                    borderWidth: 1,
                                    borderColor: showMoreTools
                                        ? Theme.colors.sanctuarySaffron
                                        : Theme.colors.dimGray,
                                    borderStyle: 'dashed'
                                }}
                            >
                                <Text fontSize="$2xl">
                                    {showMoreTools ? '−' : '+'}
                                </Text>
                                <Text
                                    size="xs"
                                    bold={showMoreTools}
                                    color={showMoreTools ? Theme.colors.white : Theme.colors.mistGray}
                                    textAlign="center"
                                >
                                    {showMoreTools ? t('self.lessTools') : t('self.moreTools')}
                                </Text>
                            </VStack>
                        </Pressable>
                    </ScrollView>
                </Box>

                {/* Dynamic Content Workbench */}
                <Box px="$6" mt="$6">
                    <Box
                        p={Theme.spacing.xl}
                        sx={{
                            backgroundColor: Theme.colors.midnightBlue,
                            borderRadius: Theme.corners.generous,
                            minHeight: 300
                        }}
                    >
                        {renderFeature()}
                    </Box>
                </Box>
            </ScrollView>

            {/* Shadow Agent Drawer - Always present as a floating orb */}
            <ShadowAgentDrawer />
        </Box>
    );
}