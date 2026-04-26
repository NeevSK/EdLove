import {
  Box,
  Button,
  ButtonIcon,
  ButtonText,
  Heading,
  HStack,
  hapticLight,
  hapticMedium,
  hapticSuccess,
  Icon,
  LotusDropdown,
  Pressable,
  ScrollView,
  SkeletonCard,
  Text,
  Textarea,
  TextareaInput,
  VStack,
} from '@repo/ui';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, ArrowLeft, Footprints, Medal, Plus, StickyNote } from 'lucide-react-native';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { observationsAPI, type PrincipalObservation } from '../../observations';

interface LogbookDashboardProps {
  userId: string;
  schoolId: string;
  viewDate: string;
  isPastView: boolean;
  onBack: () => void;
}

export const LogbookDashboard: React.FC<LogbookDashboardProps> = ({
  userId,
  schoolId,
  viewDate,
  isPastView,
  onBack,
}) => {
  const [content, setContent] = useState('');
  const [type, setType] = useState('note');
  const [observations, setObservations] = useState<PrincipalObservation[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadObservations = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await observationsAPI.listByDate(userId, viewDate, 10);
      setObservations(data || []);
    } catch (err) {
      console.error('Failed to load observations:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, viewDate]);

  useEffect(() => {
    loadObservations();
  }, [loadObservations]);

  const handleSaveObservation = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const data = await observationsAPI.create({
        principalId: userId,
        schoolId,
        type,
        content: content.trim(),
      });
      if (data) setObservations((prev) => [data, ...prev]);
      setContent('');
      hapticSuccess();
    } catch (err) {
      console.error('Failed to save observation:', err);
    } finally {
      setSaving(false);
    }
  };

  const typeOptions = [
    { label: 'General Note', value: 'note' },
    { label: 'Walkthrough', value: 'walkthrough' },
    { label: 'Concern', value: 'concern' },
    { label: 'Commendation', value: 'commendation' },
  ];

  const getTypeIcon = (t: string) => {
    switch (t) {
      case 'walkthrough':
        return <Icon as={Footprints} size="xs" />;
      case 'concern':
        return <Icon as={AlertTriangle} size="xs" />;
      case 'commendation':
        return <Icon as={Medal} size="xs" />;
      default:
        return <Icon as={StickyNote} size="xs" />;
    }
  };

  const getTypeConfig = (t: string) => {
    switch (t) {
      case 'concern':
        return {
          border: 'border-l-phase-danger',
          bg: 'bg-phase-danger/10',
          text: 'text-phase-danger',
        };
      case 'commendation':
        return {
          border: 'border-l-phase-success',
          bg: 'bg-phase-success/10',
          text: 'text-phase-success',
        };
      case 'walkthrough':
        return {
          border: 'border-l-phase-interactive',
          bg: 'bg-phase-interactive/10',
          text: 'text-phase-interactive',
        };
      default:
        return {
          border: 'border-l-phase-interactive',
          bg: 'bg-phase-canvas',
          text: 'text-phaseText-primary',
        };
    }
  };

  return (
    <ScrollView className="flex-1 bg-phase-canvas" showsVerticalScrollIndicator={false}>
      <VStack className="gap-8 p-5 pb-24">
        <Pressable
          onPress={() => {
            hapticLight();
            onBack();
          }}
        >
          <HStack className="items-center gap-2 bg-phase-surface self-start px-4 py-2.5 rounded-2xl border border-phase-border shadow-sm active:scale-95 transition-all">
            <Icon as={ArrowLeft} size="sm" className="text-phaseText-primary" />
            <Text className="text-[13px] font-black text-phaseText-primary uppercase tracking-widest">
              Back to Dashboard
            </Text>
          </HStack>
        </Pressable>

        <VStack className="gap-1.5 px-1">
          <Heading className="text-[30px] font-black text-phaseText-primary tracking-tight">
            Institutional Log
          </Heading>
          <Text className="text-[14px] font-medium text-phaseText-secondary leading-relaxed">
            Secure ledger for daily operational notes, faculty walkthroughs, and leadership
            insights.
          </Text>
        </VStack>

        <Box
          className={`bg-phase-surface p-7 rounded-[40px] border border-phase-border gap-6 shadow-sm ${isPastView ? 'opacity-50' : ''}`}
        >
          <Heading className="text-[11px] font-black uppercase tracking-[0.25em] text-phaseText-muted">
            Synchronize Entry
          </Heading>

          <LotusDropdown
            label="Log Type"
            options={typeOptions}
            value={type}
            onChange={(val: string) => {
              hapticLight();
              setType(val);
            }}
            isDisabled={isPastView}
          />

          <Textarea className="h-40 rounded-3xl bg-phase-canvas/50 border-phase-border transition-all active:border-phase-interactive">
            <TextareaInput
              className="text-[15px] font-medium text-phaseText-primary leading-relaxed"
              value={content}
              onChangeText={setContent}
              readOnly={isPastView}
              placeholder={
                isPastView ? 'Synchronized view is locked.' : 'Record leadership perspective...'
              }
              placeholderTextColor="#94a3b8"
            />
          </Textarea>

          <Button
            size="lg"
            onPress={() => {
              hapticMedium();
              handleSaveObservation();
            }}
            isDisabled={!content.trim() || saving || isPastView}
            className="bg-phase-interactive rounded-[20px] h-14 self-start px-10 shadow-md active:scale-95 transition-all"
          >
            {saving ? (
              <ButtonText className="text-white font-black uppercase tracking-widest text-[11px]">
                Archiving...
              </ButtonText>
            ) : (
              <HStack className="items-center gap-2.5">
                <ButtonIcon as={Plus} className="text-white" />
                <ButtonText className="text-white font-black uppercase tracking-widest text-[11px]">
                  Log Entry
                </ButtonText>
              </HStack>
            )}
          </Button>
        </Box>

        <VStack className="gap-4">
          {loading ? (
            <SkeletonCard height={120} className="rounded-3xl" />
          ) : observations.length === 0 ? (
            <Box className="p-16 items-center justify-center bg-phase-surface/50 rounded-[40px] border border-dashed border-phase-border">
              <Text className="text-phaseText-muted text-[13px] font-black uppercase tracking-widest">
                No Operational Records
              </Text>
            </Box>
          ) : (
            observations.map((o) => {
              const config = getTypeConfig(o.type);
              return (
                <Box
                  key={o.id}
                  className={`bg-phase-surface p-6 rounded-[28px] border-y border-r border-phase-border border-l-[6px] shadow-sm ${config.border}`}
                >
                  <HStack className="items-center gap-3 mb-3">
                    <Box
                      className={`px-3 py-1 rounded-lg border border-phase-border/20 ${config.bg}`}
                    >
                      <HStack className="items-center gap-2">
                        {getTypeIcon(o.type)}
                        <Text
                          className={`text-[10px] font-black uppercase tracking-widest ${config.text}`}
                        >
                          {o.type}
                        </Text>
                      </HStack>
                    </Box>
                    <Text className="text-[10px] text-phaseText-muted font-black uppercase tracking-[0.1em]">
                      {formatDistanceToNow(new Date(o.created_at), { addSuffix: true })}
                    </Text>
                  </HStack>
                  <Text className="text-[15px] leading-relaxed text-phaseText-primary font-medium">
                    {o.content}
                  </Text>
                </Box>
              );
            })
          )}
        </VStack>
      </VStack>
    </ScrollView>
  );
};

export type { LogbookDashboardProps };
