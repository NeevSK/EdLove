import { planBridgeAPI } from '@repo/core/api/planBridge';
import type { ModeLock, PlanSettings } from '@repo/core/api/planBridge.orpc.contract';
import { SanctuaryCard } from '@repo/ui/components/SanctuaryCard';
import { Check, Clock, Moon, ShieldCheck, Sun } from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonText,
  HStack,
  Icon,
  Input,
  InputField,
  Pressable,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { useToast } from '@repo/ui/providers';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import React, { useEffect, useState } from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface CalmPolicySectionProps {
  schoolId: string;
  principalId: string;
}

export default function CalmPolicySection({ schoolId, principalId }: CalmPolicySectionProps) {
  const toast = useToast();
  const [settings, setSettings] = useState<PlanSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Quiet Hours Form
  const [startTime, setStartTime] = useState('20:00');
  const [endTime, setEndTime] = useState('06:30');
  const [goodNightLock, setGoodNightLock] = useState<ModeLock>('suggested');

  // Rest Day Form
  const [restDayLock, setRestDayLock] = useState<ModeLock>('off');

  // Guardian Verification Policy Toggle
  const [guardianVerificationRequired, setGuardianVerificationRequired] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchSettings() {
      try {
        const data = await planBridgeAPI.getSettings();
        if (!mounted) return;
        setSettings(data);
        if (data.good_night.everyday) {
          setStartTime(data.good_night.everyday.start);
          setEndTime(data.good_night.everyday.end);
        }
        setGoodNightLock(data.good_night.lock);
        if (data.rest_day) {
          setRestDayLock(data.rest_day.lock);
        }
        setGuardianVerificationRequired(data.guardian_verification_required ?? false);
      } catch (err: any) {
        console.warn('Failed to load calm policies:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    fetchSettings();
    return () => {
      mounted = false;
    };
  }, [schoolId]);

  const handleSavePolicies = async () => {
    setIsSaving(true);
    try {
      hapticLight();
      // Update Good Night Quiet Hours
      const updated = await planBridgeAPI.updateModePolicy({
        modeKey: 'good_night',
        start: startTime,
        end: endTime,
        lock: goodNightLock,
      });

      // Update Rest Day Policy
      const finalSettings = await planBridgeAPI.updateModePolicy({
        modeKey: 'rest_day',
        start: '00:00',
        end: '23:59',
        days: ['sun'],
        lock: restDayLock,
      });

      setSettings(finalSettings);
      hapticSuccess();
      toast.showToast({ message: 'School calm communication policies updated successfully.', type: 'success' });
    } catch (err: any) {
      toast.showToast({ message: err?.message || 'Could not save calm policies.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SanctuaryCard className="bg-phase-surface border border-phase-border p-6 rounded-3xl">
        <Text className="text-sm font-semibold text-phaseText-secondary">
          Loading calm policies…
        </Text>
      </SanctuaryCard>
    );
  }

  return (
    <Animated.View entering={FadeInUp.delay(120)}>
      <SanctuaryCard className="bg-phase-surface border border-phase-border p-6 rounded-3xl gap-6">
        {/* Header */}
        <HStack className="justify-between items-center">
          <HStack className="gap-3 items-center">
            <Box className="p-2.5 rounded-xl bg-phase-interactive/10">
              <Icon as={Moon} size="sm" className="text-phase-interactive" />
            </Box>
            <VStack>
              <Text className="text-base font-black text-phaseText-primary">
                Calm Hours & Rest Policies
              </Text>
              <Text className="text-xs text-phaseText-secondary">
                Protect sleep, family sacred rest, and peaceful communication flow.
              </Text>
            </VStack>
          </HStack>
          <Box className="bg-phase-surface rounded-full px-3 py-1 border border-phase-border">
            <Text className="text-[10px] font-bold text-phaseText-secondary uppercase">
              {settings?.timezone ?? 'Asia/Colombo'}
            </Text>
          </Box>
        </HStack>

        {/* 1. Good Night Quiet Hours */}
        <VStack className="gap-3 p-4 bg-phase-canvas/40 rounded-2xl border border-phase-border/60">
          <HStack className="justify-between items-center">
            <HStack className="gap-2 items-center">
              <Icon as={Clock} size="xs" className="text-phaseText-secondary" />
              <Text className="text-xs font-bold text-phaseText-primary uppercase tracking-wider">
                Daily Quiet Hours (Evening to Morning)
              </Text>
            </HStack>
          </HStack>

          <HStack className="gap-4">
            <VStack className="flex-1 gap-1">
              <Text className="text-[11px] font-semibold text-phaseText-secondary">
                Start Time (24h)
              </Text>
              <Input className="h-11 rounded-xl bg-phase-surface border-phase-border">
                <InputField
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="20:00"
                  className="text-sm text-phaseText-primary font-mono"
                />
              </Input>
            </VStack>

            <VStack className="flex-1 gap-1">
              <Text className="text-[11px] font-semibold text-phaseText-secondary">
                End Time (24h)
              </Text>
              <Input className="h-11 rounded-xl bg-phase-surface border-phase-border">
                <InputField
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="06:30"
                  className="text-sm text-phaseText-primary font-mono"
                />
              </Input>
            </VStack>
          </HStack>

          {/* Quiet Hours Lock Level Selector */}
          <VStack className="gap-1 mt-1">
            <Text className="text-[11px] font-semibold text-phaseText-secondary">
              Quiet Hours Enforcement
            </Text>
            <HStack className="gap-2">
              {(['suggested', 'locked', 'off'] as ModeLock[]).map((level) => {
                const isSelected = goodNightLock === level;
                return (
                  <Pressable
                    accessibilityRole="button"
                    key={level}
                    onPress={() => {
                      hapticLight();
                      setGoodNightLock(level);
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl border items-center ${
                      isSelected
                        ? 'bg-phase-interactive/10 border-phase-interactive'
                        : 'bg-phase-surface border-phase-border'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold capitalize ${
                        isSelected ? 'text-phase-interactive' : 'text-phaseText-secondary'
                      }`}
                    >
                      {level}
                    </Text>
                  </Pressable>
                );
              })}
            </HStack>
            <Text className="text-[10px] text-phaseText-muted mt-0.5">
              {goodNightLock === 'locked'
                ? 'Strict hold: staff notices queue for 06:30 AM release (emergency lane only).'
                : goodNightLock === 'suggested'
                  ? 'Gentle nudge: suggests 06:30 AM release, but staff may send as requested.'
                  : 'Disabled: quiet hours window is inactive.'}
            </Text>
          </VStack>
        </VStack>

        {/* 2. Sunday Rest Day Policy */}
        <VStack className="gap-3 p-4 bg-phase-canvas/40 rounded-2xl border border-phase-border/60">
          <HStack className="justify-between items-center">
            <HStack className="gap-2 items-center">
              <Icon as={Sun} size="xs" className="text-phaseText-secondary" />
              <Text className="text-xs font-bold text-phaseText-primary uppercase tracking-wider">
                Rest Day (Sunday Sabbatical)
              </Text>
            </HStack>
          </HStack>

          <HStack className="gap-2">
            {(['off', 'suggested', 'locked'] as ModeLock[]).map((level) => {
              const isSelected = restDayLock === level;
              return (
                <Pressable
                  accessibilityRole="button"
                  key={level}
                  onPress={() => {
                    hapticLight();
                    setRestDayLock(level);
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl border items-center ${
                    isSelected
                      ? 'bg-phase-interactive/10 border-phase-interactive'
                      : 'bg-phase-surface border-phase-border'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold capitalize ${
                      isSelected ? 'text-phase-interactive' : 'text-phaseText-secondary'
                    }`}
                  >
                    {level === 'off' ? 'Off (Open)' : level}
                  </Text>
                </Pressable>
              );
            })}
          </HStack>
          <Text className="text-[10px] text-phaseText-muted">
            {restDayLock === 'locked'
              ? 'Sunday hold: all notices sent on Sunday hold until Monday morning 06:30 AM.'
              : restDayLock === 'suggested'
                ? 'Sunday calm: warns staff about Sunday family rest and suggests Monday morning.'
                : 'Sundays follow standard weekday quiet hours.'}
          </Text>
        </VStack>

        {/* 3. Guardian Visibility Mode Toggle */}
        <VStack className="gap-2 p-4 bg-phase-canvas/40 rounded-2xl border border-phase-border/60">
          <HStack className="justify-between items-center">
            <HStack className="gap-2 items-center">
              <Icon as={ShieldCheck} size="xs" className="text-phaseText-secondary" />
              <Text className="text-xs font-bold text-phaseText-primary uppercase tracking-wider">
                Guardian Notice Visibility Policy
              </Text>
            </HStack>
          </HStack>

          <HStack className="gap-2 mt-1">
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                hapticLight();
                setGuardianVerificationRequired(false);
              }}
              className={`flex-1 p-3 rounded-xl border ${
                !guardianVerificationRequired
                  ? 'bg-phase-interactive/10 border-phase-interactive'
                  : 'bg-phase-surface border-phase-border'
              }`}
            >
              <HStack className="items-center gap-1.5">
                {!guardianVerificationRequired ? (
                  <Icon as={Check} size="xs" className="text-phase-interactive" />
                ) : null}
                <Text
                  className={`text-xs font-bold ${
                    !guardianVerificationRequired
                      ? 'text-phase-interactive'
                      : 'text-phaseText-secondary'
                  }`}
                >
                  Open Visibility (Default)
                </Text>
              </HStack>
              <Text className="text-[10px] text-phaseText-muted mt-1 leading-snug">
                Unrevoked guardians immediately receive school circulars & class notices.
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                hapticLight();
                setGuardianVerificationRequired(true);
              }}
              className={`flex-1 p-3 rounded-xl border ${
                guardianVerificationRequired
                  ? 'bg-phase-interactive/10 border-phase-interactive'
                  : 'bg-phase-surface border-phase-border'
              }`}
            >
              <HStack className="items-center gap-1.5">
                {guardianVerificationRequired ? (
                  <Icon as={Check} size="xs" className="text-phase-interactive" />
                ) : null}
                <Text
                  className={`text-xs font-bold ${
                    guardianVerificationRequired
                      ? 'text-phase-interactive'
                      : 'text-phaseText-secondary'
                  }`}
                >
                  Strict Verification Only
                </Text>
              </HStack>
              <Text className="text-[10px] text-phaseText-muted mt-1 leading-snug">
                Requires administrative sign-off before guardians can see circulars.
              </Text>
            </Pressable>
          </HStack>
        </VStack>

        {/* Save Button */}
        <Button
          onPress={handleSavePolicies}
          disabled={isSaving}
          className="w-full bg-phase-interactive h-12 rounded-xl mt-1"
        >
          <ButtonText className="text-phaseText-inverse font-black uppercase tracking-wider text-xs">
            {isSaving ? 'Saving Calm Policies…' : 'Save Institutional Policies'}
          </ButtonText>
        </Button>
      </SanctuaryCard>
    </Animated.View>
  );
}
