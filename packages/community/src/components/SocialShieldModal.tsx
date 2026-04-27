import {
  Box,
  Heading,
  HStack,
  Icon,
  Pressable,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { SanctuaryButton, SanctuaryModal } from '@repo/ui/components';
import { useLotusToast } from '@repo/ui/hooks';
import { hapticError, hapticSuccess } from '@repo/ui/utils';
import { AlertTriangle, LifeBuoy, ShieldCheck, ShieldOff, UserX, X } from '@repo/ui/icons';
import React, { useState } from 'react';
import { type ReportTarget, useSocialShield } from '../hooks/useSocialShield';

interface SocialShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId?: string;
  groupId?: string;
  targetUserId?: string;
  targetUserName?: string;
}

const REPORT_REASONS = [
  { label: 'Harmful Content', value: 'harmful', icon: AlertTriangle },
  { label: 'Harassment', value: 'harassment', icon: UserX },
  { label: 'Inappropriate for School', value: 'inappropriate', icon: ShieldOff },
  { label: 'Other', value: 'other', icon: AlertTriangle },
];

const TARGET_OPTIONS: { label: string; value: ReportTarget; icon: any; description: string }[] = [
  {
    label: 'Class Teacher',
    value: 'teacher',
    icon: ShieldCheck,
    description: 'For classroom-related issues and minor conflicts.',
  },
  {
    label: 'School Principal',
    value: 'principal',
    icon: ShieldCheck,
    description: 'For serious safety concerns or severe harassment.',
  },
  {
    label: 'Platform Guardians',
    value: 'platform',
    icon: LifeBuoy,
    description: 'For technical abuse or violations of platform rules.',
  },
];

