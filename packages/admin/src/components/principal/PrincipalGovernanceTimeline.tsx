import { api, type PrincipalGovernanceEventZod } from '@repo/core/api';
import { useTemporalStore } from '@repo/core/logic';
import {
  Box,
  Heading,
  HStack,
  Icon,
  Input,
  InputField,
  Pressable,
  Spinner,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { hapticLight } from '@repo/ui/utils/haptics';

import { Activity, Clock, FileText, History, Plus, ShieldCheck } from 'lucide-react-native';
import { useEffect, useMemo, useReducer } from 'react';

interface PrincipalGovernanceTimelineProps {
  schoolId: string;
  principalId: string;
  limit?: number;
}

const EVENT_LABELS: Record<string, string> = {
  create: 'Initialization',
  read: 'Access',
  use: 'Utilization',
  expire: 'Expiraton',
  revoke: 'Revocation',
  follow_up: 'Protocol',
  approve: 'Authorization',
};

const ENTITY_LABELS: Record<string, string> = {
  principal_observation: 'Observation',
  school_invite: 'Identity Key',
};

function formatWhen(timestamp: string) {
  try {
    return new Date(timestamp).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return timestamp;
  }
}

type State = {
  events: PrincipalGovernanceEventZod[];
  snapshot: PrincipalGovernanceEventZod[];
  isLoading: boolean;
  error: string | null;
  followUp: {
    targetId: string | null;
    content: string;
    status: 'noted' | 'escalated' | 'resolved';
    isSaving: boolean;
  };
};

type Action =
  | { type: 'LOAD_START' }
  | {
      type: 'LOAD_SUCCESS';
      timeline: PrincipalGovernanceEventZod[];
      snapshot: PrincipalGovernanceEventZod[];
    }
  | { type: 'LOAD_FAILURE'; error: string }
  | { type: 'SET_FOLLOW_UP_TARGET'; targetId: string | null }
  | { type: 'UPDATE_FOLLOW_UP_CONTENT'; content: string }
  | { type: 'SET_FOLLOW_UP_STATUS'; status: 'noted' | 'escalated' | 'resolved' }
  | { type: 'SAVE_FOLLOW_UP_START' }
  | {
      type: 'SAVE_FOLLOW_UP_SUCCESS';
      timeline: PrincipalGovernanceEventZod[];
      snapshot: PrincipalGovernanceEventZod[];
    }
  | { type: 'SAVE_FOLLOW_UP_FAILURE'; error: string };

const timelineReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, isLoading: true, error: null };
    case 'LOAD_SUCCESS':
      return {
        ...state,
        isLoading: false,
        events: action.timeline,
        snapshot: action.snapshot,
      };
    case 'LOAD_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.error,
        events: [],
        snapshot: [],
      };
    case 'SET_FOLLOW_UP_TARGET':
      return {
        ...state,
        followUp: { ...state.followUp, targetId: action.targetId, content: '' },
      };
    case 'UPDATE_FOLLOW_UP_CONTENT':
      return {
        ...state,
        followUp: { ...state.followUp, content: action.content },
      };
    case 'SET_FOLLOW_UP_STATUS':
      return {
        ...state,
        followUp: { ...state.followUp, status: action.status },
      };
    case 'SAVE_FOLLOW_UP_START':
      return { ...state, followUp: { ...state.followUp, isSaving: true } };
    case 'SAVE_FOLLOW_UP_SUCCESS':
      return {
        ...state,
        events: action.timeline,
        snapshot: action.snapshot,
        followUp: {
          ...state.followUp,
          isSaving: false,
          targetId: null,
          content: '',
          status: 'noted',
        },
      };
    case 'SAVE_FOLLOW_UP_FAILURE':
      return {
        ...state,
        followUp: { ...state.followUp, isSaving: false },
        error: action.error,
      };
    default:
      return state;
  }
};

