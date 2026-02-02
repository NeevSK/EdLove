import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function PlannerScreen() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setTasks(data || []);
    setLoading(false);
  }

  // 1. Add a new Task
  async function handleAddTask() {
    if (newTask.trim().length === 0) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ title: newTask, user_id: user.id }])
      .select();

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      if (data) setTasks([data[0], ...tasks]);
      setNewTask('');
    }
  }

  // 2. Toggle "Done" / "Not Done"
  async function toggleTask(task: any) {
    // Optimistic Update (Change screen immediately)
    const updatedTasks = tasks.map(t => 
      t.id === task.id ? { ...t, is_complete: !t.is_complete } : t
    );
    setTasks(updatedTasks);

    // Update Database
    const { error } = await supabase
      .from('tasks')
      .update({ is_complete: !task.is_complete })
      .eq('id', task.id);

    if (error) Alert.alert("Error", error.message);
  }

  // 3. Delete Task
  async function deleteTask(id: string) {
    setTasks(tasks.filter(t => t.id !== id));
    await supabase.from('tasks').delete().eq('id', id);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>My Planner</Text>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task..."
          value={newTask}
          onChangeText={setNewTask}
        />
        <TouchableOpacity onPress={handleAddTask} style={styles.addButton}>
          <IconSymbol name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Task List */}
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.taskCard}>
              {/* Checkbox Button */}
              <TouchableOpacity onPress={() => toggleTask(item)}>
                <IconSymbol 
                  name={item.is_complete ? "checkmark.circle.fill" : "circle"} 
                  size={28} 
                  color={item.is_complete ? "#34C759" : "#ccc"} 
                />
              </TouchableOpacity>

              {/* Task Text (Strikethrough if done) */}
              <Text style={[
                styles.taskText, 
                item.is_complete && styles.completedText
              ]}>
                {item.title}
              </Text>

              {/* Delete Button */}
              <TouchableOpacity onPress={() => deleteTask(item.id)}>
                <IconSymbol name="trash" size={20} color="#ff3b30"  />
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
  
  inputContainer: { flexDirection: 'row', marginBottom: 20 },
  input: { 
    flex: 1, backgroundColor: 'white', padding: 15, 
    borderRadius: 12, fontSize: 16, marginRight: 10 
  },
  addButton: { 
    backgroundColor: '#007AFF', width: 50, height: 50, 
    borderRadius: 25, justifyContent: 'center', alignItems: 'center' 
  },

  taskCard: {
    flexDirection: 'row', backgroundColor: 'white', padding: 15,
    borderRadius: 12, marginBottom: 10, alignItems: 'center',
  },
  taskText: { flex: 1, fontSize: 16, marginLeft: 15, color: '#333' },
  completedText: { textDecorationLine: 'line-through', color: '#ccc' },
});