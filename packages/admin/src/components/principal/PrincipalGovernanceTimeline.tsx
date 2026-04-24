import React, { useEffect, useMemo, useState } from 'react';
import { api, useTemporalStore, type PrincipalGovernanceEventZod } from '@repo/core';
import { 
    Box, 
    HStack, 
    Text, 
    VStack, 
    Input, 
    InputField, 
    Pressable,
    Icon,
    hapticLight,
    Heading,
    Spinner
} from '@repo/ui';
import { ShieldCheck, History, Plus, FileText, Activity, Clock } from 'lucide-react-native';

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
  approve: 'Authorization'
};

const ENTITY_LABELS: Record<string, string> = {
  principal_observation: 'Observation',
  school_invite: 'Identity Key'
};

function formatWhen(timestamp: string) {
  try {
    return new Date(timestamp).toLocaleString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
  } catch {
    return timestamp;
  }
}

export default function PrincipalGovernanceTimeline({
  schoolId,
  principalId,
  limit = 6
}: PrincipalGovernanceTimelineProps) {
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
      hapticLight();
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

      {!isLoading && !error && observationSnapshot.length > 0 && (
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
                onPress={() => { hapticLight(); setFollowUpTarget(event.entity_id); }}
                className="bg-phase-interactive flex-row items-center justify-center gap-2 mt-2 py-3 rounded-[18px] shadow-sm active:scale-95 transition-all"
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

      {isLoading && (
        <Box className="rounded-[32px] p-12 bg-phase-canvas border border-phase-border items-center justify-center">
            <Spinner className="text-phase-interactive" />
        </Box>
      )}

      {!isLoading && error && (
        <Box className="rounded-[24px] p-5 border border-phase-danger/30 bg-phase-danger/5">
          <Text className="text-[13px] text-phase-danger font-black tracking-tight">{error}</Text>
        </Box>
      )}

      {!isLoading && !error && events.length === 0 && (
        <Box className="rounded-[32px] p-12 bg-phase-canvas border border-dashed border-phase-border items-center justify-center opacity-60">
              <Icon as={History} size="md" className="text-phaseText-muted mb-4 opacity-20" />
              <Text className="text-[11px] font-bold text-phaseText-muted uppercase tracking-[3px] text-center">
                Institutional Memory Blank
              </Text>
        </Box>
      )}

      <VStack className="gap-4">
        {!isLoading && !error && events.length > 0 && events.map((event) => (
            <Box key={event.id} className="rounded-[24px] p-5 bg-phase-surface border border-phase-border shadow-sm border-l-4 border-l-phase-interactive/30">
            <VStack className="gap-4">
                <HStack className="justify-between items-center gap-2">
                    <HStack className="gap-2 items-center">
                        <Icon as={Activity} size="xs" className="text-phase-interactive opacity-40" />
                        <Text className="text-[12px] font-black text-phaseText-primary uppercase tracking-widest">
                            {ENTITY_LABELS[event.entity_type] || event.entity_type} {EVENT_LABELS[event.event_type] || event.event_type}
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
                    ? `Protocol escalation for Obs ${event.entity_id.substring(0,6)}: ${(event.snapshot?.content as string) || 'Authorized updates'}.`
                    : `Observation ${event.entity_id.substring(0,6)} committed to official institutional record.`}
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

      {followUpTarget && (
        <Box className="rounded-[40px] p-2 bg-phase-interactive shadow-2xl mt-4">
            <Box className="p-6 bg-phase-surface rounded-[38px] border border-dashed border-phase-interactive/20 gap-6">
                <VStack className="gap-1.5">
                    <Text className="text-[16px] font-black text-phaseText-primary uppercase tracking-wider">
                        Commit Protocol
                    </Text>
                    <Text className="text-[11px] font-bold text-phaseText-muted uppercase tracking-[2px]">Escalation & Resolution</Text>
                </VStack>

                <Input className="min-h-[140px] bg-phase-canvas border-phase-border rounded-[24px] p-5 shadow-inner">
                    <InputField
                        value={followUpContent}
                        onChangeText={setFollowUpContent}
                        placeholder="Record official protocol step..."
                        placeholderTextColor="rgba(0,0,0,0.3)"
                        multiline
                        textAlignVertical="top"
                        className="text-[15px] font-bold text-phaseText-primary"
                    />
                </Input>

                <HStack className="gap-2.5 flex-wrap">
                    {(['noted', 'escalated', 'resolved'] as const).map((status) => {
                    const isActive = followUpStatus === status;
                    return (
                        <Pressable key={status} onPress={() => { hapticLight(); setFollowUpStatus(status); }}>
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
                            setFollowUpTarget(null);
                            setFollowUpContent('');
                            setFollowUpStatus('noted');
                        }}
                        className="flex-1"
                    >
                        <Box className="h-14 rounded-[20px] bg-phase-canvas border border-phase-border items-center justify-center active:scale-95 transition-all">
                            <Text className="text-[11px] font-black text-phaseText-secondary uppercase tracking-widest">Abort</Text>
                        </Box>
                    </Pressable>
                    <Pressable
                        onPress={() => { hapticLight(); handleSaveFollowUp(); }}
                        disabled={savingFollowUp || !followUpContent.trim()}
                        className="flex-[1.5]"
                    >
                        <Box className={`h-14 rounded-[20px] items-center justify-center bg-phase-interactive shadow-md active:scale-95 transition-all ${savingFollowUp || !followUpContent.trim() ? 'opacity-50' : ''}`}>
                            <HStack className="gap-2 items-center">
                                {savingFollowUp && <Spinner size="small" color="#FFFFFF" />}
                                <Text className="text-[11px] font-black text-white uppercase tracking-widest">
                                    {savingFollowUp ? 'Committing...' : 'Confirm Protocol'}
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
