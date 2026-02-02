import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function JournalScreen() {
  const [entries, setEntries] = useState<any[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Load my journals when screen opens
  useEffect(() => {
    fetchJournals();
  }, []);

  async function fetchJournals() {
    const { data, error } = await supabase
      .from('journals')
      .select('*')
      .order('created_at', { ascending: false }); // Newest first

    if (error) console.error(error);
    else setEntries(data || []);
    setLoading(false);
  }

// 2. Save a new journal
  async function handleSave() {
    if (newEntry.trim().length === 0) return;

    // STEP A: Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert("Error", "You must be logged in to save.");
      return;
    }

    // STEP B: Send the content AND the user_id
    const { data, error } = await supabase
      .from('journals')
      .insert([{ 
        content: newEntry, 
        user_id: user.id // <--- THIS WAS MISSING!
      }])
      .select();

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      if (data) setEntries([data[0], ...entries]);
      setNewEntry('');
    }
  }

  // 3. Delete a journal
  async function handleDelete(id: string) {
    // Optimistic update: Remove it from screen immediately
    setEntries(entries.filter(item => item.id !== id));

    // Then delete from database
    const { error } = await supabase.from('journals').delete().eq('id', id);
    if (error) Alert.alert("Error deleting", error.message);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Daily Reflection</Text>

      {/* Input Area */}
      <View style={styles.inputCard}>
        <TextInput
          style={styles.input}
          placeholder="How was your class today?"
          multiline
          value={newEntry}
          onChangeText={setNewEntry}
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save Entry</Text>
        </TouchableOpacity>
      </View>

      {/* List of Entries */}
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.dateText}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
                <Text style={styles.entryText}>{item.content}</Text>
              </View>
              
              {/* Delete Button */}
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                <IconSymbol name="trash" size={20} color="#ff3b30" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20, paddingTop: 60 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  
  // Input Styles
  inputCard: { backgroundColor: 'white', padding: 15, borderRadius: 15, marginBottom: 20 },
  input: { fontSize: 16, minHeight: 60, textAlignVertical: 'top', marginBottom: 10 },
  saveButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveText: { color: 'white', fontWeight: 'bold' },

  // List Item Styles
  card: { 
    flexDirection: 'row', 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 10,
    alignItems: 'center'
  },
  dateText: { fontSize: 12, color: '#999', marginBottom: 5 },
  entryText: { fontSize: 16, color: '#333', lineHeight: 22 },
  deleteButton: { padding: 10 },
});