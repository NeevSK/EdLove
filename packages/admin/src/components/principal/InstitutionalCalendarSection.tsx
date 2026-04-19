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
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [selectedType, setSelectedType] = useState('event');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const getTypeColorClass = (type: string): string => {
        switch (type) {
            case 'term_start': return 'bg-phase-interactive';
            case 'exam': return 'bg-phase-danger';
            case 'holiday': return 'bg-phase-success';
            case 'event': return 'bg-phase-interactive';
            default: return 'bg-phaseText-muted';
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
        <Box className="bg-phase-surface rounded-3xl border border-phase-border p-5 shadow-sm">
            <HStack className="justify-between items-center mb-5">
                <Text className="text-[17px] font-black text-phaseText-primary">
                    Institution Calendar
                </Text>
                <Pressable
                    onPress={() => {
                        hapticLight();
                        setShowForm(!showForm);
                        onAddEvent?.();
                    }}
                    className={`rounded-xl px-4 py-1.5 flex-row items-center gap-2 active:scale-95 transition-all ${showForm ? 'bg-phase-canvas border border-phase-border' : 'bg-phase-interactive'}`}
                >
                    <Icon as={Plus} size="xs" className={showForm ? 'text-phaseText-primary' : 'text-white'} />
                    <Text className={`text-[12px] font-black uppercase tracking-wider ${showForm ? 'text-phaseText-primary' : 'text-white'}`}>
                        {showForm ? 'Hide' : 'Add'}
                    </Text>
                </Pressable>
            </HStack>

            {loading && (
                <VStack className="gap-3">
                    <Box className="h-12 bg-phase-canvas border border-phase-border rounded-xl opacity-50" />
                    <Box className="h-12 bg-phase-canvas border border-phase-border rounded-xl opacity-30" />
                </VStack>
            )}

            {!loading && events.length === 0 && (
                <Box className="bg-phase-canvas rounded-2xl border border-dashed border-phase-border py-8 items-center">
                    <Text className="text-[13px] font-bold text-phaseText-muted text-center">
                        No upcoming events scheduled
                    </Text>
                </Box>
            )}

            {!loading && events.map((ev, index) => (
                <HStack
                    key={ev.id}
                    className={`items-center gap-4 py-4 ${index !== events.length - 1 ? 'border-b border-phase-border' : ''}`}
                >
                    <Box className={`rounded-lg px-2.5 py-0.5 ${getTypeColorClass(ev.type)}`}>
                        <Text className="text-[9px] font-black text-white uppercase tracking-wider">
                            {TYPE_LABELS[ev.type] || ev.type}
                        </Text>
                    </Box>
                    <Text className="flex-1 text-[13px] font-bold text-phaseText-primary" numberOfLines={1}>
                        {ev.title}
                    </Text>
                    <Text className="text-[11px] font-black text-phaseText-muted">
                        {new Date(ev.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                </HStack>
            ))}

            {showForm && (
                <VStack className="mt-6 gap-4 border-t border-phase-border pt-6">
                    <Input className="border border-phase-border rounded-xl bg-phase-canvas h-12 shadow-sm">
                        <InputField
                            placeholder="Event Title"
                            placeholderTextColor="rgba(0,0,0,0.3)"
                            value={title}
                            onChangeText={setTitle}
                            className="text-[14px] font-bold text-phaseText-primary"
                        />
                    </Input>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                        <HStack className="gap-2">
                            {TYPE_OPTIONS.map((t) => {
                                const isSelected = selectedType === t;
                                return (
                                    <Pressable key={t} onPress={() => { hapticLight(); setSelectedType(t); }}>
                                        <Box
                                            className={`rounded-full px-4 py-1.5 border transition-all ${isSelected ? `${getTypeColorClass(t)} border-transparent` : 'bg-phase-canvas border-phase-border'}`}
                                        >
                                            <Text className={`text-[11px] font-black uppercase tracking-wider ${isSelected ? 'text-white' : 'text-phaseText-secondary'}`}>
                                                {TYPE_LABELS[t]}
                                            </Text>
                                        </Box>
                                    </Pressable>
                                );
                            })}
                        </HStack>
                    </ScrollView>

                    <HStack className="gap-3">
                        <Input className="flex-1 border border-phase-border rounded-xl bg-phase-canvas h-12 shadow-sm">
                            <InputField
                                placeholder="Start Date"
                                placeholderTextColor="rgba(0,0,0,0.3)"
                                value={startDate}
                                onChangeText={setStartDate}
                                className="text-[14px] font-bold text-phaseText-primary"
                            />
                        </Input>
                        <Input className="flex-1 border border-phase-border rounded-xl bg-phase-canvas h-12 shadow-sm">
                            <InputField
                                placeholder="End Date"
                                placeholderTextColor="rgba(0,0,0,0.3)"
                                value={endDate}
                                onChangeText={setEndDate}
                                className="text-[14px] font-bold text-phaseText-primary"
                            />
                        </Input>
                    </HStack>

                    <Pressable
                        onPress={handleSave}
                        disabled={saving}
                        className={`bg-phase-interactive rounded-2xl py-3.5 items-center shadow-sm active:scale-95 transition-all ${saving ? 'opacity-60' : ''}`}
                    >
                        <Text className="text-[13px] font-black text-white uppercase tracking-widest">
                            {saving ? 'Creating Event...' : 'Create Event'}
                        </Text>
                    </Pressable>
                </VStack>
            )}
        </Box>
    );
}
