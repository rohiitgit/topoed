import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { createUser, signIn } from '@/src/services/auth';
import { useAuthStore } from '@/src/stores/authStore';
import { UserRole } from '@/src/types';

type AuthMode = 'signin' | 'signup';

export default function OnboardingScreen() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();

  const roles: { label: string; value: UserRole }[] = [
    { label: 'Student', value: 'student' },
    { label: 'Professional', value: 'professional' },
    { label: 'Firm', value: 'firm' },
  ];

  const handleAuth = async () => {
    console.log('handleAuth called, mode:', mode);
    
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (mode === 'signup' && !name) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    console.log('Starting authentication process...');
    setLoading(true);

    try {
      if (mode === 'signup') {
        console.log('Creating new user...');
        const userData = await createUser(email, password, selectedRole, name);
        console.log('User created successfully:', userData);
        setUser(userData);
      } else {
        console.log('Signing in existing user...');
        await signIn(email, password);
      }
      console.log('Redirecting to home...');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Authentication error:', error);
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Architects' App</Text>
          <Text style={styles.subtitle}>
            {mode === 'signin' ? 'Welcome back!' : 'Join the community'}
          </Text>
        </View>

        <View style={styles.form}>
          {mode === 'signup' && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />

              <View style={styles.roleContainer}>
                <Text style={styles.roleLabel}>I am a:</Text>
                <View style={styles.roleButtons}>
                  {roles.map((role) => (
                    <TouchableOpacity
                      key={role.value}
                      style={[
                        styles.roleButton,
                        selectedRole === role.value && styles.roleButtonSelected,
                      ]}
                      onPress={() => setSelectedRole(role.value)}
                    >
                      <Text
                        style={[
                          styles.roleButtonText,
                          selectedRole === role.value && styles.roleButtonTextSelected,
                        ]}
                      >
                        {role.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchMode}
            onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          >
            <Text style={styles.switchModeText}>
              {mode === 'signin'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  roleContainer: {
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  roleButtonSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  roleButtonText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  roleButtonTextSelected: {
    color: 'white',
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  switchMode: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchModeText: {
    color: '#3498db',
    fontSize: 14,
  },
});