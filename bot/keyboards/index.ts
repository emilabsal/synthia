import { Menu } from '@grammyjs/menu'
import { Composer, InlineKeyboard, Keyboard, type Context } from 'grammy'
import { changeName } from '../modules/profile'

// Главное меню
export const mainMenu = new Menu<Context>('main_menu')
mainMenu.submenu('👤 Профиль', 'profile', (ctx) =>
  ctx.editMessageText('Вы в профиле')
)
mainMenu.row()
mainMenu.text('📜 Правила', (ctx) => ctx.editMessageText('Здесь правила...'))

// Меню профиля
export const profileMenu = new Menu<Context>('profile')
profileMenu.submenu(
  'Изменить имя',
  'change_name',
  async (ctx) => await (ctx as any).conversation.enter('changeName')
)
profileMenu.row()
profileMenu.back('Назад', (ctx) =>
  ctx.editMessageText('Главное меню', {
    reply_markup: mainMenu
  })
)

export const changeNameMenu = new Menu<Context>('change_name').back('Назад')

// mainMenu.register(profileMenu)
// profileMenu.register(changeNameMenu)

// export const mainMenu = new InlineKeyboard()
//   .text('📅 Текущий раунд', 'current_round')
//   .row()
//   .text('🎧 Мои плейлисты', 'my_playlists')
//   .row()
//   .text('👤 Профиль', 'profile')
//   .row()
//   .text('📜 Правила', 'rules')
//   .row()
//   .text('📊 Статистика', 'statistics')

// Отмена
export const cancel = new Keyboard().text('Отмена').row().resized()

export const addSongMenu = new InlineKeyboard()
  .text('Новая песня', 'new_song')
  .text('Изменить песню', 'edit_song')
  .row()
