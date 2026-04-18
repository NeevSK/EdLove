import React, { useEffect, useMemo, useState } from 'react';
import { TouchableOpacity, TextInput } from 'react-native';
import { api, useTemporalStore, type PrincipalGovernanceEventZod } from '@repo/core';
import { Box, HStack, Text, VStack, useTheme, Theme } from '@repo/ui';

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

  const infoColor = Theme.colors.gurudeviBlue;
  const errorColor = Theme.colors.error;
  const warningColor = Theme.colors.warning;

  return (
    <VStack style={{ gap: Theme.spacing.sm }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text.primary }}>
        Governance timeline
      </Text>
      <Text style={{ fontSize: 12, color: theme.text.secondary, lineHeight: 18 }}>
        Official institutional events for invites and principal observations as of {viewDate}.
      </Text>

      {!isLoading && !error && observationSnapshot.length > 0 && (
        <Box
          style={{
            borderRadius: Theme.corners.comfortable,
            padding: Theme.spacing.md,
            backgroundColor: theme.scene.canvas.bg,
            borderWidth: 1,
            borderColor: theme.scene.canvas.border,
            gap: Theme.spacing.sm
          }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text.primary }}>
            Active governance snapshot
          </Text>
          <Text style={{ fontSize: 12, color: theme.text.secondary, lineHeight: 18 }}>
            Latest official observation state as of {viewDate}. This is the current institutional surface, not the full history.
          </Text>
          {observationSnapshot.map((event) => (
            <Box
              key={`snapshot-${event.id}`}
              style={{
                borderRadius: Theme.corners.comfortable,
                padding: Theme.spacing.sm,
                backgroundColor: theme.scene.surface.bg,
                borderWidth: 1,
                borderColor: theme.scene.surface.border,
                gap: Theme.spacing.xs
              }}>
              <HStack style={{ justifyContent: 'space-between', alignItems: 'center', gap: Theme.spacing.sm }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.primary }}>
                  Observation {event.entity_id}
                </Text>
                <Text style={{ fontSize: 11, color: infoColor, fontWeight: '700' }}>
                  {EVENT_LABELS[event.event_type] || event.event_type}
                </Text>
              </HStack>
              <Text style={{ fontSize: 12, color: theme.text.secondary, lineHeight: 18 }}>
                {(event.snapshot?.content as string) || 'Official observation state is available.'}
              </Text>
              <TouchableOpacity onPress={() => setFollowUpTarget(event.entity_id)} activeOpacity={0.85}>
                <Box
                  style={{
                    alignSelf: 'flex-start',
                    marginTop: Theme.spacing.xs,
                    paddingHorizontal: Theme.spacing.md,
                    paddingVertical: Theme.spacing.xs,
                    borderRadius: Theme.corners.full,
                    backgroundColor: `${infoColor}18`,
                    borderWidth: 1,
                    borderColor: theme.scene.surface.border
                  }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: infoColor }}>
                    Add follow-up
                  </Text>
                </Box>
              </TouchableOpacity>
            </Box>
          ))}
        </Box>
      )}

      {isLoading && (
        <Box
          style={{
            borderRadius: Theme.corners.comfortable,
            padding: Theme.spacing.md,
            backgroundColor: theme.scene.canvas.bg,
            borderWidth: 1,
            borderColor: theme.scene.canvas.border
          }}>
          <Text style={{ color: theme.text.secondary }}>Loading governance history...</Text>
        </Box>
      )}

      {!isLoading && error && (
        <Box
          style={{
            borderRadius: Theme.corners.comfortable,
            padding: Theme.spacing.md,
            backgroundColor: errorColor + '10',
            borderWidth: 1,
            borderColor: errorColor
          }}>
          <Text style={{ color: theme.text.primary }}>{error}</Text>
        </Box>
      )}

      {!isLoading && !error && events.length === 0 && (
        <Box
          style={{
            borderRadius: Theme.corners.comfortable,
            padding: Theme.spacing.md,
            backgroundColor: theme.scene.canvas.bg,
            borderWidth: 1,
            borderColor: theme.scene.canvas.border
          }}>
          <Text style={{ color: theme.text.secondary }}>
            No official governance events are recorded for this view yet.
          </Text>
        </Box>
      )}

      {!isLoading && !error && events.length > 0 && events.map((event) => (
        <Box
          key={event.id}
          style={{
            borderRadius: Theme.corners.comfortable,
            padding: Theme.spacing.md,
            backgroundColor: theme.scene.canvas.bg,
            borderWidth: 1,
            borderColor: theme.scene.canvas.border
          }}>
          <VStack style={{ gap: Theme.spacing.xs }}>
            <HStack style={{ justifyContent: 'space-between', alignItems: 'center', gap: Theme.spacing.sm }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text.primary }}>
                {ENTITY_LABELS[event.entity_type] || event.entity_type} {EVENT_LABELS[event.event_type] || event.event_type}
              </Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: infoColor }}>
                {event.entity_type === 'school_invite' ? 'Invite' : 'Official'}
              </Text>
            </HStack>
            <Text style={{ fontSize: 12, color: theme.text.secondary, lineHeight: 18 }}>
              {formatWhen(event.occurred_at)}
            </Text>
            <Text style={{ fontSize: 12, color: theme.text.secondary, lineHeight: 18 }}>
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
        <Box
          style={{
            borderRadius: Theme.corners.comfortable,
            padding: Theme.spacing.md,
            backgroundColor: theme.scene.surface.bg,
            borderWidth: 1,
            borderColor: theme.scene.surface.border,
            gap: Theme.spacing.sm
          }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text.primary }}>
            Follow up on observation {followUpTarget}
          </Text>
          <TextInput
            value={followUpContent}
            onChangeText={setFollowUpContent}
            placeholder="Record the next official step, decision, or resolution..."
            placeholderTextColor={theme.text.secondary}
            multiline
            style={{
              minHeight: 88,
              borderWidth: 1,
              borderColor: theme.scene.surface.border,
              borderRadius: Theme.corners.comfortable,
              padding: Theme.spacing.sm,
              color: theme.text.primary,
              backgroundColor: theme.scene.canvas.bg,
              textAlignVertical: 'top'
            }}
          />
          <HStack style={{ gap: Theme.spacing.xs, flexWrap: 'wrap' }}>
            {(['noted', 'escalated', 'resolved'] as const).map((status) => (
              <TouchableOpacity key={status} onPress={() => setFollowUpStatus(status)} activeOpacity={0.85}>
                <Box
                  style={{
                    paddingHorizontal: Theme.spacing.md,
                    paddingVertical: Theme.spacing.xs,
                    borderRadius: Theme.corners.full,
                    backgroundColor: followUpStatus === status ? infoColor : theme.scene.canvas.bg,
                    borderWidth: 1,
                    borderColor: theme.scene.surface.border
                  }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: followUpStatus === status ? '#FFFFFF' : theme.text.secondary }}>
                    {status}
                  </Text>
                </Box>
              </TouchableOpacity>
            ))}
          </HStack>
          <HStack style={{ gap: Theme.spacing.sm }}>
            <TouchableOpacity
              onPress={() => {
                setFollowUpTarget(null);
                setFollowUpContent('');
                setFollowUpStatus('noted');
              }}
              activeOpacity={0.85}>
              <Box
                style={{
                  paddingHorizontal: Theme.spacing.md,
                  paddingVertical: Theme.spacing.sm,
                  borderRadius: Theme.corners.full,
                  backgroundColor: theme.scene.canvas.bg,
                  borderWidth: 1,
                  borderColor: theme.scene.surface.border
                }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.secondary }}>Cancel</Text>
              </Box>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSaveFollowUp} activeOpacity={0.85} disabled={savingFollowUp}>
              <Box
                style={{
                  paddingHorizontal: Theme.spacing.md,
                  paddingVertical: Theme.spacing.sm,
                  borderRadius: Theme.corners.full,
                  backgroundColor: warningColor,
                  opacity: savingFollowUp ? 0.65 : 1
                }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFFFFF' }}>
                  {savingFollowUp ? 'Saving...' : 'Save follow-up'}
                </Text>
              </Box>
            </TouchableOpacity>
          </HStack>
        </Box>
      )}
    </VStack>
  );
}
