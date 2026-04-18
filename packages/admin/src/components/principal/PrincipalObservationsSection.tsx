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
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [observations, setObservations] = useState<Observation[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state
    const [content, setContent] = useState('');
    const [obsType, setObsType] = useState('note');

    const obsBadgeColor = (type: string): string => {
        switch (type) {
            case 'walkthrough': return theme.accent.action;
            case 'concern': return theme.accent.danger;
            case 'praise': return theme.accent.sageGreen;
            case 'note': return theme.accent.action;
            default: return theme.text.muted;
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
        <Box className="bg-phase-surface rounded-2xl border border-phase-border p-md">
            <HStack className="justify-between items-center mb-4">
                <Text className="text-base font-bold text-phaseText-primary">
                    Observation Notes
                </Text>
                <Pressable
                    onPress={() => setShowForm(!showForm)}
                    className="bg-phase-accent rounded-lg px-2.5 py-1 flex-row items-center gap-1"
                >
                    <Icon as={Plus} size="xs" className="text-white" />
                    <Text className="text-xs font-bold text-white">New</Text>
                </Pressable>
            </HStack>

            {loading && (
                <VStack className="gap-2">
                    <Box className="h-10 bg-phase-surface border border-phase-border rounded-xl opacity-50" />
                    <Box className="h-10 bg-phase-surface border border-phase-border rounded-xl opacity-30" />
                </VStack>
            )}

            {!loading && observations.length === 0 && (
                <Text className="text-sm text-phaseText-secondary text-center py-md">
                    No observations yet. Start your first classroom walkthrough note.
                </Text>
            )}

            {!loading && observations.map((obs) => (
                <VStack
                    key={obs.id}
                    className="py-2 border-b border-phase-border gap-1"
                >
                    <HStack className="items-center justify-between">
                        <Box
                            className="rounded-lg px-2 py-0.5"
                            style={{ backgroundColor: obsBadgeColor(obs.type) }}
                        >
                            <Text className="text-[10px] font-bold text-white uppercase">
                                {obs.type}
                            </Text>
                        </Box>
                        <Text className="text-[11px] text-phaseText-secondary">
                            {obs.created_at.split('T')[0]}
                        </Text>
                    </HStack>
                    <Text className="text-[13px] text-phaseText-primary" numberOfLines={2}>
                        {obs.content}
                    </Text>
                </VStack>
            ))}

            {showForm && (
                <VStack className="mt-4 gap-3">
                    <Input className="min-h-[72px] bg-phase-surface border-phase-border rounded-xl px-3 py-2">
                        <InputField
                            placeholder="Write your observation..."
                            placeholderTextColor={theme.text.muted}
                            value={content}
                            onChangeText={setContent}
                            multiline
                            className="text-sm text-phaseText-primary"
                        />
                    </Input>

                    <HStack className="gap-2 flex-wrap">
                        {OBS_TYPE_OPTIONS.map((t) => (
                            <Pressable key={t} onPress={() => setObsType(t)}>
                                <Box
                                    className="rounded-full px-3 py-1 border"
                                    style={{
                                        backgroundColor: obsType === t ? obsBadgeColor(t) : 'transparent',
                                        borderColor: obsType === t ? obsBadgeColor(t) : theme.scene.border.base
                                    }}
                                >
                                    <Text
                                        className="text-xs font-semibold capitalize"
                                        style={{ color: obsType === t ? '#FFFFFF' : theme.text.secondary }}
                                    >
                                        {t}
                                    </Text>
                                </Box>
                            </Pressable>
                        ))}
                    </HStack>

                    <Pressable
                        onPress={handleSave}
                        disabled={saving}
                        className={`bg-phase-accent rounded-xl p-3 items-center ${saving ? 'opacity-60' : ''}`}
                    >
                        <Text className="text-sm font-bold text-white">
                            {saving ? 'Saving...' : 'Save Observation'}
                        </Text>
                    </Pressable>
                </VStack>
            )}
        </Box>
    );
}
