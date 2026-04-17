/**
 * BREATH GUIDE (Web)
 * 4-2-6-2 breathing rhythm optimized for web performance.
 * Standardized to Zero-Legacy: purged raw HTML/inline styles and fixed syntax corruption.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Button,
    ButtonText,
    Icon,
    Heading
} from '@repo/ui';
import { Wind, Play, Pause, RotateCcw, Sparkles } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface BreathGuideProps {
    onComplete?: () => void;
}

type Phase = 'inhale' | 'hold' | 'exhale' | 'rest';

const CYCLE: Array<{ phase: Phase; duration: number; label: string; colorClass: string; accentColor: string }> = [
    { phase: 'inhale', duration: 4000, label: 'Breathe in...', colorClass: 'text-skyBlue', accentColor: '#3B82F6' },
    { phase: 'hold', duration: 2000, label: 'Hold...', colorClass: 'text-sanctuarySaffron', accentColor: '#FCD34D' },
    { phase: 'exhale', duration: 6000, label: 'Breathe out...', colorClass: 'text-emeraldGreen', accentColor: '#10B981' },
    { phase: 'rest', duration: 2000, label: 'Rest...', colorClass: 'text-mistGray', accentColor: '#94A3B8' },
];

const TOTAL_CYCLES = 4;

export default function BreathGuide({ onComplete }: BreathGuideProps) {
    const { t } = useTranslation();
    const [active, setActive] = useState(false);
    const [cycleIdx, setCycleIdx] = useState(0);
    const [phaseIdx, setPhaseIdx] = useState(0);
    const [done, setDone] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const current = CYCLE[phaseIdx] ?? CYCLE[0];

    const advance = (cycleIndex: number, phaseIndex: number) => {
        const nextPhaseIndex = (phaseIndex + 1) % CYCLE.length;
        const nextCycleIndex = nextPhaseIndex === 0 ? cycleIndex + 1 : cycleIndex;
        const nextPhase = CYCLE[nextPhaseIndex];

        if (nextCycleIndex >= TOTAL_CYCLES) {
            setActive(false);
            setDone(true);
            onComplete?.();
            return;
        }

        setPhaseIdx(nextPhaseIndex);
        setCycleIdx(nextCycleIndex);
        timerRef.current = setTimeout(() => advance(nextCycleIndex, nextPhaseIndex), nextPhase.duration);
    };

    const start = () => {
        setDone(false);
        setPhaseIdx(0);
        setCycleIdx(0);
        setActive(true);
        // Start after first phase duration
        timerRef.current = setTimeout(() => advance(0, 0), CYCLE[0].duration);
    };

    const stop = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setActive(false);
    };

    useEffect(() => {
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, []);

    // Web Scale Logic using CSS
    const scale = active && (current.phase === 'inhale' || current.phase === 'hold')
        ? 1.4
        : active && current.phase === 'exhale'
            ? 0.8
            : 1.0;

    return (
        <VStack className="items-center gap-6 py-4">
            <Box className="items-center gap-1">
                <Text className="text-[10px] uppercase font-black tracking-[0.2em] text-mistGray/60">
                    Somatic Grounding
                </Text>
                <Heading size="sm" className="text-sacredWhite/80">Breath Guide</Heading>
            </Box>

            {done ? (
                <VStack className="items-center p-6 bg-white/5 rounded-3xl border border-white/10 shadow-xl">
                    <Icon as={Sparkles} className="text-sanctuarySaffron mb-4" size={48} />
                    <Text className="text-center text-sacredWhite font-medium text-lg mb-2">
                        Grounded & Presence
                    </Text>
                    <Text className="text-center text-mistGray text-sm">
                        {TOTAL_CYCLES} cycles complete. Your nervous system is regulated.
                    </Text>
                </VStack>
            ) : (
                <VStack className="items-center gap-8">
                    {/* Breathing Orb */}
                    <Box 
                        className="relative w-32 h-32 items-center justify-center rounded-full transition-all duration-500"
                        style={{
                            transform: `scale(${scale})`,
                            transition: `transform ${active ? current.duration : 400}ms ease-in-out, background 500ms, border-color 500ms`,
                            background: active 
                                ? `radial-gradient(circle, ${current.accentColor}44 0%, ${current.accentColor}11 100%)`
                                : 'rgba(255,255,255,0.05)',
                            border: `2px solid ${active ? current.accentColor : 'rgba(255,255,255,0.1)'}`,
                            boxShadow: active ? `0 0 40px ${current.accentColor}22` : 'none'
                        }}
                    >
                        <Icon as={Wind} size={40} className={active ? current.colorClass : 'text-mistGray/30'} />
                        
                        {/* Pulse Ring */}
                        {active && (
                            <Box 
                                className="absolute inset-0 rounded-full border-2 animate-ping"
                                style={{ borderColor: `${current.accentColor}44` }}
                            />
                        )}
                    </Box>

                    {/* Status Text */}
                    <VStack className="items-center min-h-[60px] gap-2">
                        {active ? (
                            <>
                                <Heading className={`${current.colorClass} transition-colors duration-300 text-2xl`}>
                                    {current.label}
                                </Heading>
                                <HStack className="items-center gap-2">
                                    <Box className="h-1 w-24 bg-white/10 rounded-full overflow-hidden">
                                        <Box 
                                            className={`h-full ${current.colorClass.replace('text-', 'bg-')} transition-all`}
                                            style={{ width: `${((cycleIdx * CYCLE.length + phaseIdx + 1) / (TOTAL_CYCLES * CYCLE.length)) * 100}%` }}
                                        />
                                    </Box>
                                    <Text className="text-mistGray text-[10px] font-bold uppercase tracking-widest">
                                        Cycle {cycleIdx + 1}/{TOTAL_CYCLES}
                                    </Text>
                                </HStack>
                            </>
                        ) : (
                            <VStack className="items-center opacity-60">
                                <Text className="text-mistGray text-sm font-medium">
                                    4-2-6-2 Rhythmic Breath
                                </Text>
                                <Text className="text-mistGray/40 text-[10px] uppercase font-bold tracking-widest">
                                    ~1 Minute Duration
                                </Text>
                            </VStack>
                        )}
                    </VStack>
                </VStack>
            )}

            {/* Action Button */}
            <Button
                onPress={active ? stop : start}
                className={`px-8 py-3 rounded-comfortable shadow-lg transition-all ${
                    active 
                        ? 'bg-white/10 border border-white/10' 
                        : done ? 'bg-emeraldGreen shadow-emeraldGreen/20' : 'bg-sanctuarySaffron shadow-sanctuarySaffron/20'
                }`}
            >
                <HStack className="items-center gap-2">
                    <Icon 
                        as={done ? RotateCcw : active ? Pause : Play} 
                        size={18} 
                        className={active ? 'text-sacredWhite' : 'text-obsidian'} 
                    />
                    <ButtonText className={`font-black uppercase tracking-widest text-xs ${active ? 'text-sacredWhite' : 'text-obsidian'}`}>
                        {done ? 'Try Again' : active ? 'Stop Session' : 'Begin Now'}
                    </ButtonText>
                </HStack>
            </Button>
        </VStack>
    );
}
