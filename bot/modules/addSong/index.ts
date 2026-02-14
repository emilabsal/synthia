import { Composer, type Context } from 'grammy'
import {
  Conversation,
  type ConversationFlavor,
  createConversation
} from '@grammyjs/conversations'
import { cancel } from '../../keyboards/index.js'
import { prisma } from '../../../lib/prisma.js'

export const add = new Composer<ConversationFlavor<Context>>()

// types
export interface AudioFile {
  telegramFileId: string
  title: string
  performer: string
  duration: number
  fileName: string
  playlistId: string
  addedBy: string
  createdAt: Date
}

// ---- ДООБАВЛЕНИЕ ФАЙЛА ----
async function addFileHandler(conversation: Conversation, ctx: Context) {
  await ctx.reply('Можешь сюда загрузить аудиофайл', {
    reply_markup: cancel
  })

  const audioCtx = await conversation.waitFor('message:audio', {
    otherwise: (ctx) => ctx.reply('Пожалуйста, отправь аудиофайл')
  })

  const audio = audioCtx.message!.audio

  // Получаем файл
  const file = await audioCtx.api.getFile(audio.file_id)
  const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`

  console.log({
    fileId: audio.file_id,
    fileName: audio.file_name,
    duration: audio.duration,
    mimeType: audio.mime_type,
    fileUrl
  })

  // сохранение в БД
  const from = audioCtx.from!

  // пользователь (upsert)
  await prisma.user.upsert({
    where: { id: from.id },
    update: {
      username: from.username,
      firstName: from.first_name,
      lastName: from.last_name
    },
    create: {
      id: from.id,
      username: from.username,
      firstName: from.first_name,
      lastName: from.last_name
    }
  })

  // защита от дубликатов
  const exists = await prisma.song.findUnique({
    where: { fileUniqueId: audio.file_unique_id }
  })

  if (exists) {
    return audioCtx.reply('⚠️ Эта песня уже добавлена ранее')
  }

  // сохранение песни
  await prisma.song.create({
    data: {
      telegramFileId: audio.file_id,
      fileUniqueId: audio.file_unique_id,
      title: audio.title,
      performer: audio.performer,
      duration: audio.duration,
      fileName: audio.file_name,
      addedById: from.id
    }
  })

  // TODO:
  // 1. Сохранить информацию в БД
  // 2. Скачать файл на сервер (если нужно)
  // 3. Привязать к плейлисту
  // 4. Переименовать файл (если требуется)

  await audioCtx.reply('✅ Песня успешно добавлена', {
    reply_markup: {
      remove_keyboard: true
    }
  })
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

add.use(createConversation(addFileHandler))
add.command('add_song', (ctx) => ctx.conversation.enter('addFileHandler'))
