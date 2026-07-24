import { useStore } from '@repo/core/logic';
import { SanctuaryGuard } from '@repo/ui';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { ChevronLeft, Send, Sparkles } from '@repo/ui/icons';
import { Box, HStack, Text, useTheme, VStack } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';
import { hapticLight } from '@repo/ui/utils/haptics';
import { safeBack } from '@repo/ui/utils/navigation';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import { type Message, useAIAgent } from '../hooks/useAIAgent';

export default function AIAssistantScreen() {
  const router = useRouter();
  const { gradientNodes, accent, glass, text, isDark } = useTheme();
  const { t } = useTranslation();
  const { messages, input, setInput, handleSubmit, isThinking, billingMode, setBillingMode } =
    useAIAgent();
  const userRole = useStore((state) => state.activeBond?.capacity ?? null);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    hapticLight();
    handleSubmit();
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const renderMessage = ({ item }: { item: any }) => {
    const isUser = item.role === 'user';
    return (
      <Animated.View
        entering={FadeInUp.springify().damping(15)}
        layout={Layout.springify()}
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
          {
            backgroundColor: isUser
              ? accent.action
              : isDark
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(0,0,0,0.05)',
          },
        ]}
      >
        <Text
          className={`${isUser ? 'text-phaseText-onAccent' : 'text-phaseText-primary'} text-base`}
        >
          {item.content}
        </Text>
      </Animated.View>
    );
  };

  return (
    <SanctuaryGuard action="read" subject="isAIAssistantEnabled" requirement={{ flagKey: "isAIAssistantEnabled" }}>
      <ScreenWrapper backgroundColor={gradientNodes[0]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          {/* Header */}
          <HStack style={[styles.header, { borderBottomColor: glass.surface.border }]}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => safeBack('/self')}
              style={[styles.backButton, { backgroundColor: glass.surface.bg }]}
            >
              <ChevronLeft color={text.primary} size={24} />
            </TouchableOpacity>
            <VStack style={{ flex: 1 }}>
              <HStack className="justify-between items-center w-full">
                <HStack className="gap-xs items-center">
                  <Sparkles color="#B8A9E0" size={18} />
                  <Text className="font-bold text-lg text-phaseText-primary">
                    {t('aiAssistant.title')}
                  </Text>
                </HStack>

                {/* Billing Mode Selector Pill */}
                <TouchableOpacity
                  onPress={() => {
                    const modes: ('baseline' | 'byok' | 'purchased')[] = [
                      'baseline',
                      'byok',
                      'purchased',
                    ];
                    const nextMode = modes[(modes.indexOf(billingMode) + 1) % modes.length]!;
                    setBillingMode(nextMode);
                  }}
                  style={{
                    backgroundColor: glass.surface.bg,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: glass.surface.border,
                  }}
                >
                  <Text style={{ fontSize: 10, color: text.primary, fontWeight: 'bold' }}>
                    {billingMode.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              </HStack>
              <Text className="text-phaseText-secondary text-xs">{t('aiAssistant.subtitle')}</Text>
            </VStack>
          </HStack>

          {/* Chat Area */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={
              isThinking ? (
                <Box className="p-md opacity-60">
                  <Text className="text-phaseText-secondary italic text-sm">
                    {t('aiAssistant.thinking')}
                  </Text>
                </Box>
              ) : null
            }
          />

          {/* Input Area */}
          <Box style={styles.inputContainer}>
            {!userRole ? (
              <VStack className="gap-xs items-center p-md">
                <Text className="text-phaseText-secondary text-sm text-center">
                  {t('aiAssistant.loginPrompt')}
                </Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => router.push('/welcome')}
                >
                  <Text className="text-phase-accent font-bold text-sm">
                    {t('aiAssistant.continueLogin')}
                  </Text>
                </TouchableOpacity>
              </VStack>
            ) : (
              <HStack
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: glass.surface.bg,
                    borderColor: glass.surface.border,
                    borderWidth: 1,
                  },
                ]}
                space="sm"
              >
                <TextInput
                  accessibilityLabel="Text input field"
                  style={[styles.input, { color: text.primary }]}
                  placeholder={t('aiAssistant.placeholder')}
                  placeholderTextColor={text.secondary}
                  value={input}
                  onChangeText={setInput}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={handleSend}
                  disabled={!input.trim()}
                  style={[
                    styles.sendButton,
                    {
                      backgroundColor: accent.action,
                      opacity: input.trim() ? 1 : 0.5,
                    },
                  ]}
                >
                  <Send color={gradientNodes[0]} size={20} />
                </TouchableOpacity>
              </HStack>
            )}
          </Box>
        </KeyboardAvoidingView>
      </ScreenWrapper>
    </SanctuaryGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Theme.spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    gap: Theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: Theme.spacing.lg,
    paddingBottom: 40,
  },
  messageBubble: {
    padding: Theme.spacing.md,
    borderRadius: 18,
    marginBottom: Theme.spacing.md,
    maxWidth: '85%',
    ...Theme.shadows.sm,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  inputContainer: {
    padding: Theme.spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 40 : Theme.spacing.md,
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    borderRadius: 24,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 8,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 120,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
});
