/**
 * DAILY RHYTHM COMPONENT (WEB)
 * Web-specific implementation for the timetable manager.
 * Standardized to Zero-Legacy: purged corrupted imports and migrated to Sanctuary V3 architecture.
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
    SelectItem
} from '@repo/ui';
import { useTimetable } from '../hooks/useTimetable';
import type { Period } from '../types';
import { Plus, Trash2, Clock, ChevronDown, Calendar, MapPin, Activity } from 'lucide-react-native';

const DAYS = [
    { id: 1, label: 'Mon' },
    { id: 2, label: 'Tue' },
    { id: 3, label: 'Wed' },
    { id: 4, label: 'Thu' },
    { id: 5, label: 'Fri' },
];

const PERIOD_TYPES: Array<{ value: Period['type']; label: string }> = [
    { value: 'subject', label: 'Standard Focus' },
    { value: 'relief',  label: 'Relief / Alternative' },
    { value: 'interval', label: 'Internal Interval' },
];

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
        <VStack className="gap-8">
            {/* Header */}
            <HStack className="items-center justify-between">
                <VStack className="gap-1">
                    <Heading size="md" className="text-sacredWhite font-black tracking-tighter">
                        Daily Rhythm
                    </Heading>
                    <Text className="text-mistGray/40 text-[10px] font-black uppercase tracking-[0.2em]">
                        Sequence Mapping
                    </Text>
                </VStack>
                <Button
                    size="sm"
                    onPress={() => setShowForm(v => !v)}
                    className={`rounded-xl px-4 h-10 transition-all ${showForm ? 'bg-emberRed/10 border border-emberRed/20' : 'bg-sanctuarySaffron shadow-lg shadow-sanctuarySaffron/20'}`}
                >
                    <Icon as={showForm ? Trash2 : Plus} size={14} className={showForm ? 'text-emberRed' : 'text-obsidian'} />
                    <ButtonText className={`ml-2 font-black uppercase tracking-widest text-[10px] ${showForm ? 'text-emberRed' : 'text-obsidian'}`}>
                        {showForm ? 'Cancel' : 'Add Resonance'}
                    </ButtonText>
                </Button>
            </HStack>

            {/* Day selector */}
            <HStack className="gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
                {DAYS.map(d => (
                    <Pressable
                        key={d.id}
                        onPress={() => setActiveDay(d.id)}
                        className={`flex-1 py-3 rounded-xl items-center justify-center transition-all ${
                            activeDay === d.id ? 'bg-sanctuarySaffron' : 'hover:bg-white/5'
                        }`}
                    >
                        <Text className={`text-[10px] font-black uppercase tracking-widest ${activeDay === d.id ? 'text-obsidian' : 'text-mistGray/40'}`}>
                            {d.label}
                        </Text>
                        {d.id === today && (
                            <Box className={`w-1 h-1 rounded-full mt-1 ${activeDay === d.id ? 'bg-obsidian/40' : 'bg-sanctuarySaffron'}`} />
                        )}
                    </Pressable>
                ))}
            </HStack>

            {/* Add period form */}
            {showForm && (
                <VStack className="p-8 bg-shroud rounded-3xl border border-white/10 gap-6 shadow-2xl">
                    <Box className="grid grid-cols-2 gap-6">
                        <VStack className="gap-2">
                            <Text className="text-[10px] font-black text-mistGray/40 uppercase tracking-widest px-1">Identity</Text>
                            <Input className="bg-white/5 border-white/10 h-12 rounded-xl px-3 flex-row items-center">
                                <InputField 
                                    value={form.subject} 
                                    onChangeText={text => setForm(f => ({ ...f, subject: text }))} 
                                    placeholder="Mathematics, etc."
                                    className="text-sacredWhite text-sm font-bold"
                                    placeholderTextColor="#333"
                                />
                            </Input>
                        </VStack>
                        <VStack className="gap-2">
                            <Text className="text-[10px] font-black text-mistGray/40 uppercase tracking-widest px-1">Space</Text>
                            <Input className="bg-white/5 border-white/10 h-12 rounded-xl px-3 flex-row items-center">
                                <InputField 
                                    value={form.class_name} 
                                    onChangeText={text => setForm(f => ({ ...f, class_name: text }))} 
                                    placeholder="Room 101"
                                    className="text-sacredWhite text-sm font-bold"
                                    placeholderTextColor="#333"
                                />
                            </Input>
                        </VStack>
                        <VStack className="gap-2">
                            <Text className="text-[10px] font-black text-mistGray/40 uppercase tracking-widest px-1">Arrival</Text>
                            <Input className="bg-white/5 border-white/10 h-12 rounded-xl px-3 flex-row items-center">
                                <InputField 
                                    value={form.start_time} 
                                    onChangeText={text => setForm(f => ({ ...f, start_time: text }))} 
                                    className="text-sacredWhite text-sm font-bold"
                                />
                                <Icon as={Clock} size={14} className="text-mistGray/20 ml-2" />
                            </Input>
                        </VStack>
                        <VStack className="gap-2">
                            <Text className="text-[10px] font-black text-mistGray/40 uppercase tracking-widest px-1">Departure</Text>
                            <Input className="bg-white/5 border-white/10 h-12 rounded-xl px-3 flex-row items-center">
                                <InputField 
                                    value={form.end_time} 
                                    onChangeText={text => setForm(f => ({ ...f, end_time: text }))} 
                                    className="text-sacredWhite text-sm font-bold"
                                />
                                <Icon as={Clock} size={14} className="text-mistGray/20 ml-2" />
                            </Input>
                        </VStack>
                    </Box>
                    <VStack className="gap-2">
                        <Text className="text-[10px] font-black text-mistGray/40 uppercase tracking-widest px-1">Resonance Type</Text>
                        <Select
                            selectedValue={form.type}
                            onValueChange={(value: string | null) => setForm(f => ({ ...f, type: value as Period['type'] }))}
                        >
                            <SelectTrigger className="bg-white/5 border-white/10 h-12 px-4 rounded-xl flex-row items-center justify-between">
                                <SelectInput placeholder="Select frequency" className="text-sacredWhite text-sm font-bold" />
                                <Icon as={ChevronDown} className="text-mistGray/40" size={16} />
                            </SelectTrigger>
                            <SelectPortal>
                                <SelectBackdrop />
                                <SelectContent className="bg-shroud border-white/10">
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
                        className="bg-sanctuarySaffron shadow-lg shadow-sanctuarySaffron/20 rounded-2xl h-14 active:scale-[0.98]"
                    >
                        <ButtonText className="text-obsidian font-black uppercase tracking-[0.2em] text-sm">
                            {saving ? 'Synchronizing...' : 'Establish Resonance'}
                        </ButtonText>
                    </Button>
                </VStack>
            )}

            {/* Period list */}
            {loading ? (
                <VStack className="gap-3">
                    <Box className="h-20 bg-white/5 rounded-3xl animate-pulse" />
                    <Box className="h-20 bg-white/5 rounded-3xl animate-pulse" />
                </VStack>
            ) : periods.length === 0 ? (
                <Box className="p-16 bg-white/2 rounded-[40px] items-center border border-dashed border-white/5 group hover:border-sanctuarySaffron/20 transition-all">
                    <Icon as={Calendar} size={32} className="text-mistGray/10 group-hover:text-sanctuarySaffron/10 mb-4" />
                    <Text className="text-xs text-mistGray/30 font-bold uppercase tracking-widest italic text-center">
                        No periods scheduled for this day
                    </Text>
                </Box>
            ) : (
                <VStack className="gap-3">
                    {periods.map(p => (
                        <HStack
                            key={p.id}
                            className="items-center p-6 bg-white/5 rounded-3xl border border-white/5 gap-6 group hover:border-white/10 transition-all shadow-sm"
                        >
                            <VStack className="items-center gap-1 w-20 border-r border-white/5 pr-4">
                                <Text className="text-[10px] font-black text-mistGray/40 tracking-tighter">{p.start_time}</Text>
                                <Box className={`w-0.5 h-3 rounded-full ${p.type === 'subject' ? 'bg-sanctuarySaffron' : 'bg-emeraldGreen'}`} />
                                <Text className="text-[10px] font-black text-mistGray/80 tracking-tighter">{p.end_time}</Text>
                            </VStack>
                            
                            <VStack className="flex-1 min-w-0 gap-1">
                                <Text className="text-sacredWhite font-black text-sm tracking-tight truncate">
                                    {p.subject ?? p.activity ?? p.type}
                                </Text>
                                <HStack className="items-center gap-2">
                                    <Icon as={MapPin} size={10} className="text-mistGray/20" />
                                    <Text className="text-[11px] font-medium text-mistGray/40 truncate">{p.class_name ?? 'Fluid Space'}</Text>
                                </HStack>
                            </VStack>

                            <Box className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                                p.type === 'subject' ? 'bg-sanctuarySaffron/10 border-sanctuarySaffron/20 text-sanctuarySaffron' :
                                p.type === 'relief' ? 'bg-emeraldGreen/10 border-emeraldGreen/20 text-emeraldGreen' :
                                'bg-white/10 border-white/20 text-mistGray'
                            }`}>
                                {p.type}
                            </Box>

                            <Pressable
                                onPress={() => handleDelete(p.id)}
                                disabled={deleting === p.id}
                                className={`w-10 h-10 items-center justify-center rounded-xl bg-white/3 hover:bg-emberRed/10 group/btn transition-all ${deleting === p.id ? 'opacity-40' : 'opacity-100'}`}
                            >
                                <Icon as={Trash2} size={16} className="text-mistGray/20 group-hover/btn:text-emberRed" />
                            </Pressable>
                        </HStack>
                    ))}
                </VStack>
            )}
        </VStack>
    );
}

