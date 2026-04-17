/**
 * ENERGY FORECAST (Web)
 * Daily energy level log (1-5) with battery-style visualization.
 * Standardized to Zero-Legacy: purged raw HTML/inline styles and fixed syntax corruption in style objects.
 */

import React, { useState, useEffect } from 'react';
import { useTemporalStore } from '@repo/core';
import { 
    Box, 
    VStack, 
    HStack, 
    Text, 
    Heading, 
    Input, 
    InputField, 
    Pressable,
    Icon,
    SkeletonCard
} from '@repo/ui';
import { useEnergyForecast } from '../hooks/useEnergyForecast';
import { ENERGY_COLORS } from '../constants/wellbeing';
import { Battery, CheckCircle2 } from 'lucide-react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';

interface EnergyForecastProps {
    userId?: string;
}

const LEVEL_LABELS: Record<number, { label: string; emoji: string; desc: string; colorClass: string }> = {
    1: { label: 'Depleted',    emoji: '🍂', desc: 'Running on empty. Rest is medicine.', colorClass: 'text-terracotta' },
    2: { label: 'Low',         emoji: '☁️', desc: 'Conserve energy. Be gentle with yourself.', colorClass: 'text-mistGray' },
    3: { label: 'Moderate',    emoji: '🌿', desc: 'Steady and present. Enough to show up.', colorClass: 'text-emeraldGreen' },
    4: { label: 'Energised',   emoji: '✨', desc: 'Clear and capable. Use this well.', colorClass: 'text-skyBlue' },
    5: { label: 'Flourishing', emoji: '⚡', desc: 'Full vitality. Channel this energy wisely.', colorClass: 'text-sanctuarySaffron' }
};

export default function EnergyForecast({ userId }: EnergyForecastProps) {
    const { forecasts, refreshData, isLoading, saveForecast } = useEnergyForecast(userId);
    const { isPastView, viewDate } = useTemporalStore();

    const currentForecast = forecasts.find(f => f.forecast_date === viewDate) ?? null;
    const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setSelectedLevel(currentForecast?.energy_level ?? null);
        setNotes(currentForecast?.notes ?? '');
    }, [currentForecast?.energy_level, currentForecast?.notes]);

    const handleSave = async (level: number) => {
        if (!userId || saving || isPastView) return;
        
        setSelectedLevel(level);
        setSaving(true);
        try {
            await saveForecast({
                forecastDate: viewDate,
                energyLevel: level as 1 | 2 | 3 | 4 | 5,
                notes,
                existingId: currentForecast?.id
            });
            await refreshData();
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) {
        return <SkeletonCard height={120} />;
    }

    const meta = selectedLevel ? LEVEL_LABELS[selectedLevel] : null;

    return (
        <VStack className="gap-4">
            {/* Header */}
            <HStack className="items-center justify-between">
                <HStack className="items-center gap-2">
                    <Icon as={Battery} className="text-sanctuarySaffron" size={16} />
                    <Heading size="xs" className="text-sacredWhite/80 uppercase tracking-widest font-black">
                        Energy Resonance
                    </Heading>
                </HStack>
                {saved && (
                    <Animated.View entering={FadeIn}>
                        <HStack className="items-center gap-1 bg-emeraldGreen/10 px-2 py-1 rounded-full border border-emeraldGreen/20">
                            <Icon as={CheckCircle2} size={10} className="text-emeraldGreen" />
                            <Text className="text-emeraldGreen text-[9px] font-black uppercase">Logged</Text>
                        </HStack>
                    </Animated.View>
                )}
            </HStack>

            {/* Level Selector */}
            <HStack className="gap-2 justify-between">
                {[1, 2, 3, 4, 5].map(level => {
                    const m = LEVEL_LABELS[level];
                    const isSelected = selectedLevel === level;
                    const colorHex = ENERGY_COLORS[level] || '#8B5CF6';
                    
                    return (
                        <Pressable
                            key={level}
                            onPress={() => handleSave(level)}
                            disabled={saving || isPastView}
                            className={`flex-1 py-4 items-center gap-1 rounded-xl border-2 transition-all duration-300 ${
                                isSelected 
                                    ? 'bg-white/10 border-white/20' 
                                    : 'bg-white/5 border-transparent'
                            } ${isPastView && !isSelected ? 'opacity-30' : 'opacity-100'}`}
                            style={isSelected ? { borderColor: colorHex, backgroundColor: `${colorHex}15` } : {}}
                        >
                            <Text className="text-2xl mb-1">{m.emoji}</Text>
                            <Text className={`text-[9px] font-black uppercase tracking-tighter ${
                                isSelected ? m.colorClass : 'text-mistGray/40'
                            }`}>
                                {m.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </HStack>

            {/* Description & Notes */}
            {meta && (
                <Animated.View entering={SlideInUp.duration(400)}>
                    <VStack className="gap-3">
                        <Text className="text-mistGray text-xs italic opacity-80 pl-1">
                            {meta.desc}
                        </Text>
                        
                        <Box className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                            <InputField
                                value={notes}
                                onChangeText={setNotes}
                                onBlur={() => !isPastView && selectedLevel && handleSave(selectedLevel)}
                                placeholder={isPastView ? "Historical resonance log" : "Add context (optional)..."}
                                disabled={isPastView}
                                className="text-sacredWhite text-xs px-4 h-10"
                                placeholderTextColor="rgba(255,255,255,0.2)"
                            />
                        </Box>
                    </VStack>
                </Animated.View>
            )}

            {!selectedLevel && (
                <Text className="text-mistGray/40 text-[10px] italic text-center border-t border-white/5 pt-2 uppercase tracking-widest">
                    Record your energetic state for {viewDate === new Date().toISOString().split('T')[0] ? 'today' : viewDate}
                </Text>
            )}
        </VStack>
    );
}
