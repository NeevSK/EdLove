import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { MOOD_OPTIONS, MOOD_COLORS, MOOD_LABELS } from '../constants/wellbeing';
import type { MoodLog } from '../types';

interface MoodPickerCardProps {
    /** Current open state of the picker overlay. */
    isOpen: boolean;
    /** Toggle the picker open/closed. */
    onToggle: () => void;
    /** Called when user selects a mood emoji. Should call addMoodLog internally. */
    onSelect: (mood: MoodLog['mood'], note: string) => Promise<void>;
    /** Whether the save is in flight. */
    isSaving: boolean;
    /** The latest logged mood (to display when picker is closed). */
    latestMood: MoodLog | null | undefined;
    /** Whether the mood history is still loading. */
    isLoading: boolean;
    /**
     * Optional card accent.
     * - 'dark'  → #111827 background
     * - 'water' → #3B82F6 background
     * - 'light' → Soft lavender/sky for students
     * - 'earth' → Grounding terracotta/sage for admins
     * - 'fire'  → Dynamic saffron/ruby for founders
     * Defaults to 'dark'.
     */
    accent?: 'dark' | 'water' | 'light' | 'earth' | 'fire';
    /** Whether the picker is disabled (e.g. historical view). */
    isDisabled?: boolean;
}

/**
 * MoodPickerCard
 * 
 * Self-contained mood resonance card. Ported to React Native for GuruDevi Kernel.
 */
export function MoodPickerCard({
    isOpen,
    onToggle,
    onSelect,
    isSaving,
    latestMood,
    isLoading,
    accent = 'dark',
    isDisabled = false,
}: MoodPickerCardProps) {
    const [note, setNote] = useState('');

    const getBackground = () => {
        switch (accent) {
            case 'water': return '#3B82F6';
            case 'light': return '#818CF8'; // Indigo-400
            case 'earth': return '#059669'; // Emerald-600
            case 'fire': return '#EF4444';  // Red-500
            default: return '#111827';
        }
    };

    const bg = getBackground();
    const overlayBg = 'rgba(255,255,255,0.08)';

    const handleSelect = async (mood: MoodLog['mood']) => {
        await onSelect(mood, note);
        setNote('');
    };

    return (
        <View style={[styles.container, { backgroundColor: bg }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Mood Resonance</Text>
                <TouchableOpacity
                    onPress={onToggle}
                    disabled={isDisabled}
                    style={[
                        styles.toggleButton,
                        { backgroundColor: isOpen ? '#8B5CF6' : 'rgba(255,255,255,0.15)', opacity: isDisabled ? 0.5 : 1 }
                    ]}
                >
                    <Text style={styles.toggleButtonText}>
                        {isDisabled ? 'Viewing History' : (isOpen ? 'Cancel' : '+ Log Mood')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Picker overlay */}
            {isOpen && (
                <View style={[styles.overlay, { backgroundColor: overlayBg }]}>
                    <Text style={styles.overlayTitle}>How are you feeling right now?</Text>
                    <View style={styles.pickerGrid}>
                        {MOOD_OPTIONS.map(opt => (
                            <TouchableOpacity
                                key={opt.value}
                                disabled={isSaving}
                                onPress={() => void handleSelect(opt.value)}
                                style={styles.moodOption}
                            >
                                <Text style={styles.emoji}>{opt.emoji}</Text>
                                <Text style={styles.moodLabel}>{opt.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TextInput
                        value={note}
                        onChangeText={setNote}
                        placeholder="Optional note..."
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        style={styles.input}
                    />
                </View>
            )}

            {/* Latest mood display */}
            {isLoading ? (
                <ActivityIndicator color="white" style={styles.loader} />
            ) : latestMood ? (
                <View style={styles.latestContainer}>
                    <Text
                        style={[
                            styles.moodScore,
                            { color: MOOD_COLORS[latestMood.mood_score] ?? '#8B5CF6' }
                        ]}
                    >
                        {latestMood.mood_score}/5
                    </Text>
                    <Text style={styles.moodText}>
                        {latestMood.mood
                            ? latestMood.mood.charAt(0).toUpperCase() + latestMood.mood.slice(1)
                            : MOOD_LABELS[latestMood.mood_score]}
                    </Text>
                    {latestMood.note && (
                        <Text style={styles.noteText}>"{latestMood.note}"</Text>
                    )}
                    <Text style={styles.timeText}>
                        {formatDistanceToNow(new Date(latestMood.created_at), { addSuffix: true })}
                    </Text>
                </View>
            ) : (
                <Text style={styles.emptyText}>
                    No mood logs yet. Tap "+ Log Mood" above to begin.
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '800',
        color: 'white',
    },
    toggleButton: {
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    toggleButtonText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '700',
    },
    overlay: {
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
    },
    overlayTitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.75)',
        marginBottom: 12,
    },
    pickerGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    moodOption: {
        alignItems: 'center',
        gap: 4,
        padding: 8,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 10,
        minWidth: 60,
    },
    emoji: {
        fontSize: 20,
    },
    moodLabel: {
        color: 'white',
        fontSize: 10,
        fontWeight: '600',
    },
    input: {
        padding: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.12)',
        color: 'white',
        fontSize: 13,
    },
    loader: {
        marginVertical: 10,
    },
    latestContainer: {
        marginTop: 4,
    },
    moodScore: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 4,
    },
    moodText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 8,
    },
    noteText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        lineHeight: 18,
        fontStyle: 'italic',
        marginBottom: 8,
    },
    timeText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
    },
    emptyText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
    }
});
