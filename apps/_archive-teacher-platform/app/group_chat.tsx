import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router'; // To get the Group ID
import { supabase } from '@/lib/supabase';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function GroupChatScreen() {
  // Get the group ID and Name passed from the previous screen
  const { id, name } = useLocalSearchParams();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [myUserId, setMyUserId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Get My User ID (so we know which bubbles are ours)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setMyUserId(session?.user?.id || null);
    });

    // 2. Fetch Messages for THIS group
    fetchMessages();

    // 3. Set up a "Listener" for new messages (Real-time!)
    const channel = supabase
      .channel('public:group_messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'group_messages',
        filter: `group_id=eq.${id}` // Only listen for THIS group
      }, (payload) => {
        // When a new message arrives, add it to the list
        setMessages((previous) => [...previous, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  async function fetchMessages() {
    const { data, error } = await supabase
      .from('group_messages')
      .select('*')
      .eq('group_id', id) // Filter by Group ID
      .order('created_at', { ascending: true }); // Oldest first

    if (error) console.error(error);
    else setMessages(data || []);
    setLoading(false);
  }

async function handleSend() {
    if (newMessage.trim().length === 0) return;

    const messageContent = newMessage; // Save text
    setNewMessage(''); // Clear input box immediately

    // 1. Send to Supabase
    const { error } = await supabase.from('group_messages').insert({
      content: messageContent,
      group_id: id,
      user_id: myUserId,
    });

    if (error) {
      console.error("Error sending:", error);
      // Ideally, show an alert here if it failed
    }
    
    // Note: We don't manually add it to the list here because 
    // the Realtime listener (which we just fixed) will do it automatically!
  }

  return (
    <View style={styles.container}>
      {/* Set the Header Title to the Group Name */}
      <Stack.Screen options={{ title: name as string, headerBackTitle: 'Groups' }} />

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[
              styles.messageBubble, 
              item.user_id === myUserId ? styles.myBubble : styles.otherBubble
            ]}>
              <Text style={[
                styles.messageText,
                item.user_id === myUserId ? styles.myText : styles.otherText
              ]}>
                {item.content}
              </Text>
            </View>
          )}
        />
      )}

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        keyboardVerticalOffset={100}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
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
  
  // Blue bubble on right (Me)
  myBubble: { backgroundColor: '#007AFF', alignSelf: 'flex-end', borderBottomRightRadius: 5 },
  myText: { color: 'white', fontSize: 16 },
  
  // White bubble on left (Others)
  otherBubble: { backgroundColor: 'white', alignSelf: 'flex-start', borderBottomLeftRadius: 5 },
  otherText: { color: '#333', fontSize: 16 },

  // THIS WAS MISSING:
  messageText: {
    fontSize: 16,
  },

  inputContainer: { flexDirection: 'row', padding: 15, backgroundColor: 'white', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#eee' },
  input: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 10, marginRight: 10, fontSize: 16 },
  sendButton: { backgroundColor: '#007AFF', width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
});