/**
 * PrincipalObservationsSection
 *
 * Compact observation notes widget:
 *  - Last 5 observations with type badge, content, date
 *  - Inline new-observation form
 */

import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react-native';
import { supabase } from '@repo/core';
import {
    Box,
    HStack,
    VStack,
    Text,
    Pressable,
    Icon,
    Input,
    InputField,
    hapticLight,
    Heading,
    Spinner
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

    const getObsStyles = (type: string) => {
        switch (type) {
            case 'walkthrough': return { bg: 'bg-phase-interactive', text: 'text-white' };
            case 'concern': return { bg: 'bg-phase-danger', text: 'text-white' };
            case 'praise': return { bg: 'bg-phase-success', text: 'text-white' };
            case 'note': return { bg: 'bg-phase-interactive/20', text: 'text-phase-interactive' };
            default: return { bg: 'bg-phaseText-muted/10', text: 'text-phaseText-muted' };
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
        <Box className="bg-phase-surface rounded-[32px] border border-phase-border p-6 shadow-sm">
            <HStack className="justify-between items-center mb-6">
                <VStack className="gap-0.5">
                    <Heading className="text-[20px] font-black text-phaseText-primary tracking-tight">
                        Observations
                    </Heading>
                    <Text className="text-[11px] font-bold text-phaseText-muted uppercase tracking-[2px]">Institutional Logs</Text>
                </VStack>
                <Pressable
                    onPress={() => { hapticLight(); setShowForm(!showForm); }}
                    className={`rounded-[18px] px-4 py-2.5 flex-row items-center gap-2 active:scale-95 transition-all shadow-sm ${showForm ? 'bg-phase-canvas border border-phase-border' : 'bg-phase-interactive'}`}
                >
                    <Icon as={Plus} size="xs" className={showForm ? 'text-phaseText-primary' : 'text-white'} />
                    <Text className={`text-[11px] font-black uppercase tracking-widest ${showForm ? 'text-phaseText-primary' : 'text-white'}`}>
                        {showForm ? 'Hide' : 'New Entry'}
                    </Text>
                </Pressable>
            </HStack>

            {loading && (
                <Box className="h-[120px] items-center justify-center bg-phase-canvas rounded-[24px] border border-phase-border opacity-50">
                    <Spinner className="text-phase-interactive" />
                </Box>
            )}

            {!loading && observations.length === 0 && !showForm && (
                <Box className="bg-phase-canvas rounded-[24px] border border-dashed border-phase-border py-12 px-6 items-center">
                    <Text className="text-[12px] font-black text-phaseText-muted text-center leading-relaxed uppercase tracking-[2px] opacity-40">
                        Institutional memory current.
                    </Text>
                </Box>
            )}

            {!loading && observations.map((obs, index) => {
                const styles = getObsStyles(obs.type);
                return (
                    <VStack
                        key={obs.id}
                        className={`py-5 ${index !== observations.length - 1 ? 'border-b border-phase-border/50' : ''} gap-3`}
                    >
                        <HStack className="items-center justify-between">
                            <Box className={`rounded-lg px-2.5 py-1 ${styles.bg} border border-transparent`}>
                                <Text className={`text-[9px] font-black uppercase tracking-widest ${styles.text}`}>
                                    {obs.type}
                                </Text>
                            </Box>
                            <Text className="text-[10px] font-black text-phaseText-muted uppercase tracking-widest opacity-60">
                                {new Date(obs.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </Text>
                        </HStack>
                        <Text className="text-[14px] leading-[22px] text-phaseText-primary font-bold opacity-90" numberOfLines={3}>
                            {obs.content}
                        </Text>
                    </VStack>
                );
            })}

            {showForm && (
                <VStack className="mt-4 gap-6 border-t border-phase-border pt-8">
                    <VStack className="gap-1.5">
                        <Text className="text-[11px] font-black text-phaseText-primary uppercase tracking-[2px]">Capture Observation</Text>
                        <Input className="min-h-[140px] bg-phase-canvas border border-phase-border rounded-[24px] p-5 shadow-inner">
                            <InputField
                                placeholder="Record high-level institutional signal..."
                                placeholderTextColor="rgba(0,0,0,0.3)"
                                value={content}
                                onChangeText={setContent}
                                multiline
                                className="text-[15px] font-bold text-phaseText-primary"
                            />
                        </Input>
                    </VStack>

                    <HStack className="gap-2.5 flex-wrap">
                        {OBS_TYPE_OPTIONS.map((t) => {
                            const isSelected = obsType === t;
                            const styles = getObsStyles(t);
                            return (
                                <Pressable key={t} onPress={() => { hapticLight(); setObsType(t); }}>
                                    <Box
                                        className={`rounded-full px-5 py-2.5 border transition-all ${isSelected ? `${styles.bg} border-transparent` : 'bg-phase-canvas border-phase-border'}`}
                                    >
                                        <Text className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-white' : 'text-phaseText-muted'}`}>
                                            {t}
                                        </Text>
                                    </Box>
                                </Pressable>
                            );
                        })}
                    </HStack>

                    <Pressable
                        onPress={() => { hapticLight(); handleSave(); }}
                        disabled={saving || !content.trim()}
                        className={`bg-phase-interactive rounded-[20px] h-16 items-center justify-center shadow-md active:scale-95 transition-all ${saving || !content.trim() ? 'opacity-50' : ''}`}
                    >
                        <HStack className="gap-3 items-center">
                            {saving && <Spinner size="small" color="#FFFFFF" />}
                            <Text className="text-[12px] font-black text-white uppercase tracking-[3px]">
                                {saving ? 'Recording...' : 'Commit to Record'}
                            </Text>
                        </HStack>
                    </Pressable>
                </VStack>
            )}
        </Box>
    );
}