export default function SocialShieldModal({
  isOpen,
  onClose,
  postId,
  groupId,
  targetUserId,
  targetUserName = 'this user',
}: SocialShieldModalProps) {
  const { submitReport, blockUser } = useSocialShield();
  const { showToast } = useLotusToast();
  const [reason, setReason] = useState<string>('');
  const [target, setTarget] = useState<ReportTarget>('platform');
  const [shouldBlock, setShouldBlock] = useState(false);
  const [step, setStep] = useState<'reason' | 'target'>('reason');

  const handleReasonPress = React.useCallback((val: string) => {
    setReason(val);
  }, []);

  const handleTargetPress = React.useCallback((val: ReportTarget) => {
    setTarget(val);
  }, []);

  const toggleBlock = React.useCallback(() => {
    setShouldBlock((prev) => !prev);
  }, []);

  const handleNext = React.useCallback(() => {
    setStep('target');
  }, []);

  const handleBack = React.useCallback(() => {
    setStep('reason');
  }, []);

  const handleSubmit = React.useCallback(async () => {
    if (!reason || !target) return;

    const result = await submitReport({
      postId,
      groupId,
      targetUserId,
      reason,
      target,
    });

    if (result && result.success) {
      hapticSuccess();
      showToast({
        message: 'Thank you for sharing your concern. Our guardians will review this shortly.',
        type: 'success',
      });

      if (shouldBlock && targetUserId) {
        const blockResult = await blockUser(targetUserId);
        if (blockResult && blockResult.success) {
          showToast({
            message: 'User has also been blocked.',
            type: 'success',
          });
        }
      }
      onClose();
      // Reset for next time
      setStep('reason');
      setReason('');
      setTarget('platform');
      setShouldBlock(false);
    } else {
      hapticError();
      showToast({ message: 'Failed to submit report. Please try again.', type: 'error' });
    }
  }, [
    reason,
    target,
    submitReport,
    postId,
    groupId,
    targetUserId,
    shouldBlock,
    blockUser,
    onClose,
    showToast,
  ]);

  return (
    <SanctuaryModal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'reason' ? 'Shielding the Sanctuary' : 'Who should guide this?'}
    >
      <VStack className="gap-6">
        <Text className="text-ink/60 text-sm">
          {step === 'reason'
            ? `Help us understand the concern with ${targetUserName}.`
            : 'Choose the appropriate guardian for this report.'}
        </Text>

        {step === 'reason' ? (
          <VStack className="gap-3">
            {REPORT_REASONS.map((item) => {
              const isSelected = reason === item.value;
              return (
                <Pressable
                  key={item.value}
                  accessibilityLabel={`Report for ${item.label}`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => handleReasonPress(item.value)}
                  className={`p-4 rounded-2xl border-2 flex-row items-center gap-4 transition-all ${isSelected ? 'border-phase-interactive bg-phase-interactive/5' : 'border-border bg-phase-surface'}`}
                >
                  <Box
                    className={`w-10 h-10 rounded-xl items-center justify-center border ${isSelected ? 'bg-phase-interactive/10 border-phase-interactive/20' : 'bg-ink/5 border-border'}`}
                  >
                    <Icon
                      as={item.icon}
                      size="sm"
                      className={isSelected ? 'text-phase-interactive' : 'text-ink/40'}
                    />
                  </Box>
                  <Text
                    className={`text-base font-semibold ${isSelected ? 'text-ink' : 'text-ink/60'}`}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}

            <HStack className="items-center gap-3 mt-2 px-1">
              <Pressable
                accessibilityLabel="Also block this user"
                accessibilityRole="checkbox"
                accessibilityState={{ checked: shouldBlock }}
                onPress={toggleBlock}
                className={`w-6 h-6 rounded-lg border-2 items-center justify-center ${shouldBlock ? 'border-phase-interactive bg-phase-interactive' : 'border-border'}`}
              >
                {shouldBlock && <Box className="w-2.5 h-2.5 rounded-sm bg-white" />}
              </Pressable>
              <Text className="text-ink/60 text-sm leading-relaxed flex-1">
                Also block this user from interacting with me
              </Text>
            </HStack>

            <SanctuaryButton
              action="primary"
              onPress={handleNext}
              isDisabled={!reason}
              className="h-14 rounded-2xl mt-4"
            >
              <Text className="text-white font-bold text-lg">Next: Choose Guardian</Text>
            </SanctuaryButton>
          </VStack>
        ) : (
          <VStack className="gap-3">
            {TARGET_OPTIONS.map((item) => {
              const isSelected = target === item.value;
              return (
                <Pressable
                  key={item.value}
                  accessibilityLabel={`Report to ${item.label}`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => handleTargetPress(item.value)}
                  className={`p-4 rounded-2xl border-2 flex-row items-center gap-4 transition-all ${isSelected ? 'border-phase-interactive bg-phase-interactive/5' : 'border-border bg-phase-surface'}`}
                >
                  <Box
                    className={`w-10 h-10 rounded-xl items-center justify-center border ${isSelected ? 'bg-phase-interactive/10 border-phase-interactive/20' : 'bg-ink/5 border-border'}`}
                  >
                    <Icon
                      as={item.icon}
                      size="sm"
                      className={isSelected ? 'text-phase-interactive' : 'text-ink/40'}
                    />
                  </Box>
                  <VStack className="flex-1">
                    <Text
                      className={`text-base font-semibold ${isSelected ? 'text-ink' : 'text-ink/60'}`}
                    >
                      {item.label}
                    </Text>
                    <Text className="text-xs text-ink/40 font-medium leading-relaxed">
                      {item.description}
                    </Text>
                  </VStack>
                </Pressable>
              );
            })}

            <HStack className="gap-3 mt-4">
              <SanctuaryButton
                action="secondary"
                onPress={handleBack}
                className="flex-1 h-14 rounded-2xl border border-border bg-transparent"
              >
                <Text className="text-ink font-bold">Back</Text>
              </SanctuaryButton>
              <SanctuaryButton
                action="primary"
                onPress={handleSubmit}
                className="flex-[1.5] h-14 rounded-2xl"
              >
                <Text className="text-white font-bold text-lg">Submit Report</Text>
              </SanctuaryButton>
            </HStack>

            <Text className="text-[11px] text-ink/40 text-center mt-3 font-medium">
              Need to manage your blocks later? Visit{' '}
              <Text className="text-phase-interactive">Privacy Settings</Text>.
            </Text>
          </VStack>
        )}
      </VStack>
    </SanctuaryModal>
  );
}
