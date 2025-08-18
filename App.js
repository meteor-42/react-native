import React, { useState, useEffect } from 'react';
import Toast from "react-native-toast-message";
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
    const init = async () => {
      await checkSession();
      setLoading(false);
    };
    init();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Ошибка при проверке сессии:", error.message);
        return;
      }
      setSession(session);
      if (session?.user?.email) {
        await fetchUserData(session.user.email);
      }
    } catch (error) {
      console.error("Ошибка checkSession:", error);
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
        console.error('Ошибка загрузки данных пользователя:', error.message);
        Toast.show({
          type: 'error',
          text1: 'Ошибка',
          text2: 'Не удалось загрузить данные пользователя',
        });
        return;
      }

      setUser(data);
    } catch (error) {
      console.error('Ошибка fetchUserData:', error);
      Toast.show({
        type: 'error',
        text1: 'Ошибка',
        text2: 'Произошла ошибка при получении данных пользователя',
      });
    }
  };

  const handleLogin = async (email, password) => {
    try {
      // Проверка на роль администратора
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .eq('role', 'admin')
        .single();

      if (playerError || !playerData) {
        throw new Error('Доступ разрешен только администраторам');
      }

      // Устанавливаем "сессию" вручную (т.к. используем кастомную auth)
      setUser(playerData);
      setSession({ user: { email: playerData.email } });

      Toast.show({
        type: 'success',
        text1: 'Успешный вход',
        text2: `Добро пожаловать, ${playerData.name}`,
      });

      return { success: true };
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Ошибка входа',
        text2: error.message,
      });
      return { success: false, error: error.message };
    }
  };

  const handleLogout = () => {
    setSession(null);
    setUser(null);
    Toast.show({
      type: 'info',
      text1: 'Выход выполнен',
    });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <Toast />
      {session && user ? (
        <DashboardScreen user={user} onLogout={handleLogout} />
      ) : (
        <AuthScreen onLogin={handleLogin} version={appVersion} />
      )}
    </SafeAreaProvider>
  );
}
