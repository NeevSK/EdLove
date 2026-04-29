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

import type { ClassroomNote } from '@repo/core';
import { coreRuntime } from '@repo/core';
import { api } from '@repo/core/api';

import {
  Bell,
  BookOpen,
  Box,
  ChevronDown,
  Globe,
  HStack,
  Icon,
  Input,
  InputField,
  Lock,
  Megaphone,
  NotebookPen,
  Pin,
  PositiveInvitation,
  Spinner,
  StickyNote,
  Text,
  useLotusToast,
  VStack,
  X,
} from '@repo/ui';
import { FlatList, KeyboardAvoidingView, Pressable } from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ClassroomNotesProps {
  classroomId: string;
  isTeacher: boolean;
}

type NoteGroup = {
  label: string;
  data: ClassroomNote[];
};

// ─── Helpers ────────────────────────────────────────────────────────────────

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
  const safeNotes = notes || [];
  const pinned = safeNotes.filter((n) => n && n.is_pinned);
  const unpinned = safeNotes.filter((n) => n && !n.is_pinned);

  const groups: Record<string, ClassroomNote[]> = {};
  for (const note of unpinned) {
    if (!note) continue;
    const label = getRelativeDateLabel(note.created_at);
    if (!groups[label]) groups[label] = [];
    groups[label]?.push(note);
  }

  const result: NoteGroup[] = [];
  if (pinned.length > 0) result.push({ label: '📌 Pinned', data: pinned });

  for (const label of Object.keys(groups)) {
    const data = groups[label];
    if (data) {
      result.push({ label, data });
    }
  }
  return result;
}

// ─── Note type metadata ──────────────────────────────────────────────

const NOTE_TYPE_META: Record<
  ClassroomNote['note_type'],
  { label: string; icon: any; color: string; teacherOnly: boolean }
> = {
  note: {
    label: 'Note',
    icon: StickyNote,
    color: '#F6BF8C',
    teacherOnly: true,
  },
  announcement: {
    label: 'Announcement',
    icon: Megaphone,
    color: '#7A5AF8',
    teacherOnly: true,
  },
  lesson_recap: {
    label: 'Lesson Recap',
    icon: BookOpen,
    color: '#32D583',
    teacherOnly: true,
  },
  reminder: {
    label: 'Reminder',
    icon: Bell,
    color: '#FDB022',
    teacherOnly: true,
  },
  personal: {
    label: 'Personal Note',
    icon: StickyNote,
    color: '#2E90FA',
    teacherOnly: false,
  },
};

// ─── Main Component ─────────────────────────────────────────────────────────

