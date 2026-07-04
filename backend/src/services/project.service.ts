import { prisma } from '../lib/prisma.js'
import { BadRequestError, NotFoundError } from '../lib/errors.js'

export async function listProjects(organizationId: string) {
  const projects = await prisma.project.findMany({
    where: { organizationId },
    include: {
      tasks: { select: { status: true } },
      members: { include: { user: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })
  return projects
}

export async function getProject(projectId: string, organizationId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId },
    include: {
      tasks: { select: { status: true } },
      members: { include: { user: true } },
    },
  })
  if (!project) throw new NotFoundError('项目不存在')
  return project
}

export async function createProject(
  organizationId: string,
  userId: string,
  input: { name: string; key: string; description?: string },
) {
  const key = input.key.toUpperCase()
  if (!/^[A-Z]{2,5}$/.test(key)) {
    throw new BadRequestError('项目 Key 需为 2-5 位大写字母')
  }

  const existing = await prisma.project.findUnique({
    where: { organizationId_key: { organizationId, key } },
  })
  if (existing) throw new BadRequestError('项目 Key 已存在')

  return prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        organizationId,
        name: input.name,
        key,
        description: input.description,
      },
      include: {
        tasks: { select: { status: true } },
        members: { include: { user: true } },
      },
    })

    await tx.projectMember.create({
      data: {
        projectId: project.id,
        userId,
        role: 'PROJECT_ADMIN',
      },
    })

    return project
  })
}

export async function getProjectStats(projectId: string, organizationId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId },
  })
  if (!project) throw new NotFoundError('项目不存在')

  const [statusGroups, priorityGroups, assigneeGroups, total, done] = await Promise.all([
    prisma.task.groupBy({
      by: ['status'],
      where: { projectId },
      _count: { _all: true },
    }),
    prisma.task.groupBy({
      by: ['priority'],
      where: { projectId },
      _count: { _all: true },
    }),
    prisma.task.groupBy({
      by: ['assigneeId'],
      where: { projectId, assigneeId: { not: null } },
      _count: { _all: true },
    }),
    prisma.task.count({ where: { projectId } }),
    prisma.task.count({ where: { projectId, status: 'DONE' } }),
  ])

  const assigneeIds = assigneeGroups
    .map((g) => g.assigneeId)
    .filter((id): id is string => Boolean(id))

  const users = await prisma.user.findMany({
    where: { id: { in: assigneeIds } },
    select: { id: true, name: true },
  })

  const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]))

  return {
    total,
    done,
    completionRate: total ? Math.round((done / total) * 100) : 0,
    overdue: 0,
    statusGroups,
    priorityGroups,
    assigneeWorkload: assigneeGroups.map((g) => ({
      name: g.assigneeId ? userMap[g.assigneeId] ?? '未分配' : '未分配',
      count: g._count._all,
    })),
  }
}
