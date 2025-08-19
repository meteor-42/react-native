// Импорт основных React хуков для управления состоянием и жизненным циклом
import React, { useState, useEffect } from 'react';
// Библиотека для показа уведомлений (Toast) пользователю
import Toast from "react-native-toast-message";
// Провайдер для безопасных зон экрана (избегает наложения на системные элементы)
import { SafeAreaProvider } from 'react-native-safe-area-context';
// Конфигурированный клиент Supabase для работы с базой данных
import { supabase } from './lib/supabase';
// Экран авторизации (логин/регистрация)
import AuthScreen from './components/AuthScreen';
// Основной экран приложения после авторизации
import DashboardScreen from './components/DashboardScreen';
// Экран загрузки, показываемый при инициализации приложения
import LoadingScreen from './components/LoadingScreen';
// Импорт конфигурации приложения для получения версии
import appJson from './app.json';

/**
 * Главный компонент приложения Ludic App
 * Управляет авторизацией, состоянием пользователя и навигацией между экранами
 */
export default function App() {
  // Состояние сессии пользователя (null = не авторизован)
  const [session, setSession] = useState(null);
  // Состояние загрузки для показа экрана инициализации
  const [loading, setLoading] = useState(true);
  // Данные текущего пользователя из базы данных
  const [user, setUser] = useState(null);

  // Получение версии приложения из конфигурации (app.json)
  const appVersion = appJson?.expo?.version || '0.0.0';

  /**
   * Эффект инициализации приложения
   * Выполняется один раз при запуске приложения (пустой массив зависимостей)
   */
  useEffect(() => {
    const init = async () => {
      // Проверяем наличие активной сессии пользователя
      await checkSession();
      // После проверки сессии убираем экран загрузки
      setLoading(false);
    };
    init();
  }, []); // Пустой массив = выполнить только при монтировании компонента

  /**
   * Проверка текущей сессии пользователя при запуске приложения
   * Если сессия активна, загружает данные пользователя из базы
   */
  const checkSession = async () => {
    try {
      // Получаем текущую сессию из Supabase Auth
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Ошибка при проверке сессии:", error.message);
        return;
      }

      // Устанавливаем сессию в состояние
      setSession(session);

      // Если сессия активна и есть email пользователя
      if (session?.user?.email) {
        // Загружаем дополнительные данные пользователя из таблицы players
        await fetchUserData(session.user.email);
      }
    } catch (error) {
      console.error("Ошибка checkSession:", error);
    }
  };

  /**
   * Загрузка дополнительных данных пользователя из таблицы players
   * @param {string} email - Email адрес пользователя для поиска в базе
   */
  const fetchUserData = async (email) => {
    try {
      // Запрос к таблице players по email адресу
      const { data, error } = await supabase
        .from('players')           // Таблица игроков
        .select('*')              // Выбираем все поля
        .eq('email', email)       // Фильтр по email
        .single();               // Ожидаем одну запись

      if (error) {
        console.error('Ошибка загрузки данных пользователя:', error.message);
        // Показываем пользователю уведомление об ошибке
        Toast.show({
          type: 'error',
          text1: 'Ошибка',
          text2: 'Не удалось загрузить данные пользователя',
        });
        return;
      }

      // Сохраняем данные пользователя в состояние
      setUser(data);
    } catch (error) {
      console.error('Ошибка fetchUserData:', error);
      // Показываем общее сообщение об ошибке
      Toast.show({
        type: 'error',
        text1: 'Ошибка',
        text2: 'Произошла ошибка при получении данных пользователя',
      });
    }
  };

  /**
   * Обработка авторизации пользователя
   * ВАЖНО: Использует кастомную авторизацию, не стандартную Supabase Auth
   * Разрешает вход только администраторам
   *
   * @param {string} email - Email пользователя
   * @param {string} password - Пароль пользователя
   * @returns {Object} Результат авторизации {success: boolean, error?: string}
   */
  const handleLogin = async (email, password) => {
    try {
      // Поиск пользователя в таблице players с проверкой роли администратора
      // ВНИМАНИЕ: Пароли хранятся в открытом виде - НЕ безопасно для продакшна!
      const { data: playerData, error: playerError } = await supabase
        .from('players')          // Таблица игроков
        .select('*')             // Выбираем все поля
        .eq('email', email)      // Фильтр по email
        .eq('password', password) // Фильтр по паролю (небезопасно!)
        .eq('role', 'admin')     // Только администраторы
        .single();              // Ожидаем одну запись

      // Если пользователь не найден или произошла ошибка
      if (playerError || !playerData) {
        throw new Error('Доступ разрешен только администраторам');
      }

      // Создаем "псевдо-сессию" вручную (не используем Supabase Auth)
      setUser(playerData);
      setSession({ user: { email: playerData.email } });

      // Показываем успешное уведомление
      Toast.show({
        type: 'success',
        text1: 'Успешный вход',
        text2: `Добро пожаловать, ${playerData.name}`,
      });

      return { success: true };
    } catch (error) {
      // Показываем ошибку пользователю
      Toast.show({
        type: 'error',
        text1: 'Ошибка входа',
        text2: error.message,
      });
      return { success: false, error: error.message };
    }
  };

  /**
   * Обработка выхода пользователя из системы
   * Очищает все данные сессии и пользователя
   */
  const handleLogout = () => {
    // Очищаем сессию
    setSession(null);
    // Очищаем данные пользователя
    setUser(null);
    // Информируем пользователя о выходе
    Toast.show({
      type: 'info',
      text1: 'Выход выполнен',
    });
  };

  // Показываем экран загрузки во время инициализации приложения
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    // SafeAreaProvider обеспечивает корректное отображение на устройствах с "челкой" и закругленными углами
    <SafeAreaProvider>
      {/* Компонент Toast должен быть в корне для показа уведомлений поверх всех экранов */}
      <Toast />

      {/* Условный рендеринг: показываем разные экраны в зависимости от состояния авторизации */}
      {session && user ? (
        // Если пользователь авторизован - показываем основной экран приложения
        <DashboardScreen user={user} onLogout={handleLogout} />
      ) : (
        // Если не авторизован - показываем экран входа
        <AuthScreen onLogin={handleLogin} version={appVersion} />
      )}
    </SafeAreaProvider>
  );
}
