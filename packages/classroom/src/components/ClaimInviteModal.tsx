import { api } from '@repo/core/api';

import SanctuaryModal from '@repo/ui/components/SanctuaryModal';
import { CircleCheck, QrCode } from '@repo/ui/icons';
import {
  Box,
  Button,
  ButtonText,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  HStack,
  Icon,
  Input,
  InputField,
  Spinner,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { hapticSuccess } from '@repo/ui/utils/haptics';

import { useState } from 'react';

interface ClaimInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ClaimInviteModal({ isOpen, onClose, onSuccess }: ClaimInviteModalProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  const handleClaim = async () => {
    if (!inviteCode.trim()) return;
    try {
      setLoading(true);
      const result = await api.classroomStudents.claimStudent(inviteCode.trim());

      setSuccessData(result);
      hapticSuccess();
    } catch (error: any) {
      console.error('Failed to claim record:', error);
      // On mobile we might want a nicer toast, but keeping alert for now as per original if not defined
      alert(error.message || 'Invalid invite code or record already claimed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    onSuccess();
    setInviteCode('');
    setSuccessData(null);
  };

  return (
    <SanctuaryModal isOpen={isOpen} onClose={onClose} title={successData ? '' : 'Claim Invite'}>
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

          <FormControl isRequired className="gap-3">
            <FormControlLabel>
              <FormControlLabelText className="text-phaseText-secondary font-bold text-xs uppercase tracking-wider ml-1">
                Invite Code
              </FormControlLabelText>
            </FormControlLabel>
            <Input className="border-phase-border bg-phase-surface h-20 rounded-[20px] focus:border-templeGold">
              <InputField
                placeholder="e.g. a1b2c3d4"
                className="text-phaseText-primary text-3xl text-center font-black tracking-[8px]"
                value={inviteCode}
                onChangeText={setInviteCode}
                autoCapitalize="none"
              />
            </Input>
          </FormControl>

          <Button
            onPress={handleClaim}
            disabled={loading || inviteCode.length < 6}
            className={`w-full h-16 ${loading || inviteCode.length < 6 ? 'bg-phase-surface opacity-50' : 'bg-templeGold shadow-lg shadow-templeGold/20'} rounded-[24px] flex-row items-center justify-center gap-3`}
          >
            {loading ? (
              <Spinner className="text-phaseText-inverse" size="small" />
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

// Add a standard Heading wrapper if missing in local scope but SanctuaryModal title uses it internally
const Heading = ({ children, className }: any) => (
  <Text className={`text-xl font-bold ${className || ''}`}>{children}</Text>
);