export default function PrincipalGovernanceTimeline({
  schoolId,
  principalId,
  limit = 6,
}: PrincipalGovernanceTimelineProps) {
  const { viewDate } = useTemporalStore();
  const [state, dispatch] = useReducer(timelineReducer, {
    events: [],
    snapshot: [],
    isLoading: true,
    error: null,
    followUp: {
      targetId: null,
      content: '',
      status: 'noted',
      isSaving: false,
    },
  });

  const observationSnapshot = useMemo(
    () => state.snapshot.filter((event) => event.entity_type === 'principal_observation'),
    [state.snapshot],
  );

  useEffect(() => {
    let isMounted = true;

    const loadTimeline = async () => {
      if (!principalId) {
        if (isMounted) {
          dispatch({ type: 'LOAD_SUCCESS', timeline: [], snapshot: [] });
        }
        return;
      }

      dispatch({ type: 'LOAD_START' });

      try {
        const [timelineData, snapshotData] = await Promise.all([
          api.principalWorkspace.getGovernanceTimeline(principalId, viewDate, limit),
          api.principalWorkspace.getGovernanceSnapshotAsOf(principalId, viewDate, 12),
        ]);
        if (!isMounted) return;
        dispatch({
          type: 'LOAD_SUCCESS',
          timeline: timelineData,
          snapshot: snapshotData,
        });
      } catch (nextError) {
        console.warn('Failed to load principal governance timeline', nextError);
        if (isMounted) {
          dispatch({
            type: 'LOAD_FAILURE',
            error: 'Could not load governance history right now.',
          });
        }
      }
    };

    void loadTimeline();

    return () => {
      isMounted = false;
    };
  }, [principalId, viewDate, limit]);

  const handleSaveFollowUp = async () => {
    const { targetId, content, status } = state.followUp;
    if (!targetId || !content.trim()) return;

    dispatch({ type: 'SAVE_FOLLOW_UP_START' });
    try {
      hapticLight();
      await api.principalWorkspace.recordObservationFollowUp({
        schoolId,
        principalId,
        observationId: targetId,
        content: content.trim(),
        status,
      });

      const [timelineData, snapshotData] = await Promise.all([
        api.principalWorkspace.getGovernanceTimeline(principalId, viewDate, limit),
        api.principalWorkspace.getGovernanceSnapshotAsOf(principalId, viewDate, 12),
      ]);
      dispatch({
        type: 'SAVE_FOLLOW_UP_SUCCESS',
        timeline: timelineData,
        snapshot: snapshotData,
      });
    } catch (nextError) {
      console.warn('Failed to record principal follow-up', nextError);
      dispatch({
        type: 'SAVE_FOLLOW_UP_FAILURE',
        error: 'Could not save follow-up right now.',
      });
    }
  };

  return (
    <VStack className="gap-6">
      <VStack className="gap-1.5">
        <Heading className="text-[20px] font-black text-phaseText-primary tracking-tight">
          Governance Timeline
        </Heading>
        <Text className="text-[12px] font-bold text-phaseText-secondary leading-relaxed opacity-80">
          Official institutional events as of {viewDate}.
        </Text>
      </VStack>

      {!state.isLoading && !state.error && observationSnapshot.length > 0 && (
        <Box className="rounded-[32px] p-6 bg-phase-surface border border-phase-border gap-5 shadow-sm">
          <HStack className="items-center gap-3">
            <Box className="p-2 bg-phase-interactive/10 rounded-xl">
              <Icon as={ShieldCheck} size="xs" className="text-phase-interactive" />
            </Box>
            <VStack className="gap-0.5">
              <Text className="text-[14px] font-black text-phaseText-primary tracking-tight uppercase">
                Protocol Snapshot
              </Text>
              <Text className="text-[10px] font-bold text-phaseText-muted uppercase tracking-widest leading-none">
                Latest Observational State
              </Text>
            </VStack>
          </HStack>

          {observationSnapshot.map((event) => (
            <Box
              key={`snapshot-${event.id}`}
              className="rounded-[24px] p-5 bg-phase-canvas border border-phase-border gap-4"
            >
              <HStack className="justify-between items-center gap-2">
                <HStack className="gap-2 items-center">
                  <Icon as={FileText} size="xs" className="text-phaseText-muted/40" />
                  <Text className="text-[12px] font-black text-phaseText-primary uppercase tracking-wider">
                    Obs {event.entity_id.substring(0, 6)}
                  </Text>
                </HStack>
                <Box className="px-2.5 py-1 rounded-full bg-phase-interactive/10 border border-phase-interactive/20">
                  <Text className="text-[9px] font-black text-phase-interactive uppercase tracking-widest">
                    {EVENT_LABELS[event.event_type] || event.event_type}
                  </Text>
                </Box>
              </HStack>
              <Text className="text-[13px] text-phaseText-secondary leading-[20px] font-bold italic opacity-90">
                {(event.snapshot?.content as string) || 'Official observation state is available.'}
              </Text>
              <Pressable
                onPress={() => {
                  hapticLight();
                  dispatch({
                    type: 'SET_FOLLOW_UP_TARGET',
                    targetId: event.entity_id,
                  });
                }}
                className="bg-phase-interactive flex-row items-center justify-center gap-2 mt-2 py-3 rounded-[18px] shadow-sm active:scale-95 transition-all"
                accessibilityLabel="Add Protocol Follow-up"
                accessibilityHint="Opens the protocol form to record an escalation or resolution for this observation"
              >
                <Icon as={Plus} size="xs" className="text-white" />
                <Text className="text-[11px] font-black text-white uppercase tracking-widest">
                  Add Protocol
                </Text>
              </Pressable>
            </Box>
          ))}
        </Box>
      )}

      {state.isLoading && (
        <Box className="rounded-[32px] p-12 bg-phase-canvas border border-phase-border items-center justify-center">
          <Spinner className="text-phase-interactive" />
        </Box>
      )}

      {!state.isLoading && state.error && (
        <Box className="rounded-[24px] p-5 border border-phase-danger/30 bg-phase-danger/5">
          <Text className="text-[13px] text-phase-danger font-black tracking-tight">
            {state.error}
          </Text>
        </Box>
      )}

      {!state.isLoading && !state.error && state.events.length === 0 && (
        <Box className="rounded-[32px] p-12 bg-phase-canvas border border-dashed border-phase-border items-center justify-center opacity-60">
          <Icon as={History} size="md" className="text-phaseText-muted mb-4 opacity-20" />
          <Text className="text-[11px] font-bold text-phaseText-muted uppercase tracking-[3px] text-center">
            Institutional Memory Blank
          </Text>
        </Box>
      )}

      <VStack className="gap-4">
        {!state.isLoading &&
          !state.error &&
          state.events.length > 0 &&
          state.events.map((event) => (
            <Box
              key={event.id}
              className="rounded-[24px] p-5 bg-phase-surface border border-phase-border shadow-sm border-l-4 border-l-phase-interactive/30"
            >
              <VStack className="gap-4">
                <HStack className="justify-between items-center gap-2">
                  <HStack className="gap-2 items-center">
                    <Icon as={Activity} size="xs" className="text-phase-interactive opacity-40" />
                    <Text className="text-[12px] font-black text-phaseText-primary uppercase tracking-widest">
                      {ENTITY_LABELS[event.entity_type] || event.entity_type}{' '}
                      {EVENT_LABELS[event.event_type] || event.event_type}
                    </Text>
                  </HStack>
                  <Box className="px-2 py-0.5 rounded-md bg-phase-canvas border border-phase-border">
                    <Text className="text-[8px] font-black text-phaseText-muted uppercase">
                      {event.entity_type === 'school_invite' ? 'Gate' : 'Protocol'}
                    </Text>
                  </Box>
                </HStack>

                <Text className="text-[13px] text-phaseText-secondary leading-[20px] font-bold">
                  {event.entity_type === 'school_invite'
                    ? `Identity Key ${event.entity_id} assimilated into timeline.`
                    : event.event_type === 'follow_up'
                      ? `Protocol escalation for Obs ${event.entity_id.substring(0, 6)}: ${(event.snapshot?.content as string) || 'Authorized updates'}.`
                      : `Observation ${event.entity_id.substring(0, 6)} committed to official institutional record.`}
                </Text>

                <HStack className="gap-1.5 items-center">
                  <Icon as={Clock} size="xs" className="text-phaseText-muted/40" />
                  <Text className="text-[10px] font-black text-phaseText-muted uppercase tracking-widest opacity-60">
                    {formatWhen(event.occurred_at)}
                  </Text>
                </HStack>
              </VStack>
            </Box>
          ))}
      </VStack>

      {state.followUp.targetId && (
        <Box className="rounded-[40px] p-2 bg-phase-interactive shadow-2xl mt-4">
          <Box className="p-6 bg-phase-surface rounded-[38px] border border-dashed border-phase-interactive/20 gap-6">
            <VStack className="gap-1.5">
              <Text className="text-[16px] font-black text-phaseText-primary uppercase tracking-wider">
                Commit Protocol
              </Text>
              <Text className="text-[11px] font-bold text-phaseText-muted uppercase tracking-[2px]">
                Escalation & Resolution
              </Text>
            </VStack>

            <Input className="min-h-[140px] bg-phase-canvas border-phase-border rounded-[24px] p-5 shadow-inner">
              <InputField
                value={state.followUp.content}
                onChangeText={(val) => dispatch({ type: 'UPDATE_FOLLOW_UP_CONTENT', content: val })}
                placeholder="Record official protocol step..."
                placeholderTextColor="rgba(0,0,0,0.3)"
                multiline
                textAlignVertical="top"
                className="text-[15px] font-bold text-phaseText-primary"
                accessibilityLabel="Protocol Note"
                accessibilityHint="Enter the details of the escalation or resolution step"
              />
            </Input>

            <HStack className="gap-2.5 flex-wrap">
              {(['noted', 'escalated', 'resolved'] as const).map((status) => {
                const isActive = state.followUp.status === status;
                return (
                  <Pressable
                    key={status}
                    onPress={() => {
                      hapticLight();
                      dispatch({ type: 'SET_FOLLOW_UP_STATUS', status });
                    }}
                    accessibilityLabel={`Status: ${status}`}
                    accessibilityHint={`Sets the protocol escalation level to ${status}`}
                    accessibilityState={{ selected: isActive }}
                  >
                    <Box
                      className={`px-5 py-2.5 rounded-full border transition-all ${isActive ? 'bg-phase-interactive border-phase-interactive' : 'bg-phase-canvas border-phase-border'}`}
                    >
                      <Text
                        className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-phaseText-secondary'}`}
                      >
                        {status}
                      </Text>
                    </Box>
                  </Pressable>
                );
              })}
            </HStack>

            <HStack className="gap-4">
              <Pressable
                onPress={() => {
                  hapticLight();
                  dispatch({ type: 'SET_FOLLOW_UP_TARGET', targetId: null });
                }}
                className="flex-1"
                accessibilityLabel="Abort Protocol"
                accessibilityHint="Discards the current follow-up and closes the form"
              >
                <Box className="h-14 rounded-[20px] bg-phase-canvas border border-phase-border items-center justify-center active:scale-95 transition-all">
                  <Text className="text-[11px] font-black text-phaseText-secondary uppercase tracking-widest">
                    Abort
                  </Text>
                </Box>
              </Pressable>
              <Pressable
                onPress={() => {
                  hapticLight();
                  handleSaveFollowUp();
                }}
                disabled={state.followUp.isSaving || !state.followUp.content.trim()}
                className="flex-[1.5]"
                accessibilityLabel="Confirm Protocol"
                accessibilityHint="Commits the follow-up note and status to the official timeline"
              >
                <Box
                  className={`h-14 rounded-[20px] items-center justify-center bg-phase-interactive shadow-md active:scale-95 transition-all ${state.followUp.isSaving || !state.followUp.content.trim() ? 'opacity-50' : ''}`}
                >
                  <HStack className="gap-2 items-center">
                    {state.followUp.isSaving && <Spinner size="small" color="#FFFFFF" />}
                    <Text className="text-[11px] font-black text-white uppercase tracking-widest">
                      {state.followUp.isSaving ? 'Committing...' : 'Confirm Protocol'}
                    </Text>
                  </HStack>
                </Box>
              </Pressable>
            </HStack>
          </Box>
        </Box>
      )}
    </VStack>
  );
}
