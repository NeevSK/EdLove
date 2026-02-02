import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import YoutubePlayer from "react-native-youtube-iframe"; // The Player
import { supabase } from '@/lib/supabase';

export default function CoursesScreen() {
  const [courses, setCourses] = useState<any[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null); // Which video is playing?
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    const { data, error } = await supabase.from('courses').select('*');
    if (error) console.error(error);
    else setCourses(data || []);
    setLoading(false);
  }

  // Helper to handle video state
  const onStateChange = useCallback((state: string) => {
    if (state === "ended") {
      Alert.alert("Course Completed!", "You have finished this lesson.");
      setPlayingId(null);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>CPD Courses</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* IF this card is selected, show VIDEO. ELSE show IMAGE */}
              {playingId === item.id ? (
                <View style={styles.videoContainer}>
                  <YoutubePlayer
                    height={200}
                    play={true}
                    videoId={item.video_id}
                    onChangeState={onStateChange}
                  />
                  <TouchableOpacity onPress={() => setPlayingId(null)} style={styles.closeButton}>
                    <Text style={styles.closeText}>Close Video</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setPlayingId(item.id)}>
                  <Image source={{ uri: item.thumbnail_url }} style={styles.thumbnail} />
                  {/* Play Icon Overlay */}
                  <View style={styles.playOverlay}>
                    <Text style={styles.playIcon}>▶</Text>
                  </View>
                </TouchableOpacity>
              )}

              <View style={styles.info}>
                <Text style={styles.courseTitle}>{item.title}</Text>
                <Text style={styles.courseDesc}>{item.description}</Text>
              </View>
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
  card: { backgroundColor: 'white', borderRadius: 15, marginBottom: 20, overflow: 'hidden' },
  
  thumbnail: { width: '100%', height: 200 },
  playOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)'
  },
  playIcon: { fontSize: 40, color: 'white' },
  
  videoContainer: { height: 240, backgroundColor: 'black' },
  closeButton: { padding: 10, alignItems: 'center', backgroundColor: '#333' },
  closeText: { color: 'white', fontWeight: 'bold' },

  info: { padding: 15 },
  courseTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  courseDesc: { fontSize: 14, color: '#666' },
});