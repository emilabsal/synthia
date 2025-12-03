import { Composer, type Context } from 'grammy'
import {
  Conversation,
  type ConversationFlavor,
  createConversation,
} from "@grammyjs/conversations";
import { cancel } from '../../keyboads/index.js';

export const add = new Composer<ConversationFlavor<Context>>()


// Добавить новую песню
async function addFileHandler(conversation: Conversation, ctx: Context) {
  await ctx.reply('Можешь сюда загрузить файл', { reply_markup: cancel })

  const { message } = await conversation.waitFor("message:audio", {
    otherwise: (ctx) => ctx.reply('Отправь плиз песню, что неясно?')
  });


  // Добавление файла
  const file = await ctx.getFile();
  console.log(file, 'file')

  // Работа с бд и сервером

  // Проверка на текущую тему и название файла (переименовать, изменить свое имя)



}


// Действия при отмене добавления песни
add.hears('Отмена', async (ctx) => {
  await ctx.conversation.exit('addFileHandler')
  ctx.reply('Отменено', {
    reply_markup: {
      remove_keyboard: true
    }
  })
})

add.use(createConversation(addFileHandler));
add.command('add_song', ctx => ctx.conversation.enter('addFileHandler'))





