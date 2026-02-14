import { Menu } from '@grammyjs/menu'

// Создание календаря
export function createCalendarMenu(
  name: string,
  onFinish: (ctx: any, date: Date) => Promise<void>
) {
  const menu = new Menu<any>(name)

  // Рендер месяца
  menu.dynamic(async (ctx, range) => {
    const session = getSession(ctx)

    const firstDay = new Date(session.year, session.month, 1)
    const daysInMonth = new Date(session.year, session.month + 1, 0).getDate()
    const startWeekday = (firstDay.getDay() + 6) % 7

    range
      .text(`◀`, async (ctx) => {
        session.month--
        if (session.month < 0) {
          session.month = 11
          session.year--
        }

        ctx.menu.update()
      })
      .text(`${monthNames[session.month]} ${session.year}`)
      .text(`▶`, async (ctx) => {
        session.month++
        if (session.month > 11) {
          session.month = 0
          session.year++
        }

        ctx.menu.update()
      })
      .row()

    // Заголовки дней недели
    range
      .text('Пн')
      .text('Вт')
      .text('Ср')
      .text('Чт')
      .text('Пт')
      .text('Сб')
      .text('Вс')
      .row()

    // Пустые клетки перед 1 числом
    for (let i = 0; i < startWeekday; i++) range.text(' ')

    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      range.text(String(day), async (ctx) => {
        session.day = day
        await ctx.menu.nav(name + '-time')
      })

      if ((startWeekday + day) % 7 === 0) range.row()
    }

    // Пустые клетки после последнего числа
    if ((startWeekday + daysInMonth) % 7 !== 0) {
      for (let i = (startWeekday + daysInMonth) % 7; i < 7; i++) range.text(' ')
    }
  })

  // Меню выбора времени
  const timeMenu = new Menu<any>(name + '-time').dynamic((ctx, range) => {
    const session = getSession(ctx)

    range.text('◀', () => {
      session.hour = (session.hour ?? 12) - 1
      if (session.hour < 0) session.hour = 23
      ctx.menu.update()
    })
    range.text(`Час: ${session.hour ?? '0'}`)
    range
      .text('▶', () => {
        session.hour = (session.hour ?? 12) + 1
        if (session.hour > 23) session.hour = 0
        ctx.menu.update()
      })
      .row()

    range.text('◀', () => {
      session.minute = (session.minute ?? 0) - 5
      if (session.minute < 0) session.minute = 55
      ctx.menu.update()
    })
    range.text(`Мин: ${session.minute ?? '--'}`)
    range
      .text('▶', () => {
        session.minute = (session.minute ?? 0) + 5
        if (session.minute > 55) session.minute = 0
        ctx.menu.update()
      })
      .row()

    range.row().text('◀ Назад', async (ctx) => {
      await ctx.menu.nav(name)
    })

    if (
      session.day !== undefined &&
      session.hour !== undefined &&
      session.minute !== undefined
    ) {
      range.text('✔ Готово', async (ctx) => {
        const date = new Date(
          session.year,
          session.month,
          session.day!,
          session.hour!,
          session.minute!
        )
        await onFinish(ctx, date)
      })
    }
  })

  menu.register(timeMenu)

  return menu
}

function getSession(ctx: any): any {
  if (!ctx.session.calendar) {
    const now = new Date()
    ctx.session.calendar = {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: undefined,
      hour: 0,
      minute: 0
    }
  }
  return ctx.session.calendar
}

const monthNames = [
  'Янв',
  'Фев',
  'Мар',
  'Апр',
  'Май',
  'Июн',
  'Июл',
  'Авг',
  'Сен',
  'Окт',
  'Ноя',
  'Дек'
]
