/**
 * DailyRhythm.web.tsx
 *
 * Web-specific implementation for the timetable manager.
 * Purged raw HTML/inline-styles in favor of @repo/ui primitives and NativeWind v4.
 */

import React, { useState } from 'react';
import { 
    Box, 
    VStack, 
    HStack, 
    Text, 
    Heading, 
    Button, 
    ButtonText, 
    Icon, 
    Pressable,
    Input,
    InputField,
    Select,
    SelectTrigger,
    SelectInput,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicatorWrapper,
    SelectDragIndicator,
    SelectItem
} from '@repo/ui';
import { useTimetable } from '../hooks/useTimetable';
import type { Period } from '../types';
import { Plus, Trash2, Clock, ChevronDown } from 'lucide-react-native';

const DAYS = [
    { id: 1, label: 'Mon' },
    { id: 2, label: 'Tue' },
    { id: 3, label: 'Wed' },
    { id: 4, label: 'Thu' },
    { id: 5, label: 'Fri' },
];

const PERIOD_TYPES: Array<{ value: Period['type']; label: string }> = [
    { value: 'subject', label: 'Subject' },
    { value: 'relief',  label: 'Relief / Cover' },
    { value: 'interval', label: 'Interval / Break' },
];

const TYPE_CLASSES: Record<Period['type'], string> = {
    subject: 'border-skyBlue text-skyBlue bg-skyBlue/10',
    relief: 'border-emeraldGreen text-emeraldGreen bg-emeraldGreen/10',
    interval: 'border-mistGray text-mistGray bg-mistGray/10'
};

