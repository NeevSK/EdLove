import { type Message, useAIAgent } from '@repo/ai/hooks/useAIAgent';
import { useDomainFeature, useStore } from '@repo/core/logic';
import { ChatComposer } from '@repo/ui/components/ChatComposer';
import { MessageBubble } from '@repo/ui/components/MessageBubble';
import { SanctuaryLegendList } from '@repo/ui/components/SanctuaryLegendList';
import ScreenWrapper from '@repo/ui/components/ScreenWrapper';
import { ChatProvider, useChatScrollToIndex } from '@repo/ui/context/ChatContext';
import { ChevronLeft, Sparkles } from '@repo/ui/icons';
import { Box, HStack, Pressable, Text, useTheme, VStack } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';
import { hapticLight } from '@repo/ui/utils/haptics';
import { safeBack } from '@repo/ui/utils/navigation';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import Animated, {
  FadeInUp,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export default function AIAssistantScreen() {
  const router = useRouter();
  const { gradientNodes, glass, text } = useTheme();
  const { t } = useTranslation();
  const { result: aiFeature } = useDomainFeature('ai-assistant');
  const {
    messages,
    input,
    setInput,
    handleSubmit,
    isThinking,
    billingMode,
    setBillingMode,
    privacyMode,
    setPrivacyMode,
  } = useAIAgent();
  const userRole = useStore((state) => state.activeBond?.capacity ?? null);

  const handleSend = () => {
    if (!input.trim()) return;
    hapticLight();
    handleSubmit();
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <Animated.View entering={FadeInUp.springify().damping(15)} layout={Layout.springify()}>
        <MessageBubble
          content={item.content}
          variant={isUser ? 'user' : 'assistant'}
          maxWidthClassName="max-w-[85%]"
        />
      </Animated.View>
    );
  };

  if (!aiFeature.permitted) return null;

  return (
    <ScreenWrapper backgroundColor={gradientNodes[0]}>
      <ChatProvider>
        <Box style={styles.container}>
          <AIThinkingAnchor isThinking={isThinking} messages={messages} />
          {/* Header */}
          <HStack style={[styles.header, { borderBottomColor: glass.surface.border }]}>
            <Pressable
              accessibilityRole="button"
              onPress={() => safeBack('/self')}
              style={[styles.backButton, { backgroundColor: glass.surface.bg }]}
            >
              <ChevronLeft color={text.primary} size={24} />
            </Pressable>
            <VStack style={{ flex: 1 }}>
              <HStack className="justify-between items-center w-full">
                <HStack className="gap-xs items-center">
                  <Sparkles color="#B8A9E0" size={18} />
                  <Text className="font-bold text-lg text-phaseText-primary">
                    {t('aiAssistant.title')}
                  </Text>
                </HStack>

                {/* Billing Mode Selector Pill */}
                <HStack className="gap-xs">
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      const modes: ('baseline' | 'byok' | 'purchased')[] = [
                        'baseline',
                        'byok',
                        'purchased',
                      ];
                      const nextMode = modes[(modes.indexOf(billingMode) + 1) % modes.length]!;
                      void setBillingMode(nextMode);
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
                  </Pressable>

                  {/* Privacy Mode Selector Pill */}
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      const modes: ('saved' | 'temporary' | 'incognito')[] = [
                        'saved',
                        'temporary',
                        'incognito',
                      ];
                      const nextMode = modes[(modes.indexOf(privacyMode) + 1) % modes.length]!;
                      void setPrivacyMode(nextMode);
                    }}
                    style={{
                      backgroundColor: glass.surface.bg,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: privacyMode === 'incognito' ? '#FF5C5C' : glass.surface.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        color: privacyMode === 'incognito' ? '#FF5C5C' : text.primary,
                        fontWeight: 'bold',
                      }}
                    >
                      {privacyMode === 'incognito' ? 'INCOG' : privacyMode.toUpperCase()}
                    </Text>
                  </Pressable>
                </HStack>
              </HStack>
              <Text className="text-phaseText-secondary text-xs">{t('aiAssistant.subtitle')}</Text>
            </VStack>
          </HStack>

          {/* Chat Area */}
          <SanctuaryLegendList
            keyboardLiftBehavior="whenAtEnd"
            initialScrollAtEnd
            maintainScrollAtEnd
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={isThinking ? <ThinkingShimmer /> : null}
          />

          {/* Input Area */}
          <Box style={styles.inputContainer}>
            {!userRole ? (
              <VStack className="gap-xs items-center p-md">
                <Text className="text-phaseText-secondary text-sm text-center">
                  {t('aiAssistant.loginPrompt')}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push('/welcome')}
                >
                  <Text className="text-phase-accent font-bold text-sm">
                    {t('aiAssistant.continueLogin')}
                  </Text>
                </Pressable>
              </VStack>
            ) : (
              <ChatComposer
                value={input}
                onChangeText={setInput}
                onSend={handleSend}
                isSending={isThinking}
                placeholder={t('aiAssistant.placeholder')}
              />
            )}
          </Box>
        </Box>
      </ChatProvider>
    </ScreenWrapper>
  );
}

function ThinkingShimmer() {
  const { t } = useTranslation();
  const opacity = useSharedValue(0.3);
  const shimmerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
    return () => {
      opacity.value = 0.3;
    };
  }, [opacity]);
  return (
    <HStack className="items-center gap-xs self-start px-5 py-2">
      <Animated.View style={shimmerStyle}>
        <HStack className="gap-1">
          {[0, 1, 2].map((i) => (
            <Box key={i} className="w-2 h-2 rounded-full bg-ink/30" />
          ))}
        </HStack>
      </Animated.View>
      <Text className="text-phaseText-secondary italic text-sm">{t('aiAssistant.thinking')}</Text>
    </HStack>
  );
}

function AIThinkingAnchor({
  isThinking,
  messages,
}: {
  isThinking: boolean;
  messages: Message[];
}) {
  const scrollToIndex = useChatScrollToIndex();
  const messageCount = messages.length;
  useEffect(() => {
    if (isThinking && messageCount > 0) {
      scrollToIndex(messageCount - 1);
    }
  }, [isThinking, messageCount, scrollToIndex]);
  return null;
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
  },
  inputContainer: {
    padding: Theme.spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 40 : Theme.spacing.md,
    backgroundColor: 'transparent',
  },
});
