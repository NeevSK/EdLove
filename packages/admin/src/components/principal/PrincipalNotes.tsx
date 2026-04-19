import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    Platform,
    Alert,
} from 'react-native';
import {
    View,
    Text,
    useTheme,
    PositiveInvitation,
    GlobalHeader,
    ScreenWrapper,
    useToast,
    Pressable,
    HStack,
    VStack,
    Box,
    Input,
    InputField,
    Icon,
    FlatList,
    KeyboardAvoidingView,
    ActivityIndicator,
    SanctuaryButton,
} from '@repo/ui';
import {
    NotebookPen,
    CheckSquare,
    Square,
    Pin,
    Lightbulb,
    Eye,
    Bell,
    StickyNote,
    X,
} from 'lucide-react-native';
import { api } from '@repo/core';
import type { PrincipalNote } from '@repo/core';

// -- Types ----------------------------------------------------

interface PrincipalNotesProps {
    schoolId: string;
    onBack: () => void;
}

type NoteGroup = { label: string; data: PrincipalNote[] };

// -- Helpers --------------------------------------------------

function getRelativeDateLabel(dateStr: string | undefined): string {
    if (!dateStr) return 'Unknown Date';
    const now = new Date();
    const date = new Date(dateStr);
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return 'This Week';
    if (diffDays < 30) return 'This Month';
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

function groupNotes(notes: PrincipalNote[]): NoteGroup[] {
    const safeNotes = notes || [];
    const pinned = safeNotes.filter((n) => n && n.is_pinned && !n.is_done);
    const active = safeNotes.filter((n) => n && !n.is_pinned && !n.is_done);
    const done = safeNotes.filter((n) => n && n.is_done);

    const grouped: Record<string, PrincipalNote[]> = {};
    for (const note of active) {
        if (!note) continue;
        const label = getRelativeDateLabel(note.created_at);
        if (!grouped[label]) grouped[label] = [];
        grouped[label].push(note);
    }

    const result: NoteGroup[] = [];
    if (pinned.length > 0) result.push({ label: 'Pinned', data: pinned });

    for (const label of Object.keys(grouped)) {
        const groupData = grouped[label];
        if (groupData) {
            result.push({ label, data: groupData });
        }
    }

    if (done.length > 0) result.push({ label: 'Completed', data: done });
    return result;
}

// -- Main Component -------------------------------------------

export default function PrincipalNotes({ schoolId, onBack }: PrincipalNotesProps) {
    const theme = useTheme();
    const { showToast } = useToast();
    const [notes, setNotes] = useState<PrincipalNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [composing, setComposing] = useState(false);
    const [draft, setDraft] = useState('');
    const [draftType, setDraftType] = useState<PrincipalNote['note_type']>('todo');
    const [saving, setSaving] = useState(false);

    // -- Note type metadata ----------------------------------------

    const NOTE_TYPE_META: Record<PrincipalNote['note_type'], { label: string; icon: any; color: string; placeholder: string }> = {
        todo: {
            label: 'To-Do',
            icon: CheckSquare,
            color: theme.accent.action,
            placeholder: 'What needs to happen tomorrow?…'
        },
        observation: {
            label: 'Observation',
            icon: Eye,
            color: theme.accent.sageGreen,
            placeholder: 'What did you notice in class / with a teacher?…'
        },
        decision: {
            label: 'Decision',
            icon: Lightbulb,
            color: theme.accent.action,
            placeholder: 'What did you decide, and why?…'
        },
        reminder: {
            label: 'Reminder',
            icon: Bell,
            color: theme.accent.action,
            placeholder: 'What must you not forget?…'
        },
        note: {
            label: 'Note',
            icon: StickyNote,
            color: theme.accent.action,
            placeholder: 'Write anything on your mind…'
        }
    };

    const fetchNotes = useCallback(async () => {
        try {
            const data = await api.principalNotes.getAll(schoolId);
            setNotes(data || []);
        } catch (err) {
            console.error('PrincipalNotes: fetch error', err);
        } finally {
            setLoading(false);
        }
    }, [schoolId]);

    useEffect(() => { fetchNotes(); }, [fetchNotes]);

    const grouped = useMemo(() => groupNotes(notes), [notes]);

    const handleSave = async () => {
        if (!draft.trim()) return;
        setSaving(true);
        try {
            const created = await api.principalNotes.create({
                school_id: schoolId,
                content: draft.trim(),
                note_type: draftType
            });
            setNotes((prev) => [created, ...prev]);
            setDraft('');
            setComposing(false);
        } catch {
            showToast({ message: 'Could not save note. Please try again.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleToggleDone = async (note: PrincipalNote) => {
        if (note.note_type !== 'todo') return;
        try {
            const updated = await api.principalNotes.update(note.id, { is_done: !note.is_done });
            setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
        } catch {
            showToast({ message: 'Could not update note.', type: 'error' });
        }
    };

    const handleTogglePin = async (note: PrincipalNote) => {
        if (note.is_done) return;
        try {
            const updated = await api.principalNotes.update(note.id, { is_pinned: !note.is_pinned });
            setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
        } catch {
            showToast({ message: 'Could not update note.', type: 'error' });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.principalNotes.delete(id);
            setNotes((prev) => prev.filter((n) => n.id !== id));
            showToast({ message: 'Note deleted.', type: 'success' });
        } catch {
            showToast({ message: 'Could not delete note.', type: 'error' });
        }
    };

    const renderNoteCard = ({ item: note }: { item: PrincipalNote }) => {
        const meta = NOTE_TYPE_META[note.note_type];
        const NoteIcon = meta.icon;
        const isTodo = note.note_type === 'todo';
        const createdAt = note.created_at || new Date().toISOString();
        const time = new Date(createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        return (
            <Box
                className={`p-md mb-sm rounded-md border-l-4 ${
                    note.is_done ? 'bg-phase-surface/60 opacity-60 border-phase-border' : 'bg-phase-surface border-phase-accent'
                }`}
                style={{
                    borderLeftColor: note.is_done ? undefined : meta.color,
                }}>
                <HStack className="justify-between items-start">
                    <HStack className="items-center flex-1 gap-2">
                        {isTodo ? (
                            <Pressable
                                onPress={() => handleToggleDone(note)}
                                hitSlop={8}>
                                {note.is_done
                                    ? <Icon as={CheckSquare} size="sm" color={theme.text.secondary} />
                                    : <Icon as={Square} size="sm" color={meta.color} />
                                }
                            </Pressable>
                        ) : (
                            <Icon as={NoteIcon} size="sm" color={meta.color} />
                        )}
                        <Text
                            className={`flex-1 text-sm text-phase-text-primary ${
                                note.is_done ? 'line-through' : ''
                            }`}>
                            {note.content}
                        </Text>
                    </HStack>
                    
                    <HStack className="gap-3">
                        {!note.is_done && (
                            <Pressable onPress={() => handleTogglePin(note)}>
                                <Icon 
                                    as={Pin}
                                    size="sm" 
                                    color={note.is_pinned ? theme.accent.action : theme.text.secondary} 
                                    fill={note.is_pinned ? theme.accent.action : 'transparent'} 
                                />
                            </Pressable>
                        )}
                        <Pressable onPress={() => handleDelete(note.id)}>
                            <Icon as={X} size="sm" color={theme.text.muted} />
                        </Pressable>
                    </HStack>
                </HStack>
                
                <HStack className="mt-xs justify-end">
                    <Text className="text-[11px] text-phase-text-muted">
                        {time}
                    </Text>
                </HStack>
            </Box>
        );
    };

    const renderGroup = ({ item: group }: { item: NoteGroup }) => (
        <VStack className="mb-md">
            <Text
                className="text-[10px] font-bold text-phase-text-secondary uppercase tracking-[1px] mb-sm px-lg">
                {group.label}
            </Text>
            <VStack className="px-lg">
                {group.data.map((note) => renderNoteCard({ item: note }))}
            </VStack>
        </VStack>
    );

    return (
        <ScreenWrapper className="flex-1" scroll={false}>
            <GlobalHeader
                title="My Logbook"
                subtitle="Principal's private notes"
                showBack
                onBack={onBack}
            />

            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={100}>
                <VStack className="flex-1">
                    {loading ? (
                        <Box className="flex-1 items-center justify-center">
                            <ActivityIndicator color={theme.accent.action} />
                        </Box>
                    ) : grouped.length === 0 ? (
                        <Box className="px-lg pt-xl">
                            <PositiveInvitation
                                title="Your logbook is empty"
                                description="Tap the button below to capture your first thought — a to-do for tomorrow, a classroom observation, or a decision you just made."
                            />
                        </Box>
                    ) : (
                        <FlatList
                            data={grouped}
                            keyExtractor={(g) => g.label}
                            renderItem={renderGroup}
                            contentContainerStyle={{
                                paddingTop: theme.spacing.md,
                                paddingBottom: composing ? 0 : 100
                            }}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </VStack>
            </KeyboardAvoidingView>

            {composing ? (
                <Box
                    className="bg-phase-surface border-t border-phase-border p-md pb-xl">
                    <HStack className="flex-wrap gap-2 mb-4">
                        {(Object.entries(NOTE_TYPE_META) as [PrincipalNote['note_type'], typeof NOTE_TYPE_META[keyof typeof NOTE_TYPE_META]][]).map(([type, meta]) => {
                            const isActive = draftType === type;
                            const IconNode = meta.icon;
                            return (
                                <Pressable
                                    key={type}
                                    onPress={() => setDraftType(type)}
                                    style={{
                                        backgroundColor: isActive ? meta.color : theme.scene.canvas.bg,
                                        borderColor: isActive ? meta.color : theme.scene.surface.border
                                    }}
                                    className="flex-row items-center px-3 py-1.5 rounded-full border">
                                    <Icon as={IconNode} size="xs" color={isActive ? '#FFFFFF' : theme.text.secondary} />
                                    <Text
                                        className={`text-[11px] ml-1 ${isActive ? 'font-bold text-white' : 'font-normal text-phase-text-secondary'}`}>
                                        {meta.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </HStack>

                    <Input className="min-h-[120px] bg-phase-surface border-phase-border rounded-xl p-3">
                        <InputField
                            value={draft}
                            onChangeText={setDraft}
                            placeholder={NOTE_TYPE_META[draftType].placeholder}
                            placeholderTextColor={theme.text.muted}
                            multiline
                            autoFocus
                            className="text-base text-phase-text-primary"
                        />
                    </Input>

                    <HStack className="justify-end gap-2 mt-sm">
                        <SanctuaryButton
                            action="secondary"
                            onPress={() => { setComposing(false); setDraft(''); }}
                        >
                            <Text>Cancel</Text>
                        </SanctuaryButton>
                        <SanctuaryButton
                            action="primary"
                            onPress={handleSave}
                            isDisabled={!draft.trim() || saving}
                            className="min-w-[100px]"
                        >
                            {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text>Save</Text>}
                        </SanctuaryButton>
                    </HStack>
                </Box>
            ) : (
                <Box className="absolute bottom-6 right-5">
                    <Pressable
                        onPress={() => setComposing(true)}
                        className="w-14 h-14 rounded-full justify-center items-center elevation-4 shadow-sm bg-phase-accent">
                        <Icon as={NotebookPen} size="md" color="#FFFFFF" />
                    </Pressable>
                </Box>
            )}
        </ScreenWrapper>
    );
}

