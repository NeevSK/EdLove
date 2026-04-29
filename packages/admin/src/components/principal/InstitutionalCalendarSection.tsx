/**
 * InstitutionalCalendarSection
 *
 * Compact calendar widget for the principal:
 *  - Upcoming events list with type badges
 *  - Inline add-event form
 */

import { type CalendarEvent, staffManagementAPI } from '@repo/core';
import {
  Box,
  HStack,
  hapticLight,
  Icon,
  Input,
  InputField,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from '@repo/ui';
import { Plus } from 'lucide-react-native';
import React, { useEffect, useReducer } from 'react';

interface InstitutionalCalendarSectionProps {
  schoolId: string;
  principalId: string;
  onAddEvent?: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  term_start: 'Term Start',
  exam: 'Exam',
  holiday: 'Holiday',
  event: 'Event',
  other: 'Other',
};

const TYPE_OPTIONS = ['term_start', 'exam', 'holiday', 'event', 'other'];

type State = {
  events: CalendarEvent[];
  isLoading: boolean;
  isAddFormVisible: boolean;
  isSaving: boolean;
  form: {
    title: string;
    selectedType: string;
    startDate: string;
    endDate: string;
  };
};

type Action =
  | { type: 'SET_EVENTS'; events: CalendarEvent[] }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'TOGGLE_FORM' }
  | { type: 'UPDATE_FORM'; field: keyof State['form']; value: any }
  | { type: 'RESET_FORM' }
  | { type: 'SET_SAVING'; isSaving: boolean };

const calendarReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_EVENTS':
      return { ...state, events: action.events, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    case 'TOGGLE_FORM':
      return { ...state, isAddFormVisible: !state.isAddFormVisible };
    case 'UPDATE_FORM':
      return { ...state, form: { ...state.form, [action.field]: action.value } };
    case 'RESET_FORM':
      return {
        ...state,
        form: { title: '', selectedType: 'event', startDate: '', endDate: '' },
        isAddFormVisible: false,
        isSaving: false,
      };
    case 'SET_SAVING':
      return { ...state, isSaving: action.isSaving };
    default:
      return state;
  }
};

