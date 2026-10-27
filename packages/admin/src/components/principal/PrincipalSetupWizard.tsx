import {
  createPrincipalSetupActor,
  type SchoolType,
} from '@repo/admin/machines/principalSetupMachine';
import { useActorSnapshot } from '@repo/core/hooks';
import { FireflyMascot } from '@repo/ui';
import {
  Box,
  Button,
  ButtonText,
  HStack,
  Input,
  InputField,
  Pressable,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';
import React, { useMemo, useState } from 'react';

export interface PrincipalSetupWizardProps {
  userId?: string;
  onComplete?: () => void;
  onDismiss?: () => void;
}

const SCHOOL_TYPES: { label: string; value: SchoolType }[] = [
  { label: 'K-12 School', value: 'k12' },
  { label: 'Primary School', value: 'primary' },
  { label: 'Secondary School', value: 'secondary' },
  { label: 'Higher Education', value: 'higher_ed' },
  { label: 'Sanctuary Learning', value: 'sanctuary' },
];

export function PrincipalSetupWizard({
  userId,
  onComplete,
  onDismiss,
}: PrincipalSetupWizardProps) {
  const actor = useMemo(() => createPrincipalSetupActor(userId), [userId]);
  const snapshot = useActorSnapshot(actor);

  const { context, value: stateValue } = snapshot;
  const [localSchoolName, setLocalSchoolName] = useState(context.schoolName);
  const [localSchoolType, setLocalSchoolType] = useState<SchoolType>(context.schoolType);
  const [localDomain, setLocalDomain] = useState(context.domain);
  const [inviteEmail, setInviteEmail] = useState('');

  const currentStep = context.step;

  const handleStart = () => {
    hapticSuccess();
    actor.send({ type: 'START_SETUP' });
  };

  const handleSaveProfile = () => {
    if (!localSchoolName.trim()) {
      hapticLight();
      return;
    }
    hapticSuccess();
    actor.send({
      type: 'SET_SCHOOL_PROFILE',
      schoolName: localSchoolName,
      schoolType: localSchoolType,
    });
  };

  const handleClaimDomain = () => {
    if (!localDomain.trim() || !localDomain.includes('.')) {
      hapticLight();
      return;
    }
    hapticSuccess();
    actor.send({
      type: 'CLAIM_DOMAIN',
      domain: localDomain,
    });
  };

  const handleAddFaculty = () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      hapticLight();
      return;
    }
    hapticLight();
    actor.send({
      type: 'ADD_FACULTY_INVITE',
      email: inviteEmail,
    });
    setInviteEmail('');
  };

  const handleActivate = () => {
    hapticSuccess();
    actor.send({ type: 'ACTIVATE_SCHOOL' });
    onComplete?.();
  };

  return (
    <Box className="rounded-3xl border border-phase-interactive/30 bg-phase-surface p-6 shadow-md">
      {/* Top Header & Step Progress */}
      <HStack className="items-center justify-between border-b border-border/50 pb-4">
        <HStack className="items-center gap-3">
          <FireflyMascot size={48} mode="glowing" role="guide" />
          <VStack>
            <Text className="text-xs font-bold uppercase tracking-wider text-phase-interactive">
              Institutional Onboarding
            </Text>
            <Text className="text-sm font-semibold text-ink">
              {stateValue === 'welcome' && 'Welcome to Leadership'}
              {stateValue === 'school_profile' && 'Step 1: School Identity'}
              {stateValue === 'domain_claim' && 'Step 2: Institutional Domain'}
              {stateValue === 'faculty_invites' && 'Step 3: Faculty Invitations'}
              {stateValue === 'activated' && 'Workspace Activated'}
            </Text>
          </VStack>
        </HStack>

        {/* Step Indicator Dots */}
        <HStack className="items-center gap-1.5">
          {[1, 2, 3, 4].map((stepNumber) => (
            <Box
              key={stepNumber}
              className={`h-2 rounded-full transition-all ${
                currentStep >= stepNumber
                  ? 'w-6 bg-phase-interactive'
                  : 'w-2 bg-border'
              }`}
            />
          ))}
        </HStack>
      </HStack>

      {/* Error Banner */}
      {context.error ? (
        <Box className="mt-3 rounded-xl border border-phase-danger/30 bg-phase-danger/10 p-3">
          <Text className="text-xs font-semibold text-phase-danger">{context.error}</Text>
        </Box>
      ) : null}

      {/* Step Content */}
      <Box className="mt-5">
        {stateValue === 'welcome' && (
          <VStack className="gap-3">
            <Text className="text-sm leading-relaxed text-ink/80">
              Establish your institution&apos;s digital sanctuary. Configure your academic identity,
              claim your institutional domain, and assemble your founding faculty in 4 simple steps.
            </Text>
            <Text className="text-xs text-ink/60">
              Your progress is saved automatically. You can pause and return anytime.
            </Text>
            <Button
              className="mt-3 rounded-xl bg-phase-interactive"
              onPress={handleStart}
              testID="wizard-start-btn"
            >
              <ButtonText className="text-sm font-bold text-white">Begin School Setup</ButtonText>
            </Button>
          </VStack>
        )}

        {stateValue === 'school_profile' && (
          <VStack className="gap-4">
            <VStack className="gap-1.5">
              <Text className="text-xs font-semibold text-ink">School Name</Text>
              <Input className="rounded-xl border border-border bg-phase-canvas px-3 py-2">
                <InputField
                  placeholder="e.g. Saraswati Academy"
                  value={localSchoolName}
                  onChangeText={setLocalSchoolName}
                  testID="school-name-input"
                />
              </Input>
            </VStack>

            <VStack className="gap-1.5">
              <Text className="text-xs font-semibold text-ink">Institution Type</Text>
              <HStack className="flex-wrap gap-2">
                {SCHOOL_TYPES.map((type) => (
                  <Pressable
                    key={type.value}
                    onPress={() => {
                      hapticLight();
                      setLocalSchoolType(type.value);
                    }}
                    className={`rounded-xl border px-3 py-1.5 ${
                      localSchoolType === type.value
                        ? 'border-phase-interactive bg-phase-interactive/10'
                        : 'border-border bg-phase-canvas'
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        localSchoolType === type.value
                          ? 'font-bold text-phase-interactive'
                          : 'text-ink/70'
                      }`}
                    >
                      {type.label}
                    </Text>
                  </Pressable>
                ))}
              </HStack>
            </VStack>

            <HStack className="mt-2 justify-between gap-3">
              <Button
                variant="outline"
                className="rounded-xl border-border"
                onPress={() => {
                  hapticLight();
                  onDismiss?.();
                }}
              >
                <ButtonText className="text-xs text-ink/60">Save & Exit</ButtonText>
              </Button>
              <Button
                className="rounded-xl bg-phase-interactive"
                onPress={handleSaveProfile}
                testID="wizard-profile-next-btn"
              >
                <ButtonText className="text-xs font-bold text-white">Continue to Domain</ButtonText>
              </Button>
            </HStack>
          </VStack>
        )}

        {stateValue === 'domain_claim' && (
          <VStack className="gap-4">
            <VStack className="gap-1.5">
              <Text className="text-xs font-semibold text-ink">Institutional Email Domain</Text>
              <Text className="text-xs text-ink/60">
                Staff with emails matching this domain will automatically bond with your school.
              </Text>
              <Input className="rounded-xl border border-border bg-phase-canvas px-3 py-2">
                <InputField
                  placeholder="e.g. saraswati.edu or academy.org"
                  value={localDomain}
                  onChangeText={setLocalDomain}
                  autoCapitalize="none"
                  testID="domain-input"
                />
              </Input>
            </VStack>

            <HStack className="mt-2 justify-between gap-3">
              <Button
                variant="outline"
                className="rounded-xl border-border"
                onPress={() => {
                  hapticLight();
                  onDismiss?.();
                }}
              >
                <ButtonText className="text-xs text-ink/60">Save & Exit</ButtonText>
              </Button>
              <Button
                className="rounded-xl bg-phase-interactive"
                onPress={handleClaimDomain}
                testID="wizard-domain-next-btn"
              >
                <ButtonText className="text-xs font-bold text-white">Continue to Invites</ButtonText>
              </Button>
            </HStack>
          </VStack>
        )}

        {stateValue === 'faculty_invites' && (
          <VStack className="gap-4">
            <VStack className="gap-1.5">
              <Text className="text-xs font-semibold text-ink">Invite Teachers & Mentors</Text>
              <HStack className="gap-2">
                <Input className="flex-1 rounded-xl border border-border bg-phase-canvas px-3 py-2">
                  <InputField
                    placeholder="teacher@domain.edu"
                    value={inviteEmail}
                    onChangeText={setInviteEmail}
                    autoCapitalize="none"
                    testID="faculty-email-input"
                  />
                </Input>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl border-phase-interactive"
                  onPress={handleAddFaculty}
                >
                  <ButtonText className="text-xs font-bold text-phase-interactive">Add</ButtonText>
                </Button>
              </HStack>
            </VStack>

            {/* List of staged invites */}
            {context.facultyInvites.length > 0 ? (
              <VStack className="gap-1.5 rounded-xl border border-border bg-phase-canvas p-3">
                <Text className="text-xs font-semibold text-ink/60">
                  {context.facultyInvites.length} Faculty Member(s) Staged:
                </Text>
                {context.facultyInvites.map((email, idx) => (
                  <Text key={`${email}-${idx}`} className="text-xs text-ink">
                    • {email}
                  </Text>
                ))}
              </VStack>
            ) : (
              <Text className="text-xs italic text-ink/50">
                You can also invite faculty members later from the School Operations hub.
              </Text>
            )}

            <HStack className="mt-2 justify-between gap-3">
              <Button
                variant="outline"
                className="rounded-xl border-border"
                onPress={() => {
                  hapticLight();
                  onDismiss?.();
                }}
              >
                <ButtonText className="text-xs text-ink/60">Save & Exit</ButtonText>
              </Button>
              <Button
                className="rounded-xl bg-phase-interactive"
                onPress={handleActivate}
                testID="wizard-activate-btn"
              >
                <ButtonText className="text-xs font-bold text-white">Activate School Workspace</ButtonText>
              </Button>
            </HStack>
          </VStack>
        )}

        {stateValue === 'activated' && (
          <VStack className="items-center gap-3 py-4">
            <FireflyMascot size={64} mode="glowing" state="complete" role="guide" />
            <Text className="text-base font-bold text-ink">
              {context.schoolName} is Activated!
            </Text>
            <Text className="text-center text-xs text-ink/70 max-w-[280px]">
              Your institutional sanctuary is ready. Faculty can now join via {context.domain}.
            </Text>
            <Button
              className="mt-3 rounded-xl bg-phase-interactive px-6"
              onPress={() => onComplete?.()}
            >
              <ButtonText className="text-xs font-bold text-white">Enter Workspace</ButtonText>
            </Button>
          </VStack>
        )}
      </Box>
    </Box>
  );
}
