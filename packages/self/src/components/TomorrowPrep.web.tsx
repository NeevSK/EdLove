/**
 * TOMORROW PREPARATION (Web)
 * Synchronized checklist for seting future intentions with Sanctuary V3 aesthetics.
 * Standardized to Zero-Legacy: purged raw HTML styles and integrated @repo/ui primitives.
 */

import React, { useState, useEffect } from 'react';
import { useTemporalStore } from '@repo/core';
import { useTomorrowPrep } from '../hooks/useTomorrowPrep';
import type { DailyPrepItem } from '../types';
import { Calendar, Plus, Trash2, Check, X, Target, Moon } from 'lucide-react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Button,
    ButtonText,
    Icon,
    Input,
    InputField,
    Spinner,
    Pressable,
    Progress,
    ProgressFilledTrack
} from '@repo/ui';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';

interface TomorrowPrepProps {
    userId?: string;
}

const getTomorrow = (): string => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0] as string;
};

export default function TomorrowPrep({ userId }: TomorrowPrepProps) {
    const { prepItems, isLoading, addPrepItem, updatePrepItem, removePrepItem } = useTomorrowPrep(userId);
    const isPastView = useTemporalStore(s => s.isPastView);
    const [showForm, setShowForm] = useState(false);
    const [itemText, setItemText] = useState('');
    const [saving, setSaving] = useState(false);
    const [toggling, setToggling] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);

    // Recomputes at midnight so date stays correct if the app stays open overnight
    const [tomorrow, setTomorrow] = useState<string>(getTomorrow);
    useEffect(() => {
        const now = new Date();
        const msUntilMidnight =
            new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
        const timer = setTimeout(() => setTomorrow(getTomorrow()), msUntilMidnight);
        return () => clearTimeout(timer);
    }, [tomorrow]);

    const tomorrowItems = prepItems.filter(i => i.prep_date === tomorrow);
    const completedCount = tomorrowItems.filter(i => i.is_completed).length;
    const progress = tomorrowItems.length > 0 ? (completedCount / tomorrowItems.length) * 100 : 0;

    const handleAdd = async () => {
        if (!itemText.trim() || !userId) return;
        setSaving(true);
        try {
            await addPrepItem(itemText.trim(), tomorrow);
            setItemText('');
            setShowForm(false);
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (item: DailyPrepItem) => {
        setToggling(item.id);
        const newVal = !item.is_completed;
        try {
            await updatePrepItem(item.id, { is_completed: newVal });
        } catch {
            // no-op; hook state remains source of truth
        } finally {
            setToggling(null);
        }
    };

    const handleDelete = async (id: string) => {
        setDeleting(id);
        try {
            await removePrepItem(id);
        } finally {
            setDeleting(null);
        }
    };

    return (
        <VStack className="gap-6 w-full">
            {/* Header Area */}
            <VStack className="gap-3">
                <HStack className="items-center justify-between">
                    <HStack className="items-center gap-2">
                        <Box className="w-8 h-8 rounded-full bg-sanctuarySaffron/10 items-center justify-center">
                            <Icon as={Moon} size={14} className="text-sanctuarySaffron" />
                        </Box>
                        <VStack className="gap-0">
                            <Heading size="xs" className="text-sacredWhite font-black uppercase tracking-[0.2em]">
                                Future Flow
                            </Heading>
                            <Text className="text-[10px] text-mistGray/40 uppercase font-black tracking-widest pl-0.5">Tomorrow's Intentions</Text>
                        </VStack>
                    </HStack>
                    
                    {!isPastView && (
                        <Pressable 
                            onPress={() => setShowForm(v => !v)}
                            className={`px-4 py-2 rounded-xl transition-all active:scale-95 ${showForm ? 'bg-shroud border border-white/10' : 'bg-white/5 border border-white/10'}`}
                        >
                            <HStack className="items-center gap-2">
                                <Icon as={showForm ? X : Plus} size={14} className={showForm ? 'text-mistGray' : 'text-sanctuarySaffron'} />
                                <Text className={`text-[11px] font-black uppercase tracking-widest ${showForm ? 'text-mistGray' : 'text-sanctuarySaffron'}`}>
                                    {showForm ? 'Dismiss' : 'Draft'}
                                </Text>
                            </HStack>
                        </Pressable>
                    )}
                </HStack>

                {/* Progress Visualizer */}
                {tomorrowItems.length > 0 && (
                    <VStack className="gap-2 px-1">
                        <Progress value={progress} className="h-1.5 w-full bg-white/5 rounded-full border border-white/5">
                            <ProgressFilledTrack className="bg-sanctuarySaffron" />
                        </Progress>
                        <HStack className="justify-between items-center px-1">
                            <Text className="text-[9px] text-mistGray/30 font-black uppercase tracking-widest">Readiness Level</Text>
                            <Text className="text-[10px] text-sanctuarySaffron font-black uppercase tracking-widest">
                                {completedCount} / {tomorrowItems.length} Verified
                            </Text>
                        </HStack>
                    </VStack>
                )}
            </VStack>

            {/* Quick Draft Form */}
            {showForm && (
                <Animated.View entering={FadeInDown} layout={Layout}>
                    <HStack className="gap-3 p-4 bg-shroud border border-white/10 rounded-[24px] shadow-2xl">
                        <Input className="flex-1 bg-white/5 border-white/10 rounded-xl h-12">
                            <InputField 
                                autoFocus
                                value={itemText} 
                                onChangeText={setItemText} 
                                placeholder="What needs addressing...?" 
                                className="text-sacredWhite text-sm"
                                placeholderTextColor="#6A635844"
                            />
                        </Input>
                        <Button 
                            onPress={handleAdd} 
                            disabled={saving || !itemText.trim()}
                            className="bg-sanctuarySaffron w-12 h-12 rounded-xl shadow-lg shadow-sanctuarySaffron/20"
                        >
                            <HStack className="items-center justify-center">
                                {saving ? <Spinner size="small" color="#544A3D" /> : <Icon as={Plus} size={18} className="text-obsidian" />}
                            </HStack>
                        </Button>
                    </HStack>
                </Animated.View>
            )}

            {/* Preparation List */}
            {isLoading ? (
                <VStack className="gap-3">
                    {[1, 2, 3].map(i => (
                        <Box key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                </VStack>
            ) : tomorrowItems.length === 0 ? (
                <Box className="py-16 items-center opacity-30 bg-white/5 rounded-[32px] border border-dashed border-white/10">
                    <Icon as={Target} size={32} className="text-mistGray mb-4 opacity-20" />
                    <Text className="text-xs font-bold text-mistGray text-center max-w-[200px] leading-relaxed">
                        A prepared mind rests easier. Set your morning intentions now.
                    </Text>
                </Box>
            ) : (
                <VStack className="gap-2.5">
                    {tomorrowItems.map((item, idx) => (
                        <Animated.View key={item.id} entering={FadeInDown.delay(idx * 50)} layout={Layout}>
                            <HStack 
                                className={`items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-[22px] transition-all ${item.is_completed ? 'opacity-40' : 'opacity-100'}`}
                            >
                                <Pressable 
                                    onPress={() => !isPastView && handleToggle(item)}
                                    disabled={toggling === item.id || isPastView}
                                    className={`w-6 h-6 rounded-lg items-center justify-center border transition-all ${item.is_completed ? 'bg-emeraldGreen border-emeraldGreen' : 'border-white/10 bg-white/5'}`}
                                >
                                    {item.is_completed && <Icon as={Check} size={12} className="text-obsidian" />}
                                </Pressable>
                                
                                <VStack className="flex-1">
                                    <Text className={`text-sm font-bold tracking-tight ${item.is_completed ? 'text-mistGray line-through' : 'text-sacredWhite'}`}>
                                        {item.item_text}
                                    </Text>
                                </VStack>

                                {!isPastView && (
                                    <Pressable 
                                        onPress={() => handleDelete(item.id)} 
                                        disabled={deleting === item.id}
                                        className="p-2 hover:bg-emberRed/10 rounded-lg active:scale-95"
                                    >
                                        <Icon as={Trash2} size={14} className="text-mistGray/30" />
                                    </Pressable>
                                )}
                            </HStack>
                        </Animated.View>
                    ))}
                </VStack>
            )}
        </VStack>
    );
}

