import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ProfileScreen() {
  const [email, setEmail] = useState('Loading...');

  useEffect(() => {
    // Get the current user's email
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setEmail(user.email || 'No Email');
    });
  }, []);

  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Log Out", 
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          // The Gatekeeper (_layout.tsx) handles the redirect!
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>My Profile</Text>

      {/* Avatar Section */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <IconSymbol name="person.circle.fill" size={80} color="#007AFF" />
        </View>
        <Text style={styles.emailText}>{email}</Text>
        <Text style={styles.roleText}>Teacher • Sri Lanka</Text>
      </View>

      {/* Menu Options */}
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <IconSymbol name="gear" size={24} color="#333" />
          <Text style={styles.menuText}>App Settings</Text>
          <IconSymbol name="chevron.right" size={20} color="#ccc" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <IconSymbol name="questionmark.circle" size={24} color="#333" />
          <Text style={styles.menuText}>Help & Support</Text>
          <IconSymbol name="chevron.right" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <IconSymbol name="lock" size={24} color="#333" />
          <Text style={styles.menuText}>Privacy Policy</Text>
          <IconSymbol name="chevron.right" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
      
      <Text style={styles.versionText}>Version 1.0.0 (Beta)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20, paddingTop: 60 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  
  profileCard: { backgroundColor: 'white', borderRadius: 20, padding: 30, alignItems: 'center', marginBottom: 20 },
  avatarContainer: { marginBottom: 15 },
  emailText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  roleText: { fontSize: 14, color: '#666', marginTop: 5 },

  menuContainer: { backgroundColor: 'white', borderRadius: 15, padding: 10, marginBottom: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  menuText: { flex: 1, fontSize: 16, marginLeft: 15, color: '#333' },

  logoutButton: { backgroundColor: '#ffe5e5', padding: 15, borderRadius: 12, alignItems: 'center' },
  logoutText: { color: '#ff3b30', fontWeight: 'bold', fontSize: 16 },
  
  versionText: { textAlign: 'center', color: '#999', marginTop: 20, fontSize: 12 },
});