import { Card } from "@repo/ui/components/SanctuaryCard";
import { HStack } from "@repo/ui/primitives";
import { Theme } from "@repo/ui/theme";

import { useEffect, useRef, useState } from "react";
import {
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";

interface ChatMessage {
	id: string;
	text: string;
	sender: "user" | "assistant" | "system";
	timestamp: Date;
	isEditing?: boolean;
	metadata?: any;
}

interface InteractiveChatProps {
	title: string;
	messages: ChatMessage[];
	onSendMessage: (message: string, metadata?: any) => void;
	onEditMessage?: (messageId: string, newText: string) => void;
	onDeleteMessage?: (messageId: string) => void;
	height?: number;
	placeholder?: string;
	showTimestamps?: boolean;
	allowEditing?: boolean;
}

export function InteractiveChat({
	title,
	messages,
	onSendMessage,
	onEditMessage,
	onDeleteMessage,
	height = 400,
	placeholder = "Type your message...",
	showTimestamps = true,
	allowEditing = true,
}: InteractiveChatProps) {
	const [inputText, setInputText] = useState("");
	const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
	const scrollViewRef = useRef<ScrollView>(null);

	useEffect(() => {
		// Auto-scroll to bottom when new messages arrive
		if (scrollViewRef.current && messages.length > 0) {
			setTimeout(() => {
				scrollViewRef.current?.scrollToEnd({ animated: true });
			}, 100);
		}
	}, [messages.length]);

	const handleSend = () => {
		if (inputText.trim()) {
			onSendMessage(inputText.trim());
			setInputText("");
		}
	};

	const handleEdit = (messageId: string, currentText: string) => {
		if (onEditMessage) {
			setEditingMessageId(messageId);
			setInputText(currentText);
		}
	};

	const handleSaveEdit = () => {
		if (editingMessageId && onEditMessage) {
			onEditMessage(editingMessageId, inputText.trim());
			setEditingMessageId(null);
			setInputText("");
		}
	};

	const handleCancelEdit = () => {
		setEditingMessageId(null);
		setInputText("");
	};

	const handleDelete = (messageId: string) => {
		if (onDeleteMessage) {
			Alert.alert(
				"Delete Message",
				"Are you sure you want to delete this message?",
				[
					{ text: "Cancel", style: "cancel" },
					{
						text: "Delete",
						style: "destructive",
						onPress: () => onDeleteMessage(messageId),
					},
				],
			);
		}
	};

	const formatTimestamp = (date: Date) => {
		return date.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getMessageStyle = (message: ChatMessage) => {
		switch (message.sender) {
			case "user":
				return styles.userMessage;
			case "assistant":
				return styles.assistantMessage;
			case "system":
				return styles.systemMessage;
			default:
				return styles.systemMessage;
		}
	};

	const renderMessage = (message: ChatMessage) => {
		const isEditing = editingMessageId === message.id;

		return (
			<View key={message.id} style={styles.messageContainer}>
				<HStack style={styles.messageHeader}>
					<Text style={styles.senderText}>
						{message.sender === "user"
							? "You"
							: message.sender === "assistant"
								? "Assistant"
								: "System"}
					</Text>
					{showTimestamps && (
						<Text style={styles.timestampText}>
							{formatTimestamp(message.timestamp)}
						</Text>
					)}
				</HStack>

				<View style={styles.messageContent}>
					{isEditing && allowEditing ? (
						<TextInput
							style={styles.editInput}
							value={inputText}
							onChangeText={setInputText}
							multiline
							autoFocus
							placeholder="Edit message..."
						/>
					) : (
						<Text style={getMessageStyle(message)}>{message.text}</Text>
					)}
				</View>

				{allowEditing && message.sender !== "system" && (
					<HStack style={styles.messageActions}>
						{message.sender === "user" && (
							<>
								<Text
									style={styles.actionButton}
									onPress={() => handleEdit(message.id, message.text)}
								>
									Edit
								</Text>
								<Text
									style={styles.actionButton}
									onPress={() => handleDelete(message.id)}
								>
									Delete
								</Text>
							</>
						)}
					</HStack>
				)}

				{isEditing && (
					<HStack style={styles.editActions}>
						<Text
							style={[styles.actionButton, styles.saveButton]}
							onPress={handleSaveEdit}
						>
							Save
						</Text>
						<Text
							style={[styles.actionButton, styles.cancelButton]}
							onPress={handleCancelEdit}
						>
							Cancel
						</Text>
					</HStack>
				)}
			</View>
		);
	};

	return (
		<Card style={[styles.container, { height }]}>
			<Text style={styles.title}>{title}</Text>
			<ScrollView
				ref={scrollViewRef}
				style={styles.messagesContainer}
				showsVerticalScrollIndicator={false}
			>
				{messages.map(renderMessage)}
			</ScrollView>

			{/* Input Area */}
			<View style={styles.inputContainer}>
				<TextInput
					style={styles.textInput}
					value={inputText}
					onChangeText={setInputText}
					placeholder={placeholder}
					multiline
					maxLength={1000}
					editable={!editingMessageId}
					onSubmitEditing={handleSend}
				/>
				<Text
					style={[styles.sendButton, { opacity: inputText.trim() ? 1 : 0.5 }]}
					onPress={handleSend}
				>
					Send
				</Text>
			</View>
		</Card>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		margin: Theme.spacing.md,
	},
	title: {
		fontSize: 18,
		fontWeight: "700",
		color: Theme.colors.text,
		marginBottom: Theme.spacing.md,
		textAlign: "center",
	},
	messagesContainer: {
		flex: 1,
		paddingHorizontal: Theme.spacing.md,
	},
	messageContainer: {
		marginBottom: Theme.spacing.sm,
		padding: Theme.spacing.sm,
		borderRadius: Theme.corners.comfortable,
		backgroundColor: Theme.colors.background,
	},
	messageHeader: {
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: Theme.spacing.xs,
	},
	senderText: {
		fontSize: 12,
		fontWeight: "600",
		color: Theme.colors.gurudeviBlue,
	},
	timestampText: {
		fontSize: 10,
		color: Theme.colors.textSecondary,
	},
	messageContent: {
		marginBottom: Theme.spacing.xs,
	},
	userMessage: {
		backgroundColor: Theme.colors.gurudeviBlue,
		padding: Theme.spacing.sm,
		borderRadius: Theme.corners.comfortable,
	},
	assistantMessage: {
		backgroundColor: Theme.colors.background,
		padding: Theme.spacing.sm,
		borderRadius: Theme.corners.comfortable,
	},
	systemMessage: {
		backgroundColor: Theme.colors.warning,
		padding: Theme.spacing.sm,
		borderRadius: Theme.corners.comfortable,
	},
	defaultMessage: {
		backgroundColor: Theme.colors.background,
		padding: Theme.spacing.sm,
		borderRadius: Theme.corners.comfortable,
	},
	messageActions: {
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: Theme.spacing.xs,
	},
	actionButton: {
		fontSize: 12,
		color: Theme.colors.gurudeviBlue,
		padding: Theme.spacing.xs,
	},
	editActions: {
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: Theme.spacing.xs,
		marginTop: Theme.spacing.xs,
	},
	saveButton: {
		color: Theme.colors.success,
	},
	cancelButton: {
		color: Theme.colors.error,
	},
	inputContainer: {
		borderTopWidth: 1,
		borderTopColor: Theme.colors.border,
		padding: Theme.spacing.md,
		flexDirection: "row",
		alignItems: "flex-end",
		gap: Theme.spacing.sm,
	},
	textInput: {
		flex: 1,
		borderWidth: 1,
		borderColor: Theme.colors.border,
		borderRadius: Theme.corners.comfortable,
		padding: Theme.spacing.sm,
		fontSize: 14,
		color: Theme.colors.text,
		maxHeight: 100,
		textAlignVertical: "top",
	},
	sendButton: {
		backgroundColor: Theme.colors.gurudeviBlue,
		color: Theme.colors.background,
		paddingHorizontal: Theme.spacing.lg,
		paddingVertical: Theme.spacing.sm,
		borderRadius: Theme.corners.comfortable,
		fontSize: 16,
		fontWeight: "600",
	},
	editInput: {
		borderWidth: 1,
		borderColor: Theme.colors.border,
		borderRadius: Theme.corners.comfortable,
		padding: Theme.spacing.sm,
		fontSize: 14,
		color: Theme.colors.text,
		backgroundColor: Theme.colors.background,
		textAlignVertical: "top",
	},
});

// Export types
export type { ChatMessage, InteractiveChatProps };
