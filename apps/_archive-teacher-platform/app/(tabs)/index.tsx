import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';


export default function HomeScreen() {
  


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Teacher Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back!</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.placeholderText}>
          Your daily tasks will appear here.
        </Text>
      </View>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: { marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 5 },
  content: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  placeholderText: { color: '#999' },
  logoutButton: {
    backgroundColor: '#ff3b30', // Red for "Danger/Logout"
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});