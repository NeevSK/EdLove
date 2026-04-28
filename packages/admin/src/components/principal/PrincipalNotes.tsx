import type { PrincipalNote } from '@repo/core';
import { api, coreRuntime } from '@repo/core';
import {
  ActivityIndicator,
  Box,
  FlatList,
  GlobalHeader,
  HStack,
  hapticLight,
  Icon,
  Input,
  InputField,
  KeyboardAvoidingView,
  PositiveInvitation,
  Pressable,
  SanctuaryButton,
  ScreenWrapper,
  Text,
  useToast,
  VStack,
} from '@repo/ui';
import {
  Bell,
  CheckSquare,
  ChevronDown,
  Eye,
  Lightbulb,
  NotebookPen,
  Pin,
  StickyNote,
  X,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useReducer } from 'react';

// -- Types ----------------------------------------------------

interface PrincipalNotesProps {
  schoolId: string;
  onBack: () => void;
}

type NoteGroup = { label: string; data: PrincipalNote[] };

type NoteRow =
  | { type: 'HEADER'; label: string; id: string }
  | { type: 'NOTE'; note: PrincipalNote; id: string };

type State = {
  notes: PrincipalNote[];
  isLoading: boolean;
  isComposing: boolean;
  draft: string;
  draftType: PrincipalNote['note_type'];
  isSaving: boolean;
};

type Action =
  | { type: 'SET_NOTES'; notes: PrincipalNote[] }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'START_COMPOSING'; defaultType?: PrincipalNote['note_type'] }
  | { type: 'STOP_COMPOSING' }
  | { type: 'UPDATE_DRAFT'; draft: string }
  | { type: 'SET_DRAFT_TYPE'; draftType: PrincipalNote['note_type'] }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS'; note: PrincipalNote }
  | { type: 'SAVE_FAILURE' }
  | { type: 'UPDATE_NOTE'; note: PrincipalNote }
  | { type: 'DELETE_NOTE'; id: string };

const notesReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_NOTES':
      return { ...state, notes: action.notes, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    case 'START_COMPOSING':
      return { ...state, isComposing: true, draftType: action.defaultType || state.draftType };
    case 'STOP_COMPOSING':
      return { ...state, isComposing: false, draft: '' };
    case 'UPDATE_DRAFT':
      return { ...state, draft: action.draft };
    case 'SET_DRAFT_TYPE':
      return { ...state, draftType: action.draftType };
    case 'SAVE_START':
      return { ...state, isSaving: true };
    case 'SAVE_SUCCESS':
      return {
        ...state,
        isSaving: false,
        isComposing: false,
        draft: '',
        notes: [action.note, ...state.notes],
      };
    case 'SAVE_FAILURE':
      return { ...state, isSaving: false };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map((n) => (n.id === action.note.id ? action.note : n)),
      };
    case 'DELETE_NOTE':
      return { ...state, notes: state.notes.filter((n) => n.id !== action.id) };
    default:
      return state;
  }
};

// -- Note type metadata ----------------------------------------

const NOTE_TYPE_META: Record<
  PrincipalNote['note_type'],
  { label: string; icon: any; color: string; bg: string; placeholder: string }
