import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { type InviteCodeData, validateInviteCode } from '@repo/core/logic';
import { Button } from '@repo/ui/components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSanctuaryToast } from '@repo/ui/hooks';
import { ArrowRight, CircleQuestionMark, Shield } from '@repo/ui/icons';
import { hapticError, hapticLight, hapticSuccess } from '@repo/ui/utils';
import { useTranslation } from 'react-i18next';

interface InviteCodeEntryProps {
  initialCode?: string;
  onCodeValidated: (codeData: InviteCodeData) => void;
  onSkip: () => void;
}

export default function InviteCodeEntry({
  initialCode,
  onCodeValidated,
  onSkip,
}: InviteCodeEntryProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState(initialCode ?? '');
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
    <SafeAreaView edges={["bottom", "left", "right"]} className="flex-1 bg-phase-canvas">
      <View className="flex-1 p-8 justify-center">
        <View className="gap-10 max-w-[400px] w-full self-center">
          {/* Header */}
          <View className="gap-3 items-center">
            <View className="w-16 h-16 rounded-3xl bg-phase-interactive/10 items-center justify-center mb-2">
              <Shield size={32} className="text-phase-interactive" />
            </View>
            <Text className="text-3xl text-ink text-center font-black">
              {t('invite.enterCode') || 'Sanctuary Key'}
            </Text>
            <Text className="text-ink/60 text-base text-center font-medium">
              {t('invite.codeDesc') || 'Unlock your school community with your invitation key.'}
            </Text>
          </View>

          {/* Code Input */}
          <View className="gap-4">
            <View className="gap-2">
              <Text className="text-ink/40 text-[10px] font-bold uppercase tracking-widest ml-1">
                {t('invite.inviteCode') || 'Invitation Key'}
              </Text>
              <View className="bg-phase-surface border border-border rounded-2xl p-1 overflow-hidden h-16 justify-center">
                <TextInput
                  placeholder="GURU-ABC123-TEACH"
                  value={code}
                  onChangeText={handleCodeChange}
                  autoCapitalize="characters"
                  maxLength={20}
                  className="text-ink text-xl font-black text-center"
                  placeholderTextColor="rgba(var(--ink), 0.2)"
                  onSubmitEditing={handleValidateCode}
                />
              </View>
              <Text className="text-ink/40 text-[10px] font-medium text-center italic">
                {t('invite.codeFormat') || 'Keys follow the GURU-XXXXXX-XXXX format'}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View className="gap-4">
            <Button
              label={t('invite.validate') || 'Activate Key'}
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading || code.length < 5}
              icon={ArrowRight}
              onPress={handleValidateCode}
            />

            {/* Info Box */}
            <View className="p-5 bg-phase-surface border border-border rounded-2xl mt-2">
              <View className="flex-row gap-4 items-start">
                <View className="w-8 h-8 rounded-full bg-phase-interactive/10 items-center justify-center">
                  <CircleQuestionMark className="text-phase-interactive" size={16} />
                </View>
                <View className="gap-1 flex-1">
                  <Text className="text-ink text-xs font-black">
                    {t('invite.whereToFind') || 'Lost your key?'}
                  </Text>
                  <Text className="text-ink/60 text-[11px] font-medium leading-relaxed">
                    {t('invite.whereDesc') ||
                      'Keys are generated by school authorities. Please consult your principal or mentor.'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Skip / Create School */}
          <View className="mt-2 items-center">
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
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
