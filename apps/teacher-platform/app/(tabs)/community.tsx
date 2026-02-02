import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router'; // <--- IMPORT THIS

export default function CommunityScreen() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // <--- INITIALIZE THIS

  useEffect(() => {
    async function fetchGroups() {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) console.error(error);
      else setGroups(data || []);
      
      setLoading(false);
    }
    fetchGroups();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Community Groups</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.groupCard}
              // THIS IS THE NEW PART:
              onPress={() => router.push({
                pathname: '/group_chat',
                params: { id: item.id, name: item.name }
              })}
            >
              <View style={styles.iconBox}>
                <IconSymbol name="person.2.fill" size={24} color="#007AFF" />
              </View>
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{item.name}</Text>
                <Text style={styles.groupDesc}>{item.description}</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color="#ccc" />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20, paddingTop: 60 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  groupCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconBox: {
    width: 50, height: 50,
    backgroundColor: '#E3F2FD',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  groupInfo: { flex: 1 },
  groupName: { fontSize: 18, fontWeight: '600', color: '#333' },
  groupDesc: { fontSize: 14, color: '#666', marginTop: 2 },
});