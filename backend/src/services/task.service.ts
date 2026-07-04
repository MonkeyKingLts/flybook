import type { Prisma, TaskPriority, TaskStatus } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { BadRequestError, NotFoundError } from '../lib/errors.js'
import { canTransition, fromApiPriority, fromApiStatus, toApiStatus } from '../utils/task-mappers.js'
import type { TaskListQuery } from '../utils/query.js'
import { daysAgo, endOfDay, isOverdue, startOfDay, startOfWeek } from '../utils/date-format.js'

const taskInclude = {
  assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
  project: { select: { id: true, name: true, key: true } },
  _count: { select: { comments: true } },
} as const

function buildTaskWhere(
  organizationId: string,
  query: TaskListQuery,
  base: Prisma.TaskWhereInput = {},
): Prisma.TaskWhereInput {
  const where: Prisma.TaskWhereInput = {
    organizationId,
    ...base,
  }

  if (query.status) where.status = query.status
  if (query.priority) where.priority = query.priority
  if (query.projectId) where.projectId = query.projectId
  if (query.assigneeId) where.assigneeId = query.assigneeId

  if (query.overdue) {
    where.dueDate = { lt: startOfDay() }
    where.status = { not: 'DONE' }
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  return where
}

export async function listProjectTasks(
  projectId: string,
  organizationId: string,
  query: Partial<TaskListQuery> = {},
) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId },
  })
  if (!project) throw new NotFoundError('项目不存在')

  const fullQuery: TaskListQuery = {
    page: 1,
    pageSize: 500,
    ...query,
    projectId,
  }

  const where = buildTaskWhere(organizationId, fullQuery)

  return prisma.task.findMany({
    where,
    include: taskInclude,
    orderBy: [{ status: 'asc' }, { sortOrder: 'asc' }, { updatedAt: 'desc' }],
  })
}

export async function getProjectTaskCounts(projectId: string, organizationId: string) {
  const groups = await prisma.task.groupBy({
    by: ['status'],
    where: { projectId, organizationId },
    _count: { _all: true },
  })

  const counts: Record<string, number> = {
    todo: 0,
    in_progress: 0,
    in_review: 0,
    done: 0,
    blocked: 0,
  }

  for (const group of groups) {
    counts[toApiStatus(group.status)] = group._count._all
  }

  return counts
}

export async function getTaskById(taskId: string, organizationId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, organizationId },
    include: {
      ...taskInclude,
      comments: {
        include: { author: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
      history: {
        include: { changedBy: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
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
  tags?: string[]
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
        tags: input.tags ?? [],
        assigneeId: input.assigneeId,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        completedAt: status === 'DONE' ? new Date() : undefined,
      },
      include: taskInclude,
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

    await tx.project.update({
      where: { id: input.projectId },
      data: { updatedAt: new Date() },
    })

    return task
  })
}

export async function updateTask(
  taskId: string,
  organizationId: string,
  _userId: string,
  patch: {
    title?: string
    description?: string | null
    priority?: string
    assigneeId?: string | null
    dueDate?: string | null
    tags?: string[]
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
      tags: patch.tags,
      dueDate: patch.dueDate === null ? null : patch.dueDate ? new Date(patch.dueDate) : undefined,
    },
    include: taskInclude,
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
      data: {
        status: toStatus,
        completedAt: toStatus === 'DONE' ? new Date() : task.status === 'DONE' ? null : task.completedAt,
      },
      include: taskInclude,
    })

    await tx.taskStatusHistory.create({
      data: {
        taskId,
        fromStatus: task.status,
        toStatus,
        changedById: userId,
      },
    })

    await tx.project.update({
      where: { id: task.projectId },
      data: { updatedAt: new Date() },
    })

    return updated
  })
}

export async function listMyTasks(
  userId: string,
  organizationId: string,
  query: TaskListQuery,
) {
  const where = buildTaskWhere(organizationId, query, { assigneeId: userId })
  const skip = (query.page - 1) * query.pageSize

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: taskInclude,
      orderBy: [{ dueDate: 'asc' }, { updatedAt: 'desc' }],
      skip,
      take: query.pageSize,
    }),
    prisma.task.count({ where }),
  ])

  return { tasks, total }
}

export async function listComments(taskId: string, organizationId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, organizationId },
  })
  if (!task) throw new NotFoundError('任务不存在')

  const comments = await prisma.taskComment.findMany({
    where: { taskId },
    include: { author: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return comments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    author: {
      id: comment.author.id,
      name: comment.author.name,
      avatar: comment.author.avatarUrl ?? undefined,
    },
  }))
}

export async function createComment(
  taskId: string,
  organizationId: string,
  userId: string,
  content: string,
) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, organizationId },
  })
  if (!task) throw new NotFoundError('任务不存在')

  const comment = await prisma.taskComment.create({
    data: { taskId, authorId: userId, content },
    include: { author: { select: { id: true, name: true, avatarUrl: true } } },
  })

  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt.toISOString(),
    author: {
      id: comment.author.id,
      name: comment.author.name,
      avatar: comment.author.avatarUrl ?? undefined,
    },
  }
}

export async function batchUpdateTasks(
  organizationId: string,
  userId: string,
  input: {
    taskIds: string[]
    status?: string
    assigneeId?: string | null
  },
) {
  if (!input.taskIds.length) throw new BadRequestError('请选择任务')

  const tasks = await prisma.task.findMany({
    where: { id: { in: input.taskIds }, organizationId },
  })

  if (tasks.length !== input.taskIds.length) {
    throw new BadRequestError('部分任务不存在')
  }

  const results = []

  for (const task of tasks) {
    if (input.status) {
      const toStatus = fromApiStatus(input.status)
      if (!canTransition(task.status, toStatus)) {
        throw new BadRequestError(`任务「${task.title}」无法变更到该状态`)
      }
      results.push(await transitionTask(task.id, organizationId, userId, input.status))
      continue
    }

    if (input.assigneeId !== undefined) {
      results.push(
        await updateTask(task.id, organizationId, userId, { assigneeId: input.assigneeId }),
      )
    }
  }

  return results
}

