import { Composer, InlineKeyboard, type Context } from 'grammy'
import {
  Conversation,
  type ConversationFlavor,
  createConversation
} from '@grammyjs/conversations'

export const currentRound = new Composer<ConversationFlavor<Context>>()

const currentRoundKeyboard = new InlineKeyboard()
  .text('Добавить песню', 'add_song')
  .row()
  .text('Добавить тему', 'add_theme')

currentRound.callbackQuery('current_round', (ctx) => {
  ctx
    .editMessageText(
      `
    📅 Текущий раунд

🎯 Тема: Ночной город
Описание: бла бла бла
👑 Ведущий: @user

🎵 Моя песня: ❌ не добавлена 
Моя тема: ❌ не добавлена
⏳ До дедлайна: {2 дня}`, //посчитать, проверить наличие песни
      {
        reply_markup: currentRoundKeyboard
      }
    )
    .catch(() => {})
})
