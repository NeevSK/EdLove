import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import { LifeBuoy, ShieldCheck, ShieldOff, TriangleAlert, UserX } from '@repo/ui/icons';
import { Box, HStack, Icon, Pressable, Text, VStack } from '@repo/ui/primitives';
import React, { useCallback, useMemo } from 'react';

export type ReportTarget = 'teacher' | 'principal' | 'platform';
export type ModalStep = 'reason' | 'target';

export interface SocialShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId?: string;
  groupId?: string;
  targetUserId?: string;
  targetUserName?: string;
  // State from core logic/tanstack hooks
  reason: string;
  target: ReportTarget;
  shouldBlock: boolean;
  step: ModalStep;
  // Actions
  onSetReason: (reason: string) => void;
  onSetTarget: (target: ReportTarget) => void;
  onToggleBlock: () => void;
  onSetStep: (step: ModalStep) => void;
  onSubmit: () => Promise<void>;
}

const REPORT_REASONS = [
  { label: 'Harmful Content', value: 'harmful', icon: TriangleAlert },
  { label: 'Harassment', value: 'harassment', icon: UserX },
  {
    label: 'Inappropriate for School',
    value: 'inappropriate',
    icon: ShieldOff,
  },
  { label: 'Other', value: 'other', icon: TriangleAlert },
];

const TARGET_OPTIONS: {
  label: string;
  value: ReportTarget;
  icon: React.ComponentType<{ size?: string | number; className?: string }>;
  description: string;
}[] = [
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

const ReportReasonItem = React.memo(
  ({
    label,
    value,
    icon,
    isSelected,
    onPress,
  }: {
    label: string;
    value: string;
    icon: React.ComponentType<{ size?: string | number; className?: string }>;
    isSelected: boolean;
    onPress: (val: string) => void;
  }) => {
    const handlePress = useCallback(() => onPress(value), [onPress, value]);
    const accessibilityState = useMemo(() => ({ selected: isSelected }), [isSelected]);

    return (
      <Pressable
        accessibilityLabel={`Report for ${label}`}
        accessibilityHint="Selects this reason for the report"
        accessibilityRole="radio"
        accessibilityState={accessibilityState}
        onPress={handlePress}
        className={`p-4 rounded-2xl border-2 flex-row items-center gap-4 transition-all ${
          isSelected
            ? 'border-phase-interactive bg-phase-interactive/5'
            : 'border-border bg-phase-surface'
        }`}
      >
        <Box
          className={`w-10 h-10 rounded-xl items-center justify-center border ${
            isSelected
              ? 'bg-phase-interactive/10 border-phase-interactive/20'
              : 'bg-ink/5 border-border'
          }`}
        >
          <Icon
            as={icon}
            size="sm"
            className={isSelected ? 'text-phase-interactive' : 'text-ink/40'}
          />
        </Box>
        <Text className={`text-base font-semibold ${isSelected ? 'text-ink' : 'text-ink/60'}`}>
          {label}
        </Text>
      </Pressable>
    );
  },
);
ReportReasonItem.displayName = 'ReportReasonItem';

const TargetOptionItem = React.memo(
  ({
    label,
    value,
    icon,
    description,
    isSelected,
    onPress,
  }: {
    label: string;
    value: ReportTarget;
    icon: React.ComponentType<{ size?: string | number; className?: string }>;
    description: string;
    isSelected: boolean;
    onPress: (val: ReportTarget) => void;
  }) => {
    const handlePress = useCallback(() => onPress(value), [onPress, value]);
    const accessibilityState = useMemo(() => ({ selected: isSelected }), [isSelected]);

    return (
      <Pressable
        accessibilityLabel={`Report to ${label}`}
        accessibilityHint={`Sends this report to ${label} for review`}
        accessibilityRole="radio"
        accessibilityState={accessibilityState}
        onPress={handlePress}
        className={`p-4 rounded-2xl border-2 flex-row items-center gap-4 transition-all ${
          isSelected
            ? 'border-phase-interactive bg-phase-interactive/5'
            : 'border-border bg-phase-surface'
        }`}
      >
        <Box
          className={`w-10 h-10 rounded-xl items-center justify-center border ${
            isSelected
              ? 'bg-phase-interactive/10 border-phase-interactive/20'
              : 'bg-ink/5 border-border'
          }`}
        >
          <Icon
            as={icon}
            size="sm"
            className={isSelected ? 'text-phase-interactive' : 'text-ink/40'}
          />
        </Box>
        <VStack className="flex-1">
          <Text className={`text-base font-semibold ${isSelected ? 'text-ink' : 'text-ink/60'}`}>
            {label}
          </Text>
          <Text className="text-xs text-ink/40 font-medium leading-relaxed">{description}</Text>
        </VStack>
      </Pressable>
    );
  },
);
TargetOptionItem.displayName = 'TargetOptionItem';

export const SocialShieldModal = React.memo(function SocialShieldModal({
  isOpen,
  onClose,
  targetUserName = 'this user',
  reason,
  target,
  shouldBlock,
  step,
  onSetReason,
  onSetTarget,
  onToggleBlock,
  onSetStep,
  onSubmit,
}: SocialShieldModalProps) {
  const handleNext = useCallback(() => {
    onSetStep('target');
  }, [onSetStep]);

  const handleBack = useCallback(() => {
    onSetStep('reason');
  }, [onSetStep]);

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
            {REPORT_REASONS.map((item) => (
              <ReportReasonItem
                key={item.value}
                label={item.label}
                value={item.value}
                icon={item.icon}
                isSelected={reason === item.value}
                onPress={onSetReason}
              />
            ))}

            <HStack className="items-center gap-3 mt-2 px-1">
              <Pressable
                accessibilityLabel="Also block this user"
                accessibilityHint="Toggles whether to block this user from future interactions"
                accessibilityRole="checkbox"
                accessibilityState={{ checked: shouldBlock }}
                onPress={onToggleBlock}
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
            {TARGET_OPTIONS.map((item) => (
              <TargetOptionItem
                key={item.value}
                label={item.label}
                value={item.value}
                icon={item.icon}
                description={item.description}
                isSelected={target === item.value}
                onPress={onSetTarget}
              />
            ))}

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
                onPress={() => {
                  void onSubmit();
                }}
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
});

export default SocialShieldModal;
