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
    Pressable,
    Icon,
    Input,
    InputField,
    ScrollView,
    hapticLight
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
                hapticLight();
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
        <Box className="bg-phase-surface rounded-[32px] border border-phase-border p-6 shadow-sm">
            <HStack className="justify-between items-center mb-6">
                <VStack className="gap-0.5">
                    <Text className="text-[18px] font-black text-phaseText-primary tracking-tight">
                        Institution Calendar
                    </Text>
                    <Text className="text-[11px] font-bold text-phaseText-muted uppercase tracking-wider">Upcoming Cycles</Text>
                </VStack>
                <Pressable
                    onPress={() => {
                        hapticLight();
                        setShowForm(!showForm);
                        onAddEvent?.();
                    }}
                    className={`rounded-2xl px-5 py-2 flex-row items-center gap-2 active:scale-95 transition-all ${showForm ? 'bg-phase-canvas border border-phase-border' : 'bg-phase-interactive'}`}
                >
                    <Icon as={Plus} size="xs" className={showForm ? 'text-phaseText-primary' : 'text-white'} />
                    <Text className={`text-[12px] font-black uppercase tracking-wider ${showForm ? 'text-phaseText-primary' : 'text-white'}`}>
                        {showForm ? 'Hide' : 'Add Event'}
                    </Text>
                </Pressable>
            </HStack>

            {loading && (
                <VStack className="gap-3">
                    <Box className="h-16 bg-phase-canvas border border-phase-border rounded-2xl opacity-50" />
                    <Box className="h-16 bg-phase-canvas border border-phase-border rounded-2xl opacity-30" />
                </VStack>
            )}

            {!loading && events.length === 0 && !showForm && (
                <Box className="bg-phase-canvas rounded-[24px] border border-dashed border-phase-border py-10 items-center">
                    <Text className="text-[14px] font-bold text-phaseText-muted text-center opacity-60">
                        No institutional events scheduled.
                    </Text>
                </Box>
            )}

            {!loading && events.map((ev, index) => (
                <HStack
                    key={ev.id}
                    className={`items-center gap-5 py-5 ${index !== events.length - 1 ? 'border-b border-phase-border/50' : ''}`}
                >
                    <Box className={`rounded-lg px-3 py-1 ${getTypeColorClass(ev.type)}`}>
                        <Text className="text-[10px] font-black text-white uppercase tracking-widest leading-none">
                            {TYPE_LABELS[ev.type] || ev.type}
                        </Text>
                    </Box>
                    <Text className="flex-1 text-[15px] font-bold text-phaseText-primary tracking-tight" numberOfLines={1}>
                        {ev.title}
                    </Text>
                    <Text className="text-[11px] font-black text-phaseText-muted uppercase">
                        {new Date(ev.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                </HStack>
            ))}

            {showForm && (
                <VStack className="mt-8 gap-5 border-t border-phase-border pt-8">
                    <Input className="border border-phase-border rounded-[20px] bg-phase-canvas h-14 shadow-sm px-4">
                        <InputField
                            placeholder="Event Title"
                            placeholderTextColor="rgba(0,0,0,0.3)"
                            value={title}
                            onChangeText={setTitle}
                            className="text-[15px] font-black text-phaseText-primary"
                        />
                    </Input>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <HStack className="gap-2.5">
                            {TYPE_OPTIONS.map((t) => {
                                const isSelected = selectedType === t;
                                return (
                                    <Pressable key={t} onPress={() => { hapticLight(); setSelectedType(t); }}>
                                        <Box
                                            className={`rounded-full px-5 py-2 border transition-all ${isSelected ? `${getTypeColorClass(t)} border-transparent` : 'bg-phase-canvas border-phase-border'}`}
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
                        <Input className="flex-1 border border-phase-border rounded-[20px] bg-phase-canvas h-14 shadow-sm px-4">
                            <InputField
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor="rgba(0,0,0,0.2)"
                                value={startDate}
                                onChangeText={setStartDate}
                                className="text-[14px] font-bold text-phaseText-primary"
                            />
                        </Input>
                        <Input className="flex-1 border border-phase-border rounded-[20px] bg-phase-canvas h-14 shadow-sm px-4">
                            <InputField
                                placeholder="End (Opt)"
                                placeholderTextColor="rgba(0,0,0,0.2)"
                                value={endDate}
                                onChangeText={setEndDate}
                                className="text-[14px] font-bold text-phaseText-primary"
                            />
                        </Input>
                    </HStack>

                    <Pressable
                        onPress={handleSave}
                        disabled={saving}
                        className={`bg-phase-interactive rounded-[20px] py-4 items-center shadow-md active:scale-95 transition-all ${saving ? 'opacity-50' : ''}`}
                    >
                        <Text className="text-[13px] font-black text-white uppercase tracking-[2px]">
                            {saving ? 'Scheduling...' : 'Commit to Calendar'}
                        </Text>
                    </Pressable>
                </VStack>
            )}
        </Box>
    );
}
