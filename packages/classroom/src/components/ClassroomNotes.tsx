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

import { api, type ClassroomNote } from '@repo/core/api';
import { coreRuntime } from '@repo/core/logic';

import PositiveInvitation from '@repo/ui/components/PositiveInvitation';
import { useLotusToast } from '@repo/ui/hooks';
import {
  Bell,
  BookOpen,
  ChevronDown,
  Globe,
  Lock,
  Megaphone,
  NotebookPen,
  Pin,
  StickyNote,
  X,
} from '@repo/ui/icons';
import {
  Box,
  FlatList,
  HStack,
  Icon,
  Input,
  InputField,
  KeyboardAvoidingView,
  Pressable,
  Spinner,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';

import type React from 'react';
import { useEffect, useMemo, useReducer } from 'react';
import { useTranslation } from 'react-i18next';

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

function getRelativeDateLabel(dateIn: string | Date): string {
  const now = new Date();
  const date = new Date(dateIn);
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
  const pinned = safeNotes.filter((n) => n?.is_pinned);
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
  { label: string; icon: React.ElementType; color: string; teacherOnly: boolean }
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

// ─── Reducer State Management ────────────────────────────────────────────────

type NotesState = {
  notes: ClassroomNote[];
  loading: boolean;
  composing: boolean;
  draft: string;
  draftType: ClassroomNote['note_type'];
  draftVisibility: ClassroomNote['visibility'];
  saving: boolean;
};

type NotesAction =
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_NOTES'; notes: ClassroomNote[] }
  | { type: 'SET_COMPOSING'; composing: boolean }
  | { type: 'SET_DRAFT'; draft: string }
  | { type: 'SET_DRAFT_TYPE'; draftType: ClassroomNote['note_type'] }
  | { type: 'SET_DRAFT_VISIBILITY'; draftVisibility: ClassroomNote['visibility'] }
  | { type: 'SET_SAVING'; saving: boolean }
  | { type: 'NOTE_CREATED'; note: ClassroomNote }
  | { type: 'NOTE_DELETED'; id: string }
  | { type: 'NOTE_UPDATED'; note: ClassroomNote };

function notesReducer(state: NotesState, action: NotesAction): NotesState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_NOTES':
      return { ...state, notes: action.notes };
    case 'SET_COMPOSING':
      return { ...state, composing: action.composing };
    case 'SET_DRAFT':
      return { ...state, draft: action.draft };
    case 'SET_DRAFT_TYPE':
      return { ...state, draftType: action.draftType };
    case 'SET_DRAFT_VISIBILITY':
      return { ...state, draftVisibility: action.draftVisibility };
    case 'SET_SAVING':
      return { ...state, saving: action.saving };
    case 'NOTE_CREATED':
      return {
        ...state,
        notes: [action.note, ...state.notes],
        draft: '',
        composing: false,
      };
    case 'NOTE_DELETED':
      return {
        ...state,
        notes: state.notes.filter((n) => n.id !== action.id),
      };
    case 'NOTE_UPDATED':
      return {
        ...state,
        notes: state.notes.map((n) => (n.id === action.note.id ? action.note : n)),
      };
    default:
      return state;
  }
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function ClassroomNotes({ classroomId, isTeacher }: ClassroomNotesProps) {
  const { showToast } = useLotusToast();
  const { t } = useTranslation();

  const [state, dispatch] = useReducer(notesReducer, {
    notes: [],
    loading: true,
    composing: false,
    draft: '',
    draftType: isTeacher ? 'note' : 'personal',
    draftVisibility: 'private',
    saving: false,
  });

  useEffect(() => {
    let active = true;
    const loadNotes = async () => {
      try {
        const data = await api['classroomNotes'].getAll(classroomId);
        if (active) {
          dispatch({ type: 'SET_NOTES', notes: data || [] });
        }
      } catch (err) {
        console.error('ClassroomNotes: fetch error', err);
      } finally {
        if (active) {
          dispatch({ type: 'SET_LOADING', loading: false });
        }
      }
    };
    void loadNotes();
    return () => {
      active = false;
    };
  }, [classroomId]);

  const grouped = useMemo(() => groupNotesByDate(state.notes), [state.notes]);

  const handleSave = async () => {
    if (!state.draft.trim()) return;
    dispatch({ type: 'SET_SAVING', saving: true });
    try {
      const created = await api['classroomNotes'].create({
        classroom_id: classroomId,
        content: state.draft.trim(),
        note_type: state.draftType,
        visibility: state.draftVisibility,
      });
      dispatch({ type: 'NOTE_CREATED', note: created });
      hapticLight();
    } catch {
      showToast({
        message: 'Could not save note. Please try again.',
        type: 'error',
      });
    } finally {
      dispatch({ type: 'SET_SAVING', saving: false });
    }
  };

  const handleDelete = async (id: string) => {
    hapticLight();
    try {
      await api['classroomNotes'].delete(id);
      dispatch({ type: 'NOTE_DELETED', id });
      showToast({ message: 'Note deleted.', type: 'success' });
    } catch {
      showToast({ message: 'Could not delete note.', type: 'error' });
    }
  };

  const handleTogglePin = async (note: ClassroomNote) => {
    hapticLight();
    try {
      const updated = await api['classroomNotes'].update(note.id, {
        is_pinned: !note.is_pinned,
      });
      dispatch({ type: 'NOTE_UPDATED', note: updated });
    } catch {
      showToast({ message: 'Could not update note.', type: 'error' });
    }
  };

  const handleToggleVisibility = async (note: ClassroomNote) => {
    hapticLight();
    const next: ClassroomNote['visibility'] = note.visibility === 'private' ? 'class' : 'private';
    try {
      const updated = await api['classroomNotes'].update(note.id, {
        visibility: next,
      });
      dispatch({ type: 'NOTE_UPDATED', note: updated });
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
                  <Pressable
                    onPress={() => {
                      void handleTogglePin(note);
                    }}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={note.is_pinned ? 'Unpin note' : 'Pin note'}
                  >
                    <Icon
                      as={Pin}
                      size={14}
                      className={note.is_pinned ? 'text-sanctuarySaffron' : 'text-typography-400'}
                      fill={note.is_pinned ? '#F6BF8C' : 'transparent'}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      void handleToggleVisibility(note);
                    }}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={isClassVisible ? 'Make private' : 'Share with class'}
                  >
                    {isClassVisible ? (
                      <Icon as={Globe} size={14} className="text-primary-500" />
                    ) : (
                      <Icon as={Lock} size={14} className="text-typography-400" />
                    )}
                  </Pressable>
                </HStack>
              )}
              <Pressable
                onPress={() => {
                  void handleDelete(note.id);
                }}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Delete note"
              >
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

  if (state.loading) {
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
              paddingBottom: state.composing ? 0 : 100,
            }}
            showsVerticalScrollIndicator={false}
          />
        )}

        {state.composing ? (
          <Box className="bg-sanctuary-surface border-t border-sanctuary-border p-4">
            <VStack className="gap-2">
              {isTeacher && (
                <ScrollableTypeSelector
                  types={availableTypes}
                  selected={state.draftType}
                  onSelect={(t) => {
                    hapticLight();
                    dispatch({ type: 'SET_DRAFT_TYPE', draftType: t });
                  }}
                />
              )}

              {isTeacher && (
                <Pressable
                  onPress={() => {
                    hapticLight();
                    dispatch({
                      type: 'SET_DRAFT_VISIBILITY',
                      draftVisibility: state.draftVisibility === 'private' ? 'class' : 'private',
                    });
                  }}
                  className="mt-2 mb-1"
                  accessibilityRole="button"
                  accessibilityLabel="Toggle visibility status"
                >
                  <HStack className="gap-1.5 items-center">
                    {state.draftVisibility === 'class' ? (
                      <Icon as={Globe} size={14} className="text-primary-500" />
                    ) : (
                      <Icon as={Lock} size={14} className="text-typography-400" />
                    )}
                    <Text
                      className={`text-xs ${state.draftVisibility === 'class' ? 'text-primary-500' : 'text-typography-400'}`}
                    >
                      {state.draftVisibility === 'class' ? 'Visible to class' : 'Private to me'}
                    </Text>
                    <Icon as={ChevronDown} size={12} className="text-typography-400" />
                  </HStack>
                </Pressable>
              )}

              <Input className="min-h-[80px] max-h-[160px] rounded-xl border border-sanctuary-border mt-2 bg-sanctuary-surface-secondary">
                <InputField
                  value={state.draft}
                  onChangeText={(val) => dispatch({ type: 'SET_DRAFT', draft: val })}
                  placeholder={
                    state.draftType === 'announcement'
                      ? 'Write an announcement for the class...'
                      : state.draftType === 'lesson_recap'
                        ? 'What did you cover today?...'
                        : state.draftType === 'reminder'
                          ? 'What do you need to remember?...'
                          : state.draftType === 'personal'
                            ? 'Write your study note...'
                            : 'Write your note...'
                  }
                  multiline
                  className="text-typography-900"
                  textAlignVertical="top"
                />
              </Input>

              <HStack className="justify-end gap-2 mt-2">
                <Pressable
                  onPress={() => {
                    hapticLight();
                    dispatch({ type: 'SET_COMPOSING', composing: false });
                    dispatch({ type: 'SET_DRAFT', draft: '' });
                  }}
                  className="px-4 py-2"
                  accessibilityRole="button"
                  accessibilityLabel="Cancel composing note"
                >
                  <Text className="text-sm text-sanctuary-text-tertiary font-semibold">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    void handleSave();
                  }}
                  disabled={!state.draft.trim() || state.saving}
                  className={`px-5 py-2 rounded-xl min-w-[70px] items-center ${
                    state.draft.trim() ? 'bg-sanctuarySaffron' : 'bg-background-100'
                  }`}
                  accessibilityRole="button"
                  accessibilityLabel="Save draft note"
                >
                  {state.saving ? (
                    <Spinner color="white" />
                  ) : (
                    <Text
                      className={`text-sm font-bold ${
                        state.draft.trim() ? 'text-white' : 'text-sanctuary-text-tertiary'
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
                dispatch({ type: 'SET_COMPOSING', composing: true });
              }}
              className="w-13 h-13 rounded-full bg-sanctuarySaffron items-center justify-center shadow-md"
              accessibilityRole="button"
              accessibilityLabel="Compose a new note"
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
        if (!meta) return null;
        const isActive = selected === type;
        const IconComponent = meta.icon;
        return (
          <Pressable
            key={type}
            onPress={() => onSelect(type)}
            className={`flex-row items-center px-2.5 py-1.5 rounded-full border ${
              isActive ? '' : 'bg-sanctuary-surface-secondary border-sanctuary-border'
            }`}
            style={isActive ? { backgroundColor: meta.color, borderColor: meta.color } : {}}
            accessibilityRole="button"
            accessibilityLabel={`Note type: ${meta.label}`}
          >
            <IconComponent size={12} color={isActive ? 'white' : '#667085'} />
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
