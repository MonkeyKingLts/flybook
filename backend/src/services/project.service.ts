import { prisma } from '../lib/prisma.js'
import { BadRequestError, NotFoundError } from '../lib/errors.js'
import { pickProjectColor } from '../utils/serializers.js'

export async function listProjects(organizationId: string) {
  return prisma.project.findMany({
    where: { organizationId },
    include: {
      tasks: { select: { status: true } },
      members: { include: { user: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })
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
  input: { name: string; key: string; description?: string; color?: string },
) {
  const key = input.key.toUpperCase()
  if (!/^[A-Z]{2,5}$/.test(key)) {
    throw new BadRequestError('项目 Key 需为 2-5 位大写字母')
  }

  const existing = await prisma.project.findUnique({
    where: { organizationId_key: { organizationId, key } },
  })
  if (existing) throw new BadRequestError('项目 Key 已存在')

  const color = input.color ?? pickProjectColor(key)

  return prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        organizationId,
        name: input.name,
        key,
        description: input.description,
        color,
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

export async function updateProject(
  projectId: string,
  organizationId: string,
  input: { name?: string; description?: string; color?: string },
) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId },
  })
  if (!project) throw new NotFoundError('项目不存在')

  return prisma.project.update({
    where: { id: projectId },
    data: {
      name: input.name,
      description: input.description,
      color: input.color,
    },
    include: {
      tasks: { select: { status: true } },
      members: { include: { user: true } },
    },
  })
}

export async function deleteProject(projectId: string, organizationId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId },
  })
  if (!project) throw new NotFoundError('项目不存在')

  await prisma.project.delete({ where: { id: projectId } })
  return { deleted: true }
}

export async function listProjectMembers(projectId: string, organizationId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId },
  })
  if (!project) throw new NotFoundError('项目不存在')

  const members = await prisma.projectMember.findMany({
    where: { projectId },
    include: { user: true },
    orderBy: { joinedAt: 'asc' },
  })

  return members.map((member) => ({
    id: member.user.id,
    name: member.user.name,
    email: member.user.email,
    avatar: member.user.avatarUrl ?? undefined,
    role: member.role.toLowerCase(),
    joinedAt: member.joinedAt.toISOString().slice(0, 10),
  }))
}
