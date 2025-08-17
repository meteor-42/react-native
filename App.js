import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from './lib/supabase';
import AuthScreen from './components/AuthScreen';
import DashboardScreen from './components/DashboardScreen';
import LoadingScreen from './components/LoadingScreen';
import appJson from './app.json';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const appVersion = appJson?.expo?.version || '0.0.0';

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        await fetchUserData(session.user.email);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (email) => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        return;
      }

      setUser(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleLogin = async (email, password) => {
    try {
      // Проверяем пользователя в таблице players
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (playerError || !playerData) {
        throw new Error('Неверный email или пароль');
      }

      // Создаем временную сессию (поскольку регистрация не используется)
      setUser(playerData);
      setSession({ user: { email: playerData.email } });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleLogout = () => {
    setSession(null);
    setUser(null);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      {session && user ? (
        <DashboardScreen user={user} onLogout={handleLogout} />
      ) : (
        <AuthScreen onLogin={handleLogin} version={appVersion} />
      )}
    </SafeAreaProvider>
  );
}