export default function DailyRhythm() {
    const today = new Date().getDay();
    const [activeDay, setActiveDay] = useState(today >= 1 && today <= 5 ? today : 1);
    const { periods, loading, addPeriod, deletePeriod } = useTimetable(activeDay);

    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        subject: '',
        activity: '',
        class_name: '',
        type: 'subject' as Period['type'],
        start_time: '08:00',
        end_time: '09:00'
    });
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    const handleAdd = async () => {
        if (!form.subject.trim() && !form.activity.trim()) return;
        setSaving(true);
        try {
            await addPeriod({
                day_of_week: activeDay,
                period_number: periods.length + 1,
                subject: form.subject || undefined,
                activity: form.activity || undefined,
                class_name: form.class_name || undefined,
                type: form.type,
                start_time: form.start_time,
                end_time: form.end_time
            } as Omit<Period, 'id' | 'user_id'>);
            setForm({ subject: '', activity: '', class_name: '', type: 'subject', start_time: '08:00', end_time: '09:00' });
            setShowForm(false);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        setDeleting(id);
        try { await deletePeriod(id); } finally { setDeleting(null); }
    };

    return (
        <VStack className="gap-lg">
            {/* Header */}
            <HStack className="items-center justify-between">
                <Heading size="sm" className="text-sacredWhite font-bold">
                    Daily Rhythm
                </Heading>
                <Button
                    size="sm"
                    variant="outline"
                    onPress={() => setShowForm(v => !v)}
                    className={`border-dimGray rounded-comfortable ${showForm ? 'bg-skyBlue border-skyBlue' : ''}`}
                >
                    <Icon as={Plus} size={14} className={showForm ? 'text-white' : 'text-mistGray'} />
                    <ButtonText className={`ml-1 ${showForm ? 'text-white' : 'text-mistGray'}`}>
                        {showForm ? 'Cancel' : 'Add Period'}
                    </ButtonText>
                </Button>
            </HStack>

            {/* Day selector */}
            <HStack className="gap-2">
                {DAYS.map(d => (
                    <Pressable
                        key={d.id}
                        onPress={() => setActiveDay(d.id)}
                        className={`flex-1 py-3 rounded-comfortable border-2 items-center justify-center transition-all ${
                            activeDay === d.id ? 'border-skyBlue bg-skyBlue' : 'border-obsidian bg-ink'
                        }`}
                    >
                        <Text className={`text-xs font-bold ${activeDay === d.id ? 'text-white' : 'text-mistGray'}`}>
                            {d.label}
                        </Text>
                        {d.id === today && (
                            <Box className={`w-1 h-1 rounded-full mt-1 ${activeDay === d.id ? 'bg-white/80' : 'bg-skyBlue'}`} />
                        )}
                    </Pressable>
                ))}
            </HStack>

            {/* Add period form */}
            {showForm && (
                <VStack className="p-lg bg-obsidian rounded-xl border border-dimGray gap-4">
                    <Box className="grid grid-cols-2 gap-4">
                        <VStack className="gap-1">
                            <Text className="text-[11px] font-bold text-mistGray ml-1">Subject / Topic</Text>
                            <Input className="bg-ink border-transparent">
                                <InputField 
                                    value={form.subject} 
                                    onChangeText={text => setForm(f => ({ ...f, subject: text }))} 
                                    placeholder="e.g. Mathematics"
                                    className="text-sacredWhite"
                                />
                            </Input>
                        </VStack>
                        <VStack className="gap-1">
                            <Text className="text-[11px] font-bold text-mistGray ml-1">Class</Text>
                            <Input className="bg-ink border-transparent">
                                <InputField 
                                    value={form.class_name} 
                                    onChangeText={text => setForm(f => ({ ...f, class_name: text }))} 
                                    placeholder="e.g. Grade 10A"
                                    className="text-sacredWhite"
                                />
                            </Input>
                        </VStack>
                        <VStack className="gap-1">
                            <Text className="text-[11px] font-bold text-mistGray ml-1">Start</Text>
                            <Input className="bg-ink border-transparent">
                                <InputField 
                                    type="text" 
                                    value={form.start_time} 
                                    onChangeText={text => setForm(f => ({ ...f, start_time: text }))} 
                                    className="text-sacredWhite"
                                />
                            </Input>
                        </VStack>
                        <VStack className="gap-1">
                            <Text className="text-[11px] font-bold text-mistGray ml-1">End</Text>
                            <Input className="bg-ink border-transparent">
                                <InputField 
                                    type="text" 
                                    value={form.end_time} 
                                    onChangeText={text => setForm(f => ({ ...f, end_time: text }))} 
                                    className="text-sacredWhite"
                                />
                            </Input>
                        </VStack>
                    </Box>
                    <VStack className="gap-1">
                        <Text className="text-[11px] font-bold text-mistGray ml-1">Type</Text>
                        <Select
                            selectedValue={form.type}
                            onValueChange={(value) => setForm(f => ({ ...f, type: value as Period['type'] }))}
                        >
                            <SelectTrigger className="bg-ink border-transparent justify-between px-4 py-2 rounded-md">
                                <SelectInput placeholder="Select type" className="text-sacredWhite" />
                                <Icon as={ChevronDown} className="text-mistGray" size={16} />
                            </SelectTrigger>
                            <SelectPortal>
                                <SelectBackdrop />
                                <SelectContent className="bg-obsidian">
                                    <SelectDragIndicatorWrapper>
                                        <SelectDragIndicator />
                                    </SelectDragIndicatorWrapper>
                                    {PERIOD_TYPES.map(t => (
                                        <SelectItem key={t.value} label={t.label} value={t.value} />
                                    ))}
                                </SelectContent>
                            </SelectPortal>
                        </Select>
                    </VStack>
                    <Button
                        onPress={handleAdd}
                        isDisabled={saving || (!form.subject.trim() && !form.activity.trim())}
                        className="bg-skyBlue rounded-comfortable h-12"
                    >
                        <ButtonText className="text-white font-bold">
                            {saving ? 'Saving...' : '+ Add to Schedule'}
                        </ButtonText>
                    </Button>
                </VStack>
            )}

            {/* Period list */}
            {loading ? (
                <VStack className="gap-2">
                    <Box className="h-14 bg-obsidian rounded-xl animate-pulse" />
                    <Box className="h-14 bg-obsidian rounded-xl animate-pulse" />
                </VStack>
            ) : periods.length === 0 ? (
                <Box className="p-xl bg-obsidian rounded-xl items-center border border-dashed border-dimGray">
                    <Text className="text-sm text-mistGray italic">
                        No periods scheduled for this day
                    </Text>
                </Box>
            ) : (
                <VStack className="gap-2">
                    {periods.map(p => (
                        <HStack
                            key={p.id}
                            className="items-center p-md bg-obsidian rounded-xl border-l-4 gap-4"
                            style={{ borderLeftColor: p.type === 'subject' ? '#0EA5E9' : p.type === 'relief' ? '#10B981' : '#6A6358' }}
                        >
                            <HStack className="items-center gap-2 flex-shrink-0">
                                <Icon as={Clock} size={14} className="text-mistGray" />
                                <Text className="text-[11px] font-semibold text-mistGray">
                                    {p.start_time} - {p.end_time}
                                </Text>
                            </HStack>
                            
                            <VStack className="flex-1 min-w-0">
                                <Text className="text-sacredWhite font-bold text-sm truncate">
                                    {p.subject ?? p.activity ?? p.type}
                                </Text>
                                {p.class_name && (
                                    <Text className="text-[11px] text-mistGray truncate">{p.class_name}</Text>
                                )}
                            </VStack>

                            <Box className={`px-2 py-0.5 rounded border ${TYPE_CLASSES[p.type]}`}>
                                <Text className="text-[10px] font-bold uppercase">{p.type}</Text>
                            </Box>

                            <Pressable
                                onPress={() => handleDelete(p.id)}
                                disabled={deleting === p.id}
                                className={`p-2 rounded-md ${deleting === p.id ? 'opacity-40' : 'opacity-100'}`}
                            >
                                <Icon as={Trash2} size={14} className="text-dimGray hover:text-emberRed" />
                            </Pressable>
                        </HStack>
                    ))}
                </VStack>
            )}
        </VStack>
    );
}
