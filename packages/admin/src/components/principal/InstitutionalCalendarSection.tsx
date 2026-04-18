/**
 * InstitutionalCalendarSection
 *
 * Compact calendar widget for the principal:
 *  - Upcoming events list with type badges
 *  - Inline add-event form
 */

import React, { useEffect, useState } from 'react';
import {
    Box,
    HStack,
    VStack,
    Text,
    useTheme,
    Pressable,
    Icon,
    Theme,
    Input,
    InputField,
    ScrollView
} from '@repo/ui';
import { Plus } from 'lucide-react-native';
import { staffManagementAPI, type CalendarEvent } from '@repo/core';

interface InstitutionalCalendarSectionProps {
    schoolId: string;
    principalId: string;
    onAddEvent?: () => void;
}

const TYPE_LABELS: Record<string, string> = {
    term_start: 'Term Start',
    exam: 'Exam',
    holiday: 'Holiday',
    event: 'Event',
    other: 'Other'
};

const TYPE_OPTIONS = ['term_start', 'exam', 'holiday', 'event', 'other'];

export default function InstitutionalCalendarSection({
    schoolId,
    principalId,
    onAddEvent
}: InstitutionalCalendarSectionProps) {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [selectedType, setSelectedType] = useState('event');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const typeBadgeColor = (type: string): string => {
        switch (type) {
            case 'term_start': return theme.accent.action;
            case 'exam': return theme.accent.danger;
            case 'holiday': return theme.accent.sageGreen;
            case 'event': return theme.accent.action;
            default: return theme.text.muted;
        }
    };

    async function fetchEvents() {
        try {
            const data = await staffManagementAPI.getUpcomingCalendarEvents(schoolId, 5);
            setEvents(data);
        } catch (err) {
            console.error('InstitutionalCalendar: fetch error', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setLoading(true);
        fetchEvents();
    }, [schoolId]);

    async function handleSave() {
        if (!title.trim() || !startDate.trim()) return;
        setSaving(true);
        try {
            const ok = await staffManagementAPI.createCalendarEvent(schoolId, principalId, {
                title: title.trim(),
                type: selectedType,
                start_date: startDate.trim(),
                end_date: endDate.trim() || undefined
            });
            if (ok) {
                setTitle('');
                setStartDate('');
                setEndDate('');
                setSelectedType('event');
                setShowForm(false);
                await fetchEvents();
            }
        } catch (err) {
            console.error('InstitutionalCalendar: save error', err);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Box className="bg-phase-surface rounded-2xl border border-phase-border p-md">
            <HStack className="justify-between items-center mb-4">
                <Text className="text-base font-bold text-phaseText-primary">
                    School Calendar
                </Text>
                <Pressable
                    onPress={() => {
                        setShowForm(!showForm);
                        onAddEvent?.();
                    }}
                    className="bg-phase-accent rounded-lg px-2.5 py-1 flex-row items-center gap-1"
                >
                    <Icon as={Plus} size="xs" className="text-white" />
                    <Text className="text-xs font-bold text-white">Add</Text>
                </Pressable>
            </HStack>

            {loading && (
                <VStack className="gap-2">
                    <Box className="h-10 bg-phase-surface border border-phase-border rounded-xl opacity-50" />
                    <Box className="h-10 bg-phase-surface border border-phase-border rounded-xl opacity-30" />
                </VStack>
            )}

            {!loading && events.length === 0 && (
                <Text className="text-sm text-phaseText-secondary text-center py-md">
                    No upcoming events
                </Text>
            )}

            {!loading && events.map((ev) => (
                <HStack
                    key={ev.id}
                    className="items-center gap-3 py-2 border-b border-phase-border"
                >
                    <Box
                        className="rounded-lg px-2 py-0.5"
                        style={{ backgroundColor: typeBadgeColor(ev.type) }}
                    >
                        <Text className="text-[10px] font-bold text-white uppercase">
                            {TYPE_LABELS[ev.type] || ev.type}
                        </Text>
                    </Box>
                    <Text className="flex-1 text-[13px] text-phaseText-primary" numberOfLines={1}>
                        {ev.title}
                    </Text>
                    <Text className="text-[11px] text-phaseText-secondary">
                        {ev.start_date.split('T')[0]}
                    </Text>
                </HStack>
            ))}

            {showForm && (
                <VStack className="mt-4 gap-3">
                    <Input className="border border-phase-border rounded-xl bg-phase-surface h-10">
                        <InputField
                            placeholder="Event title"
                            placeholderTextColor={theme.text.muted}
                            value={title}
                            onChangeText={setTitle}
                            className="text-sm text-phaseText-primary"
                        />
                    </Input>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                        <HStack className="gap-2">
                            {TYPE_OPTIONS.map((t) => (
                                <Pressable key={t} onPress={() => setSelectedType(t)}>
                                    <Box
                                        className="rounded-full px-3 py-1 border"
                                        style={{
                                            backgroundColor: selectedType === t ? typeBadgeColor(t) : 'transparent',
                                            borderColor: selectedType === t ? typeBadgeColor(t) : theme.scene.border
                                        }}
                                    >
                                        <Text
                                            className="text-xs font-semibold"
                                            style={{ color: selectedType === t ? '#FFFFFF' : theme.text.secondary }}
                                        >
                                            {TYPE_LABELS[t]}
                                        </Text>
                                    </Box>
                                </Pressable>
                            ))}
                        </HStack>
                    </ScrollView>

                    <Input className="border border-phase-border rounded-xl bg-phase-surface h-10">
                        <InputField
                            placeholder="Start date (YYYY-MM-DD)"
                            placeholderTextColor={theme.text.muted}
                            value={startDate}
                            onChangeText={setStartDate}
                            className="text-sm text-phaseText-primary"
                        />
                    </Input>
                    <Input className="border border-phase-border rounded-xl bg-phase-surface h-10">
                        <InputField
                            placeholder="End date (YYYY-MM-DD, optional)"
                            placeholderTextColor={theme.text.muted}
                            value={endDate}
                            onChangeText={setEndDate}
                            className="text-sm text-phaseText-primary"
                        />
                    </Input>

                    <Pressable
                        onPress={handleSave}
                        disabled={saving}
                        className={`bg-phase-accent rounded-xl p-3 items-center ${saving ? 'opacity-60' : ''}`}
                    >
                        <Text className="text-sm font-bold text-white">
                            {saving ? 'Saving...' : 'Save Event'}
                        </Text>
                    </Pressable>
                </VStack>
            )}
        </Box>
    );
}
