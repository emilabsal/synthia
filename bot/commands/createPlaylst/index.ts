import { Composer, type Context } from 'grammy'
import {
  Conversation,
  type ConversationFlavor,
  createConversation,
} from "@grammyjs/conversations";

export const createPlaylist = new Composer<ConversationFlavor<Context>>()


async function addPlaylist(conversation: Conversation, ctx: Context) {
  await ctx.reply('Введите название плейлиста')

  const { message } = await conversation.waitFor('message:text', {
    otherwise: (ctx) => ctx.reply('Нужно текстовое сообщение')
  })

  console.log(message.text, 'hello')

}

// Session Storage (хранение текста)

// Основные команды и middlewares
createPlaylist.use(createConversation(addPlaylist));
createPlaylist.command('create_playlist', (ctx) => ctx.conversation.enter('addPlaylist'))
