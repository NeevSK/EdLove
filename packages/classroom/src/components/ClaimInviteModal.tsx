import { api } from '@repo/core/api/client';
import { useActorSnapshot } from '@repo/core/hooks';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import { CircleCheck, QrCode } from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonText,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  Heading,
  HStack,
  Icon,
  Input,
  InputField,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { useSanctuaryToast } from '@repo/ui/providers/ToastProvider';
import { hapticSuccess } from '@repo/ui/utils/haptics';
import { useMemo } from 'react';
import {
  createStudentClaimActor,
  executeStudentClaimEffect,
} from '../machines/studentClaimMachine';

interface ClaimInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ClaimInviteModal({ isOpen, onClose, onSuccess }: ClaimInviteModalProps) {
  const { showToast } = useSanctuaryToast();
  const actor = useMemo(() => createStudentClaimActor(), []);
  const snapshot = useActorSnapshot(actor);

  const loading = snapshot.value === 'verifying';
  const successData = snapshot.context.successData;
  const inviteCode = snapshot.context.code;
  const error = snapshot.context.error;

  const handleClaim = async () => {
    if (!inviteCode.trim()) return;
    const result = await executeStudentClaimEffect(actor, inviteCode, (c) =>
      api.classroomStudents.claimStudent(c),
    );

    if (result.success) {
      hapticSuccess();
    } else if (result.error) {
      showToast({
        message: result.error,
        type: 'error',
      });
    }
  };

  const handleDone = () => {
    onSuccess();
    actor.send({ type: 'RESET' });
  };

  const handleClose = () => {
    if (!loading) {
      actor.send({ type: 'RESET' });
    }
    onClose();
  };

  return (
    <SanctuaryModal
      isOpen={isOpen}
      onClose={handleClose}
      title={successData ? 'Invite claimed' : 'Claim Invite'}
    >
      {successData ? (
        <VStack className="items-center justify-center p-8 gap-6">
          <Box className="w-24 h-24 bg-phase-reward/10 rounded-full items-center justify-center border border-phase-reward/20">
            <Icon as={CircleCheck} size="xl" className="text-phase-reward" />
          </Box>
          <VStack className="items-center gap-2">
            <Heading className="text-3xl font-black text-phaseText-primary tracking-tighter">
              Success!
            </Heading>
            <Text className="text-lg font-medium text-phaseText-secondary text-center leading-relaxed">
              You have successfully linked your account to your classroom record.
            </Text>
          </VStack>
          <Button
            onPress={handleDone}
            className="w-full h-16 bg-templeGold rounded-[24px] shadow-lg shadow-templeGold/20 flex-row items-center justify-center gap-3 mt-4"
          >
            <ButtonText className="text-phaseText-inverse font-bold text-lg">
              Continue to Classroom
            </ButtonText>
          </Button>
        </VStack>
      ) : (
        <VStack className="gap-8 p-1">
          <Box className="p-5 bg-phase-surface rounded-[24px] border border-phase-border">
            <HStack className="gap-3 items-center">
              <Box className="w-10 h-10 rounded-full bg-templeGold/10 items-center justify-center">
                <Icon as={QrCode} size="sm" className="text-templeGold" />
              </Box>
              <Text className="text-phaseText-secondary text-sm font-medium flex-1">
                Enter the 8-character invite code provided by your teacher.
              </Text>
            </HStack>
          </Box>

          <FormControl className="gap-3">
            <FormControlLabel>
              <FormControlLabelText className="text-phaseText-secondary font-bold text-xs uppercase tracking-wider ml-1">
                Invite Code
              </FormControlLabelText>
            </FormControlLabel>
            <Input className="border-phase-border bg-phase-surface h-20 rounded-[20px] focus:border-templeGold">
              <InputField
                accessibilityLabel="Invite code"
                placeholder="e.g. a1b2c3d4"
                className="text-phaseText-primary text-3xl text-center font-black tracking-[8px]"
                value={inviteCode}
                onChangeText={(value) =>
                  actor.send({
                    type: 'SET_CODE',
                    code: value.replace(/\s/g, '').slice(0, 8),
                  })
                }
                autoCapitalize="none"
                maxLength={8}
              />
            </Input>
            {error ? (
              <Text className="text-phase-reward-destructive text-sm text-center font-medium mt-1">
                {error}
              </Text>
            ) : null}
          </FormControl>

          <Button
            onPress={handleClaim}
            disabled={loading || inviteCode.length < 8}
            className={`w-full h-16 ${loading || inviteCode.length < 8 ? 'bg-phase-surface opacity-50' : 'bg-templeGold shadow-lg shadow-templeGold/20'} rounded-[24px] flex-row items-center justify-center gap-3`}
          >
            {loading ? (
              <BrandPulse size={20} tintColor="#FFFFFF" accessibilityLabel="Claiming invitation" />
            ) : (
              <ButtonText className="text-phaseText-inverse font-bold text-lg">
                Claim Record
              </ButtonText>
            )}
          </Button>
        </VStack>
      )}
    </SanctuaryModal>
  );
}
