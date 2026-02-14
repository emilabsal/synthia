import { Context } from 'grammy'
import { prisma } from '../../../lib/prisma'

export namespace Profile {
  export async function getUserName(ctx: Context) {
    if (!ctx.from) return null

    const user = await prisma.user.findUnique({
      where: { id: ctx.from.id },
      select: { firstName: true }
    })

    return user?.firstName || 'Ошибка получения имени('
  }
}
