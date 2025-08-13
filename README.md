# React Shadcn/UI проект

Современное React приложение, построенное с использованием последних технологий для создания красивых и функциональных пользовательских интерфейсов.

## 🚀 Технологический стек

- **React 18** - Библиотека для создания пользовательских интерфейсов
- **TypeScript** - Типизированный JavaScript для более надежного кода
- **Vite** - Быстрый инструмент сборки и сервер разработки
- **Tailwind CSS** - CSS-фреймворк для быстрой стилизации
- **shadcn/ui** - Коллекция красивых и доступных компонентов
- **Radix UI** - Низкоуровневые UI примитивы для создания компонентов
- **Bun** - Быстрый JavaScript runtime и менеджер пакетов
- **Biome** - Быстрый линтер и форматтер

## 🛠️ Установка и запуск

### Предварительные требования

- [Bun](https://bun.sh/) (рекомендуется) или Node.js 18+

### Установка зависимостей

```bash
# Клонировать проект
cd react-shadcn-app

# Установить зависимости
bun install
```

### Команды разработки

```bash
# Запуск dev сервера
bun run dev

# Сборка для продакшена
bun run build

# Предварительный просмотр сборки
bun run preview

# Линтинг кода
bun run lint

# Форматирование кода
bun run format
```

## 📁 Структура проекта

```
react-shadcn-app/
├── public/                    # Статические файлы
│   └── _redirects            # Настройки перенаправления для Netlify
├── src/                      # Исходный код приложения
│   ├── components/           # React компоненты
│   │   └── ui/              # shadcn/ui компоненты
│   ├── lib/                 # Утилиты и хелперы
│   │   └── utils.ts         # Вспомогательные функции
│   ├── App.tsx              # Главный компонент приложения
│   ├── main.tsx             # Точка входа в приложение
│   ├── index.css            # Глобальные стили и Tailwind CSS
│   └── vite-env.d.ts        # TypeScript определения для Vite
├── biome.json               # Конфигурация Biome (линтер/форматтер)
├── components.json          # Конфигурация shadcn/ui
├── netlify.toml             # Конфигурация для деплоя на Netlify
├── package.json             # Зависимости и скрипты
├── postcss.config.js        # Конфигурация PostCSS
├── tailwind.config.js       # Конфигурация Tailwind CSS
├── tsconfig.json            # Конфигурация TypeScript
└── vite.config.ts           # Конфигурация Vite
```

## 🎨 Работа с shadcn/ui компонентами

### Добавление новых компонентов

```bash
# Основные компоненты
bunx shadcn@latest add -y -o button
bunx shadcn@latest add -y -o card
bunx shadcn@latest add -y -o input
bunx shadcn@latest add -y -o label

# Формы и валидация
bunx shadcn@latest add -y -o form
bunx shadcn@latest add -y -o checkbox
bunx shadcn@latest add -y -o radio-group
bunx shadcn@latest add -y -o select

# Навигация
bunx shadcn@latest add -y -o navigation-menu
bunx shadcn@latest add -y -o breadcrumb
bunx shadcn@latest add -y -o tabs

# Отображение данных
bunx shadcn@latest add -y -o table
bunx shadcn@latest add -y -o card
bunx shadcn@latest add -y -o badge
bunx shadcn@latest add -y -o avatar

# Модальные окна и всплывающие элементы
bunx shadcn@latest add -y -o dialog
bunx shadcn@latest add -y -o popover
bunx shadcn@latest add -y -o tooltip
bunx shadcn@latest add -y -o sheet

# Уведомления
bunx shadcn@latest add -y -o sonner  # Рекомендуется вместо toast
bunx shadcn@latest add -y -o alert

# Дополнительные компоненты
bunx shadcn@latest add -y -o dropdown-menu
bunx shadcn@latest add -y -o accordion
bunx shadcn@latest add -y -o calendar
bunx shadcn@latest add -y -o date-picker
```

### Импорт и использование компонентов

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function MyComponent() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Заголовок</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Имя</Label>
            <Input id="name" placeholder="Введите ваше имя" />
          </div>
          <Button>Отправить</Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

## 🎯 Особенности настройки

### Алиас импорта

Проект настроен с алиасом `@/` для импорта из папки `src/`:

```tsx
// Вместо
import { Button } from "../components/ui/button"

// Используйте
import { Button } from "@/components/ui/button"
```

### Тема и стилизация

- **Цветовая схема**: zinc (настроена в `components.json`)
- **CSS переменные**: определены в `src/index.css`
- **Кастомизация**: все компоненты shadcn/ui можно настраивать в `src/components/ui/`

### Полезные утилиты

Файл `src/lib/utils.ts` содержит функцию `cn()` для объединения CSS классов:

```tsx
import { cn } from "@/lib/utils"

// Использование
<div className={cn("base-class", condition && "conditional-class", className)} />
```

## 🚢 Деплой

Проект готов для деплоя на Netlify:

```bash
# Сборка проекта
bun run build

# Папка dist/ будет содержать готовые файлы для деплоя
```

## 📚 Дополнительные ресурсы

- [shadcn/ui документация](https://ui.shadcn.com/)
- [Tailwind CSS документация](https://tailwindcss.com/docs)
- [Radix UI документация](https://www.radix-ui.com/)
- [Vite документация](https://vitejs.dev/)
- [React документация](https://react.dev/)

## 🤝 Разработка

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add some amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request
