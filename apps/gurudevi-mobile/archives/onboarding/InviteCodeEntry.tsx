import { type InviteCodeData, validateInviteCode } from '@repo/core/logic';

import {
  Box,
  Button,
  ButtonIcon,
  ButtonText,
  Heading,
  HStack,
  Input,
  InputField,
  Spinner,
  Text,
  Toast,
  ToastTitle,
  useToast,
  VStack,
} from '@repo/ui';
import { Pressable } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';
import { hapticError, hapticLight, hapticSuccess } from '@repo/ui/utils/haptics';

import { ArrowRight, HelpCircle } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface InviteCodeEntryProps {
  onCodeValidated: (codeData: InviteCodeData) => void;
  onSkip: () => void;
}

export default function InviteCodeEntry({ onCodeValidated, onSkip }: InviteCodeEntryProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function handleValidateCode() {
    if (!code.trim()) {
      showToast('Please enter an invite code', 'error');
      return;
    }

    setLoading(true);
    hapticLight();

    const result = await validateInviteCode(code.trim());

    if (result.valid && result.data) {
      hapticSuccess();
      showToast(`Joining ${result.data.school_name}!`, 'success');
      onCodeValidated(result.data);
    } else {
      hapticError();
      showToast(result.error || 'Invalid code', 'error');
    }

    setLoading(false);
  }

  function showToast(message: string, action: 'error' | 'success') {
    toast.show({
      placement: 'bottom',
      render: ({ id }) => (
        <Toast nativeID={id} action={action} variant="solid">
          <ToastTitle>{message}</ToastTitle>
        </Toast>
      ),
    });
  }

  function formatCodeInput(text: string) {
    // Auto-format as user types: GURU-ABC123-TEACH
    const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (cleaned.length <= 4) {
      return cleaned;
    } else if (cleaned.length <= 10) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    } else {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 10)}-${cleaned.slice(10, 15)}`;
    }
  }

  function handleCodeChange(text: string) {
    const formatted = formatCodeInput(text);
    setCode(formatted);
  }

  return (
    <Box sx={{ flex: 1, backgroundColor: Theme.colors.obsidian, padding: Theme.spacing.xl }}>
      <VStack
        space="xl"
        sx={{
          flex: 1,
          justifyContent: 'center',
          maxWidth: 400,
          width: '100%',
          alignSelf: 'center',
        }}
      >
        {/* Header */}
        <VStack space="sm" mb={Theme.spacing.lg}>
          <Heading size="3xl" color={Theme.colors.sanctuarySaffron} textAlign="center">
            {t('invite.enterCode') || 'Enter Invite Code'}
          </Heading>
          <Text color={Theme.colors.starlightGray} size="md" textAlign="center">
            {t('invite.codeDesc') || 'Join your school with an invite code'}
          </Text>
        </VStack>

        {/* Code Input */}
        <VStack space="xs">
          <Text color={Theme.colors.sacredWhite} size="sm">
            {t('invite.inviteCode') || 'Invite Code'}
          </Text>
          <Input
            variant="outline"
            size="lg"
            sx={{
              borderColor: Theme.colors.mistGray,
              borderRadius: Theme.corners.comfortable,
              backgroundColor: Theme.colors.ink,
            }}
          >
            <InputField
              placeholder="GURU-ABC123-TEACH"
              value={code}
              onChangeText={handleCodeChange}
              autoCapitalize="characters"
              maxLength={20}
              color={Theme.colors.sacredWhite}
              placeholderTextColor={Theme.colors.dimGray}
              onSubmitEditing={handleValidateCode}
            />
          </Input>
          <Text color={Theme.colors.dimGray} size="xs">
            {t('invite.codeFormat') || 'Format: GURU-XXXXXX-TEACH'}
          </Text>
        </VStack>

        {/* Validate Button */}
        <Button
          size="lg"
          onPress={handleValidateCode}
          isDisabled={loading || code.length < 15}
          sx={{
            backgroundColor: Theme.colors.sanctuarySaffron,
            borderRadius: Theme.corners.comfortable,
          }}
        >
          {loading ? (
            <Spinner color={Theme.colors.sacredWhite} />
          ) : (
            <>
              <ButtonText color={Theme.colors.sacredWhite} fontWeight="$semibold">
                {t('invite.validate') || 'Validate Code'}
              </ButtonText>
              <ButtonIcon as={ArrowRight} color={Theme.colors.sacredWhite} ml={Theme.spacing.sm} />
            </>
          )}
        </Button>

        {/* Info Box */}
        <Box
          p={Theme.spacing.lg}
          sx={{
            backgroundColor: Theme.colors.shroud,
            borderRadius: Theme.corners.comfortable,
            borderWidth: 1,
            borderColor: Theme.colors.mistGray,
          }}
        >
          <HStack space="sm" alignItems="flex-start">
            <HelpCircle color={Theme.colors.sanctuarySaffron} size={20} />
            <VStack space="xs" sx={{ flex: 1 }}>
              <Text color={Theme.colors.sacredWhite} size="sm" bold>
                {t('invite.whereToFind') || 'Where to find your code?'}
              </Text>
              <Text color={Theme.colors.dimGray} size="xs">
                {t('invite.whereDesc') || 'Ask your principal or administrator for an invite code'}
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* Skip / Create School */}
        <VStack space="sm" mt={Theme.spacing.md}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              hapticLight();
              onSkip();
            }}
          >
            <Text
              color={Theme.colors.sanctuarySaffron}
              size="sm"
              textAlign="center"
              fontWeight="$semibold"
            >
              {t('invite.createSchool') || "I'm a Principal - Create my school →"}
            </Text>
          </Pressable>
        </VStack>
      </VStack>
    </Box>
  );
}