export default function InstitutionalCalendarSection({
  schoolId,
  principalId,
  onAddEvent,
}: InstitutionalCalendarSectionProps) {
  const [state, dispatch] = useReducer(calendarReducer, {
    events: [],
    isLoading: true,
    isAddFormVisible: false,
    isSaving: false,
    form: { title: '', selectedType: 'event', startDate: '', endDate: '' },
  });

  const getTypeColorClass = (type: string): string => {
    switch (type) {
      case 'term_start':
        return 'bg-phase-interactive';
      case 'exam':
        return 'bg-phase-danger';
      case 'holiday':
        return 'bg-phase-success';
      case 'event':
        return 'bg-phase-interactive';
      default:
        return 'bg-phaseText-muted';
    }
  };

  async function fetchEvents() {
    try {
      const data = await staffManagementAPI.getUpcomingCalendarEvents(schoolId, 5);
      dispatch({ type: 'SET_EVENTS', events: data ?? [] });
    } catch (err) {
      console.error('InstitutionalCalendar: fetch error', err);
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  }

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', isLoading: true });
    fetchEvents();
  }, [schoolId]);

  async function handleSave() {
    const { title, selectedType, startDate, endDate } = state.form;
    if (!title.trim() || !startDate.trim()) return;
    dispatch({ type: 'SET_SAVING', isSaving: true });
    try {
      const ok = await staffManagementAPI.createCalendarEvent(schoolId, principalId, {
        title: title.trim(),
        type: selectedType,
        start_date: startDate.trim(),
        end_date: endDate.trim() || undefined,
      });
      if (ok) {
        hapticLight();
        dispatch({ type: 'RESET_FORM' });
        await fetchEvents();
      }
    } catch (err) {
      console.error('InstitutionalCalendar: save error', err);
      dispatch({ type: 'SET_SAVING', isSaving: false });
    }
  }

  return (
    <Box className="bg-phase-surface rounded-[32px] border border-phase-border p-6 shadow-sm">
      <HStack className="justify-between items-center mb-6">
        <VStack className="gap-0.5">
          <Text className="text-[18px] font-black text-phaseText-primary tracking-tight">
            Institution Calendar
          </Text>
          <Text className="text-[11px] font-bold text-phaseText-muted uppercase tracking-wider">
            Upcoming Cycles
          </Text>
        </VStack>
        <Pressable
          onPress={() => {
            hapticLight();
            dispatch({ type: 'TOGGLE_FORM' });
            onAddEvent?.();
          }}
          className={`rounded-2xl px-5 py-2 flex-row items-center gap-2 active:scale-95 transition-all ${state.isAddFormVisible ? 'bg-phase-canvas border border-phase-border' : 'bg-phase-interactive'}`}
          accessibilityLabel={state.isAddFormVisible ? 'Hide form' : 'Add event'}
          accessibilityHint="Toggles the form to add a new institutional event to the calendar"
        >
          <Icon
            as={Plus}
            size="xs"
            className={state.isAddFormVisible ? 'text-phaseText-primary' : 'text-white'}
          />
          <Text
            className={`text-[12px] font-black uppercase tracking-wider ${state.isAddFormVisible ? 'text-phaseText-primary' : 'text-white'}`}
          >
            {state.isAddFormVisible ? 'Hide' : 'Add Event'}
          </Text>
        </Pressable>
      </HStack>

      {state.isLoading && (
        <VStack className="gap-3">
          <Box className="h-16 bg-phase-canvas border border-phase-border rounded-2xl opacity-50" />
          <Box className="h-16 bg-phase-canvas border border-phase-border rounded-2xl opacity-30" />
        </VStack>
      )}

      {!state.isLoading && state.events.length === 0 && !state.isAddFormVisible && (
        <Box className="bg-phase-canvas rounded-[24px] border border-dashed border-phase-border py-10 items-center">
          <Text className="text-[14px] font-bold text-phaseText-muted text-center opacity-60">
            No institutional events scheduled.
          </Text>
        </Box>
      )}

      {!state.isLoading &&
        state.events.map((ev, index) => (
          <HStack
            key={ev.id}
            className={`items-center gap-5 py-5 ${index !== state.events.length - 1 ? 'border-b border-phase-border/50' : ''}`}
          >
            <Box className={`rounded-lg px-3 py-1 ${getTypeColorClass(ev.type)}`}>
              <Text className="text-[10px] font-black text-white uppercase tracking-widest leading-none">
                {TYPE_LABELS[ev.type] || ev.type}
              </Text>
            </Box>
            <Text
              className="flex-1 text-[15px] font-bold text-phaseText-primary tracking-tight"
              numberOfLines={1}
            >
              {ev.title}
            </Text>
            <Text className="text-[11px] font-black text-phaseText-muted uppercase">
              {new Date(ev.start_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </HStack>
        ))}

      {state.isAddFormVisible && (
        <VStack className="mt-8 gap-5 border-t border-phase-border pt-8">
          <Input className="border border-phase-border rounded-[20px] bg-phase-canvas h-14 shadow-sm px-4">
            <InputField
              placeholder="Event Title"
              placeholderTextColor="rgba(0,0,0,0.3)"
              value={state.form.title}
              onChangeText={(val) => dispatch({ type: 'UPDATE_FORM', field: 'title', value: val })}
              className="text-[15px] font-black text-phaseText-primary"
              accessibilityLabel="Event Title"
              accessibilityHint="Enter a descriptive title for the institutional event"
            />
          </Input>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HStack className="gap-2.5">
              {TYPE_OPTIONS.map((t) => {
                const isSelected = state.form.selectedType === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => {
                      hapticLight();
                      dispatch({ type: 'UPDATE_FORM', field: 'selectedType', value: t });
                    }}
                    accessibilityLabel={`Type: ${TYPE_LABELS[t]}`}
                    accessibilityHint={`Sets the event category to ${TYPE_LABELS[t]}`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Box
                      className={`rounded-full px-5 py-2 border transition-all ${isSelected ? `${getTypeColorClass(t)} border-transparent` : 'bg-phase-canvas border-phase-border'}`}
                    >
                      <Text
                        className={`text-[11px] font-black uppercase tracking-wider ${isSelected ? 'text-white' : 'text-phaseText-secondary'}`}
                      >
                        {TYPE_LABELS[t]}
                      </Text>
                    </Box>
                  </Pressable>
                );
              })}
            </HStack>
          </ScrollView>

          <HStack className="gap-3">
            <Input className="flex-1 border border-phase-border rounded-[20px] bg-phase-canvas h-14 shadow-sm px-4">
              <InputField
                placeholder="YYYY-MM-DD"
                placeholderTextColor="rgba(0,0,0,0.2)"
                value={state.form.startDate}
                onChangeText={(val) =>
                  dispatch({ type: 'UPDATE_FORM', field: 'startDate', value: val })
                }
                className="text-[14px] font-bold text-phaseText-primary"
                accessibilityLabel="Start Date"
                accessibilityHint="Enter the event start date in ISO format"
              />
            </Input>
            <Input className="flex-1 border border-phase-border rounded-[20px] bg-phase-canvas h-14 shadow-sm px-4">
              <InputField
                placeholder="End (Opt)"
                placeholderTextColor="rgba(0,0,0,0.2)"
                value={state.form.endDate}
                onChangeText={(val) =>
                  dispatch({ type: 'UPDATE_FORM', field: 'endDate', value: val })
                }
                className="text-[14px] font-bold text-phaseText-primary"
                accessibilityLabel="End Date"
                accessibilityHint="Enter the optional end date in ISO format"
              />
            </Input>
          </HStack>

          <Pressable
            onPress={handleSave}
            disabled={state.isSaving}
            className={`bg-phase-interactive rounded-[20px] py-4 items-center shadow-md active:scale-95 transition-all ${state.isSaving ? 'opacity-50' : ''}`}
            accessibilityLabel="Commit to Calendar"
            accessibilityHint="Synchronizes this event with the institutional calendar"
          >
            <Text className="text-[13px] font-black text-white uppercase tracking-[2px]">
              {state.isSaving ? 'Scheduling...' : 'Commit to Calendar'}
            </Text>
          </Pressable>
        </VStack>
      )}
    </Box>
  );
}
