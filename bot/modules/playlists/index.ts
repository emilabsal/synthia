import {
  Composer,
  InlineKeyboard,
  type Context,
  type SessionFlavor
} from 'grammy'
import {
  Conversation,
  type ConversationFlavor,
  createConversation
} from '@grammyjs/conversations'
import { Menu, MenuRange, type MenuFlavor } from '@grammyjs/menu'
import type { Playlists } from '../../types/index.js'

export const playlistsMiddleware = new Composer<MyContext>()

type MyContext = Context &
  ConversationFlavor<any> &
  MenuFlavor &
  SessionFlavor<Playlists.Data>

const playlistsData: Playlists.Data = {
  title: '',
  description: '',
  time: ''
}

// МЕНЮ
export const playlistsMenu = new Menu<MyContext>('playlists')
  .text(
    'Создать плейлист',
    async (ctx) => await ctx.conversation.enter('createPlaylist')
  )
  .row()
  .text('Изменить плейлист')
  .row()
  .text('Статистика')

playlistsMiddleware.use(createConversation(createPlaylist))
playlistsMiddleware.use(playlistsMenu)

interface PlaylistWizard {
  step: 'title' | 'description' | 'date'
  title?: string
  description?: string
  date?: string
  messageId?: number
  calendarMonth?: number
  calendarYear?: number
}

function navigationKeyboard(step: PlaylistWizard['step']) {
  const kb = new InlineKeyboard()

  if (step !== 'title') kb.text('⬅ Назад', 'nav:back')
  if (step !== 'date') kb.text('➡ Вперёд', 'nav:next')

  return kb
}

function buildCalendar(
  year: number,
  month: number // 0–11
) {
  const kb = new InlineKeyboard()
  const date = new Date(year, month, 1)

  const monthName = date.toLocaleString('ru-RU', {
    month: 'long',
    year: 'numeric'
  })

  // Заголовок
  kb.text(`📅 ${monthName}`, 'ignore').row()

  // Дни недели
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  days.forEach((d) => kb.text(d, 'ignore'))
  kb.row()

  const firstDay = (date.getDay() + 6) % 7 // пн=0
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  let day = 1
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 7; j++) {
      if ((i === 0 && j < firstDay) || day > daysInMonth) {
        kb.text(' ', 'ignore')
      } else {
        const value = `${year}-${String(month + 1).padStart(2, '0')}-${String(
          day
        ).padStart(2, '0')}`
        kb.text(day.toString(), `date:${value}`)
        day++
      }
    }
    kb.row()
  }

  // Навигация по месяцам
  kb.text('⬅', 'cal:prev').text('➡', 'cal:next')

  return kb
}

async function editMain(
  ctx: MyContext,
  text: string,
  keyboard?: InlineKeyboard
) {
  const id = ctx.session.playlist.messageId!
  await ctx.api.editMessageText(ctx.chat!.id, id, text, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  })
}

async function renderStep(ctx: MyContext) {
  const s = ctx.session.playlist

  if (s.step === 'title') {
    await editMain(ctx, '🎵 Напиши название плейлиста')
  }

  if (s.step === 'description') {
    await editMain(
      ctx,
      `🎵 *Тема:* ${s.title}\n\n📝 Напиши описание`,
      navigationKeyboard('description')
    )
  }

  if (s.step === 'date') {
    await editMain(
      ctx,
      `🎵 *Тема:* ${s.title}
📝 *Описание:* ${s.description}

📅 Выбери дату`,
      buildCalendar(s.calendarYear!, s.calendarMonth!)
    )
  }
}

async function createPlaylist(
  conversation: Conversation<MyContext>,
  ctx: MyContext
) {
  ctx.session.playlist = {
    step: 'title',
    calendarMonth: new Date().getMonth(),
    calendarYear: new Date().getFullYear()
  }

  const main = await ctx.reply('🎵 Напиши название плейлиста')
  ctx.session.playlist.messageId = main.message_id

  while (true) {
    const step = ctx.session.playlist.step

    // ---------- TITLE ----------
    if (step === 'title') {
      const title = await conversation.waitFor('message:text')
      ctx.session.playlist.title = title.message.text
      await ctx.api.deleteMessage(ctx.chat!.id, title.message.message_id)

      ctx.session.playlist.step = 'description'
      await renderStep(ctx)
    }

    // ---------- DESCRIPTION ----------
    if (step === 'description') {
      const event = await conversation.waitFor([
        'message:text',
        'callback_query:data'
      ])

      // текст
      if (event.message?.text) {
        ctx.session.playlist.description = event.message.text
        await ctx.api.deleteMessage(ctx.chat!.id, event.message.message_id)

        ctx.session.playlist.step = 'date'
        await renderStep(ctx)
      }
    }

    // ---------- DATE ----------
    if (step === 'date') {
      const cb = await conversation.waitFor('callback_query:data')
      const data = cb.callbackQuery.data

      if (data.startsWith('date:')) {
        ctx.session.playlist.date = data.replace('date:', '')

        await editMain(
          ctx,
          `✅ *Готово!*

🎵 ${ctx.session.playlist.title}
📝 ${ctx.session.playlist.description}
📅 ${ctx.session.playlist.date}`
        )
        return
      }
    }
  }
}

// Открытие меню
playlistsMiddleware.command('playlists', async (ctx) => {
  await ctx.deleteMessage().catch(() => {})
  await ctx.reply('Выберите из предложенного', {
    reply_markup: playlistsMenu
  })
})

const changeDateTimeMenu = new Menu('change-datetime').text(
  'Изменить дату и время'
)

playlistsMiddleware.use(changeDateTimeMenu)
