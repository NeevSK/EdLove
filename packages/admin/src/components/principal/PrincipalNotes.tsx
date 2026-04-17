/**
 * PrincipalNotes — School Logbook
 *
 * The principal's personal memory-offload layer, scoped to their school.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    View,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
    StyleSheet
} from 'react-native';
import {
    VStack,
    HStack,
    Box,
    Text,
    useThemedColors,
    PositiveInvitation,
    GlobalHeader,
    ScreenWrapper,
    useLotusToast
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
    MoreVertical
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
    const theme = useThemedColors();
    const { showToast } = useLotusToast();
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
            color: theme.status.warning,
            placeholder: 'What needs to happen tomorrow?…'
        },
        observation: {
            label: 'Observation',
            icon: Eye,
            color: theme.status.success,
            placeholder: 'What did you notice in class / with a teacher?…'
        },
        decision: {
            label: 'Decision',
            icon: Lightbulb,
            color: theme.status.info,
            placeholder: 'What did you decide, and why?…'
        },
        reminder: {
            label: 'Reminder',
            icon: Bell,
            color: theme.status.warning,
            placeholder: 'What must you not forget?…'
        },
        note: {
            label: 'Note',
            icon: StickyNote,
            color: theme.status.info,
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
                style={{
                    backgroundColor: note.is_done ? theme.scene.backgroundBody : theme.scene.backgroundPrimary,
                    borderRadius: theme.corners.md,
                    borderLeftWidth: 3,
                    borderLeftColor: note.is_done ? theme.scene.border : meta.color,
                    padding: theme.spacing.md,
                    marginBottom: theme.spacing.sm,
                    opacity: note.is_done ? 0.6 : 1
                }}>
                <HStack style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <HStack style={{ gap: 8, alignItems: 'center', flex: 1 }}>
                        {isTodo ? (
                            <TouchableOpacity
                                onPress={() => handleToggleDone(note)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                {note.is_done
                                    ? <CheckSquare size={18} color={theme.text.secondary} />
                                    : <Square size={18} color={meta.color} />
                                }
                            </TouchableOpacity>
                        ) : (
                            <NoteIcon size={18} color={meta.color} />
                        )}
                        <Text
                            style={{
                                flex: 1,
                                fontSize: 14,
                                color: theme.text.primary,
                                textDecorationLine: note.is_done ? 'line-through' : 'none'
                            }}>
                            {note.content}
                        </Text>
                    </HStack>
                    
                    <HStack style={{ gap: 12 }}>
                        {!note.is_done && (
                            <TouchableOpacity onPress={() => handleTogglePin(note)}>
                                <Pin 
                                    size={16} 
                                    color={note.is_pinned ? theme.status.warning : theme.text.secondary} 
                                    fill={note.is_pinned ? theme.status.warning : 'transparent'} 
                                />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={() => handleDelete(note.id)}>
                            <X size={16} color={theme.text.tertiary} />
                        </TouchableOpacity>
                    </HStack>
                </HStack>
                
                <HStack style={{ marginTop: theme.spacing.xs, justifyContent: 'flex-end' }}>
                    <Text style={{ fontSize: 11, color: theme.text.tertiary }}>
                        {time}
                    </Text>
                </HStack>
            </Box>
        );
    };

    const renderGroup = ({ item: group }: { item: NoteGroup }) => (
        <VStack style={{ marginBottom: theme.spacing.md }}>
            <Text
                style={{
                    fontSize: 10,
                    fontWeight: '700',
                    color: theme.text.secondary,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    marginBottom: theme.spacing.sm,
                    paddingHorizontal: theme.spacing.lg
                }}>
                {group.label}
            </Text>
            <VStack style={{ paddingHorizontal: theme.spacing.lg }}>
                {group.data.map((note) => renderNoteCard({ item: note }))}
            </VStack>
        </VStack>
    );

    return (
        <ScreenWrapper style={{ flex: 1 }} scroll={false}>
            <GlobalHeader
                title="My Logbook"
                subtitle="Principal's private notes"
                showBack
                onBack={onBack}
            />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={100}>
                <VStack style={{ flex: 1 }}>
                    {loading ? (
                        <Box style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <ActivityIndicator color={theme.status.warning} />
                        </Box>
                    ) : grouped.length === 0 ? (
                        <Box style={{ paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.xl }}>
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

                    {composing ? (
                        <Box
                            style={{
                                backgroundColor: theme.scene.backgroundPrimary,
                                borderTopWidth: 1,
                                borderTopColor: theme.scene.border,
                                padding: theme.spacing.md
                            }}>
                            <View style={styles.typeRow}>
                                {(Object.entries(NOTE_TYPE_META) as [PrincipalNote['note_type'], typeof NOTE_TYPE_META[keyof typeof NOTE_TYPE_META]][]).map(([type, meta]) => {
                                    const isActive = draftType === type;
                                    const IconNode = meta.icon;
                                    return (
                                        <TouchableOpacity
                                            key={type}
                                            onPress={() => setDraftType(type)}
                                            style={[
                                                styles.typeChip,
                                                {
                                                    backgroundColor: isActive ? meta.color : theme.scene.backgroundBody,
                                                    borderColor: isActive ? meta.color : theme.scene.border
                                                }
                                            ]}>
                                            <IconNode size={12} color={isActive ? '#FFFFFF' : theme.text.secondary} />
                                            <Text
                                                style={{
                                                    fontSize: 11,
                                                    fontWeight: isActive ? '700' : '400',
                                                    color: isActive ? '#FFFFFF' : theme.text.secondary,
                                                    marginLeft: 4
                                                }}>
                                                {meta.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <TextInput
                                value={draft}
                                onChangeText={setDraft}
                                placeholder={NOTE_TYPE_META[draftType].placeholder}
                                placeholderTextColor={theme.text.tertiary}
                                multiline
                                autoFocus
                                style={[
                                    styles.textInput, {
                                        color: theme.text.primary,
                                        backgroundColor: theme.scene.backgroundBody,
                                        borderColor: theme.scene.border
                                    }
                                ]}
                            />

                            <HStack style={{ justifyContent: 'flex-end', gap: theme.spacing.sm, marginTop: theme.spacing.sm }}>
                                <TouchableOpacity
                                    onPress={() => { setComposing(false); setDraft(''); }}
                                    style={styles.cancelBtn}>
                                    <Text style={{ fontSize: 14, color: theme.text.secondary, fontWeight: '600' }}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleSave}
                                    disabled={!draft.trim() || saving}
                                    style={[
                                        styles.saveBtn, { backgroundColor: draft.trim() ? theme.status.warning : theme.scene.backgroundBody }
                                    ]}>
                                    {saving
                                        ? <ActivityIndicator size="small" color="#FFFFFF" />
                                        : <Text style={{ fontSize: 14, fontWeight: '700', color: draft.trim() ? '#FFFFFF' : theme.text.tertiary }}>Save</Text>
                                    }
                                </TouchableOpacity>
                            </HStack>
                        </Box>
                    ) : (
                        <Box style={{ position: 'absolute', bottom: 24, right: 20 }}>
                            <TouchableOpacity
                                onPress={() => setComposing(true)}
                                style={[styles.fabButton, { backgroundColor: theme.status.warning }]}
                                activeOpacity={0.85}>
                                <NotebookPen size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </Box>
                    )}
                </VStack>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    typeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12
    },
    typeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1
    },
    textInput: {
        minHeight: 120,
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        textAlignVertical: 'top'
    },
    cancelBtn: {
        paddingVertical: 10,
        paddingHorizontal: 16
    },
    saveBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        minWidth: 80,
        alignItems: 'center',
        justifyContent: 'center'
    },
    fabButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84
    }
});