export default function ClassroomNotes({ classroomId, isTeacher }: ClassroomNotesProps) {
  const { showToast } = useLotusToast();
  const [notes, setNotes] = useState<ClassroomNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState('');
  const [draftType, setDraftType] = useState<ClassroomNote['note_type']>(
    isTeacher ? 'note' : 'personal',
  );
  const [draftVisibility, setDraftVisibility] = useState<ClassroomNote['visibility']>('private');
  const [saving, setSaving] = useState(false);

  const fetchNotes = useCallback(async () => {
    try {
      const data = await api.classroomNotes.getAll(classroomId);
      setNotes(data || []);
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
      hapticLight();
    } catch (err) {
      showToast({ message: 'Could not save note. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    hapticLight();
    try {
      await api.classroomNotes.delete(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      showToast({ message: 'Note deleted.', type: 'success' });
    } catch {
      showToast({ message: 'Could not delete note.', type: 'error' });
    }
  };

  const handleTogglePin = async (note: ClassroomNote) => {
    hapticLight();
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
    hapticLight();
    const next: ClassroomNote['visibility'] = note.visibility === 'private' ? 'class' : 'private';
    try {
      const updated = await api.classroomNotes.update(note.id, { visibility: next });
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    } catch {
      showToast({ message: 'Could not update note.', type: 'error' });
    }
  };

  const availableTypes = useMemo(
    () =>
      (
        Object.entries(NOTE_TYPE_META) as [
          ClassroomNote['note_type'],
          (typeof NOTE_TYPE_META)[keyof typeof NOTE_TYPE_META],
        ][]
      )
        .filter(([, meta]) => isTeacher || !meta.teacherOnly)
        .map(([type]) => type),
    [isTeacher],
  );

  const renderNoteCard = ({ item: note }: { item: ClassroomNote }) => {
    const meta = NOTE_TYPE_META[note.note_type];
    if (!meta) return null;
    const NoteIcon = meta.icon;
    const isClassVisible = note.visibility === 'class';
    const time = new Date(note.created_at || new Date()).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <Box
        key={note.id}
        className={`mb-2 p-4 rounded-xl border border-sanctuary-border border-l-[3px] ${note.is_pinned ? 'bg-sanctuary-surface-secondary' : 'bg-sanctuary-surface'}`}
        style={{ borderLeftColor: meta.color }}
      >
        <VStack className="gap-1">
          <HStack className="justify-between items-start">
            <HStack className="gap-1.5 items-center flex-1">
              <NoteIcon size={14} color={meta.color} />
              <Text
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: meta.color }}
              >
                {meta.label}
              </Text>
              {isClassVisible && (
                <Icon as={Globe} size={12} className="text-sanctuary-text-tertiary" />
              )}
              {!isClassVisible && (
                <Icon as={Lock} size={12} className="text-sanctuary-text-tertiary" />
              )}
            </HStack>

            <HStack className="gap-2.5 items-center">
              <Text className="text-[11px] text-sanctuary-text-tertiary">{time}</Text>
              {isTeacher && (
                <HStack className="gap-2">
                  <Pressable onPress={() => handleTogglePin(note)} hitSlop={8}>
                    <Icon
                      as={Pin}
                      size={14}
                      className={note.is_pinned ? 'text-sanctuarySaffron' : 'text-typography-400'}
                      fill={note.is_pinned ? '#F6BF8C' : 'transparent'}
                    />
                  </Pressable>
                  <Pressable onPress={() => handleToggleVisibility(note)} hitSlop={8}>
                    {isClassVisible ? (
                      <Icon as={Globe} size={14} className="text-primary-500" />
                    ) : (
                      <Icon as={Lock} size={14} className="text-typography-400" />
                    )}
                  </Pressable>
                </HStack>
              )}
              <Pressable onPress={() => handleDelete(note.id)} hitSlop={8}>
                <Icon as={X} size={14} className="text-typography-400" />
              </Pressable>
            </HStack>
          </HStack>

          <Text className="text-sm text-sanctuary-text leading-5">{note.content}</Text>

          {isClassVisible && note.author && (
            <Text className="text-[11px] text-sanctuary-text-tertiary mt-1">
              — {note.author.full_name}
            </Text>
          )}
        </VStack>
      </Box>
    );
  };

  const renderGroup = ({ item: group }: { item: NoteGroup }) => (
    <VStack className="mb-4">
      <Text className="text-[10px] font-bold text-sanctuary-text-tertiary uppercase tracking-[1px] mb-2 px-6">
        {group.label}
      </Text>
      <VStack className="px-6">{group.data.map((note) => renderNoteCard({ item: note }))}</VStack>
    </VStack>
  );

  if (loading) {
    return (
      <Box className="flex-1 items-center justify-center pt-10">
        <Spinner color="#F6BF8C" />
      </Box>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={coreRuntime.device.getMetadata().platform === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={120}
    >
      <VStack className="flex-1">
        {grouped.length === 0 ? (
          <Box className="px-6 pt-8">
            <PositiveInvitation
              title="No notes yet"
              description={
                isTeacher
                  ? "Tap the button below to add your first note — recap today's lesson, pin an announcement, or jot a private reminder."
                  : 'Tap the button below to add personal study notes for this class. Teacher announcements will appear here too.'
              }
            />
          </Box>
        ) : (
          <FlatList
            data={grouped}
            keyExtractor={(g) => g.label}
            renderItem={renderGroup}
            contentContainerStyle={{
              paddingTop: 16,
              paddingBottom: composing ? 0 : 100,
            }}
            showsVerticalScrollIndicator={false}
          />
        )}

        {composing ? (
          <Box className="bg-sanctuary-surface border-t border-sanctuary-border p-4">
            <VStack className="gap-2">
              {isTeacher && (
                <ScrollableTypeSelector
                  types={availableTypes}
                  selected={draftType}
                  onSelect={(t) => {
                    hapticLight();
                    setDraftType(t);
                  }}
                />
              )}

              {isTeacher && (
                <Pressable
                  onPress={() => {
                    hapticLight();
                    setDraftVisibility((v) => (v === 'private' ? 'class' : 'private'));
                  }}
                  className="mt-2 mb-1"
                >
                  <HStack className="gap-1.5 items-center">
                    {draftVisibility === 'class' ? (
                      <Icon as={Globe} size={14} className="text-primary-500" />
                    ) : (
                      <Icon as={Lock} size={14} className="text-typography-400" />
                    )}
                    <Text
                      className={`text-xs ${draftVisibility === 'class' ? 'text-primary-500' : 'text-typography-400'}`}
                    >
                      {draftVisibility === 'class' ? 'Visible to class' : 'Private to me'}
                    </Text>
                    <Icon as={ChevronDown} size={12} className="text-typography-400" />
                  </HStack>
                </Pressable>
              )}

              <Input className="min-h-[80px] max-h-[160px] rounded-xl border border-sanctuary-border mt-2 bg-sanctuary-surface-secondary">
                <InputField
                  value={draft}
                  onChangeText={setDraft}
                  placeholder={
                    draftType === 'announcement'
                      ? 'Write an announcement for the class...'
                      : draftType === 'lesson_recap'
                        ? 'What did you cover today?...'
                        : draftType === 'reminder'
                          ? 'What do you need to remember?...'
                          : draftType === 'personal'
                            ? 'Write your study note...'
                            : 'Write your note...'
                  }
                  multiline
                  autoFocus
                  className="text-typography-900"
                  textAlignVertical="top"
                />
              </Input>

              <HStack className="justify-end gap-2 mt-2">
                <Pressable
                  onPress={() => {
                    hapticLight();
                    setComposing(false);
                    setDraft('');
                  }}
                  className="px-4 py-2"
                >
                  <Text className="text-sm text-sanctuary-text-tertiary font-semibold">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleSave}
                  disabled={!draft.trim() || saving}
                  className={`px-5 py-2 rounded-xl min-w-[70px] items-center ${
                    draft.trim() ? 'bg-sanctuarySaffron' : 'bg-background-100'
                  }`}
                >
                  {saving ? (
                    <Spinner color="white" />
                  ) : (
                    <Text
                      className={`text-sm font-bold ${
                        draft.trim() ? 'text-white' : 'text-sanctuary-text-tertiary'
                      }`}
                    >
                      Save
                    </Text>
                  )}
                </Pressable>
              </HStack>
            </VStack>
          </Box>
        ) : (
          <Box className="absolute bottom-6 right-5">
            <Pressable
              onPress={() => {
                hapticLight();
                setComposing(true);
              }}
              className="w-13 h-13 rounded-full bg-sanctuarySaffron items-center justify-center shadow-md"
            >
              <Icon as={NotebookPen} size={20} className="text-white" />
            </Pressable>
          </Box>
        )}
      </VStack>
    </KeyboardAvoidingView>
  );
}

function ScrollableTypeSelector({
  types,
  selected,
  onSelect,
}: {
  types: ClassroomNote['note_type'][];
  selected: ClassroomNote['note_type'];
  onSelect: (t: ClassroomNote['note_type']) => void;
}) {
  return (
    <Box className="flex-row gap-2 flex-wrap mb-1">
      {types.map((type) => {
        const meta = NOTE_TYPE_META[type];
        const isActive = selected === type;
        const Icon = meta.icon;
        return (
          <Pressable
            key={type}
            onPress={() => onSelect(type)}
            className={`flex-row items-center px-2.5 py-1.5 rounded-full border ${
              isActive ? '' : 'bg-sanctuary-surface-secondary border-sanctuary-border'
            }`}
            style={isActive ? { backgroundColor: meta.color, borderColor: meta.color } : {}}
          >
            <Icon size={12} color={isActive ? 'white' : '#667085'} />
            <Text
              className={`text-[11px] ml-1 ${
                isActive ? 'text-white font-bold' : 'text-sanctuary-text-tertiary'
              }`}
            >
              {meta.label}
            </Text>
          </Pressable>
        );
      })}
    </Box>
  );
}
