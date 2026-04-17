/**
 * MoodLotus.web.tsx
 *
 * Web-specific implementation for the mood resonance module.
 * Purged raw HTML fragments and inline styles in favor of @repo/ui primitives and Sanctuary design tokens.
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
    Box, 
    VStack, 
    HStack, 
    Text, 
    Heading, 
    Button, 
    ButtonText, 
    Input, 
    InputField, 
    Icon,
    SkeletonCard
} from '@repo/ui';
import { supabase, useTemporalStore } from '@repo/core';
import { useMoodLogs } from '../hooks/useMoodLogs';
import { Wind, CheckCircle, Info, Sparkles } from 'lucide-react-native';

interface MoodLotusProps {
    userId?: string;
    onMoodChange?: (mood: number) => void;
    variant?: 'summary' | 'detail';
}

const LOTUS_EMOJIS = ['', '🪷', '🌷', '🌸', '💐', '✨'];
const MOOD_OPTION_LABELS = ['', 'Struggling', 'Challenging', 'Okay', 'Good', 'Flourishing'];
const MOOD_TOKEN_COLORS = ['', 'text-emberRed', 'text-amberGlow', 'text-mistGray', 'text-emeraldGreen', 'text-sanctuarySaffron'];
const MOOD_TOKEN_BGS = ['', 'bg-emberRed', 'bg-amberGlow', 'bg-mistGray', 'bg-emeraldGreen', 'bg-sanctuarySaffron'];

const BREATH_STEPS = [
    { label: 'Breathe in', seconds: 4, color: 'text-indigo-400' },
    { label: 'Hold', seconds: 4, color: 'text-amber-400' },
    { label: 'Breathe out', seconds: 6, color: 'text-emeraldGreen' },
];

export default function MoodLotus({ userId, onMoodChange, variant = 'summary' }: MoodLotusProps) {
    const { moodHistory, addMoodLog, isLoading } = useMoodLogs(userId);
    const isPastView = useTemporalStore(s => s.isPastView);

    const [selected, setSelected] = useState<number | null>(null);
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showBreath, setShowBreath] = useState(false);
    const [breathStep, setBreathStep] = useState(0);
    const [breathActive, setBreathActive] = useState(false);
    const breathTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
        };
    }, []);

    const latestScore = moodHistory[0]?.mood_score ?? null;
    const displayScore = selected ?? latestScore;
    const isDetail = variant === 'detail';

    const handleSave = async () => {
        if (!selected || !userId) return;
        const moodMap: Record<number, 'sad' | 'frustrated' | 'calm' | 'curious' | 'joyful'> = {
            1: 'sad', 2: 'frustrated', 3: 'calm', 4: 'curious', 5: 'joyful'
        };
        setSaving(true);
        try {
            await addMoodLog(moodMap[selected], note || undefined);
            onMoodChange?.(selected);
            setSaved(true);
            setNote('');
            setTimeout(() => setSaved(false), 2500);
        } catch (error) {
            console.error('Failed to log mood:', error);
        } finally {
            setSaving(false);
        }
    };

    const startBreath = () => {
        setBreathStep(0);
        setBreathActive(true);
        const durations = [4000, 4000, 6000];
        let i = 0;
        const cycle = () => {
            breathTimerRef.current = setTimeout(() => {
                i = (i + 1) % 3;
                setBreathStep(i);
                cycle();
            }, durations[i]);
        };
        cycle();
    };

    const stopBreath = () => {
        if (breathTimerRef.current) {
            clearTimeout(breathTimerRef.current);
            breathTimerRef.current = null;
        }
        setBreathActive(false);
        setBreathStep(0);
    };

    return (
        <VStack className={`gap-lg ${isDetail ? 'max-w-4xl' : ''}`}>
            <HStack className={`gap-xl ${isDetail ? 'flex-col md:flex-row' : 'flex-col'}`}>
                {/* Main Interaction Area */}
                <VStack className="flex-1 gap-lg">
                    {/* Header */}
                    <HStack className="justify-between items-center">
                        <VStack className="gap-0">
                            <Text className="text-[10px] font-bold uppercase tracking-widest text-mistGray">Mood Resonance</Text>
                            <Heading size="md" className="text-sacredWhite">How are you feeling?</Heading>
                        </VStack>
                        {!isDetail && (
                            <Button
                                variant="outline"
                                size="sm"
                                onPress={() => {
                                    if (showBreath) stopBreath();
                                    setShowBreath(v => !v);
                                }}
                                className="border-white/10 rounded-full h-9"
                            >
                                <Icon as={Wind} size={14} className="text-mistGray mr-2" />
                                <ButtonText className="text-mistGray text-xs">Breath</ButtonText>
                            </Button>
                        )}
                    </HStack>

                    {/* Lotus Display */}
                    <VStack className="items-center justify-center p-xl bg-obsidian rounded-comfortable border border-white/5 min-h-[250px] relative overflow-hidden">
                        <Box className={`absolute inset-0 opacity-10 blur-3xl rounded-full ${displayScore ? MOOD_TOKEN_BGS[displayScore] : ''}`} />
                        
                        <Box className="transition-all duration-500 ease-in-out">
                            <Text className={`${isDetail ? 'text-[120px]' : 'text-[80px]'} animate-in zoom-in duration-500`}>
                                {LOTUS_EMOJIS[displayScore ?? 0] || '🪷'}
                            </Text>
                        </Box>
                        
                        {displayScore !== null && (
                            <VStack className="items-center mt-4">
                                <Text className={`text-xl font-bold ${MOOD_TOKEN_COLORS[displayScore]}`}>
                                    {MOOD_OPTION_LABELS[displayScore]}
                                </Text>
                            </VStack>
                        )}
                    </VStack>

                    {/* Selectable Petals */}
                    <HStack className="justify-center gap-4">
                        {[1, 2, 3, 4, 5].map(score => (
                            <Button
                                key={score}
                                onPress={() => !isPastView && setSelected(score)}
                                isDisabled={isPastView}
                                className={`w-14 h-14 rounded-full transition-all duration-300 ${
                                    selected === score 
                                        ? `${MOOD_TOKEN_BGS[score]} border-2 border-white/20 scale-110 shadow-lg` 
                                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                }`}
                            >
                                <Text className="text-2xl">{LOTUS_EMOJIS[score]}</Text>
                            </Button>
                        ))}
                    </HStack>

                    {/* Logging Form */}
                    {selected !== null && (
                        <VStack className="gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <Input className="bg-obsidian border-white/10 h-14 rounded-comfortable">
                                <InputField
                                    placeholder={isPastView ? "Historical resonance view" : "What is on your mind? (optional)"}
                                    value={note}
                                    onChangeText={setNote}
                                    isDisabled={isPastView}
                                    className="text-sacredWhite"
                                    placeholderTextColor="#6A6358"
                                />
                            </Input>
                            <Button
                                onPress={handleSave}
                                isDisabled={saving || isPastView}
                                className={`h-14 rounded-full ${displayScore ? MOOD_TOKEN_BGS[displayScore] : 'bg-sanctuarySaffron'}`}
                            >
                                <ButtonText className="text-white font-bold">
                                    {saving ? 'Syncing...' : saved ? '✓ Logged' : 'Log Mood'}
                                </ButtonText>
                            </Button>
                        </VStack>
                    )}

                    {/* Breath Guide */}
                    {(showBreath || isDetail) && (
                        <Box className="p-lg bg-indigo-400/5 rounded-comfortable border border-indigo-400/10 items-center justify-center">
                            <Text className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-4">Paced Breathing</Text>
                            {breathActive ? (
                                <VStack className="items-center gap-4">
                                    <Text className={`text-3xl font-extrabold transition-colors duration-500 ${BREATH_STEPS[breathStep]?.color}`}>
                                        {BREATH_STEPS[breathStep]?.label}
                                    </Text>
                                    <HStack className="items-center gap-2">
                                        <Icon as={Clock} className="text-mistGray" size={14} />
                                        <Text className="text-mistGray font-bold">{BREATH_STEPS[breathStep]?.seconds}s</Text>
                                    </HStack>
                                    <Button variant="outline" size="sm" onPress={stopBreath} className="rounded-full border-white/10 mt-2">
                                        <ButtonText className="text-dimGray">Stop</ButtonText>
                                    </Button>
                                </VStack>
                            ) : (
                                <VStack className="items-center gap-4">
                                    <Text className="text-sm text-mistGray text-center italic max-w-xs">
                                        A 4-4-6 cycle to ground your energy and calm the nervous system.
                                    </Text>
                                    <Button onPress={startBreath} className="bg-indigo-500 rounded-full h-11 px-8">
                                        <ButtonText className="text-white font-bold">Begin Breath</ButtonText>
                                    </Button>
                                </VStack>
                            )}
                        </Box>
                    )}
                </VStack>

                {/* History Sidebar (Detail Only) */}
                {isDetail && (
                    <VStack className="w-full md:w-80 gap-lg">
                        <HStack className="items-center gap-2 px-1">
                            <Icon as={Clock} className="text-mistGray" size={16} />
                            <Text className="text-[11px] font-bold uppercase tracking-widest text-mistGray">Recent History</Text>
                        </HStack>
                        
                        <VStack className="gap-3">
                            {!isLoading && moodHistory.length > 0 ? (
                                moodHistory.slice(0, 10).map(m => (
                                    <HStack key={m.id} className="p-4 bg-obsidian rounded-comfortable border border-white/5 items-center gap-4">
                                        <Box className={`w-10 h-10 rounded-full items-center justify-center shadow-sm ${MOOD_TOKEN_BGS[m.mood_score]}`}>
                                            <Text className="text-xl">{LOTUS_EMOJIS[m.mood_score]}</Text>
                                        </Box>
                                        <VStack className="flex-1 gap-0.5">
                                            <Text className="text-sm font-bold text-sacredWhite">{MOOD_OPTION_LABELS[m.mood_score]}</Text>
                                            <Text className="text-[10px] text-dimGray italic">
                                                {new Date(m.created_at).toLocaleDateString()} at {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                            {m.note && (
                                                <Text className="text-xs text-mistGray mt-1.5 italic line-clamp-2">"{m.note}"</Text>
                                            )}
                                        </VStack>
                                    </HStack>
                                ))
                            ) : (
                                <SkeletonCard height={80} />
                            )}
                        </VStack>
                    </VStack>
                )}
            </HStack>
        </VStack>
    );
}
