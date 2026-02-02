import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { sendMessageToAI } from '@/lib/aiService'; // <--- Import your new brain

export default function ChatScreen() {
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello! I am your AI Assistant. How can I help you today?', sender: 'ai' },
  ]);
  const [loading, setLoading] = useState(false); // To show spinner

  const handleSend = async () => {
    if (messageText.trim().length === 0) return;

    // 1. Add User Message to Screen
    const userMsg = { id: Date.now().toString(), text: messageText, sender: 'user' };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setMessageText(''); // Clear input
    setLoading(true);   // Start thinking

    // 2. Ask the AI (The Service)
    const aiResponseText = await sendMessageToAI(messageText);

    // 3. Add AI Message to Screen
    const aiMsg = { id: (Date.now() + 1).toString(), text: aiResponseText, sender: 'ai' };
    setMessages([...newHistory, aiMsg]);
    setLoading(false);  // Stop thinking
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble, 
            item.sender === 'user' ? styles.userBubble : styles.aiBubble
          ]}>
            <Text style={[
              styles.messageText,
              item.sender === 'user' ? styles.userText : styles.aiText
            ]}>
              {item.text}
            </Text>
          </View>
        )}
      />

      {/* Loading Spinner */}
      {loading && (
        <View style={{ padding: 10, alignItems: 'center' }}>
          <Text style={{ color: '#999', fontSize: 12 }}>AI is typing...</Text>
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      )}

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        keyboardVerticalOffset={100}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask about a lesson plan..."
            value={messageText}
            onChangeText={setMessageText}
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton} disabled={loading}>
            <IconSymbol name="paperplane.fill" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  listContent: { padding: 20, paddingBottom: 20 },
  messageBubble: { padding: 15, borderRadius: 20, marginBottom: 10, maxWidth: '80%' },
  aiBubble: { backgroundColor: 'white', alignSelf: 'flex-start', borderBottomLeftRadius: 5 },
  userBubble: { backgroundColor: '#007AFF', alignSelf: 'flex-end', borderBottomRightRadius: 5 },
  messageText: { fontSize: 16 },
  aiText: { color: '#333' },
  userText: { color: 'white' },
  inputContainer: { flexDirection: 'row', padding: 15, backgroundColor: 'white', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#eee' },
  input: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 10, marginRight: 10, fontSize: 16 },
  sendButton: { backgroundColor: '#007AFF', width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
});