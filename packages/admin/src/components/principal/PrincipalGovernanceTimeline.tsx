import React, { useEffect, useMemo, useState } from 'react';
import { TouchableOpacity, TextInput } from 'react-native';
import { api, useTemporalStore, type PrincipalGovernanceEventZod } from '@repo/core';
import { Box, HStack, Text, Theme, VStack, useThemedColors } from '@repo/ui';

interface PrincipalGovernanceTimelineProps {
  schoolId: string;
  principalId: string;
  limit?: number;
}

const EVENT_LABELS: Record<PrincipalGovernanceEventZod['event_type'], string> = {
  create: 'Created',
  read: 'Read',
  use: 'Used',
  expire: 'Expired',
  revoke: 'Revoked',
  follow_up: 'Follow-up',
  approve: 'Approved',
};

const ENTITY_LABELS: Record<PrincipalGovernanceEventZod['entity_type'], string> = {
  principal_observation: 'Observation',
  school_invite: 'Invite',
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
  limit = 6,
}: PrincipalGovernanceTimelineProps) {
  const colors = useThemedColors();
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
    [snapshot],
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
          api.principalWorkspace.getGovernanceSnapshotAsOf(principalId, viewDate, 12),
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
        status: followUpStatus,
      });

      const [timelineData, snapshotData] = await Promise.all([
        api.principalWorkspace.getGovernanceTimeline(principalId, viewDate, limit),
        api.principalWorkspace.getGovernanceSnapshotAsOf(principalId, viewDate, 12),
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

  return (
    <VStack sx={{ gap: Theme.spacing.sm }}      <Text sx={{ fontSize: 16, fontWeight: '700', color: Theme.colors.inkTruth }}        Governance timeline
      </Text      <Text sx={{ fontSize: 12, color: colors.textSecondary, lineHeight: 18 }}        Official institutional events for invites and principal observations as of {viewDate}.>
      </Text>
      {!isLoading && !error && observationSnapshot.length > 0 ? (
        <Box
          sx={{
            borderRadius: Theme.corners.comfortable,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.silk,
            borderWidth: 1,
            borderColor: colors.border,
            gap: Theme.spacing.sm,>
          }}
                  <Text sx={{ fontSize: 13, fontWeight: '700', color: Theme.colors.inkTruth }}            Active governance snapshot
          </Text          <Text sx={{ fontSize: 12, color: colors.textSecondary, lineHeight: 18 }}            Latest official observation state as of {viewDate}. This is the current institutional surface, not the full history.>
          </Text          >{observationSnapshot.map((event) => (
            <Box
              key={`snapshot-${event.id}`}
              sx={{
                borderRadius: Theme.corners.comfortable,
                padding: Theme.spacing.sm,
                backgroundColor: colors.primary,
                borderWidth: 1,
                borderColor: colors.border,
                gap: Theme.spacing.xs,>
              }}
                          <HStack sx={{ justifyContent: 'space-between', alignItems: 'center', gap: Theme.spacing.sm }}                <Text sx={{ fontSize: 12, fontWeight: '700', color: Theme.colors.inkTruth }}                  Observation {event.entity_id}
                </Text                <Text sx={{ fontSize: 11, color: Theme.colors.gurudeviBlue, fontWeight: '700' }}                  {EVENT_LABELS[event.event_type]}>
                </Text              ></HStack              <Text sx={{ fontSize: 12, color: colors.textSecondary, lineHeight: 18 }}                {(event.snapshot?.content as string) || 'Official observation state is available.'}
              </Text              <TouchableOpacity onPress={() => setFollowUpTarget(event.entity_id)} activeOpacity={0.85}                <Box
                  sx={{
                    alignSelf: 'flex-start',
                    marginTop: Theme.spacing.xs,
                    paddingHorizontal: Theme.spacing.md,
                    paddingVertical: Theme.spacing.xs,
                    borderRadius: Theme.corners.full,
                    backgroundColor: `${Theme.colors.gurudeviBlue}18`,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                                  <Text sx={{ fontSize: 11, fontWeight: '700', color: Theme.colors.gurudeviBlue }}                    Add follow-up
                  </Text                </Box              </TouchableOpacity            </Box          ))}>
        </Box      >) : null}

      {isLoading ? (
        <Box
          sx={{
            borderRadius: Theme.corners.comfortable,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.silk,
            borderWidth: 1,
            borderColor: colors.border,>
          }}
                  <Text sx={{ color: colors.textSecondary }}>Loading governance history...</Text        ></Box      ) : null}

      {!isLoading && error ? (
        <Box
          sx={{
            borderRadius: Theme.corners.comfortable,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.errorBackground,
            borderWidth: 1,
            borderColor: Theme.colors.emberRed,>
          }}
                  <Text sx={{ color: Theme.colors.inkTruth }}>{error}</Text        ></Box      ) : null}

      {!isLoading && !error && events.length === 0 ? (
        <Box
          sx={{
            borderRadius: Theme.corners.comfortable,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.silk,
            borderWidth: 1,
            borderColor: colors.border,>
          }}
                  <Text sx={{ color: colors.textSecondary }}            No official governance events are recorded for this view yet.
          </Text        </Box      ) : null}>

      {!isLoading && !error
        ? events.map((event) => (
            <Box
              key={event.id}
              sx={{
                borderRadius: Theme.corners.comfortable,
                padding: Theme.spacing.md,
                backgroundColor: Theme.colors.silk,
                borderWidth: 1,
                borderColor: colors.border,>
              }}
                          <VStack sx={{ gap: Theme.spacing.xs }}                <HStack sx={{ justifyContent: 'space-between', alignItems: 'center', gap: Theme.spacing.sm }}                  <Text sx={{ fontSize: 13, fontWeight: '700', color: Theme.colors.inkTruth }}                    {ENTITY_LABELS[event.entity_type]} {EVENT_LABELS[event.event_type]}
                  </Text                  ><Text sx={{ fontSize: 11, fontWeight: '700', color: Theme.colors.gurudeviBlue }}                    {event.entity_type === 'school_invite' ? 'Invite' : 'Official'}>
                  </Text                ></HStack                <Text sx={{ fontSize: 12, color: colors.textSecondary, lineHeight: 18 }}                  {formatWhen(event.occurred_at)}
                </Text                <Text sx={{ fontSize: 12, color: colors.textSecondary, lineHeight: 18 }}                  {event.entity_type === 'school_invite'
                    ? `Invite code ${event.entity_id} entered the governance timeline.`
                    : event.event_type === 'follow_up'
                      ? `Observation ${event.entity_id} received a follow-up: ${(event.snapshot?.content as string) || 'updated'}.`
                      : `Observation ${event.entity_id} is now part of the official school record.`}
                </Text              </VStack            </Box          ))
        : null}

      {followUpTarget ? (
        <Box
          sx={{
            borderRadius: Theme.corners.comfortable,
            padding: Theme.spacing.md,
            backgroundColor: colors.primary,
            borderWidth: 1,
            borderColor: colors.border,
            gap: Theme.spacing.sm,>
          }}
                  <Text sx={{ fontSize: 13, fontWeight: '700', color: Theme.colors.inkTruth }}            Follow up on observation {followUpTarget}
          </Text          <TextInput
            value={followUpContent}
            onChangeText={setFollowUpContent}
            placeholder="Record the next official step, decision, or resolution..."
            placeholderTextColor={colors.textSecondary}
            multiline
            style={{
              minHeight: 88,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: Theme.corners.comfortable,
              padding: Theme.spacing.sm,
              color: colors.text,
              backgroundColor: Theme.colors.silk,
              textAlignVertical: 'top',>
            }}
          /          ><HStack sx={{ gap: Theme.spacing.xs, flexWrap: 'wrap' }}            {(['noted', 'escalated', 'resolved'] as const).map((status) => (
              <TouchableOpacity key={status} onPress={() => setFollowUpStatus(status)} activeOpacity={0.85}                <Box
                  sx={{
                    paddingHorizontal: Theme.spacing.md,
                    paddingVertical: Theme.spacing.xs,
                    borderRadius: Theme.corners.full,
                    backgroundColor: followUpStatus === status ? Theme.colors.gurudeviBlue : Theme.colors.silk,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                                  <Text sx={{ fontSize: 11, fontWeight: '700', color: followUpStatus === status ? Theme.colors.sacredWhite : colors.textSecondary }}                    {status}
                  </Text                </Box              </TouchableOpacity            ))}>
          </HStack          ><HStack sx={{ gap: Theme.spacing.sm }}            <TouchableOpacity onPress={() => {
              setFollowUpTarget(null);
              setFollowUpContent('');
              setFollowUpStatus('noted');
            }} activeOpacity={0.85}              <Box
                sx={{
                  paddingHorizontal: Theme.spacing.md,
                  paddingVertical: Theme.spacing.sm,
                  borderRadius: Theme.corners.full,
                  backgroundColor: Theme.colors.silk,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                              <Text sx={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary }}>Cancel</Text              ></Box            </TouchableOpacity            <TouchableOpacity onPress={handleSaveFollowUp} activeOpacity={0.85} disabled={savingFollowUp}              <Box
                sx={{
                  paddingHorizontal: Theme.spacing.md,
                  paddingVertical: Theme.spacing.sm,
                  borderRadius: Theme.corners.full,
                  backgroundColor: Theme.colors.sanctuarySaffron,
                  opacity: savingFollowUp ? 0.65 : 1,
                }}
                              <Text sx={{ fontSize: 12, fontWeight: '700', color: Theme.colors.sacredWhite }}                  {savingFollowUp ? 'Saving...' : 'Save follow-up'}
                </Text              </Box            </TouchableOpacity          </HStack        </Box      ) : null}>
    </VStack  >);
}
