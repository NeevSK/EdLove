import { type InviteCodeData, validateInviteCode } from '@repo/core/logic';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { useSanctuaryToast } from '@repo/ui/hooks';
import { ArrowRight, CircleQuestionMark, Shield } from '@repo/ui/icons';
import {
  Box,
  Heading,
  HStack,
  Icon,
  InputField,
  Pressable,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { hapticError, hapticLight, hapticSuccess } from '@repo/ui/utils';
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
  const { showToast } = useSanctuaryToast();

  async function handleValidateCode() {
    if (!code.trim()) {
      notify(t('invite.error.noCode') || 'Please enter an invite code', 'error');
      return;
    }

    setLoading(true);
    hapticLight();

    try {
      const result = await validateInviteCode(code.trim());

      if (result.valid && result.data) {
        hapticSuccess();
        notify(
          t('invite.success.joining', { school: result.data.school_name }) ||
            `Joining ${result.data.school_name}!`,
          'success',
        );
        onCodeValidated(result.data);
      } else {
        hapticError();
        notify(result.error || t('invite.error.invalid') || 'Invalid code', 'error');
      }
    } catch (_err) {
      hapticError();
      notify('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  }

  function notify(message: string, type: 'error' | 'success') {
    showToast({
      message,
      type,
    });
  }

  function formatCodeInput(text: string) {
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
    <ScreenWrapper noTopInset scroll={false} className="bg-phase-canvas">
      <Box className="flex-1 p-8 justify-center">
        <VStack className="gap-10 max-w-[400px] w-full self-center">
          {/* Header */}
          <VStack className="gap-3 items-center">
            <Box className="w-16 h-16 rounded-3xl bg-phase-interactive/10 items-center justify-center mb-2">
              <Icon as={Shield} size="xl" className="text-phase-interactive" />
            </Box>
            <Heading className="text-3xl text-ink text-center font-black">
              {t('invite.enterCode') || 'Sanctuary Key'}
            </Heading>
            <Text className="text-ink/60 text-base text-center font-medium">
              {t('invite.codeDesc') || 'Unlock your school community with your invitation key.'}
            </Text>
          </VStack>

          {/* Code Input */}
          <VStack className="gap-4">
            <VStack className="gap-2">
              <Text className="text-ink/40 text-[10px] font-bold uppercase tracking-widest ml-1">
                {t('invite.inviteCode') || 'Invitation Key'}
              </Text>
              <Box className="bg-phase-surface border border-border rounded-2xl p-1 overflow-hidden h-16 justify-center">
                <InputField
                  placeholder="GURU-ABC123-TEACH"
                  value={code}
                  onChangeText={handleCodeChange}
                  autoCapitalize="characters"
                  maxLength={20}
                  className="text-ink text-xl font-black text-center"
                  placeholderTextColor="rgba(var(--ink), 0.2)"
                  onSubmitEditing={handleValidateCode}
                />
              </Box>
              <Text className="text-ink/40 text-[10px] font-medium text-center italic">
                {t('invite.codeFormat') || 'Keys follow the GURU-XXXXXX-XXXX format'}
              </Text>
            </VStack>
          </VStack>

          {/* Actions */}
          <VStack className="gap-4">
            <SanctuaryButton
              action="primary"
              onPress={handleValidateCode}
              isDisabled={loading || code.length < 5}
              className="h-16 rounded-2xl"
            >
              {loading ? (
                <BrandPulse size={22} accessibilityLabel="Validating invitation code" />
              ) : (
                <HStack className="gap-2 items-center">
                  <Text className="text-white font-black text-lg">
                    {t('invite.validate') || 'Activate Key'}
                  </Text>
                  <Icon as={ArrowRight} className="text-white" size="sm" />
                </HStack>
              )}
            </SanctuaryButton>

            {/* Info Box */}
            <Box className="p-5 bg-phase-surface border border-border rounded-2xl mt-2">
              <HStack className="gap-4 items-start">
                <Box className="w-8 h-8 rounded-full bg-phase-interactive/10 items-center justify-center">
                  <Icon as={CircleQuestionMark} className="text-phase-interactive" size="xs" />
                </Box>
                <VStack className="gap-1 flex-1">
                  <Text className="text-ink text-xs font-black">
                    {t('invite.whereToFind') || 'Lost your key?'}
                  </Text>
                  <Text className="text-ink/60 text-[11px] font-medium leading-relaxed">
                    {t('invite.whereDesc') ||
                      'Keys are generated by school authorities. Please consult your principal or mentor.'}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </VStack>

          {/* Skip / Create School */}
          <VStack className="mt-2 items-center">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                t('invite.createSchool') || 'Principal registration? Create School'
              }
              accessibilityHint="Navigates to the school creation screen for principals"
              onPress={() => {
                hapticLight();
                onSkip();
              }}
              className="active:opacity-70 px-4 py-2"
            >
              <Text className="text-phase-interactive text-sm font-bold">
                {t('invite.createSchool') || 'Principal registration? Create School →'}
              </Text>
            </Pressable>
          </VStack>
        </VStack>
      </Box>
    </ScreenWrapper>
  );
}
