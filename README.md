# ⚽ Футбольные Прогнозы

Профессиональная платформа для футбольных прогнозов и ставок с современным монохромным дизайном.

## 🚀 Технологии

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** для стилизации
- **shadcn/ui** для UI компонентов
- **Supabase** для базы данных и аутентификации
- **Lucide React** для иконок
- **next-themes** для поддержки темной/светлой темы
- **Bun** как менеджер пакетов

## 📁 Структура проекта

```
react-shadcn-app/
├── public/
│   └── _redirects              # Netlify redirects config
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── button.tsx      # Button component
│   │   │   ├── input.tsx       # Input with icon support
│   │   │   └── label.tsx       # Label component
│   │   ├── Header.tsx          # Header with user info
│   │   └── LoginForm.tsx       # Login form + Players counter
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client setup
│   │   └── utils.ts            # Utility functions
│   ├── App.tsx                 # Main App component
│   ├── main.tsx                # Entry point with ThemeProvider
│   ├── index.css               # Global styles
│   └── vite-env.d.ts           # TypeScript definitions
├── .same/
│   └── todos.md                # Development todos
├── .env.local                  # Environment variables
├── netlify.toml                # Netlify deployment config
├── package.json                # Dependencies and scripts
├── tailwind.config.js          # Tailwind configuration
├── components.json             # shadcn/ui configuration
├── biome.json                  # Biome linter config
└── vite.config.ts              # Vite configuration
```

## 🎨 Особенности дизайна

- **Монохромная тема**: Черно-белый дизайн в стиле shadcn
- **Темная тема по умолчанию** с переключателем
- **Адаптивный дизайн** для всех устройств
- **Иконки в полях ввода** для улучшения UX
- **Круглый логотип** с футбольным мячом

## 🗄️ База данных

### Таблица `players`
```sql
- id: UUID (primary key)
- name: TEXT
- email: TEXT (unique)
- password: TEXT
- role: TEXT
- created_at: TIMESTAMP
```

## 🚀 Запуск проекта

1. **Установка зависимостей:**
   ```bash
   bun install
   ```

2. **Настройка переменных окружения:**
   ```bash
   # .env.local
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Запуск dev-сервера:**
   ```bash
   bun run dev
   ```

4. **Открыть в браузере:**
   ```
   http://localhost:5173
   ```

## 📝 Скрипты

- `bun run dev` - Запуск dev-сервера
- `bun run build` - Сборка для продакшена
- `bun run lint` - Проверка кода линтером
- `bun run format` - Форматирование кода
- `bun run preview` - Предпросмотр сборки

## 🔧 Конфигурация

### shadcn/ui
Проект настроен с темой `zinc` и использует:
- Tailwind CSS для стилизации
- CSS переменные для цветовой схемы
- Компоненты в папке `src/components/ui/`

### Supabase
- Аутентификация через email/пароль
- Таблица `players` для пользователей
- Подсчет зарегистрированных пользователей в реальном времени

## 🎯 Функционал

- ✅ Система входа с проверкой в Supabase
- ✅ Отображение количества зарегистрированных пользователей
- ✅ Переключение темы (темная/светлая)
- ✅ Адаптивный дизайн
- ✅ Валидация форм
- 🔄 Дашборд с прогнозами (в разработке)
- 🔄 Система рейтингов (в разработке)
- 🔄 Админ-панель (в разработке)

## 📞 Контакты

Регистрация новых пользователей — в телеграме: **@fabiocapello**

---

Сделано с ❤️ для любителей футбола
