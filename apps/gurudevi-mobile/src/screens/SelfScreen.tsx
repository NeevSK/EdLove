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
import { Mic, Send, MessageCircle, Repeat, Sun, FileText, Flower, Flame, Sprout } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '../constants/Theme';
import { getGreetingKey, getSanctuaryTimeTheme } from '../utils/time';
import { hapticLight } from '../utils/haptics';
import DailyRhythm from '../components/self/DailyRhythm';
import { MoodLotus, ShadowAgentDrawer, FireJournal, CommunityPresence, ProgressTree, VoiceJournaling } from '../components/self';
import { supabase } from '../lib/supabase';
import GlobalHeader from '../components/shared/GlobalHeader';

const SUB_FEATURES = [
    { id: 'mood', label: 'Mood Check-in', icon: Flower },
    { id: 'fire', label: 'Fire Journal', icon: Flame },
    { id: 'progress', label: 'Growth', icon: Sprout },
    { id: 'rhythm', label: 'Daily Rhythm', icon: Repeat },
    { id: 'venting', label: 'Venting Space', icon: MessageCircle },
];

export default function SelfScreen() {
    const { t } = useTranslation();
    const [activeFeature, setActiveFeature] = useState('mood');
    const [userId, setUserId] = useState<string | null>(null);
    const greetingKey = getGreetingKey(); // Get i18n key based on time
    const timeTheme = getSanctuaryTimeTheme(); // Get time-aware theme

    // Get current user on mount
    React.useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }
        };
        fetchUser();
    }, []);

    return (
        <Box sx={{ flex: 1, backgroundColor: timeTheme.backgroundColor }}>
            <GlobalHeader showGreeting={true} />
            <ScrollView sx={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100, paddingTop: Theme.spacing.lg }}>
                {/* 1. Atmospheric Header Removed (Replaced by GlobalHeader) */}

                {/* Community Presence - Shows online teachers */}
                <Box px="$6" mb="$4">
                    <CommunityPresence compact={true} />
                </Box>

                {/* 2. Sub-Feature Carousel */}
                <Box sx={{ height: 100 }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
                    >
                        {SUB_FEATURES.map((feature) => (
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
                    </ScrollView>
                </Box>

                {/* 3. Dynamic Content Workbench */}
                <Box px="$6" mt="$6">
                    <Box
                        p={Theme.spacing.xl}
                        sx={{
                            backgroundColor: Theme.colors.midnightBlue,
                            borderRadius: Theme.corners.generous,
                            minHeight: 300
                        }}
                    >
                        {activeFeature === 'mood' && (
                            <MoodLotus userId={userId ?? undefined} />
                        )}

                        {activeFeature === 'fire' && (
                            <FireJournal userId={userId ?? undefined} />
                        )}

                        {activeFeature === 'progress' && (
                            <ProgressTree userId={userId ?? undefined} />
                        )}

                        {activeFeature === 'rhythm' && (
                            <DailyRhythm />
                        )}

                        {activeFeature === 'venting' && (
                            <VoiceJournaling userId={userId ?? undefined} />
                        )}
                    </Box>
                </Box>
            </ScrollView>

            {/* Shadow Agent Drawer - Always present as a floating orb */}
            <ShadowAgentDrawer />
        </Box>
    );
}