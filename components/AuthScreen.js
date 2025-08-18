import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { layout, screens, forms, colors, typography, spacing } from '../styles';

export default function AuthScreen({ onLogin, version }) {
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
    if (!result.success) Alert.alert('Ошибка входа', result.error);
  };

  return (
    <SafeAreaView style={layout.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={layout.flex1}>
        <View style={[layout.flex1, { justifyContent: 'center', paddingHorizontal: 40 }]}>
          <View style={{ alignItems: 'center', marginBottom: 60 }}>
            <Text style={{ fontSize: 32, fontWeight: '100', color: colors.text, letterSpacing: 8, marginBottom: 10 }}>ЛУДИК</Text>
            <Text style={{ fontSize: typography.lg, color: colors.textMuted, fontWeight: '300' }}>Добро пожаловать</Text>
          </View>

          <View style={{ marginBottom: 40 }}>
            <View style={{ marginBottom: 30 }}>
              <Text style={{ fontSize: typography.sm, color: colors.text, marginBottom: spacing.sm, letterSpacing: 2, fontWeight: '300' }}>EMAIL</Text>
              <TextInput style={{ borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 15, fontSize: typography.lg, color: colors.text, fontWeight: '300' }} value={email} onChangeText={setEmail} placeholder="your@email.com" placeholderTextColor="#666" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            </View>

            <View style={{ marginBottom: 30 }}>
              <Text style={{ fontSize: typography.sm, color: colors.text, marginBottom: spacing.sm, letterSpacing: 2, fontWeight: '300' }}>ПАРОЛЬ</Text>
              <TextInput style={{ borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 15, fontSize: typography.lg, color: colors.text, fontWeight: '300' }} value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor="#666" secureTextEntry />
            </View>

            <TouchableOpacity style={[{ backgroundColor: colors.accentLight, paddingVertical: 18, alignItems: 'center', marginTop: 30, borderRadius: 0 }, loading && { backgroundColor: '#333' }]} onPress={handleLogin} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={{ color: colors.accentLightText, fontSize: typography.md, fontWeight: '500', letterSpacing: 2 }}>ВОЙТИ</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: colors.textMuted, fontSize: typography.sm, fontWeight: '300' }}>Версия приложения: {version}</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
