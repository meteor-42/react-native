# Настройка приложения Supabase Auth

## 1. Настройка Supabase

1. Зарегистрируйтесь на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Скопируйте URL проекта и ANON ключ
4. Откройте файл `lib/supabase.js` и замените:
   - `YOUR_SUPABASE_URL` на URL вашего проекта
   - `YOUR_SUPABASE_ANON_KEY` на ваш ANON ключ

## 2. Создание таблицы players

Выполните этот SQL запрос в SQL Editor вашего Supabase проекта:

```sql
-- Создание таблицы players (если еще не создана)
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'player' CHECK (role IN ('admin', 'player')),
  points INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  total_predictions INTEGER DEFAULT 0,
  rank_position INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Вставка тестовых данных
INSERT INTO players (name, email, password, role, points, correct_predictions, total_predictions, rank_position)
VALUES
  ('admin', 'admin@example.com', 'admin123', 'admin', 500, 25, 30, 1),
  ('player1', 'player1@example.com', 'player123', 'player', 350, 18, 25, 2),
  ('player2', 'player2@example.com', 'player123', 'player', 280, 15, 22, 3),
  ('john', 'john@example.com', 'john123', 'player', 120, 8, 15, 4),
  ('sarah', 'sarah@example.com', 'sarah123', 'admin', 600, 30, 35, 0)
ON CONFLICT (name) DO UPDATE SET
  email = EXCLUDED.email,
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  points = EXCLUDED.points,
  correct_predictions = EXCLUDED.correct_predictions,
  total_predictions = EXCLUDED.total_predictions,
  rank_position = EXCLUDED.rank_position;

-- Настройка Row Level Security (опционально)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Политика для чтения данных игроков
CREATE POLICY "Players can read their own data" ON players
  FOR SELECT USING (true);
```

## 3. Тестовые учетные данные

### Администраторы:
- Email: admin@example.com / Password: admin123 (500 очков, ранг #1)
- Email: sarah@example.com / Password: sarah123 (600 очков, без ранга)

### Игроки:
- Email: player1@example.com / Password: player123 (350 очков, ранг #2)
- Email: player2@example.com / Password: player123 (280 очков, ранг #3)
- Email: john@example.com / Password: john123 (120 очков, ранг #4)

## 4. Запуск приложения

1. Установите зависимости:
   ```bash
   npm install
   ```

2. Запустите приложение:
   ```bash
   npm start
   ```

3. Выберите платформу (iOS/Android/Web) в Expo CLI

## 5. Особенности приложения

- **Монохромный дизайн**: Использует черно-белую цветовую схему
- **Авторизация без регистрации**: Проверка email/password в таблице players
- **Роли пользователей**:
  - Admin: Доступ к панели администратора, управление пользователями
  - Player: Персональный профиль, статистика игрока
- **Отображение имени**: После входа показывается имя пользователя из поля `name`

## 6. Структура проекта

```
/
├── App.js                    # Главный компонент приложения
├── lib/
│   └── supabase.js          # Конфигурация Supabase клиента
├── components/
│   ├── AuthScreen.js        # Экран авторизации
│   ├── DashboardScreen.js   # Главный экран с навигацией по ролям
│   ├── AdminDashboard.js    # Панель администратора
│   ├── PlayerDashboard.js   # Панель игрока
│   └── LoadingScreen.js     # Экран загрузки
├── package.json
├── app.json
├── babel.config.js
└── SETUP.md                 # Данный файл с инструкциями
```

## 7. Дополнительная настройка

### Настройка иконок и изображений
Поместите следующие файлы в папку `assets/`:
- `icon.png` (1024x1024) - иконка приложения
- `splash.png` (1242x2436) - заставка
- `adaptive-icon.png` (1024x1024) - адаптивная иконка для Android
- `favicon.png` (48x48) - фавикон для веб-версии

### Безопасность
В продакшене рекомендуется:
- Хешировать пароли в базе данных
- Использовать JWT токены для аутентификации
- Настроить правильные политики RLS в Supabase
- Добавить валидацию данных на сервере
