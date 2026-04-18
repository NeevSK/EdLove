import React, { useEffect, useMemo, useState } from 'react';
import { api, useTemporalStore, type PrincipalGovernanceEventZod } from '@repo/core';
import { 
    Box, 
    HStack, 
    Text, 
    VStack, 
    useTheme, 
    Input, 
    InputField, 
    Pressable,
    Heading,
    Button,
    ButtonText
} from '@repo/ui';
import { ShieldCheck, Scale, History, Plus, X } from 'lucide-react-native';

interface PrincipalGovernanceTimelineProps {
  schoolId: string;
  principalId: string;
  limit?: number;
}

const EVENT_LABELS: Record<string, string> = {
  create: 'Created',
  read: 'Read',
  use: 'Used',
  expire: 'Expired',
  revoke: 'Revoked',
  follow_up: 'Follow-up',
  approve: 'Approved'
};

const ENTITY_LABELS: Record<string, string> = {
  principal_observation: 'Observation',
  school_invite: 'Invite'
};

function formatWhen(timestamp: string) {
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return timestamp;
  }
}

export default function PrincipalGovernanceTimeline({
  schoolId,
  principalId,
  limit = 6
}: PrincipalGovernanceTimelineProps) {
  const theme = useTheme();
  const { viewDate } = useTemporalStore();
  const [events, setEvents] = useState<PrincipalGovernanceEventZod[]>([]);
  const [snapshot, setSnapshot] = useState<PrincipalGovernanceEventZod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followUpTarget, setFollowUpTarget] = useState<string | null>(null);
  const [followUpContent, setFollowUpContent] = useState('');
  const [followUpStatus, setFollowUpStatus] = useState<'noted' | 'escalated' | 'resolved'>('noted');
  const [savingFollowUp, setSavingFollowUp] = useState(false);

  const observationSnapshot = useMemo(
    () => snapshot.filter((event) => event.entity_type === 'principal_observation'),
    [snapshot]
  );

  useEffect(() => {
    let isMounted = true;

    const loadTimeline = async () => {
      if (!principalId) {
        if (isMounted) {
          setEvents([]);
          setSnapshot([]);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [timelineData, snapshotData] = await Promise.all([
          api.principalWorkspace.getGovernanceTimeline(principalId, viewDate, limit),
          api.principalWorkspace.getGovernanceSnapshotAsOf(principalId, viewDate, 12)
        ]);
        if (!isMounted) return;
        setEvents(timelineData);
        setSnapshot(snapshotData);
      } catch (nextError) {
        console.warn('Failed to load principal governance timeline', nextError);
        if (isMounted) {
          setError('Could not load governance history right now.');
          setEvents([]);
          setSnapshot([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadTimeline();

    return () => {
      isMounted = false;
    };
  }, [principalId, viewDate, limit]);

  const handleSaveFollowUp = async () => {
    if (!followUpTarget || !followUpContent.trim()) return;

    setSavingFollowUp(true);
    try {
      await api.principalWorkspace.recordObservationFollowUp({
        schoolId,
        principalId,
        observationId: followUpTarget,
        content: followUpContent.trim(),
        status: followUpStatus
      });

      const [timelineData, snapshotData] = await Promise.all([
        api.principalWorkspace.getGovernanceTimeline(principalId, viewDate, limit),
        api.principalWorkspace.getGovernanceSnapshotAsOf(principalId, viewDate, 12)
      ]);
      setEvents(timelineData);
      setSnapshot(snapshotData);
      setFollowUpTarget(null);
      setFollowUpContent('');
      setFollowUpStatus('noted');
    } catch (nextError) {
      console.warn('Failed to record principal follow-up', nextError);
      setError('Could not save follow-up right now.');
    } finally {
      setSavingFollowUp(false);
    }
  };

  const infoColor = theme.accent.action;
  const errorColor = theme.accent.danger;
  const warningColor = theme.accent.templeGold;

  return (
    <VStack className="gap-2">
      <Text className="text-base font-bold text-phaseText-primary">
        Governance timeline
      </Text>
      <Text className="text-xs text-phaseText-secondary leading-relaxed">
        Official institutional events for invites and principal observations as of {viewDate}.
      </Text>

      {!isLoading && !error && observationSnapshot.length > 0 && (
        <Box className="rounded-2xl p-4 bg-phase-canvas border border-phase-border gap-2">
          <Text className="text-[13px] font-bold text-phaseText-primary">
            Active governance snapshot
          </Text>
          <Text className="text-xs text-phaseText-secondary leading-relaxed">
            Latest official observation state as of {viewDate}. This is the current institutional surface, not the full history.
          </Text>
          {observationSnapshot.map((event) => (
            <Box
              key={`snapshot-${event.id}`}
              className="rounded-2xl p-2 bg-phase-surface border border-phase-border gap-2"
            >
              <HStack className="justify-between items-center gap-2">
                <Text className="text-xs font-bold text-phaseText-primary">
                  Observation {event.entity_id}
                </Text>
                <Text style={{ color: infoColor }} className="text-[11px] font-bold">
                  {EVENT_LABELS[event.event_type] || event.event_type}
                </Text>
              </HStack>
              <Text className="text-xs text-phaseText-secondary leading-relaxed">
                {(event.snapshot?.content as string) || 'Official observation state is available.'}
              </Text>
              <StyledTouchableOpacity onPress={() => setFollowUpTarget(event.entity_id)} activeOpacity={0.85}>
                <Box
                  style={{ backgroundColor: `${infoColor}18` }}
                  className="self-start mt-2 px-4 py-1 rounded-full border border-phase-border"
                >
                  <Text style={{ color: infoColor }} className="text-[11px] font-bold">
                    Add follow-up
                  </Text>
                </Box>
              </Pressable>
            </Box>
          ))}
        </Box>
      )}

      {isLoading && (
        <Box className="rounded-2xl p-4 bg-phase-canvas border border-phase-border">
          <Text className="text-phaseText-secondary">Loading governance history...</Text>
        </Box>
      )}

      {!isLoading && error && (
        <Box
          style={{ backgroundColor: errorColor + '10', borderColor: errorColor }}
          className="rounded-2xl p-4 border"
        >
          <Text className="text-phaseText-primary">{error}</Text>
        </Box>
      )}

      {!isLoading && !error && events.length === 0 && (
        <Box className="rounded-2xl p-4 bg-phase-canvas border border-phase-border">
          <Text className="text-phaseText-secondary">
            No official governance events are recorded for this view yet.
          </Text>
        </Box>
      )}

      {!isLoading && !error && events.length > 0 && events.map((event) => (
        <Box key={event.id} className="rounded-2xl p-4 bg-phase-canvas border border-phase-border">
          <VStack className="gap-2">
            <HStack className="justify-between items-center gap-2">
              <Text className="text-xs font-bold text-phaseText-primary">
                {ENTITY_LABELS[event.entity_type] || event.entity_type} {EVENT_LABELS[event.event_type] || event.event_type}
              </Text>
              <Text style={{ color: infoColor }} className="text-[11px] font-bold">
                {event.entity_type === 'school_invite' ? 'Invite' : 'Official'}
              </Text>
            </HStack>
            <Text className="text-xs text-phaseText-secondary leading-relaxed">
              {formatWhen(event.occurred_at)}
            </Text>
            <Text className="text-xs text-phaseText-secondary leading-relaxed">
              {event.entity_type === 'school_invite'
                ? `Invite code ${event.entity_id} entered the governance timeline.`
                : event.event_type === 'follow_up'
                  ? `Observation ${event.entity_id} received a follow-up: ${(event.snapshot?.content as string) || 'updated'}.`
                  : `Observation ${event.entity_id} is now part of the official school record.`}
            </Text>
          </VStack>
        </Box>
      ))}

      {followUpTarget && (
        <Box className="rounded-2xl p-4 bg-phase-surface border border-phase-border gap-4">
          <Text className="text-[13px] font-bold text-phaseText-primary">
            Follow up on observation {followUpTarget}
          </Text>
          <Input className="min-h-[88px] bg-phase-canvas border-phase-border rounded-2xl p-2">
            <InputField
                value={followUpContent}
                onChangeText={setFollowUpContent}
                placeholder="Record the next official step, decision, or resolution..."
                placeholderTextColor={theme.scene.text.muted}
                multiline
                textAlignVertical="top"
                className="text-phaseText-primary"
            />
          </Input>
          <HStack className="gap-2 flex-wrap">
            {(['noted', 'escalated', 'resolved'] as const).map((status) => (
              <Pressable key={status} onPress={() => setFollowUpStatus(status)}>
                <Box
                  style={{ backgroundColor: followUpStatus === status ? infoColor : 'transparent' }}
                  className={`px-4 py-1 rounded-full border border-phase-border`}
                >
                  <Text
                    style={{ color: followUpStatus === status ? '#FFFFFF' : theme.scene.text.secondary }}
                    className="text-[11px] font-bold"
                  >
                    {status}
                  </Text>
                </Box>
              </Pressable>
            ))}
          </HStack>
          <HStack className="gap-4">
            <Pressable
              onPress={() => {
                setFollowUpTarget(null);
                setFollowUpContent('');
                setFollowUpStatus('noted');
              }}
              className="flex-1"
            >
              <Box className="py-2.5 rounded-full bg-phase-canvas border border-phase-border items-center">
                <Text className="text-xs font-bold text-phaseText-secondary">Cancel</Text>
              </Box>
            </Pressable>
            <Pressable
              onPress={handleSaveFollowUp}
              disabled={savingFollowUp}
              className="flex-1"
            >
              <Box
                style={{ backgroundColor: warningColor }}
                className={`py-2.5 rounded-full items-center ${savingFollowUp ? 'opacity-50' : ''}`}
              >
                <Text className="text-xs font-bold text-white">
                  {savingFollowUp ? 'Saving...' : 'Save follow-up'}
                </Text>
              </Box>
            </Pressable>
          </HStack>
        </Box>
      )}
    </VStack>
  );
}