export async function batchDeleteTasks(organizationId: string, taskIds: string[]) {
  if (!taskIds.length) throw new BadRequestError('请选择任务')

  const result = await prisma.task.deleteMany({
    where: { id: { in: taskIds }, organizationId },
  })

  return { deleted: result.count }
}

export async function getDashboardStats(organizationId: string, userId: string) {
  const todayStart = startOfDay()
  const todayEnd = endOfDay()
  const weekStart = startOfWeek()

  const [
    statusGroups,
    myOpenTasks,
    myOverdueTasks,
    myTodayTasks,
    projectCount,
    completedThisWeek,
    projects,
    myTodos,
  ] = await Promise.all([
    prisma.task.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: { _all: true },
    }),
    prisma.task.count({
      where: { organizationId, assigneeId: userId, status: { not: 'DONE' } },
    }),
    prisma.task.count({
      where: {
        organizationId,
        assigneeId: userId,
        status: { not: 'DONE' },
        dueDate: { lt: todayStart },
      },
    }),
    prisma.task.count({
      where: {
        organizationId,
        assigneeId: userId,
        status: { not: 'DONE' },
        dueDate: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.project.count({ where: { organizationId } }),
    prisma.task.count({
      where: {
        organizationId,
        assigneeId: userId,
        status: 'DONE',
        completedAt: { gte: weekStart },
      },
    }),
    prisma.project.findMany({
      where: { organizationId },
      include: { tasks: { select: { status: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 6,
    }),
    prisma.task.findMany({
      where: {
        organizationId,
        assigneeId: userId,
        status: { not: 'DONE' },
      },
      include: taskInclude,
      orderBy: [{ dueDate: 'asc' }, { updatedAt: 'desc' }],
      take: 5,
    }),
  ])

  const statusCounts: Record<string, number> = {
    todo: 0,
    in_progress: 0,
    in_review: 0,
    done: 0,
    blocked: 0,
  }

  for (const group of statusGroups) {
    statusCounts[toApiStatus(group.status)] = group._count._all
  }

  const total = statusGroups.reduce((sum, g) => sum + g._count._all, 0)

  return {
    total,
    myOpenTasks,
    myOverdueTasks,
    myTodayTasks,
    projectCount,
    completedThisWeek,
    statusCounts,
    myTodos,
    projects: projects.map((project) => {
      const tasks = project.tasks
      const doneCount = tasks.filter((t) => t.status === 'DONE').length
      const totalCount = tasks.length
      return {
        id: project.id,
        name: project.name,
        key: project.key,
        color: project.color,
        doneCount,
        totalCount,
        progress: totalCount ? Math.round((doneCount / totalCount) * 100) : 0,
      }
    }),
  }
}

export async function getProjectStats(projectId: string, organizationId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, organizationId },
  })
  if (!project) throw new NotFoundError('项目不存在')

  const todayStart = startOfDay()
  const weekStart = startOfWeek()
  const trendStart = daysAgo(13)

  const [
    statusGroups,
    priorityGroups,
    assigneeGroups,
    total,
    done,
    overdue,
    newThisWeek,
    completionHistory,
  ] = await Promise.all([
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
    prisma.task.count({
      where: {
        projectId,
        status: { not: 'DONE' },
        dueDate: { lt: todayStart },
      },
    }),
    prisma.task.count({
      where: { projectId, createdAt: { gte: weekStart } },
    }),
    prisma.taskStatusHistory.findMany({
      where: {
        toStatus: 'DONE',
        createdAt: { gte: trendStart },
        task: { projectId },
      },
      select: { createdAt: true },
    }),
  ])

  const assigneeIds = assigneeGroups
    .map((g) => g.assigneeId)
    .filter((id): id is string => Boolean(id))

  const users = await prisma.user.findMany({
    where: { id: { in: assigneeIds } },
    select: { id: true, name: true },
  })
  const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]))

  const completionTrend = buildCompletionTrend(completionHistory)

  return {
    total,
    done,
    completionRate: total ? Math.round((done / total) * 100) : 0,
    overdue,
    newThisWeek,
    statusGroups: statusGroups.map((g) => ({
      status: toApiStatus(g.status),
      count: g._count._all,
    })),
    priorityGroups: priorityGroups.map((g) => ({
      priority: g.priority.toLowerCase(),
      count: g._count._all,
    })),
    assigneeWorkload: assigneeGroups.map((g) => ({
      name: g.assigneeId ? userMap[g.assigneeId] ?? '未分配' : '未分配',
      count: g._count._all,
    })),
    completionTrend,
  }
}

function buildCompletionTrend(history: { createdAt: Date }[]) {
  const trend: Record<string, number> = {}

  for (let i = 13; i >= 0; i--) {
    const d = daysAgo(i)
    const key = `${d.getMonth() + 1}/${d.getDate()}`
    trend[key] = 0
  }

  for (const item of history) {
    const d = startOfDay(item.createdAt)
    const key = `${d.getMonth() + 1}/${d.getDate()}`
    if (key in trend) trend[key] += 1
  }

  return Object.entries(trend).map(([date, count]) => ({ date, count }))
}

export function isTaskOverdue(dueDate: Date | null, status: TaskStatus) {
  return isOverdue(dueDate, status)
}
