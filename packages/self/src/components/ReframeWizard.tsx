/**
 * REFRAME WIZARD
 * A guided thought record: notice the automatic thought, name the feeling,
 * spot the thinking trap, weigh evidence, and write a balanced reframe. The
 * pre/post mood delta gives an honest measure of whether the reframe moved the
 * feeling. Clean-room pattern (inspiration: classic CBT thought-record practice
 * - see docs/decisions/2026-08-27-gpl-reference-project-clean-room-strategy.md).
 */

import { usePermissions } from '@repo/core/logic';
import { deriveReframeOutcome, isFollowUpDue } from '@repo/core/logic/reflection';
import { TRAP_CATALOG } from '@repo/self/constants/trapCatalog';
import { useThoughtRecords } from '@repo/self/hooks/useThoughtRecords';
import type {
  ReframeOutcome,
  ReframeStepId,
  ThinkingTrap,
  ThoughtEmotion,
  ThoughtRecord,
} from '@repo/self/types';
import PositiveInvitation from '@repo/ui/components/PositiveInvitation';
import { SkeletonCard } from '@repo/ui/components/SkeletonLoader';
import { ArrowRight, Brain, Check } from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Icon,
  Input,
  InputField,
  Pressable,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { hapticLight, hapticMedium } from '@repo/ui/utils/haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const STEPS: ReframeStepId[] = [
  'checkup',
  'thought',
  'feeling',
  'traps',
  'evidence',
  'reframe',
  'recheck',
];

const EMOTIONS: { id: ThoughtEmotion; emoji: string }[] = [
  { id: 'anxious', emoji: '😟' },
  { id: 'overwhelmed', emoji: '🌀' },
  { id: 'frustrated', emoji: '😤' },
  { id: 'angry', emoji: '😠' },
  { id: 'sad', emoji: '😢' },
  { id: 'guilty', emoji: '😔' },
  { id: 'focused', emoji: '🎯' },
  { id: 'calm', emoji: '😌' },
  { id: 'relaxed', emoji: '🌿' },
  { id: 'happy', emoji: '😊' },
];

const MOOD_LABEL_KEYS = [
  'reframe.moodHeavy',
  'reframe.moodLow',
  'reframe.moodNeutral',
  'reframe.moodGood',
  'reframe.moodRadiant',
];

const MOOD_EMOJI = ['🌧️', '☁️', '🌤️', '☀️', '🌟'];

function newRecordId(): string {
  return `thought_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function addHours(hours: number): string {
  return new Date(Date.now() + hours * 3600_000).toISOString();
}

function MoodPicker({
  value,
  onChange,
  prompt,
}: {
  value: number;
  onChange: (mood: number) => void;
  prompt: string;
}) {
  const { t } = useTranslation();
  return (
    <VStack className="gap-md">
      <Text className="text-mistGray text-sm">{prompt}</Text>
      <HStack className="justify-between gap-1">
        {[1, 2, 3, 4, 5].map((level) => {
          const selected = value === level;
          return (
            <Pressable
              key={level}
              onPress={() => {
                hapticLight();
                onChange(level);
              }}
              className={`flex-1 items-center rounded-2xl border px-1 py-md transition-all ${
                selected
                  ? 'bg-sanctuarySaffron/15 border-sanctuarySaffron'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <Text className={`text-xl ${selected ? '' : 'opacity-60'}`}>
                {MOOD_EMOJI[level - 1]}
              </Text>
              <Text
                className={`mt-1 text-[10px] font-semibold uppercase tracking-wider ${
                  selected ? 'text-sanctuarySaffron' : 'text-mistGray'
                }`}
              >
                {t(MOOD_LABEL_KEYS[level - 1] ?? 'reframe.moodNeutral')}
              </Text>
            </Pressable>
          );
        })}
      </HStack>
    </VStack>
  );
}

function TrapChip({
  trap,
  selected,
  onToggle,
  compact,
}: {
  trap: ThinkingTrap;
  selected: boolean;
  onToggle: () => void;
  compact?: boolean;
}) {
  return (
    <Pressable
      onPress={() => {
        hapticLight();
        onToggle();
      }}
      className={`rounded-2xl border px-md py-sm transition-all ${
        selected ? 'bg-sanctuarySaffron/15 border-sanctuarySaffron' : 'bg-white/5 border-white/10'
      }`}
    >
      <Text className={`text-sm ${selected ? 'text-sacredWhite font-semibold' : 'text-mistGray'}`}>
        {trap.emoji} {trap.label}
      </Text>
      {selected && !compact && (
        <Text className="mt-1 text-[11px] text-mistGray/80 leading-snug">
          {trap.challengePrompt}
        </Text>
      )}
    </Pressable>
  );
}

