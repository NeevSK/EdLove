import { useNavigation } from "@react-navigation/native";
import { type Message, useAIAgent } from "@repo/ai";
import { useStore } from "@repo/core/logic";
import { ScreenWrapper } from "@repo/ui";
import { Box, HStack, Text, useTheme, VStack } from "@repo/ui/primitives";
import { Theme } from "@repo/ui/theme";
import { hapticLight } from "@repo/ui/utils/haptics";
import { ChevronLeft, Send, Sparkles } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	FlatList,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	TextInput,
	TouchableOpacity,
} from "react-native";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";
export default function AIAssistantScreen() {
	const navigation = useNavigation();
	const { gradientNodes, accent, glass, text, isDark } = useTheme();
	const { t } = useTranslation();
	const { messages, isThinking, sendMessage } = useAIAgent();
	const userRole = useStore((state) => state.userRole);
	const [inputText, setInputText] = useState("");
	const flatListRef = useRef<FlatList>(null);
	const handleSend = () => {
		if (!inputText.trim()) return;
		hapticLight();
		sendMessage(inputText);
		setInputText("");
	};
	useEffect(() => {
		if (messages.length > 0) {
			setTimeout(() => {
				flatListRef.current?.scrollToEnd({ animated: true });
			}, 100);
		}
	}, [messages]);
	const renderMessage = ({ item }: { item: Message }) => {
		const isUser = item.role === "user";
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
								? "rgba(255,255,255,0.08)"
								: "rgba(0,0,0,0.05)",
					},
				]}
			>
				<Text
					color={isUser ? gradientNodes[0] : text.primary}
					sx={{ fontSize: "$md" as any }}
				>
					{item.content}
				</Text>
			</Animated.View>
		);
	};
	return (
		<ScreenWrapper backgroundColor={gradientNodes[0]}>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				style={styles.container}
			>
				{/* Header */}
				<HStack
					style={[styles.header, { borderBottomColor: glass.surface.border }]}
				>
					<TouchableOpacity
						accessibilityRole="button"
						onPress={() => navigation.goBack()}
						style={[styles.backButton, { backgroundColor: glass.surface.bg }]}
					>
						<ChevronLeft color={text.primary} size={24} />
					</TouchableOpacity>
					<VStack>
						<HStack space="xs" alignItems="center">
							<Sparkles color={Theme.colors.gurudeviViolet} size={18} />
							<Text
								sx={{
									fontWeight: "700",
									fontSize: "$lg" as any,
									color: text.primary,
								}}
							>
								{t("aiAssistant.title")}
							</Text>
						</HStack>
						<Text color={text.secondary} size="xs">
							{t("aiAssistant.subtitle")}
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
							<Box sx={{ padding: "$md" as any, opacity: 0.6 }}>
								<Text color={text.secondary} italic size="sm">
									{t("aiAssistant.thinking")}
								</Text>
							</Box>
						) : null
					}
				/>

				{/* Input Area */}
				<Box style={styles.inputContainer}>
					{!userRole ? (
						<VStack space="xs" alignItems="center" p="$4">
							<Text color={text.secondary} size="sm" textAlign="center">
								{t("aiAssistant.loginPrompt")}
							</Text>
							<TouchableOpacity
								accessibilityRole="button"
								onPress={() => (navigation as any).navigate("Welcome")}
							>
								<Text color={accent.action} bold size="sm">
									{t("aiAssistant.continueLogin")}
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
								placeholder={t("aiAssistant.placeholder")}
								placeholderTextColor={text.secondary}
								value={inputText}
								onChangeText={setInputText}
								multiline
								maxLength={500}
							/>
							<TouchableOpacity
								accessibilityRole="button"
								onPress={handleSend}
								disabled={!inputText.trim()}
								style={[
									styles.sendButton,
									{
										backgroundColor: accent.action,
										opacity: inputText.trim() ? 1 : 0.5,
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
	);
}
const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		padding: Theme.spacing.lg,
		alignItems: "center",
		borderBottomWidth: 1,
		gap: Theme.spacing.md,
	},
	backButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	listContent: {
		padding: Theme.spacing.lg,
		paddingBottom: 40,
	},
	messageBubble: {
		padding: Theme.spacing.md,
		borderRadius: 18,
		marginBottom: Theme.spacing.md,
		maxWidth: "85%",
		...Theme.shadows.sm,
	},
	userBubble: {
		alignSelf: "flex-end",
		borderBottomRightRadius: 4,
	},
	assistantBubble: {
		alignSelf: "flex-start",
		borderBottomLeftRadius: 4,
	},
	inputContainer: {
		padding: Theme.spacing.md,
		paddingBottom: Platform.OS === "ios" ? 40 : Theme.spacing.md,
		backgroundColor: "transparent",
	},
	inputWrapper: {
		borderRadius: 24,
		paddingHorizontal: Theme.spacing.md,
		paddingVertical: 8,
		alignItems: "flex-end",
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
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 2,
	},
});
