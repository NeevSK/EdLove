import React from 'react';
import { Pressable } from 'react-native';
import { ChevronLeft, ChevronRight, Calendar, RotateCcw } from 'lucide-react-native';
import { useTemporalStore } from '@repo/core/logic';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { Box, Text, HStack } from '../gluestack';

/**
 * TemporalNavigator
 * 
 * A premium UI component that allows users to travel through "Time".
 * Updates the global useTemporalStore which in turn refreshes data across the app.
 */
export const TemporalNavigator = () => {
    const { 
        viewDate, 
        setViewDate, 
        resetToToday, 
        phase,
    } = useTemporalStore();

    const adjustDate = (days: number) => {
        const date = new Date(viewDate);
        date.setDate(date.getDate() + days);
        const dateStr = date.toISOString().split('T')[0] || '';
        setViewDate(dateStr);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const todayStr = new Date().toISOString().split('T')[0];
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (dateStr === todayStr) return 'Today';
        if (dateStr === yesterdayStr) return 'Yesterday';

        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
    };

    const isToday = phase === 'present';

    return (
        <Animated.View 
            layout={Layout} 
            entering={FadeIn}
            className="flex-row items-center justify-between bg-phase-surface/10 mx-4 my-2 py-2.5 px-3 rounded-xl border border-white/5 shadow-sm"
        >
            <HStack className="items-center flex-1 gap-2">
                <Pressable 
                    accessibilityRole="button" 
                    className="w-9 h-9 rounded-full bg-white/5 items-center justify-center active:bg-white/10" 
                    onPress={() => adjustDate(-1)}
                >
                    <ChevronLeft size={20} color="#999" />
                </Pressable>
                
                {!isToday && (
                    <Pressable 
                        accessibilityRole="button" 
                        className="flex-row items-center ml-2 px-2.5 py-1.5 rounded-lg bg-phase-accent/15 active:bg-phase-accent/25" 
                        onPress={resetToToday}
                    >
                        <RotateCcw size={14} color="#F6BF8C" />
                        <Text className="text-phase-accent text-xs font-semibold ml-1">Today</Text>
                    </Pressable>
                )}
            </HStack>

            <Pressable 
                accessibilityRole="button" 
                className="flex-row items-center px-3 active:opacity-70"
                onPress={() => {/* In a real app, this triggers a DatePicker modal */}}
            >
                <Calendar size={16} color="#F6BF8C" className="mr-1.5" />
                <Box>
                    <Text className="text-white text-base font-bold tracking-tight">
                        {formatDate(viewDate)}
                    </Text>
                    {/* Temporal pulse (Phase 2 delighter) */}
                    <Box className="w-1 h-1 rounded-full bg-phase-accent absolute -bottom-2 self-center shadow-[0_0_8px_#F6BF8C]" />
                </Box>
            </Pressable>

            <Box className="flex-row items-center justify-end flex-1">
                <Pressable 
                    accessibilityRole="button" 
                    className={`w-9 h-9 rounded-full bg-white/5 items-center justify-center ${isToday ? 'opacity-20' : 'active:bg-white/10'}`} 
                    onPress={() => !isToday && adjustDate(1)}
                    disabled={isToday}
                >
                    <ChevronRight size={20} color="#999" />
                </Pressable>
            </Box>
        </Animated.View>
    );
};