> = {
  todo: {
    label: 'To-Do',
    icon: CheckSquare,
    color: 'text-phase-interactive',
    bg: 'bg-phase-interactive/10',
    placeholder: 'What needs to happen?…',
  },
  observation: {
    label: 'Observation',
    icon: Eye,
    color: 'text-phase-success',
    bg: 'bg-phase-success/10',
    placeholder: 'What did you notice in class?…',
  },
  decision: {
    label: 'Decision',
    icon: Lightbulb,
    color: 'text-phase-warning',
    bg: 'bg-phase-warning/10',
    placeholder: 'What did you decide?…',
  },
  reminder: {
    label: 'Reminder',
    icon: Bell,
    color: 'text-phase-interactive',
    bg: 'bg-phase-interactive/10',
    placeholder: 'What must you not forget?…',
  },
  note: {
    label: 'Note',
    icon: StickyNote,
    color: 'text-phaseText-secondary',
    bg: 'bg-phase-canvas',
    placeholder: 'Write anything on your mind…',
  },
};

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
  const { showToast } = useToast();
  const [state, dispatch] = useReducer(notesReducer, {
    notes: [],
    isLoading: true,
    isComposing: false,
    draft: '',
    draftType: 'todo',
    isSaving: false,
  });

  const isIos = coreRuntime.device.getMetadata().platform === 'ios';

  // -- Sub-Components -------------------------------------------

  const NoteCard = React.memo(
    ({
      note,
      onToggleDone,
      onTogglePin,
      onDelete,
    }: {
      note: PrincipalNote;
      onToggleDone: (note: PrincipalNote) => void;
      onTogglePin: (note: PrincipalNote) => void;
      onDelete: (id: string) => void;
    }) => {
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
          className={`p-6 mb-4 rounded-[24px] border-l-4 shadow-sm ${
            note.is_done
              ? 'bg-phase-surface/60 opacity-60 border-phase-border'
              : `bg-phase-surface border-phase-interactive`
          }`}
        >
          <HStack className="justify-between items-start gap-4">
            <HStack className="items-center flex-1 gap-4">
              {isTodo ? (
                <Pressable
                  onPress={() => onToggleDone(note)}
                  className={`w-7 h-7 rounded-lg border-2 items-center justify-center ${note.is_done ? 'bg-phase-interactive border-phase-interactive' : 'border-phase-interactive/40'}`}
                  hitSlop={12}
                  accessibilityLabel={`Mark "${note.content}" as ${note.is_done ? 'incomplete' : 'complete'}`}
                  accessibilityHint="Toggles the completion status of this item"
                >
                  {note.is_done && <Icon as={CheckSquare} size="xs" className="text-white" />}
                </Pressable>
              ) : (
                <Box className={`w-7 h-7 rounded-lg items-center justify-center ${meta.bg}`}>
                  <Icon as={NoteIcon} size="xs" className={meta.color} />
                </Box>
              )}
              <Text
                className={`flex-1 text-[16px] font-bold text-phaseText-primary tracking-tight leading-[22px] ${
                  note.is_done ? 'line-through opacity-50' : ''
                }`}
              >
                {note.content}
              </Text>
            </HStack>

            <HStack className="gap-5 items-center">
              {!note.is_done && (
                <Pressable
                  onPress={() => onTogglePin(note)}
                  accessibilityLabel={note.is_pinned ? 'Unpin item' : 'Pin item'}
                  accessibilityHint="Keeps this item at the top of the log"
                >
                  <Icon
                    as={Pin}
                    size="xs"
                    className={
                      note.is_pinned ? 'text-phase-interactive' : 'text-phaseText-muted/30'
                    }
                    fill={note.is_pinned ? 'currentColor' : 'transparent'}
                  />
                </Pressable>
              )}
              <Pressable
                onPress={() => onDelete(note.id)}
                accessibilityLabel="Delete item"
                accessibilityHint="Permanently removes this entry from the log"
              >
                <Icon as={X} size="xs" className="text-phaseText-muted/40" />
              </Pressable>
            </HStack>
          </HStack>

          <HStack className="mt-3 justify-end items-center gap-1.5">
            <Box className="w-1.5 h-1.5 rounded-full bg-phaseText-muted/20" />
            <Text className="text-[10px] font-black text-phaseText-muted uppercase tracking-widest opacity-60">
              {time}
            </Text>
          </HStack>
        </Box>
      );
    },
  );

  const fetchNotes = useCallback(async () => {
    try {
      const data = await api.principalNotes.getAll(schoolId);
      dispatch({ type: 'SET_NOTES', notes: data ?? [] });
    } catch (err) {
      console.error('PrincipalNotes: fetch error', err);
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  }, [schoolId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const rows = useMemo(() => {
    const groups = groupNotes(state.notes);
    const result: NoteRow[] = [];
    for (const g of groups) {
      result.push({ type: 'HEADER', label: g.label, id: `header-${g.label}` });
      for (const n of g.data) {
        result.push({ type: 'NOTE', note: n, id: n.id });
      }
    }
    return result;
  }, [state.notes]);

  const handleSave = async () => {
    if (!state.draft.trim()) return;
    dispatch({ type: 'SAVE_START' });
    try {
      const created = await api.principalNotes.create({
        school_id: schoolId,
        content: state.draft.trim(),
        note_type: state.draftType,
      });
      hapticLight();
      dispatch({ type: 'SAVE_SUCCESS', note: created });
    } catch {
      showToast({ message: 'Could not save note.', type: 'error' });
      dispatch({ type: 'SAVE_FAILURE' });
    }
  };

  const handleToggleDone = async (note: PrincipalNote) => {
    if (note.note_type !== 'todo') return;
    try {
      hapticLight();
      const updated = await api.principalNotes.update(note.id, { is_done: !note.is_done });
      dispatch({ type: 'UPDATE_NOTE', note: updated });
    } catch {
      showToast({ message: 'Could not update note.', type: 'error' });
    }
  };

  const handleTogglePin = async (note: PrincipalNote) => {
    if (note.is_done) return;
    try {
      hapticLight();
      const updated = await api.principalNotes.update(note.id, { is_pinned: !note.is_pinned });
      dispatch({ type: 'UPDATE_NOTE', note: updated });
    } catch {
      showToast({ message: 'Could not update note.', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      hapticLight();
      await api.principalNotes.delete(id);
      dispatch({ type: 'DELETE_NOTE', id });
      showToast({ message: 'Note deleted.', type: 'success' });
    } catch {
      showToast({ message: 'Could not delete note.', type: 'error' });
    }
  };

  const renderRow = useCallback(
    ({ item }: { item: NoteRow }) => {
      if (item.type === 'HEADER') {
        return (
          <VStack className="mb-4 mt-4">
            <Text className="text-[11px] font-black text-phaseText-muted uppercase tracking-[3px] px-8">
              {item.label}
            </Text>
          </VStack>
        );
      }

      return (
        <Box className="px-5">
          <NoteCard
            note={item.note}
            onToggleDone={handleToggleDone}
            onTogglePin={handleTogglePin}
            onDelete={handleDelete}
          />
        </Box>
      );
    },
    [handleToggleDone, handleTogglePin, handleDelete],
  );

  return (
    <ScreenWrapper className="flex-1 bg-phase-canvas" scroll={false}>
      <GlobalHeader
        title="Institutional Log"
        subtitle="High-level governance stream"
        showBack
        onBack={onBack}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={isIos ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <VStack className="flex-1">
          {state.isLoading ? (
            <Box className="flex-1 items-center justify-center">
              <ActivityIndicator className="text-phase-interactive" size="large" />
            </Box>
          ) : rows.length === 0 ? (
            <Box className="px-8 pt-12">
              <PositiveInvitation
                title="Institutional Memory Clear"
                description="Start capturing critical signals, governance decisions, and high-impact to-dos that stay secure in your workstation."
              />
            </Box>
          ) : (
            <FlatList
              data={rows}
              keyExtractor={(r) => r.id}
              renderItem={renderRow}
              contentContainerStyle={{
                paddingTop: 24,
                paddingBottom: state.isComposing ? 0 : 140,
              }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </VStack>
      </KeyboardAvoidingView>

      {state.isComposing ? (
        <Box className="bg-phase-surface border-t border-phase-border p-8 pb-12 shadow-2xl rounded-t-[40px]">
          <HStack className="justify-between items-center mb-8">
            <VStack className="gap-1">
              <Text className="text-[16px] font-black text-phaseText-primary uppercase tracking-widest leading-none">
                New Signal
              </Text>
              <Text className="text-[11px] font-bold text-phaseText-muted uppercase tracking-[2px]">
                Capture Context
              </Text>
            </VStack>
            <Pressable
              onPress={() => {
                hapticLight();
                dispatch({ type: 'STOP_COMPOSING' });
              }}
              className="w-10 h-10 items-center justify-center bg-phase-canvas rounded-full border border-phase-border"
              accessibilityLabel="Close composer"
              accessibilityHint="Discards the current draft and closes the composer"
            >
              <Icon as={ChevronDown} size="sm" className="text-phaseText-muted" />
            </Pressable>
          </HStack>

          <HStack className="flex-wrap gap-3 mb-8">
            {(
              Object.entries(NOTE_TYPE_META) as [
                PrincipalNote['note_type'],
                (typeof NOTE_TYPE_META)[keyof typeof NOTE_TYPE_META],
              ][]
            ).map(([type, meta]) => {
              const isActive = state.draftType === type;
              const IconNode = meta.icon;
              return (
                <Pressable
                  key={type}
                  onPress={() => {
                    hapticLight();
                    dispatch({ type: 'SET_DRAFT_TYPE', draftType: type });
                  }}
                  className={`flex-row items-center px-5 py-2.5 rounded-full border transition-all ${isActive ? 'bg-phase-interactive border-transparent' : 'bg-phase-canvas border-phase-border'}`}
                  accessibilityLabel={`Filter by ${meta.label}`}
                  accessibilityHint={`Changes the note type to ${meta.label}`}
                  accessibilityState={{ selected: isActive }}
                >
                  <Icon
                    as={IconNode}
                    size="xs"
                    className={isActive ? 'text-white' : 'text-phaseText-secondary'}
                  />
                  <Text
                    className={`text-[10px] ml-2 uppercase tracking-widest ${isActive ? 'font-black text-white' : 'font-bold text-phaseText-secondary'}`}
                  >
                    {meta.label}
                  </Text>
                </Pressable>
              );
            })}
          </HStack>

          <Input className="min-h-[160px] bg-phase-canvas border-phase-border rounded-[28px] p-6 shadow-inner">
            <InputField
              value={state.draft}
              onChangeText={(val) => dispatch({ type: 'UPDATE_DRAFT', draft: val })}
              placeholder={NOTE_TYPE_META[state.draftType].placeholder}
              placeholderTextColor="rgba(0,0,0,0.3)"
              multiline
              autoFocus
              className="text-[17px] font-bold text-phaseText-primary leading-[24px]"
              accessibilityLabel="Note content"
              accessibilityHint="Type your governance note or signal here"
            />
          </Input>

          <HStack className="gap-4 mt-8">
            <Pressable
              onPress={() => {
                hapticLight();
                dispatch({ type: 'STOP_COMPOSING' });
              }}
              className="flex-1 h-16 rounded-[20px] bg-phase-canvas border border-phase-border items-center justify-center active:scale-95 transition-all"
              accessibilityLabel="Abort"
              accessibilityHint="Discards the current draft and closes the composer"
            >
              <Text className="font-black uppercase text-[11px] text-phaseText-secondary tracking-[2px]">
                Abort
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                hapticLight();
                handleSave();
              }}
              disabled={!state.draft.trim() || state.isSaving}
              className={`flex-[1.8] h-16 rounded-[20px] bg-phase-interactive shadow-md items-center justify-center active:scale-95 transition-all ${!state.draft.trim() || state.isSaving ? 'opacity-50' : ''}`}
              accessibilityLabel="Commit Signal"
              accessibilityHint="Saves the current note to the institutional log"
            >
              <HStack className="gap-2 items-center">
                {state.isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="font-black uppercase text-[11px] text-white tracking-[3px]">
                    Commit Signal
                  </Text>
                )}
              </HStack>
            </Pressable>
          </HStack>
        </Box>
      ) : (
        <Box className="absolute bottom-12 right-8">
          <Pressable
            onPress={() => {
              hapticLight();
              dispatch({ type: 'START_COMPOSING' });
            }}
            className="w-20 h-20 rounded-[30px] justify-center items-center shadow-xl bg-phase-interactive active:scale-90 transition-all"
            accessibilityLabel="New Signal"
            accessibilityHint="Opens the composer to capture a new institutional note or to-do"
          >
            <Icon as={NotebookPen} size="md" className="text-white" />
          </Pressable>
        </Box>
      )}
    </ScreenWrapper>
  );
}
