import React, { useState } from 'react';
import { Pressable, Modal } from 'react-native';
import { Calendar, Search, Wifi, WifiOff, Zap, Layout as LayoutIcon } from 'lucide-react-native';
import { useTemporalStore } from '@repo/core';
import { Box, Text, HStack, VStack } from '../gluestack';
import { TemporalScrubber } from './TemporalScrubber';

/**
 * TemporalPilot
 * 
 * The ultimate temporal command center. 
 * Merges the intuitive flow of the Scrubber with the tactical precision of a Calendar.
 */
export const TemporalPilot: React.FC = () => {
    const { 
        viewScale, setScale, 
        viewMode, setViewMode,
        timelineFocus, setTimelineFocus,
        isOffline, setOffline 
    } = useTemporalStore();
    const [isCalendarVisible, setCalendarVisible] = useState(false);

    return (
        <Box className="bg-white/5 rounded-3xl p-4 mx-4 border border-white/10">
            {/* Tactical Switcher */}
            <HStack className="justify-between items-center mb-4">
                <HStack className="gap-2">
                    {(['day', 'week', 'month'] as const).map((s) => (
                        <Pressable
                            accessibilityRole="button"
                            key={s}
                            onPress={() => setScale(s)}
                            className={`py-1.5 px-3 rounded-xl ${viewScale === s ? 'bg-white/20' : 'bg-white/5'}`}
                        >
                            <Text className={`text-[10px] font-bold ${viewScale === s ? 'text-white' : 'text-white/40'}`}>
                                {s.toUpperCase()}
                            </Text>
                        </Pressable>
                    ))}
                </HStack>

                <HStack className="gap-3">
                    {/* View Mode Toggle */}
                    <Pressable
                        accessibilityRole="button"
                        onPress={() => setViewMode(viewMode === 'spotlight' ? 'timeline' : 'spotlight')}
                        className={`w-9 h-9 rounded-full items-center justify-center ${viewMode === 'timeline' ? 'bg-white/20 border border-phase-accent/50' : 'bg-white/5'}`}
                    >
                        {viewMode === 'spotlight' ? (
                            <Zap size={20} color="#F6BF8C" />
                        ) : (
                            <LayoutIcon size={20} color="#F6BF8C" />
                        )}
                    </Pressable>

                    <Pressable
                        accessibilityRole="button"
                        onPress={() => setOffline(!isOffline)}
                        className="w-9 h-9 rounded-full bg-white/5 items-center justify-center active:bg-white/10"
                    >
                        {isOffline ? (
                            <WifiOff size={20} color="#FF6B6B" />
                        ) : (
                            <Wifi size={20} color="#F6BF8C" />
                        )}
                    </Pressable>

                    <Pressable
                        accessibilityRole="button"
                        onPress={() => setCalendarVisible(true)}
                        className="w-9 h-9 rounded-full bg-white/5 items-center justify-center active:bg-white/10"
                    >
                        <Calendar size={20} color="#F6BF8C" />
                    </Pressable>

                    <Pressable accessibilityRole="button" className="w-9 h-9 rounded-full bg-white/5 items-center justify-center active:bg-white/10">
                        <Search size={20} color="#F6BF8C" />
                    </Pressable>
                </HStack>
            </HStack>

            {/* Focus Selector (Only in Timeline Mode) */}
            {viewMode === 'timeline' && (
                <HStack className="gap-2 mb-4 justify-center">
                    {(['all', 'mood', 'journal'] as const).map((f) => (
                        <Pressable
                            accessibilityRole="button"
                            key={f}
                            onPress={() => setTimelineFocus(f)}
                            className={`py-1 px-3 rounded-full border ${timelineFocus === f ? 'bg-phase-accent/10 border-phase-accent' : 'bg-white/5 border-white/10'}`}
                        >
                            <Text className={`text-[9px] font-extrabold tracking-widest ${timelineFocus === f ? 'text-phase-accent' : 'text-white/30'}`}>
                                {f.toUpperCase()}
                            </Text>
                        </Pressable>
                    ))}
                </HStack>
            )}

            {/* Intuitive Flow */}
            <TemporalScrubber />

            {/* Tactical Calendar Modal */}
            <Modal visible={isCalendarVisible} transparent animationType="fade">
                <Box className="flex-1 bg-black/80 justify-center items-center">
                    <Box className="w-[90%] bg-[#1A1A1A] rounded-[32px] p-6 border border-white/10">
                        <Text className="text-white text-lg font-bold mb-6 text-center">
                            Select Temporal Point
                        </Text>
                        
                        <Box className="h-[300px] bg-white/5 rounded-2xl items-center justify-center mb-6">
                            <Text className="text-white/50">[Tactical Calendar Utility]</Text>
                        </Box>

                        <Pressable
                            accessibilityRole="button"
                            onPress={() => setCalendarVisible(false)}
                            className="bg-phase-accent p-4 rounded-2xl items-center active:opacity-90"
                        >
                            <Text className="text-black font-extrabold tracking-widest">
                                LOCK TEMPORAL VIEW
                            </Text>
                        </Pressable>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};
