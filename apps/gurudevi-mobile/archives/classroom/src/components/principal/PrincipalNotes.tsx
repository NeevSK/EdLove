/**
 * PrincipalNotes — School Logbook
 *
 * The principal's personal memory-offload layer, scoped to their school.
 *
 * Topology parallel:
 *   Teacher/Student in a classroom → ClassroomNotes  (classroom_id)
 *   Principal in their school      → PrincipalNotes  (school_id)
 *
 * What makes this distinct from ClassroomNotes:
 *   • Always fully private — no visibility toggle needed
 *   • Todo items can be checked off (is_done=true) — struck through but
 *     never deleted; the record of what was done matters
 *   • Note types: todo, observation, decision, reminder, note
 *   • Optional context tags: which teacher or classroom this note is about
 *   • Undone todos float above done ones; pinned always on top
 */

import type { PrincipalNote } from '@repo/core';
import { api } from '@repo/core/api';

import {
  Box,
  GlobalHeader,
  HStack,
  PositiveInvitation,
  ScreenWrapper,
  Text,
  useLotusToast,
  useThemedColors,
  VStack,
} from '@repo/ui';
import { Theme } from '@repo/ui/theme';

import {
  Bell,
  BookMarked,
  CheckSquare,
  Eye,
  Lightbulb,
  NotebookPen,
  Pin,
  Square,
  StickyNote,
  X,
} from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ── Types ────────────────────────────────────────────────────

interface PrincipalNotesProps {
  schoolId: string;
  onBack: () => void;
}

type NoteGroup = { label: string; data: PrincipalNote[] };

// ── Helpers ──────────────────────────────────────────────────

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
  const pinned = safeNotes.filter((n) => n?.is_pinned && !n.is_done);
  const active = safeNotes.filter((n) => n && !n.is_pinned && !n.is_done);
  const done = safeNotes.filter((n) => n?.is_done);

  const grouped: Record<string, PrincipalNote[]> = {};
  for (const note of active) {
    if (!note) continue;
    const label = getRelativeDateLabel(note.created_at);
    if (!grouped[label]) grouped[label] = [];
    grouped[label]?.push(note);
  }

  const result: NoteGroup[] = [];
  if (pinned.length > 0) result.push({ label: '📌 Pinned', data: pinned });

  // Explicitly handle noUncheckedIndexedAccess: true from base.json
  for (const label of Object.keys(grouped)) {
    const groupData = grouped[label];
    if (groupData) {
      result.push({ label, data: groupData });
    }
  }

  if (done.length > 0) result.push({ label: '✅ Completed', data: done });
  return result;
}

// ── Note type metadata ────────────────────────────────────────

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

// ── Main Component ───────────────────────────────────────────

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
      const data = await api.principalNotes.getAll(schoolId);
      setNotes(data || []);
    } catch (err) {
      console.error('PrincipalNotes: fetch error', err);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const grouped = useMemo(() => groupNotes(notes), [notes]);

  const handleSave = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    try {
      const created = await api.principalNotes.create({
        school_id: schoolId,
        content: draft.trim(),
        note_type: draftType,
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
    // Only todos are check-off-able
    if (note.note_type !== 'todo') return;
    try {
      const updated = await api.principalNotes.update(note.id, { is_done: !note.is_done });
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    } catch {
      showToast({ message: 'Could not update note.', type: 'error' });
    }
  };

  const handleTogglePin = async (note: PrincipalNote) => {
    if (note.is_done) return; // don't pin completed items
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

  // ── Note card ─────────────────────────────────────────────

  const renderNoteCard = ({ item: note }: { item: PrincipalNote }) => {
    const meta = NOTE_TYPE_META[note.note_type];
    const NoteIcon = meta.icon;
    const isTodo = note.note_type === 'todo';
    const createdAt = note.created_at || new Date().toISOString();
    const time = new Date(createdAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <Box
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
          {/* Left: check-off (todos) or type icon */}
          <HStack sx={{ gap: 8, alignItems: 'center', flex: 1 }}>
            {isTodo ? (
              <TouchableOpacity
                onPress={() => handleToggleDone(note)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {note.is_done ? (
                  <CheckSquare size={18} color={colors.textTertiary} />
                ) : (
                  <Square size={18} color={meta.color} />
                )}
              </TouchableOpacity>
            ) : (
              <NoteIcon size={14} color={note.is_done ? colors.textTertiary : meta.color} />
            )}
            <Text
              sx={{
                fontSize: Theme.typography.fontSize.xs,
                fontWeight: '700',
                color: note.is_done ? colors.textTertiary : meta.color,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {meta.label}
            </Text>
          </HStack>

          {/* Right: time + actions */}
          <HStack sx={{ gap: 10, alignItems: 'center' }}>
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

        {/* Content */}
        <Text
          sx={{
            fontSize: Theme.typography.fontSize.sm,
            color: note.is_done ? colors.textTertiary : colors.text,
            marginTop: Theme.spacing.xs,
            lineHeight: 20,
            textDecorationLine: note.is_done ? 'line-through' : 'none',
          }}
        >
          {note.content}
        </Text>

        {/* Context tag */}
        {(note.context_teacher || note.context_classroom) && (
          <HStack sx={{ gap: 6, marginTop: Theme.spacing.xs, alignItems: 'center' }}>
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

  // ── Render ────────────────────────────────────────────────

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
        keyboardVerticalOffset={100}
      >
        <VStack sx={{ flex: 1 }}>
          {loading ? (
            <Box sx={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color={Theme.colors.sanctuarySaffron} />
            </Box>
          ) : grouped.length === 0 ? (
            <Box sx={{ paddingHorizontal: Theme.spacing.lg, paddingTop: Theme.spacing.xl }}>
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
              {/* Type selector */}
              <View style={styles.typeRow}>
                {(
                  Object.entries(NOTE_TYPE_META) as [
                    PrincipalNote['note_type'],
                    (typeof NOTE_TYPE_META)[keyof typeof NOTE_TYPE_META],
                  ][]
                ).map(([type, meta]) => {
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
                      <Icon
                        size={12}
                        color={isActive ? Theme.colors.sacredWhite : colors.textSecondary}
                      />
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

              <HStack
                sx={{
                  justifyContent: 'flex-end',
                  gap: Theme.spacing.sm,
                  marginTop: Theme.spacing.sm,
                }}
              >
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
                        color: draft.trim() ? Theme.colors.sacredWhite : colors.textTertiary,
                      }}
                    >
                      Save
                    </Text>
                  )}
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
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 8 },
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