interface ReframeWizardPersistence {
  records: ThoughtRecord[];
  isLoading: boolean;
  isAnonymous: boolean;
  addThoughtRecord: (record: ThoughtRecord) => Promise<ThoughtRecord>;
  completeFollowUp: (
    id: string,
    input: { outcome: ReframeOutcome; reflection?: string },
  ) => Promise<void>;
}

export default function ReframeWizard({
  userId,
  persistence,
}: {
  userId?: string;
  persistence?: ReframeWizardPersistence;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const { context } = usePermissions();
  const activeUserId = userId || context.userId;
  const { records, isLoading, isAnonymous, addThoughtRecord, completeFollowUp } =
    persistence ?? useThoughtRecords(activeUserId ?? undefined);

  const [stepIndex, setStepIndex] = useState(0);
  const [preMood, setPreMood] = useState(3);
  const [preNote, setPreNote] = useState('');
  const [automaticThought, setAutomaticThought] = useState('');
  const [emotion, setEmotion] = useState<ThoughtEmotion>('anxious');
  const [intensity, setIntensity] = useState(6);
  const [trapIds, setTrapIds] = useState<string[]>([]);
  const [customTrap, setCustomTrap] = useState('');
  const [forThought, setForThought] = useState('');
  const [againstThought, setAgainstThought] = useState('');
  const [reframedThought, setReframedThought] = useState('');
  const [postMood, setPostMood] = useState(3);
  const [scheduledHours, setScheduledHours] = useState(24);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedRecord, setSavedRecord] = useState<ThoughtRecord | null>(null);

  const step = STEPS[stepIndex] ?? 'checkup';
  const isLastStep = stepIndex === STEPS.length - 1;
  const canAdvance =
    step === 'thought'
      ? automaticThought.trim().length > 0
      : step === 'traps'
        ? trapIds.length > 0 || customTrap.trim().length > 0
        : step === 'evidence'
          ? forThought.trim().length > 0 && againstThought.trim().length > 0
          : step === 'reframe'
            ? reframedThought.trim().length > 0
            : true;

  const toggleTrap = (id: string) => {
    setTrapIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleFinish = async () => {
    if (isSaving) return;
    setSaveError(null);
    setIsSaving(true);
    try {
      const record: ThoughtRecord = {
        id: newRecordId(),
        userId: activeUserId ?? '',
        preMood,
        preNote: preNote.trim() || undefined,
        automaticThought: automaticThought.trim(),
        emotion,
        intensity,
        trapIds,
        customTrap: customTrap.trim() || undefined,
        evidence: {
          forThought: forThought.trim(),
          againstThought: againstThought.trim(),
        },
        reframedThought: reframedThought.trim(),
        postMood,
        postOutcome: deriveReframeOutcome(preMood, postMood),
        followUp: { dueAt: addHours(scheduledHours) },
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };
      const saved = await addThoughtRecord(record);
      hapticMedium();
      setSavedRecord(saved);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : t('reframe.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSavedRecord(null);
    setStepIndex(0);
    setPreMood(3);
    setPreNote('');
    setAutomaticThought('');
    setEmotion('anxious');
    setIntensity(6);
    setTrapIds([]);
    setCustomTrap('');
    setForThought('');
    setAgainstThought('');
    setReframedThought('');
    setPostMood(3);
    setScheduledHours(24);
    setSaveError(null);
  };

  if (isLoading) {
    return (
      <VStack className="p-lg gap-lg">
        <SkeletonCard height={40} />
        <SkeletonCard height={240} />
      </VStack>
    );
  }

  if (isAnonymous) {
    return <PositiveInvitation type="anonymous" onAction={() => router.push('/auth')} />;
  }

  const dueFollowUps = records.filter(isFollowUpDue).slice(0, 3);

  return (
    <VStack className="p-lg gap-lg">
      <VStack className="gap-1">
        <Heading className="text-sacredWhite" size="lg">
          {t('reframe.title')}
        </Heading>
        <Text className="text-mistGray text-sm">{t('reframe.subtitle')}</Text>
      </VStack>

      {savedRecord ? (
        <VStack className="gap-lg">
          <Box className="bg-emeraldGreen/10 rounded-comfortable p-lg border border-emeraldGreen/20 items-center gap-md">
            <Icon as={Check} className="text-emeraldGreen" size={28} />
            <Text className="text-sacredWhite font-semibold text-center">
              {t('reframe.savedTitle')}
            </Text>
            <HStack className="gap-lg">
              <VStack className="items-center">
                <Text className="text-[10px] uppercase tracking-widest text-mistGray">
                  {t('reframe.savedBefore')}
                </Text>
                <Text className="text-sacredWhite text-lg font-bold">{preMood}/5</Text>
              </VStack>
              <VStack className="items-center">
                <Text className="text-[10px] uppercase tracking-widest text-mistGray">
                  {t('reframe.savedAfter')}
                </Text>
                <Text className="text-sacredWhite text-lg font-bold">{postMood}/5</Text>
              </VStack>
              <VStack className="items-center">
                <Text className="text-[10px] uppercase tracking-widest text-mistGray">
                  {t('reframe.savedShift')}
                </Text>
                <Text className="text-sanctuarySaffron text-lg font-bold capitalize">
                  {t(`reframe.outcome.${savedRecord.postOutcome}`)}
                </Text>
              </VStack>
            </HStack>
            <Text className="text-mistGray text-sm text-center italic">
              {savedRecord.reframedThought}
            </Text>
            <Text className="text-sanctuarySaffron text-xs">
              {t('reframe.savedRecheckDue', { hours: scheduledHours })}
            </Text>
          </Box>
          <Button onPress={handleReset} className="rounded-full bg-white/5 border border-white/10">
            <ButtonText className="text-mistGray">{t('reframe.startAnother')}</ButtonText>
          </Button>
        </VStack>
      ) : (
        <VStack className="gap-lg">
          <HStack className="justify-between items-center">
            {STEPS.map((s, index) => (
              <Box
                key={s}
                className={`h-1.5 flex-1 mx-0.5 rounded-full ${
                  index <= stepIndex ? 'bg-sanctuarySaffron' : 'bg-white/10'
                }`}
              />
            ))}
          </HStack>

          {saveError && (
            <Box className="bg-emberRed/10 rounded-comfortable p-md border border-emberRed/20">
              <Text className="text-emberRed text-center text-sm">{saveError}</Text>
            </Box>
          )}

          {step === 'checkup' && (
            <VStack className="gap-lg">
              <MoodPicker
                value={preMood}
                onChange={setPreMood}
                prompt={t('reframe.checkupPrompt')}
              />
              <Input className="border-0">
                <InputField
                  placeholder={t('reframe.preNotePlaceholder')}
                  value={preNote}
                  onChangeText={setPreNote}
                  className="text-sacredWhite"
                  placeholderTextColor="#6A6358"
                  maxLength={160}
                />
              </Input>
            </VStack>
          )}

          {step === 'thought' && (
            <VStack className="gap-sm">
              <Text className="text-mistGray text-sm">{t('reframe.thoughtPrompt')}</Text>
              <Box className="bg-obsidian rounded-comfortable p-md">
                <Input className="border-0" isDisabled={isSaving}>
                  <InputField
                    placeholder={t('reframe.thoughtPlaceholder')}
                    value={automaticThought}
                    onChangeText={setAutomaticThought}
                    multiline
                    className="text-sacredWhite text-lg min-h-[140px] leading-relaxed"
                    placeholderTextColor="#6A6358"
                    textAlignVertical="top"
                  />
                </Input>
              </Box>
            </VStack>
          )}

          {step === 'feeling' && (
            <VStack className="gap-lg">
              <VStack className="gap-sm">
                <Text className="text-mistGray text-sm">{t('reframe.feelingPrompt')}</Text>
                <VStack className="gap-sm">
                  {EMOTIONS.map((option) => {
                    const selected = emotion === option.id;
                    return (
                      <Pressable
                        key={option.id}
                        onPress={() => {
                          hapticLight();
                          setEmotion(option.id);
                        }}
                        className={`rounded-2xl border px-lg py-sm transition-all ${
                          selected
                            ? 'bg-sanctuarySaffron/15 border-sanctuarySaffron'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <Text
                          className={selected ? 'text-sacredWhite font-semibold' : 'text-mistGray'}
                        >
                          {option.emoji} {t(`reframe.emotion.${option.id}`)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </VStack>
              </VStack>
              <VStack className="gap-sm">
                <Text className="text-mistGray text-sm">{t('reframe.intensityPrompt')}</Text>
                <HStack className="justify-between gap-1">
                  {[2, 4, 6, 8, 10].map((level) => {
                    const selected = intensity === level;
                    return (
                      <Pressable
                        key={level}
                        onPress={() => {
                          hapticLight();
                          setIntensity(level);
                        }}
                        className={`flex-1 items-center rounded-full border py-sm transition-all ${
                          selected
                            ? 'bg-sanctuarySaffron/15 border-sanctuarySaffron'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <Text
                          className={selected ? 'text-sanctuarySaffron font-bold' : 'text-mistGray'}
                        >
                          {level}
                        </Text>
                      </Pressable>
                    );
                  })}
                </HStack>
              </VStack>
            </VStack>
          )}

          {step === 'traps' && (
            <VStack className="gap-md">
              <Text className="text-mistGray text-sm">{t('reframe.trapsPrompt')}</Text>
              <Text className="text-[10px] uppercase tracking-widest text-mistGray">
                {t('reframe.trapsGeneral')}
              </Text>
              {TRAP_CATALOG.filter((trap) => trap.slope === 'general').map((trap) => (
                <TrapChip
                  key={trap.id}
                  trap={trap}
                  selected={trapIds.includes(trap.id)}
                  onToggle={() => toggleTrap(trap.id)}
                />
              ))}
              <Text className="text-[10px] uppercase tracking-widest text-mistGray">
                {t('reframe.trapsLearning')}
              </Text>
              {TRAP_CATALOG.filter((trap) => trap.slope === 'learning').map((trap) => (
                <TrapChip
                  key={trap.id}
                  trap={trap}
                  selected={trapIds.includes(trap.id)}
                  onToggle={() => toggleTrap(trap.id)}
                />
              ))}
              <Input className="border-0">
                <InputField
                  placeholder={t('reframe.customTrapPlaceholder')}
                  value={customTrap}
                  onChangeText={setCustomTrap}
                  className="text-sacredWhite"
                  placeholderTextColor="#6A6358"
                  maxLength={80}
                />
              </Input>
            </VStack>
          )}

          {step === 'evidence' && (
            <VStack className="gap-md">
              <Text className="text-mistGray text-sm">{t('reframe.evidenceForPrompt')}</Text>
              <Box className="bg-obsidian rounded-comfortable p-md">
                <Input className="border-0">
                  <InputField
                    placeholder={t('reframe.evidenceForPlaceholder')}
                    value={forThought}
                    onChangeText={setForThought}
                    multiline
                    className="text-sacredWhite min-h-[110px] leading-relaxed"
                    placeholderTextColor="#6A6358"
                    textAlignVertical="top"
                  />
                </Input>
              </Box>
              <Text className="text-mistGray text-sm">{t('reframe.evidenceAgainstPrompt')}</Text>
              <Box className="bg-obsidian rounded-comfortable p-md">
                <Input className="border-0">
                  <InputField
                    placeholder={t('reframe.evidenceAgainstPlaceholder')}
                    value={againstThought}
                    onChangeText={setAgainstThought}
                    multiline
                    className="text-sacredWhite min-h-[110px] leading-relaxed"
                    placeholderTextColor="#6A6358"
                    textAlignVertical="top"
                  />
                </Input>
              </Box>
            </VStack>
          )}

          {step === 'reframe' && (
            <VStack className="gap-sm">
              <Text className="text-mistGray text-sm">{t('reframe.reframePrompt')}</Text>
              <Box className="bg-obsidian rounded-comfortable p-md">
                <Input className="border-0">
                  <InputField
                    placeholder={t('reframe.reframePlaceholder')}
                    value={reframedThought}
                    onChangeText={setReframedThought}
                    multiline
                    className="text-sacredWhite text-lg min-h-[140px] leading-relaxed"
                    placeholderTextColor="#6A6358"
                    textAlignVertical="top"
                  />
                </Input>
              </Box>
            </VStack>
          )}

          {step === 'recheck' && (
            <VStack className="gap-lg">
              <Text className="text-mistGray text-sm">{t('reframe.recheckPrompt')}</Text>
              <MoodPicker
                value={postMood}
                onChange={setPostMood}
                prompt={t('reframe.postMoodPrompt')}
              />
              <VStack className="gap-sm">
                <Text className="text-[11px] uppercase tracking-widest text-mistGray">
                  {t('reframe.recheckIn')}
                </Text>
                <HStack className="gap-sm">
                  {[
                    { label: t('reframe.hours6'), hours: 6 },
                    { label: t('reframe.hours24'), hours: 24 },
                    { label: t('reframe.hours72'), hours: 72 },
                  ].map((option) => {
                    const selected = scheduledHours === option.hours;
                    return (
                      <Pressable
                        key={option.hours}
                        onPress={() => {
                          hapticLight();
                          setScheduledHours(option.hours);
                        }}
                        className={`flex-1 rounded-full border items-center py-sm ${
                          selected
                            ? 'bg-sanctuarySaffron/15 border-sanctuarySaffron'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <Text
                          className={
                            selected
                              ? 'text-sanctuarySaffron font-semibold text-xs'
                              : 'text-mistGray text-xs'
                          }
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </HStack>
              </VStack>
            </VStack>
          )}

          <HStack className="justify-between items-center">
            {stepIndex > 0 && (
              <Button
                size="md"
                onPress={() => {
                  hapticLight();
                  setStepIndex((i) => Math.max(0, i - 1));
                }}
                isDisabled={isSaving}
                className="rounded-full bg-white/5 border border-white/10"
              >
                <ButtonText className="text-mistGray">{t('reframe.back')}</ButtonText>
              </Button>
            )}
            {isLastStep ? (
              <Button
                size="md"
                onPress={handleFinish}
                isDisabled={isSaving}
                className={`rounded-full px-xl ${isSaving ? 'bg-white/10' : 'bg-sanctuarySaffron'}`}
              >
                <ButtonText className="text-white font-bold">
                  {isSaving ? t('reframe.saving') : t('reframe.save')}
                </ButtonText>
              </Button>
            ) : (
              <Button
                size="md"
                onPress={() => {
                  hapticLight();
                  setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
                }}
                isDisabled={!canAdvance}
                className={`rounded-full px-xl flex-row items-center gap-sm ${
                  canAdvance ? 'bg-sanctuarySaffron' : 'bg-white/10'
                }`}
              >
                <ButtonText className="text-white font-bold">{t('reframe.next')}</ButtonText>
                <Icon as={ArrowRight} className="text-white" size={16} />
              </Button>
            )}
          </HStack>
        </VStack>
      )}

      {dueFollowUps.length > 0 && (
        <VStack className="gap-md">
          <HStack className="items-center gap-2">
            <Icon as={Brain} className="text-sanctuarySaffron" size={16} />
            <Text className="text-[11px] uppercase tracking-widest text-mistGray">
              {t('reframe.dueTitle')}
            </Text>
          </HStack>
          {dueFollowUps.map((record) => (
            <Box
              key={record.id}
              className="bg-obsidian rounded-comfortable p-md border border-white/5 gap-sm"
            >
              <Text className="text-sacredWhite text-sm font-semibold" numberOfLines={2}>
                {record.automaticThought}
              </Text>
              <Text className="text-mistGray text-xs italic" numberOfLines={2}>
                {record.reframedThought}
              </Text>
              <HStack className="gap-sm justify-end">
                {(['worse', 'same', 'better'] as ReframeOutcome[]).map((outcome) => (
                  <Pressable
                    key={outcome}
                    onPress={async () => {
                      hapticLight();
                      await completeFollowUp(record.id, { outcome });
                    }}
                    className={`rounded-full border px-md py-sm ${
                      outcome === 'better'
                        ? 'bg-emeraldGreen/10 border-emeraldGreen/30'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <Text className="text-xs text-mistGray capitalize">
                      {t(`reframe.outcome.${outcome}`)}
                    </Text>
                  </Pressable>
                ))}
              </HStack>
            </Box>
          ))}
        </VStack>
      )}
    </VStack>
  );
}
