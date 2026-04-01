import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import {
    VStack,
    HStack,
    Box,
    Text,
    useThemedColors,
    Theme,
    PositiveInvitation,
    GlobalHeader,
    ScreenWrapper,
    useLotusToast,
} from '@repo/ui';
import {
    NotebookPen,
    CheckSquare,
    Square,
    Pin,
    Lightbulb,
    Eye,
    BookMarked,
    Bell,
    StickyNote,
    X,
} from 'lucide-react-native';
import { notesAPI, type PrincipalNote } from '../../notes';

// —————————————————————————————————————————————————————————————————————————————
// TYPES
// —————————————————————————————————————————————————————————————————————————————

interface PrincipalNotesProps {
    schoolId: string;
    onBack: () => void;
}

type NoteGroup = { label: string; data: PrincipalNote[] };

// —————————————————————————————————————————————————————————————————————————————
// HELPERS
// —————————————————————————————————————————————————————————————————————————————

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
        grouped[label]?.push(note);
    }

    const result: NoteGroup[] = [];
    if (pinned.length > 0) result.push({ label: '📌 Pinned', data: pinned });

    for (const label of Object.keys(grouped)) {
        const groupData = grouped[label];
        if (groupData) {
            result.push({ label, data: groupData });
        }
    }

    if (done.length > 0) result.push({ label: '✅ Completed', data: done });
    return result;
}

const NOTE_TYPE_META: Record<
    PrincipalNote['note_type'],
    { label: string; icon: any; color: string; placeholder: string }
> = {
    todo: {
        label: 'To-Do',
        icon: CheckSquare,
        color: Theme.colors.sanctuarySaffron,
        placeholder: 'What needs to happen tomorrow?…',
    },
    observation: {
        label: 'Observation',
        icon: Eye,
        color: Theme.colors.sageGreen,
        placeholder: 'What did you notice in class / with a teacher?…',
    },
    decision: {
        label: 'Decision',
        icon: Lightbulb,
        color: Theme.colors.gurudeviViolet,
        placeholder: 'What did you decide, and why?…',
    },
    reminder: {
        label: 'Reminder',
        icon: Bell,
        color: Theme.colors.amberGlow,
        placeholder: 'What must you not forget?…',
    },
    note: {
        label: 'Note',
        icon: StickyNote,
        color: Theme.colors.gurudeviBlue,
        placeholder: 'Write anything on your mind…',
    },
};

// —————————————————————————————————————————————————————————————————————————————
// MAIN COMPONENT
// —————————————————————————————————————————————————————————————————————————————

