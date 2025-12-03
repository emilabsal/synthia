import { Composer, InlineKeyboard, Keyboard } from "grammy"

export const keyboards = new Composer()

export const cancel = new Keyboard()
  .text('Отмена').row().resized()


export const addSongMenu = new InlineKeyboard()
  .text('Новая песня', 'new_song').text('Изменить песню', 'edit_song').row()