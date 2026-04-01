import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { 
    VStack, 
    HStack, 
    Text, 
    Theme, 
    useThemedColors,
    GlassCard
} from '@repo/ui';
import { Flower2, Wind, Sun, CloudRain, Zap } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring
} from 'react-native-reanimated';

/**
 * MOOD LOTUS COMPONENT
 * Daily mood check-in with lotus visual metaphor
 *
 * Visual States:
 * 1 = Closed Bud (Dark) - Heavy/Struggling
 * 2 = Slight Opening (Dim) - Challenging
 * 3 = Half Bloom (Medium) - Neutral/Okay
 * 4 = Full Bloom (Bright) - Good/Positive
 * 5 = Radiant (Glow) - Inspired/Joyful
 */
interface MoodLotusProps {
    userId?: string;
    onMoodChange?: (mood: number) => void;
    disabled?: boolean;
}

export const MoodLotus: React.FC<MoodLotusProps> = ({ userId, onMoodChange, disabled }) => {
    const { t } = useTranslation();
    const colors = useThemedColors();
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const rotation = useSharedValue(0);

    const moodOptions = [
        { level: 1, icon: CloudRain, label: t('self.moodHeavy') || 'Heavy', color: '#4B5563' },
        { level: 2, icon: Wind, label: t('self.moodChallenging') || 'Challenging', color: '#6366F1' },
        { level: 3, icon: Flower2, label: t('self.moodNeutral') || 'Neutral', color: '#10B981' },
        { level: 4, icon: Sun, label: t('self.moodPositive') || 'Positive', color: '#F59E0B' },
        { level: 5, icon: Zap, label: t('self.moodRadiant') || 'Radiant', color: Theme.colors.sanctuarySaffron },
    ];

    const handleMoodSelect = (level: number) => {
        if (disabled) return;
        setSelectedMood(level);
        rotation.value = withSpring(rotation.value + 360);
        onMoodChange?.(level);
    };

    const lotusStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    return (
        <GlassCard style={styles.container}>
            <VStack space="xl" alignItems="center">
                <Text fontWeight="700" size="lg">
                    {t('self.moodHowAreYou') || 'How is your inner lotus today?'}
                </Text>

                <Animated.View style={[styles.lotusContainer, lotusStyle]}>
                    <Flower2 
                        size={80} 
                        color={(selectedMood !== null && moodOptions[selectedMood - 1]) ? (moodOptions[selectedMood - 1] as any).color : colors.textTertiary} 
                        strokeWidth={1.5}
                    />
                </Animated.View>

                <HStack space="md" justifyContent="center">
                    {moodOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = selectedMood === option.level;
                        return (
                            <VStack key={option.level} space="xs" alignItems="center">
                                <TouchableOpacity
                                    onPress={() => handleMoodSelect(option.level)}
                                    disabled={disabled}
                                    style={[
                                        styles.moodBtn,
                                        isSelected && { backgroundColor: `${option.color}20`, borderColor: option.color, borderWidth: 2 }
                                    ]}
                                >
                                    <Icon 
                                        size={24} 
                                        color={isSelected ? option.color : colors.textSecondary} 
                                    />
                                </TouchableOpacity>
                                <Text size="xs" color={isSelected ? colors.text : colors.textTertiary} fontWeight={isSelected ? "600" : "400"}>
                                    {option.label}
                                </Text>
                            </VStack>
                        );
                    })}
                </HStack>
            </VStack>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        borderRadius: 24,
    },
    lotusContainer: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    moodBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    }
});
export default MoodLotus;
