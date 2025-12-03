// Imports
import { Bot } from 'grammy'
import 'dotenv/config'
import { add } from './commands/addSong/index.js'
import { createPlaylist } from './commands/createPlaylst/index.js'
import {
  conversations,
} from "@grammyjs/conversations";

// Initialization
const bot = new Bot(process.env.BOT_TOKEN || '')
bot.use(conversations() as any)
bot.use(add as any)
bot.use(createPlaylist as any)

// Menu
await bot.api.setMyCommands([
  { command: 'add_song', description: 'Добавить песню' },
  { command: 'create_playlist', description: 'Создать плейлист' },
  { command: 'statistics', description: 'Статистика' },
  { command: 'settings', description: 'Настройки' }
])

// bot.on('message:text', ctx => ctx.react('👀'))

// Handle other messages
bot.on('message', (ctx) => ctx.reply(`
Извини, я тебя не понимаю или возникла ошибка 
В любом случае напиши [@Emil313](@Emil313)
`, { parse_mode: 'MarkdownV2' }))


bot.catch(err => console.error(err))

// Start
bot.start()