export default function PrincipalNotes({ schoolId, onBack }: PrincipalNotesProps) {
    const colors = useThemedColors();
    const { showToast } = useLotusToast();
    const [notes, setNotes] = useState<PrincipalNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [composing, setComposing] = useState(false);
    const [draft, setDraft] = useState('');
    const [draftType, setDraftType] = useState<PrincipalNote['note_type']>('todo');
    const [saving, setSaving] = useState(false);

    const fetchNotes = useCallback(async () => {
        try {
            const data = await notesAPI.listBySchool(schoolId);
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
            const created = await notesAPI.create({
                school_id: schoolId,
                content: draft.trim(),
                note_type: draftType,
            });
            setNotes((prev) => [created, ...prev]);
            setDraft('');
            setComposing(false);
        } catch {
            showToast({ message: 'Could not save note.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleToggleDone = async (note: PrincipalNote) => {
        if (note.note_type !== 'todo') return;
        try {
            const updated = await notesAPI.update(note.id, { is_done: !note.is_done });
            setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
        } catch {
            showToast({ message: 'Could not update note.', type: 'error' });
        }
    };

    const handleTogglePin = async (note: PrincipalNote) => {
        if (note.is_done) return;
        try {
            const updated = await notesAPI.update(note.id, { is_pinned: !note.is_pinned });
            setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
        } catch {
            showToast({ message: 'Could not update note.', type: 'error' });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await notesAPI.remove(id);
            setNotes((prev) => prev.filter((n) => n.id !== id));
            showToast({ message: 'Note deleted.', type: 'success' });
        } catch {
            showToast({ message: 'Could not delete note.', type: 'error' });
        }
    };

    const renderNoteCard = (note: PrincipalNote) => {
        const meta = NOTE_TYPE_META[note.note_type];
        const NoteIcon = meta.icon;
        const isTodo = note.note_type === 'todo';
        const time = new Date(note.created_at || Date.now()).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });

        return (
            <Box
                key={note.id}
                sx={{
                    backgroundColor: note.is_done ? colors.tertiary : colors.secondary,
                    borderRadius: Theme.corners.comfortable,
                    borderLeftWidth: 3,
                    borderLeftColor: note.is_done ? colors.border : meta.color,
                    padding: Theme.spacing.md,
                    marginBottom: Theme.spacing.sm,
                    opacity: note.is_done ? 0.6 : 1,
                }}
            >
                <HStack sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <HStack space="xs" sx={{ alignItems: 'center', flex: 1 }}>
                        {isTodo ? (
                            <TouchableOpacity
                                onPress={() => handleToggleDone(note)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                {note.is_done
                                    ? <CheckSquare size={18} color={colors.textTertiary} />
                                    : <Square size={18} color={meta.color} />
                                }
                            </TouchableOpacity>
                        ) : (
                            <NoteIcon size={14} color={note.is_done ? colors.textTertiary : meta.color} />
                        )}
                        <Text sx={{
                            fontSize: 10,
                            fontWeight: '700',
                            color: note.is_done ? colors.textTertiary : meta.color,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                        }}>
                            {meta.label}
                        </Text>
                    </HStack>

                    <HStack space="md" sx={{ alignItems: 'center' }}>
                        <Text sx={{ fontSize: 11, color: colors.textTertiary }}>{time}</Text>
                        {!note.is_done && (
                            <TouchableOpacity
                                onPress={() => handleTogglePin(note)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Pin
                                    size={14}
                                    color={note.is_pinned ? Theme.colors.sanctuarySaffron : colors.textTertiary}
                                    fill={note.is_pinned ? Theme.colors.sanctuarySaffron : 'transparent'}
                                />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={() => handleDelete(note.id)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <X size={14} color={colors.textTertiary} />
                        </TouchableOpacity>
                    </HStack>
                </HStack>

                <Text sx={{
                    fontSize: 14,
                    color: note.is_done ? colors.textTertiary : colors.text,
                    marginTop: Theme.spacing.xs,
                    lineHeight: 20,
                    textDecorationLine: note.is_done ? 'line-through' : 'none',
                }}>
                    {note.content}
                </Text>

                {(note.context_teacher || note.context_classroom) && (
                    <HStack space="xs" sx={{ marginTop: Theme.spacing.xs, alignItems: 'center' }}>
                        <BookMarked size={11} color={colors.textTertiary} />
                        <Text sx={{ fontSize: 11, color: colors.textTertiary }}>
                            {note.context_teacher?.full_name || (note.context_classroom as any)?.name}
                        </Text>
                    </HStack>
                )}
            </Box>
        );
    };

    const renderGroup = ({ item: group }: { item: NoteGroup }) => (
        <VStack sx={{ marginBottom: Theme.spacing.md }}>
            <Text sx={{
                fontSize: 10,
                fontWeight: '700',
                color: colors.textTertiary,
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: Theme.spacing.sm,
                paddingHorizontal: Theme.spacing.lg,
            }}>
                {group.label}
            </Text>
            <VStack sx={{ paddingHorizontal: Theme.spacing.lg }}>
                {group.data.map((note) => renderNoteCard(note))}
            </VStack>
        </VStack>
    );

    return (
        <ScreenWrapper scroll={false}>
            <GlobalHeader
                title="My Logbook"
                subtitle="Principal's private notes"
                showBack
                onBack={onBack}
            />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <VStack sx={{ flex: 1 }}>
                    {loading ? (
                        <Box sx={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <ActivityIndicator color={Theme.colors.sanctuarySaffron} />
                        </Box>
                    ) : grouped.length === 0 && !composing ? (
                        <Box sx={{ paddingHorizontal: Theme.spacing.lg, paddingTop: Theme.spacing.xl }}>
                            <PositiveInvitation
                                title="Your logbook is empty"
                                description="Tap the button below to capture your first thought — a to-do, an observation, or a decision."
                            />
                        </Box>
                    ) : (
                        <FlatList
                            data={grouped}
                            keyExtractor={(g) => g.label}
                            renderItem={renderGroup}
                            contentContainerStyle={{
                                paddingTop: Theme.spacing.md,
                                paddingBottom: composing ? 20 : 100,
                            }}
                            showsVerticalScrollIndicator={false}
                        />
                    )}

                    {/* Compose sheet */}
                    {composing ? (
                        <Box sx={{
                            backgroundColor: colors.secondary,
                            borderTopWidth: 1,
                            borderTopColor: colors.border,
                            padding: Theme.spacing.md,
                            paddingBottom: Platform.OS === 'ios' ? Theme.spacing.xl : Theme.spacing.md,
                        }}>
                            <View style={styles.typeRow}>
                                {(Object.entries(NOTE_TYPE_META) as [PrincipalNote['note_type'], typeof NOTE_TYPE_META[keyof typeof NOTE_TYPE_META]][]).map(([type, meta]) => {
                                    const isActive = draftType === type;
                                    const Icon = meta.icon;
                                    return (
                                        <TouchableOpacity
                                            key={type}
                                            onPress={() => setDraftType(type)}
                                            style={[
                                                styles.typeChip,
                                                {
                                                    backgroundColor: isActive ? meta.color : colors.tertiary,
                                                    borderColor: isActive ? meta.color : colors.border,
                                                },
                                            ]}
                                        >
                                            <Icon size={12} color={isActive ? Theme.colors.sacredWhite : colors.textSecondary} />
                                            <Text style={{
                                                fontSize: 11,
                                                fontWeight: isActive ? '700' : '400',
                                                color: isActive ? Theme.colors.sacredWhite : colors.textSecondary,
                                                marginLeft: 4,
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
                                placeholderTextColor={colors.textTertiary}
                                multiline
                                autoFocus
                                style={[
                                    styles.textInput,
                                    {
                                        color: colors.text,
                                        backgroundColor: colors.tertiary,
                                        borderColor: colors.border,
                                    },
                                ]}
                            />

                            <HStack sx={{ justifyContent: 'flex-end', gap: Theme.spacing.sm, marginTop: Theme.spacing.sm }}>
                                <TouchableOpacity onPress={() => { setComposing(false); setDraft(''); }} style={styles.cancelBtn}>
                                    <Text sx={{ fontSize: 14, color: colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleSave}
                                    disabled={!draft.trim() || saving}
                                    style={[
                                        styles.saveBtn,
                                        { backgroundColor: draft.trim() ? Theme.colors.sanctuarySaffron : colors.tertiary },
                                    ]}
                                >
                                    {saving
                                        ? <ActivityIndicator size="small" color={Theme.colors.sacredWhite} />
                                        : <Text sx={{ fontSize: 14, fontWeight: '700', color: draft.trim() ? Theme.colors.sacredWhite : colors.textTertiary }}>Save</Text>
                                    }
                                </TouchableOpacity>
                            </HStack>
                        </Box>
                    ) : (
                        <Box sx={{ position: 'absolute', bottom: 24, right: 20 }}>
                            <TouchableOpacity
                                onPress={() => setComposing(true)}
                                style={[styles.fabButton, { backgroundColor: Theme.colors.sanctuarySaffron }]}
                                activeOpacity={0.85}
                            >
                                <NotebookPen size={20} color={Theme.colors.sacredWhite} />
                            </TouchableOpacity>
                        </Box>
                    )}
                </VStack>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    textInput: {
        minHeight: 100,
        maxHeight: 200,
        borderRadius: Theme.corners.comfortable,
        borderWidth: 1,
        padding: Theme.spacing.md,
        fontSize: 14,
        marginTop: Theme.spacing.sm,
        textAlignVertical: 'top',
    },
    cancelBtn: { paddingHorizontal: 16, paddingVertical: 8 },
    saveBtn: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: Theme.corners.comfortable,
        minWidth: 80,
        alignItems: 'center',
    },
    fabButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    typeRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    typeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
});
