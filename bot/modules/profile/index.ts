import { Composer, InlineKeyboard, type Context } from 'grammy'
import {
  Conversation,
  type ConversationFlavor,
  createConversation
} from '@grammyjs/conversations'
import { prisma } from '../../../lib/prisma'
import { Profile } from './service'
import { constants } from '../../const/index.js'
import { Menu } from '@grammyjs/menu'
import { changeNameMenu, mainMenu, profileMenu } from '../../keyboards'

// export const profile = new Composer<ConversationFlavor<Context>>()

// const profileKeyboard = new InlineKeyboard()
//   .text('Изменить имя', 'change_name')
//   .row()
//   .text('Правила', 'rules')
//   .row()
//   .text('Назад', 'back')

async function getProfileText(ctx: Context) {
  const name = (await Profile.getUserName(ctx)) || ''
  return '👤 Профиль\n\n' + `Отображаемое имя: ***${name}***`
}

// Главное действие
// profile.callbackQuery('profile', async (ctx) => {
//   await ctx.editMessageText(await getProfileText(ctx), {
//     parse_mode: 'MarkdownV2',
//     reply_markup: profileMenu
//   })
// })

// ---- Изменение имени -----
// profile.callbackQuery(
//   'change_name',
//   async (ctx) => await ctx.conversation.enter('changeName')
// )

export async function changeName(conversation: Conversation, ctx: Context) {
  ctx.editMessageText('Напиши, пожалуйста, свое имя', {
    reply_markup: changeNameMenu
  })

  const name = await conversation.waitFor('message:text', {
    otherwise: (ctx) => ctx.reply('Пожалуйста, отправь имя')
  })

  try {
    await prisma.user.update({
      where: { id: ctx.from?.id || 1 },
      data: { firstName: name.message.text }
    })

    // Удаление сообщения пользователя
    await ctx.api
      .deleteMessage(ctx.chat!.id, name.message.message_id)
      .catch((e) => {
        console.error('Не удалось удалить сообщение', e)
      })

    // Обновление данных профиля
    await ctx.editMessageText(await getProfileText(ctx), {
      parse_mode: 'MarkdownV2',
      reply_markup: profileMenu
    })
  } catch (e) {
    ctx.editMessageText('К сожалению, не удалось поменять имя(')
    console.error(e)
  }
}

// ---- Правила ----
// profile.callbackQuery('rules', async (ctx) => {
//   await ctx.editMessageText(constants.rules1)
//   await ctx.reply(constants.rules2)
// })

// // Назад
// profile.callbackQuery('back', async (ctx) => {
//   await ctx.editMessageText('', {
//     reply_markup: mainMenu
//   })
// })
