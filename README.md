# Synthia

Synthia - помощник для музыкальных плейлистов. Проект построен вокруг Telegram-бота, который помогает добавлять треки, собирать плейлисты и управлять музыкальной библиотекой.

## Стек

- TypeScript
- Node.js
- grammY
- Prisma
- SQLite / PostgreSQL-ready слой
- dotenv
- tsx
- oxlint
- Prettier

## Возможности

- Telegram bot interface на grammY
- Сценарии диалогов через `@grammyjs/conversations`
- Меню через `@grammyjs/menu`
- Работа с базой через Prisma

## Запуск

```bash
npm install
npm run dev
```

Для работы бота потребуется `.env` с токеном Telegram-бота и настройками базы данных.
