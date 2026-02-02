import { useState } from 'react';
import { Alert, StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase'; // Import your connection

export default function LoginScreen() {
  // "State" variables to hold what the user types
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Function 1: Log In an existing user
  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("Login Failed", error.message);
      setLoading(false); // Stop loading if failed
    } 
    // IF SUCCESS: We do NOTHING here. 
    // The Gatekeeper in _layout.tsx will see the login and move you automatically.
  }

  // Function 2: Create a NEW user
  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("Sign Up Failed", error.message);
      setLoading(false);
    } else {
      Alert.alert("Success!", "Account created.");
      // The Gatekeeper will handle the rest.
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Teacher Login</Text>
        <Text style={styles.subtitle}>Sign in or create an account</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput 
            style={styles.input} 
            placeholder="teacher@school.lk" 
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput 
            style={styles.input} 
            placeholder="********" 
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Loading Spinner or Buttons */}
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
        ) : (
          <>
            <TouchableOpacity style={styles.button} onPress={signInWithEmail}>
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={signUpWithEmail}>
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Create Account</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 20,
  },
  content: { width: '100%' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#666', marginBottom: 40 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, color: '#333', marginBottom: 8, fontWeight: '600' },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#007AFF',
    marginTop: 15,
  },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  secondaryButtonText: { color: '#007AFF' },
});