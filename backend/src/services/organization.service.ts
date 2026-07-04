import { prisma } from '../lib/prisma.js'
import { formatUser } from '../utils/serializers.js'
import { formatJoinedDate } from '../utils/date-format.js'

export async function listMembers(organizationId: string, search?: string) {
  const members = await prisma.organizationMember.findMany({
    where: {
      organizationId,
      ...(search
        ? {
            user: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            },
          }
        : {}),
    },
    include: { user: true },
    orderBy: { joinedAt: 'asc' },
  })

  return members.map((member) => ({
    ...formatUser(member.user),
    role: member.role.toLowerCase(),
    joinedAt: formatJoinedDate(member.joinedAt),
  }))
}
