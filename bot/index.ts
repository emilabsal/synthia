// Imports
import 'dotenv/config'
import { Bot, InlineKeyboard, type Context } from 'grammy'
import { conversations, createConversation } from '@grammyjs/conversations'
import { add } from './modules/addSong/index.js'
import { currentRound } from './modules/currentRound/index.js'
// import { profile } from './modules/profile/index.js'
import { constants } from './const/index.js'
import { prisma } from '../lib/prisma.js'
import { changeNameMenu, mainMenu, profileMenu } from './keyboards/index.js'
import { changeName } from './modules/profile/index.js'

// Инициализация
const bot = new Bot(process.env.BOT_TOKEN || '')

// Функция для создания или получения пользователя
bot.use(async (ctx, next) => {
  if (ctx.from) {
    const userId = ctx.from.id
    // Проверяем, есть ли пользователь в базе
    const userExist = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!userExist) {
      // Создаем пользователя только один раз
      await prisma.user.create({
        data: {
          id: userId,
          firstName: ctx.from.first_name,
          lastName: ctx.from.last_name || null,
          username: ctx.from.username || null
        }
      })
      console.log(`Добавлен пользователь: ${ctx.from.first_name}`)
    }
  }

  // Продолжаем выполнение остальных middleware/хэндлеров
  await next()
})

// Модули
bot.use(conversations() as any)
// bot.use(add as any)
bot.use(currentRound as any)
// bot.use(profile as any)
bot.use(createConversation(changeName) as any)
bot.use(profileMenu)
bot.use(mainMenu)
// bot.use(changeNameMenu)

// Меню
await bot.api.setMyCommands([{ command: 'start', description: 'Начать' }])

// Старт
bot.command('start', async (ctx) => {
  await ctx.deleteMessage().catch(() => {})
  ctx.reply(constants.greeting, {
    reply_markup: mainMenu
  })
})

// Обработка ошибок
// bot.on('message', (ctx) =>
//   ctx.reply('Извини, я тебя не понимаю или возникла ошибка')
// )

// Логирование ошибок
bot.catch((err) => console.error(err))

// Запуск бота
bot.start()
