import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    FlatList,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    Box,
    Text,
    HStack,
    VStack,
    Theme,
    useThemedColors,
    hapticLight,
    ScreenWrapper
} from '@repo/ui';
import { Send, ChevronLeft, Sparkles, MessageSquare } from 'lucide-react-native';
import { useAIAgent, Message } from '@repo/core';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import { useStore } from '@repo/core';

export default function AIAssistantScreen() {
    const navigation = useNavigation();
    const colors = useThemedColors();
    const { messages, isThinking, sendMessage } = useAIAgent();
    const userRole = useStore(state => state.userRole);
    const [inputText, setInputText] = useState('');
    const flatListRef = useRef<FlatList>(null);

    const handleSend = () => {
        if (!inputText.trim()) return;
        hapticLight();
        sendMessage(inputText);
        setInputText('');
    };

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages, isThinking]);

    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.role === 'user';
        return (
            <Animated.View
                entering={FadeInUp.springify().damping(15)}
                layout={Layout.springify()}
                style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.assistantBubble,
                    { backgroundColor: isUser ? colors.action : colors.tertiary }
                ]}
            >
                <Text color={colors.text} sx={{ fontSize: '$md' as any }}>
                    {item.content}
                </Text>
            </Animated.View>
        );
    };

    return (
        <ScreenWrapper
            backgroundColor={Theme.colors.voidIndigo}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.container}
            >
                {/* Header */}
                <HStack style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft color={colors.text} size={24} />
                    </TouchableOpacity>
                    <VStack>
                        <HStack space="xs" alignItems="center">
                            <Sparkles color={Theme.colors.gurudeviViolet} size={18} />
                            <Text sx={{
                                fontWeight: '700',
                                fontSize: '$lg' as any,
                                color: Theme.colors.sacredWhite
                            }}>
                                Mr. AI Agent
                            </Text>
                        </HStack>
                        <Text color={colors.textSecondary} size="xs">
                            Reflection & Guidance
                        </Text>
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
                            <Box sx={{ padding: '$md' as any, opacity: 0.6 }}>
                                <Text color={colors.textSecondary} italic size="sm">
                                    Mr. Agent is reflecting...
                                </Text>
                            </Box>
                        ) : null
                    }
                />

                {/* Input Area */}
                <Box style={styles.inputContainer}>
                    {!userRole ? (
                        <VStack space="xs" alignItems="center" p="$4">
                            <Text color={colors.textSecondary} size="sm" textAlign="center">
                                Log in to save your reflections and receive personalized guidance.
                            </Text>
                            <TouchableOpacity onPress={() => (navigation as any).navigate('Welcome')}>
                                <Text color={colors.action} bold size="sm">Continue to Login</Text>
                            </TouchableOpacity>
                        </VStack>
                    ) : (
                        <HStack style={styles.inputWrapper} space="sm">
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Share your thoughts..."
                                placeholderTextColor={colors.textSecondary}
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                                maxLength={500}
                            />
                            <TouchableOpacity
                                onPress={handleSend}
                                disabled={!inputText.trim()}
                                style={[
                                    styles.sendButton,
                                    { opacity: inputText.trim() ? 1 : 0.5 }
                                ]}
                            >
                                <Send color={Theme.colors.sacredWhite} size={20} />
                            </TouchableOpacity>
                        </HStack>
                    )}
                </Box>
            </KeyboardAvoidingView>
        </ScreenWrapper>
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
        borderBottomColor: 'rgba(255,255,255,0.05)',
        gap: Theme.spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
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
        backgroundColor: 'rgba(255,255,255,0.05)',
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
        backgroundColor: Theme.colors.gurudeviViolet,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
});
