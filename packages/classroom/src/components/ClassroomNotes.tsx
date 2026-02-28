/**
 * ClassroomNotes
 *
 * Persistent, date-stamped logbook for a classroom.
 *
 * Teacher sees:
 *   - Their own private notes (padlock indicator)
 *   - Their own class-wide announcements (globe indicator)
 *   - A quick-add button to write a new note
 *
 * Student sees:
 *   - Teacher's class-wide announcements
 *   - Their own personal study notes
 *   - A quick-add button for personal notes
 *
 * Layout:
 *   - Pinned notes always float to the top
 *   - Notes grouped by relative date label (Today, Yesterday, This Week, Earlier)
 *   - Infinite scroll backward in time — old notes are never deleted
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
    StyleSheet,
} from 'react-native';
import {
    VStack,
    HStack,
    Box,
    Text,
    Pressable,
    useThemedColors,
    Theme,
    PositiveInvitation,
    useLotusToast,
} from '@repo/ui';
import {
    NotebookPen,
    Globe,
    Lock,
    Pin,
    Megaphone,
    BookOpen,
    Bell,
    StickyNote,
    X,
    ChevronDown,
    ChevronUp,
} from 'lucide-react-native';
import { api } from '@repo/core';
import type { ClassroomNote } from '@repo/core';

// ── Types ────────────────────────────────────────────────────

interface ClassroomNotesProps {
    classroomId: string;
    isTeacher: boolean;
}

type NoteGroup = {
    label: string;
    data: ClassroomNote[];
};

// ── Helpers ──────────────────────────────────────────────────

function getRelativeDateLabel(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return 'This Week';
    if (diffDays < 30) return 'This Month';
    const months = Math.floor(diffDays / 30);
    if (months === 1) return 'Last Month';
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

function groupNotesByDate(notes: ClassroomNote[]): NoteGroup[] {
    const pinned = notes.filter((n) => n.is_pinned);
    const unpinned = notes.filter((n) => !n.is_pinned);

    const groups: Record<string, ClassroomNote[]> = {};
    for (const note of unpinned) {
        const label = getRelativeDateLabel(note.created_at);
        if (!groups[label]) groups[label] = [];
        groups[label].push(note);
    }

    const result: NoteGroup[] = [];
    if (pinned.length > 0) result.push({ label: '📌 Pinned', data: pinned });
    for (const label of Object.keys(groups)) {
        result.push({ label, data: groups[label] });
    }
    return result;
}

// ── Note type metadata ────────────────────────────────────────

const NOTE_TYPE_META: Record<
    ClassroomNote['note_type'],
    { label: string; icon: any; color: string; teacherOnly: boolean }
> = {
    note: {
        label: 'Note',
        icon: StickyNote,
        color: Theme.colors.sanctuarySaffron,
        teacherOnly: true,
    },
    announcement: {
        label: 'Announcement',
        icon: Megaphone,
        color: Theme.colors.gurudeviViolet,
        teacherOnly: true,
    },
    lesson_recap: {
        label: 'Lesson Recap',
        icon: BookOpen,
        color: Theme.colors.sageGreen,
        teacherOnly: true,
    },
    reminder: {
        label: 'Reminder',
        icon: Bell,
        color: Theme.colors.amberGlow,
        teacherOnly: true,
    },
    personal: {
        label: 'Personal Note',
        icon: StickyNote,
        color: Theme.colors.gurudeviBlue,
        teacherOnly: false,
    },
};

// ── Main Component ───────────────────────────────────────────

export default function ClassroomNotes({ classroomId, isTeacher }: ClassroomNotesProps) {
    const colors = useThemedColors();
    const { showToast } = useLotusToast();
    const [notes, setNotes] = useState<ClassroomNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [composing, setComposing] = useState(false);
    const [draft, setDraft] = useState('');
    const [draftType, setDraftType] = useState<ClassroomNote['note_type']>(
        isTeacher ? 'note' : 'personal'
    );
    const [draftVisibility, setDraftVisibility] = useState<ClassroomNote['visibility']>(
        isTeacher ? 'private' : 'private'
    );
    const [saving, setSaving] = useState(false);

    const fetchNotes = useCallback(async () => {
        try {
            const data = await api.classroomNotes.getAll(classroomId);
            setNotes(data);
        } catch (err) {
            console.error('ClassroomNotes: fetch error', err);
        } finally {
            setLoading(false);
        }
    }, [classroomId]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const grouped = useMemo(() => groupNotesByDate(notes), [notes]);

    const handleSave = async () => {
        if (!draft.trim()) return;
        setSaving(true);
        try {
            const created = await api.classroomNotes.create({
                classroom_id: classroomId,
                content: draft.trim(),
                note_type: draftType,
                visibility: draftVisibility,
            });
            setNotes((prev) => [created, ...prev]);
            setDraft('');
            setComposing(false);
        } catch (err) {
            showToast({ message: 'Could not save note. Please try again.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (id: string) => {
        // Use a simple async confirm pattern — show an inline confirm button rather than Alert
        setNotes((prev) => prev.map((n) => n.id === id ? { ...n, _pendingDelete: true } as any : n));
        setTimeout(async () => {
            try {
                await api.classroomNotes.delete(id);
                setNotes((prev) => prev.filter((n) => n.id !== id));
                showToast({ message: 'Note deleted.', type: 'success' });
            } catch {
                showToast({ message: 'Could not delete note.', type: 'error' });
                setNotes((prev) => prev.map((n) => n.id === id ? { ...n, _pendingDelete: false } as any : n));
            }
        }, 0);
    };

    const handleTogglePin = async (note: ClassroomNote) => {
        try {
            const updated = await api.classroomNotes.update(note.id, {
                is_pinned: !note.is_pinned,
            });
            setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
        } catch {
            showToast({ message: 'Could not update note.', type: 'error' });
        }
    };

    const handleToggleVisibility = async (note: ClassroomNote) => {
        const next: ClassroomNote['visibility'] =
            note.visibility === 'private' ? 'class' : 'private';
        try {
            const updated = await api.classroomNotes.update(note.id, { visibility: next });
            setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
        } catch {
            showToast({ message: 'Could not update note.', type: 'error' });
        }
    };

    // ── Compose sheet available note types ───────────────────

    const availableTypes = useMemo(
        () =>
            (Object.entries(NOTE_TYPE_META) as [ClassroomNote['note_type'], typeof NOTE_TYPE_META[keyof typeof NOTE_TYPE_META]][])
                .filter(([, meta]) => isTeacher || !meta.teacherOnly)
                .map(([type]) => type),
        [isTeacher]
    );

    // ── Render helpers ───────────────────────────────────────

    const renderNoteCard = ({ item: note }: { item: ClassroomNote }) => {
        const meta = NOTE_TYPE_META[note.note_type];
        const NoteIcon = meta.icon;
        const isClassVisible = note.visibility === 'class';
        const time = new Date(note.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });

        return (
            <Box
                sx={{
                    backgroundColor: note.is_pinned ? colors.tertiary : colors.secondary,
                    borderRadius: Theme.corners.comfortable,
                    borderLeftWidth: 3,
                    borderLeftColor: meta.color,
                    padding: Theme.spacing.md,
                    marginBottom: Theme.spacing.sm,
                }}
            >
                <HStack sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    {/* Type badge */}
                    <HStack sx={{ gap: 6, alignItems: 'center', flex: 1 }}>
                        <NoteIcon size={14} color={meta.color} />
                        <Text
                            sx={{
                                fontSize: Theme.typography.fontSize.xs,
                                fontWeight: '700',
                                color: meta.color,
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                            }}
                        >
                            {meta.label}
                        </Text>
                        {isClassVisible && (
                            <Globe size={12} color={colors.textTertiary} />
                        )}
                        {!isClassVisible && (
                            <Lock size={12} color={colors.textTertiary} />
                        )}
                    </HStack>

                    {/* Actions (own notes only) */}
                    <HStack sx={{ gap: 10, alignItems: 'center' }}>
                        <Text sx={{ fontSize: 11, color: colors.textTertiary }}>{time}</Text>
                        {isTeacher && (
                            <>
                                <TouchableOpacity onPress={() => handleTogglePin(note)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                    <Pin
                                        size={14}
                                        color={note.is_pinned ? Theme.colors.sanctuarySaffron : colors.textTertiary}
                                        fill={note.is_pinned ? Theme.colors.sanctuarySaffron : 'transparent'}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleToggleVisibility(note)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                    {isClassVisible
                                        ? <Globe size={14} color={Theme.colors.gurudeviViolet} />
                                        : <Lock size={14} color={colors.textTertiary} />
                                    }
                                </TouchableOpacity>
                            </>
                        )}
                        <TouchableOpacity onPress={() => handleDelete(note.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <X size={14} color={colors.textTertiary} />
                        </TouchableOpacity>
                    </HStack>
                </HStack>

                <Text
                    sx={{
                        fontSize: Theme.typography.fontSize.sm,
                        color: colors.text,
                        marginTop: Theme.spacing.xs,
                        lineHeight: 20,
                    }}
                >
                    {note.content}
                </Text>

                {/* Author line for class-visible notes (shows who wrote it) */}
                {isClassVisible && note.author && (
                    <Text sx={{ fontSize: 11, color: colors.textTertiary, marginTop: 4 }}>
                        — {note.author.full_name}
                    </Text>
                )}
            </Box>
        );
    };

    const renderGroup = ({ item: group }: { item: NoteGroup }) => (
        <VStack sx={{ marginBottom: Theme.spacing.md }}>
            <Text
                sx={{
                    fontSize: Theme.typography.fontSize.xs,
                    fontWeight: '700',
                    color: colors.textTertiary,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    marginBottom: Theme.spacing.sm,
                    paddingHorizontal: Theme.spacing.lg,
                }}
            >
                {group.label}
            </Text>
            <VStack sx={{ paddingHorizontal: Theme.spacing.lg }}>
                {group.data.map((note) => renderNoteCard({ item: note }))}
            </VStack>
        </VStack>
    );

    if (loading) {
        return (
            <Box sx={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 }}>
                <ActivityIndicator color={Theme.colors.sanctuarySaffron} />
            </Box>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={120}
        >
            <VStack sx={{ flex: 1 }}>
                {/* Note list */}
                {grouped.length === 0 ? (
                    <Box sx={{ paddingHorizontal: Theme.spacing.lg, paddingTop: Theme.spacing.xl }}>
                        <PositiveInvitation
                            title="No notes yet"
                            description={
                                isTeacher
                                    ? "Tap the button below to add your first note — recap today's lesson, pin an announcement, or jot a private reminder."
                                    : "Tap the button below to add personal study notes for this class. Teacher announcements will appear here too."
                            }
                        />
                    </Box>
                ) : (
                    <FlatList
                        data={grouped}
                        keyExtractor={(g) => g.label}
                        renderItem={renderGroup}
                        contentContainerStyle={{
                            paddingTop: Theme.spacing.md,
                            paddingBottom: composing ? 0 : 100,
                        }}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {/* Compose sheet */}
                {composing ? (
                    <Box
                        sx={{
                            backgroundColor: colors.secondary,
                            borderTopWidth: 1,
                            borderTopColor: colors.border,
                            padding: Theme.spacing.md,
                        }}
                    >
                        {/* Type selector (teacher only: all types; student: personal only) */}
                        {isTeacher && (
                            <ScrollableTypeSelector
                                types={availableTypes}
                                selected={draftType}
                                onSelect={setDraftType}
                                colors={colors}
                            />
                        )}

                        {/* Visibility toggle (teacher only) */}
                        {isTeacher && (
                            <TouchableOpacity
                                onPress={() =>
                                    setDraftVisibility((v) =>
                                        v === 'private' ? 'class' : 'private'
                                    )
                                }
                                style={styles.visibilityToggle}
                            >
                                <HStack sx={{ gap: 6, alignItems: 'center' }}>
                                    {draftVisibility === 'class' ? (
                                        <Globe size={14} color={Theme.colors.gurudeviViolet} />
                                    ) : (
                                        <Lock size={14} color={colors.textTertiary} />
                                    )}
                                    <Text sx={{ fontSize: 12, color: draftVisibility === 'class' ? Theme.colors.gurudeviViolet : colors.textTertiary }}>
                                        {draftVisibility === 'class' ? 'Visible to class' : 'Private to me'}
                                    </Text>
                                    <ChevronDown size={12} color={colors.textTertiary} />
                                </HStack>
                            </TouchableOpacity>
                        )}

                        {/* Text input */}
                        <TextInput
                            value={draft}
                            onChangeText={setDraft}
                            placeholder={
                                draftType === 'announcement'
                                    ? "Write an announcement for the class…"
                                    : draftType === 'lesson_recap'
                                    ? "What did you cover today?…"
                                    : draftType === 'reminder'
                                    ? "What do you need to remember?…"
                                    : draftType === 'personal'
                                    ? "Write your study note…"
                                    : "Write your note…"
                            }
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

                        {/* Action row */}
                        <HStack sx={{ justifyContent: 'flex-end', gap: Theme.spacing.sm, marginTop: Theme.spacing.sm }}>
                            <TouchableOpacity
                                onPress={() => {
                                    setComposing(false);
                                    setDraft('');
                                }}
                                style={styles.cancelBtn}
                            >
                                <Text sx={{ fontSize: 14, color: colors.textSecondary, fontWeight: '600' }}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSave}
                                disabled={!draft.trim() || saving}
                                style={[
                                    styles.saveBtn,
                                    {
                                        backgroundColor: draft.trim()
                                            ? Theme.colors.sanctuarySaffron
                                            : colors.tertiary,
                                    },
                                ]}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color={Theme.colors.sacredWhite} />
                                ) : (
                                    <Text
                                        sx={{
                                            fontSize: 14,
                                            fontWeight: '700',
                                            color: draft.trim()
                                                ? Theme.colors.sacredWhite
                                                : colors.textTertiary,
                                        }}
                                    >
                                        Save
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </HStack>
                    </Box>
                ) : (
                    /* Floating add button */
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 24,
                            right: 20,
                        }}
                    >
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
    );
}

// ── Scrollable type chip row ─────────────────────────────────

function ScrollableTypeSelector({
    types,
    selected,
    onSelect,
    colors,
}: {
    types: ClassroomNote['note_type'][];
    selected: ClassroomNote['note_type'];
    onSelect: (t: ClassroomNote['note_type']) => void;
    colors: ReturnType<typeof useThemedColors>;
}) {
    return (
        <View style={styles.typeRow}>
            {types.map((type) => {
                const meta = NOTE_TYPE_META[type];
                const isActive = selected === type;
                const Icon = meta.icon;
                return (
                    <TouchableOpacity
                        key={type}
                        onPress={() => onSelect(type)}
                        style={[
                            styles.typeChip,
                            {
                                backgroundColor: isActive ? meta.color : colors.tertiary,
                                borderColor: isActive ? meta.color : colors.border,
                            },
                        ]}
                    >
                        <Icon size={12} color={isActive ? Theme.colors.sacredWhite : colors.textSecondary} />
                        <Text
                            style={{
                                fontSize: 11,
                                fontWeight: isActive ? '700' : '400',
                                color: isActive ? Theme.colors.sacredWhite : colors.textSecondary,
                                marginLeft: 4,
                            }}
                        >
                            {meta.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

// ── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
    textInput: {
        minHeight: 80,
        maxHeight: 160,
        borderRadius: Theme.corners.comfortable,
        borderWidth: 1,
        padding: Theme.spacing.md,
        fontSize: Theme.typography.fontSize.sm,
        marginTop: Theme.spacing.sm,
        textAlignVertical: 'top',
    },
    cancelBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    saveBtn: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: Theme.corners.comfortable,
        minWidth: 70,
        alignItems: 'center',
    },
    fabButton: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
    visibilityToggle: {
        marginTop: Theme.spacing.sm,
        marginBottom: Theme.spacing.xs,
    },
    typeRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: Theme.spacing.xs,
    },
    typeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: Theme.corners.full,
        borderWidth: 1,
    },
});
