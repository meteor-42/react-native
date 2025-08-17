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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    setLoading(true);
    const result = await onLogin(email, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Ошибка входа', result.error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>ВХОД</Text>
            <Text style={styles.subtitle}>Добро пожаловать</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>ПАРОЛЬ</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#666"
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>ВОЙТИ</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Авторизация через базу данных
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '100',
    color: '#fff',
    letterSpacing: 8,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    fontWeight: '300',
  },
  form: {
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 2,
    fontWeight: '300',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingVertical: 15,
    fontSize: 16,
    color: '#fff',
    fontWeight: '300',
  },
  loginButton: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 30,
    borderRadius: 0,
  },
  loginButtonDisabled: {
    backgroundColor: '#333',
  },
  loginButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 2,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '300',
  },
});
