import { prisma } from '../lib/prisma.js'
import { BadRequestError, NotFoundError } from '../lib/errors.js'
import { canTransition, fromApiPriority, fromApiStatus } from '../utils/task-mappers.js'
import type { TaskPriority, TaskStatus } from '@prisma/client'

export async function listProjectTasks(projectId: string, organizationId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId },
  })
  if (!project) throw new NotFoundError('项目不存在')

  return prisma.task.findMany({
    where: { projectId, organizationId },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      project: { select: { id: true, name: true, key: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function getTaskById(taskId: string, organizationId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, organizationId },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      project: { select: { id: true, name: true, key: true } },
      comments: {
        include: { author: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      history: {
        include: { changedBy: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      _count: { select: { comments: true } },
    },
  })
  if (!task) throw new NotFoundError('任务不存在')
  return task
}

export async function createTask(input: {
  organizationId: string
  projectId: string
  title: string
  description?: string
  status?: string
  priority?: string
  assigneeId?: string
  dueDate?: string
  userId: string
}) {
  const project = await prisma.project.findFirst({
    where: { id: input.projectId, organizationId: input.organizationId },
  })
  if (!project) throw new NotFoundError('项目不存在')

  const lastTask = await prisma.task.findFirst({
    where: { projectId: input.projectId },
    orderBy: { number: 'desc' },
  })
  const number = (lastTask?.number ?? 0) + 1

  const status = input.status ? fromApiStatus(input.status) : ('TODO' as TaskStatus)
  const priority = input.priority ? fromApiPriority(input.priority) : ('MEDIUM' as TaskPriority)

  return prisma.$transaction(async (tx) => {
    const task = await tx.task.create({
      data: {
        organizationId: input.organizationId,
        projectId: input.projectId,
        number,
        title: input.title,
        description: input.description,
        status,
        priority,
        assigneeId: input.assigneeId,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        project: { select: { id: true, name: true, key: true } },
        _count: { select: { comments: true } },
      },
    })

    await tx.taskStatusHistory.create({
      data: {
        taskId: task.id,
        fromStatus: null,
        toStatus: status,
        changedById: input.userId,
        comment: '创建任务',
      },
    })

    return task
  })
}

export async function updateTask(
  taskId: string,
  organizationId: string,
  userId: string,
  patch: {
    title?: string
    description?: string
    priority?: string
    assigneeId?: string | null
    dueDate?: string | null
  },
) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, organizationId },
  })
  if (!task) throw new NotFoundError('任务不存在')

  return prisma.task.update({
    where: { id: taskId },
    data: {
      title: patch.title,
      description: patch.description,
      priority: patch.priority ? fromApiPriority(patch.priority) : undefined,
      assigneeId: patch.assigneeId,
      dueDate: patch.dueDate === null ? null : patch.dueDate ? new Date(patch.dueDate) : undefined,
    },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      project: { select: { id: true, name: true, key: true } },
      _count: { select: { comments: true } },
    },
  })
}

export async function transitionTask(
  taskId: string,
  organizationId: string,
  userId: string,
  toStatusRaw: string,
) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, organizationId },
  })
  if (!task) throw new NotFoundError('任务不存在')

  const toStatus = fromApiStatus(toStatusRaw)
  if (!canTransition(task.status, toStatus)) {
    throw new BadRequestError('不允许的状态流转')
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.task.update({
      where: { id: taskId },
      data: { status: toStatus },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        project: { select: { id: true, name: true, key: true } },
        _count: { select: { comments: true } },
      },
    })

    await tx.taskStatusHistory.create({
      data: {
        taskId,
        fromStatus: task.status,
        toStatus,
        changedById: userId,
      },
    })

    return updated
  })
}

export async function listMyTasks(userId: string, organizationId: string) {
  return prisma.task.findMany({
    where: { organizationId, assigneeId: userId },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
      project: { select: { id: true, name: true, key: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function getDashboardStats(organizationId: string, userId: string) {
  const [statusGroups, myTasks, projectCount] = await Promise.all([
    prisma.task.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: { _all: true },
    }),
    prisma.task.count({
      where: { organizationId, assigneeId: userId, status: { not: 'DONE' } },
    }),
    prisma.project.count({ where: { organizationId } }),
  ])

  const statusCounts = Object.fromEntries(
    statusGroups.map((g) => [g.status, g._count._all]),
  ) as Record<string, number>

  const total = statusGroups.reduce((sum, g) => sum + g._count._all, 0)

  return {
    total,
    myOpenTasks: myTasks,
    projectCount,
    statusCounts,
  }
}
