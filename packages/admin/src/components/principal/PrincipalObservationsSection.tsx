/**
 * PrincipalObservationsSection
 *
 * Compact observation notes widget:
 *  - Last 5 observations with type badge, content, date
 *  - Inline new-observation form
 */

import React, { useEffect, useState } from 'react';
import { TextInput } from 'react-native';
import { Plus } from 'lucide-react-native';
import { supabase } from '@repo/core';
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
    InputField
} from '@repo/ui';

interface Observation {
    id: string;
    type: string;
    content: string;
    created_at: string;
}

interface PrincipalObservationsSectionProps {
    schoolId: string;
    principalId: string;
}

const OBS_TYPE_OPTIONS = ['walkthrough', 'note', 'concern', 'praise'];

export default function PrincipalObservationsSection({
    schoolId,
    principalId
}: PrincipalObservationsSectionProps) {
    const [loading, setLoading] = useState(true);
    const [observations, setObservations] = useState<Observation[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state
    const [content, setContent] = useState('');
    const [obsType, setObsType] = useState('note');

    const getObsColorClass = (type: string): string => {
        switch (type) {
            case 'walkthrough': return 'bg-phase-interactive';
            case 'concern': return 'bg-phase-danger';
            case 'praise': return 'bg-phase-success';
            case 'note': return 'bg-phase-interactive';
            default: return 'bg-phaseText-muted';
        }
    };

    async function fetchObservations() {
        try {
            const { data } = await supabase
                .from('principal_observations')
                .select('*')
                .eq('principal_id', principalId)
                .order('created_at', { ascending: false })
                .limit(5);
            setObservations((data ?? []) as Observation[]);
        } catch (err) {
            console.error('PrincipalObservations: fetch error', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setLoading(true);
        fetchObservations();
    }, [principalId]);

    async function handleSave() {
        if (!content.trim()) return;
        setSaving(true);
        try {
            const { error } = await supabase.from('principal_observations').insert({
                school_id: schoolId,
                principal_id: principalId,
                type: obsType,
                content: content.trim()
            });
            if (!error) {
                hapticLight();
                setContent('');
                setObsType('note');
                setShowForm(false);
                await fetchObservations();
            }
        } catch (err) {
            console.error('PrincipalObservations: save error', err);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Box className="bg-phase-surface rounded-3xl border border-phase-border p-5 shadow-sm">
            <HStack className="justify-between items-center mb-5">
                <Text className="text-[17px] font-black text-phaseText-primary">
                    Observation Notes
                </Text>
                <Pressable
                    onPress={() => { hapticLight(); setShowForm(!showForm); }}
                    className={`rounded-xl px-4 py-1.5 flex-row items-center gap-2 active:scale-95 transition-all ${showForm ? 'bg-phase-canvas border border-phase-border' : 'bg-phase-interactive'}`}
                >
                    <Icon as={Plus} size="xs" className={showForm ? 'text-phaseText-primary' : 'text-white'} />
                    <Text className={`text-[12px] font-black uppercase tracking-wider ${showForm ? 'text-phaseText-primary' : 'text-white'}`}>
                        {showForm ? 'Hide' : 'New'}
                    </Text>
                </Pressable>
            </HStack>

            {loading && (
                <VStack className="gap-3">
                    <Box className="h-12 bg-phase-canvas border border-phase-border rounded-xl opacity-50" />
                    <Box className="h-12 bg-phase-canvas border border-phase-border rounded-xl opacity-30" />
                </VStack>
            )}

            {!loading && observations.length === 0 && (
                <Box className="bg-phase-canvas rounded-2xl border border-dashed border-phase-border py-8 px-5 items-center">
                    <Text className="text-[13px] font-bold text-phaseText-muted text-center leading-relaxed">
                        No observations recorded. Start your first walkthrough note to begin.
                    </Text>
                </Box>
            )}

            {!loading && observations.map((obs, index) => (
                <VStack
                    key={obs.id}
                    className={`py-4 ${index !== observations.length - 1 ? 'border-b border-phase-border' : ''} gap-2.5`}
                >
                    <HStack className="items-center justify-between">
                        <Box className={`rounded-lg px-2 py-0.5 ${getObsColorClass(obs.type)}`}>
                            <Text className="text-[9px] font-black text-white uppercase tracking-wider">
                                {obs.type}
                            </Text>
                        </Box>
                        <Text className="text-[11px] font-black text-phaseText-muted">
                            {new Date(obs.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>
                    </HStack>
                    <Text className="text-[14px] leading-relaxed text-phaseText-primary font-medium" numberOfLines={2}>
                        {obs.content}
                    </Text>
                </VStack>
            ))}

            {showForm && (
                <VStack className="mt-6 gap-4 border-t border-phase-border pt-6">
                    <Input className="min-h-[100px] bg-phase-canvas border border-phase-border rounded-2xl px-4 py-3 shadow-sm">
                        <InputField
                            placeholder="Record your observation notes..."
                            placeholderTextColor="rgba(0,0,0,0.3)"
                            value={content}
                            onChangeText={setContent}
                            multiline
                            className="text-[14px] font-bold text-phaseText-primary"
                        />
                    </Input>

                    <HStack className="gap-2 flex-wrap">
                        {OBS_TYPE_OPTIONS.map((t) => {
                            const isSelected = obsType === t;
                            return (
                                <Pressable key={t} onPress={() => { hapticLight(); setObsType(t); }}>
                                    <Box
                                        className={`rounded-full px-4 py-1.5 border transition-all ${isSelected ? `${getObsColorClass(t)} border-transparent` : 'bg-phase-canvas border-phase-border'}`}
                                    >
                                        <Text className={`text-[11px] font-black uppercase tracking-wider ${isSelected ? 'text-white' : 'text-phaseText-muted'}`}>
                                            {t}
                                        </Text>
                                    </Box>
                                </Pressable>
                            );
                        })}
                    </HStack>

                    <Pressable
                        onPress={handleSave}
                        disabled={saving}
                        className={`bg-phase-interactive rounded-2xl py-3.5 items-center shadow-sm active:scale-95 transition-all ${saving ? 'opacity-60' : ''}`}
                    >
                        <Text className="text-[13px] font-black text-white uppercase tracking-widest">
                            {saving ? 'Recording...' : 'Record Observation'}
                        </Text>
                    </Pressable>
                </VStack>
            )}
        </Box>
    );
}
