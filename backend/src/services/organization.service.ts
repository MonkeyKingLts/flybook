import { prisma } from '../lib/prisma.js'
import { formatUser } from '../utils/serializers.js'

export async function listMembers(organizationId: string) {
  const members = await prisma.organizationMember.findMany({
    where: { organizationId },
    include: { user: true },
    orderBy: { joinedAt: 'asc' },
  })

  return members.map((member) => ({
    ...formatUser(member.user),
    role: member.role.toLowerCase(),
  }))
}
