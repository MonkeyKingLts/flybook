import type { Task, TaskPriority, User } from '@prisma/client'
import { TaskStatus } from '@prisma/client'
import { toApiPriority, toApiStatus } from './task-mappers.js'

type TaskWithRelations = Task & {
  assignee?: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'> | null
  project?: { id: string; name: string; key: string }
  _count?: { comments: number }
}

export function formatTask(task: TaskWithRelations, projectKey?: string) {
  const key = projectKey
    ? `${projectKey}-${task.number}`
    : task.project
      ? `${task.project.key}-${task.number}`
      : `TASK-${task.number}`

  return {
    id: task.id,
    key,
    title: task.title,
    description: task.description ?? undefined,
    status: toApiStatus(task.status),
    priority: toApiPriority(task.priority),
    projectId: task.projectId,
    projectName: task.project?.name ?? '',
    assignee: task.assignee
      ? {
          id: task.assignee.id,
          name: task.assignee.name,
          email: task.assignee.email,
          avatar: task.assignee.avatarUrl ?? undefined,
        }
      : undefined,
    dueDate: task.dueDate ? formatDate(task.dueDate) : undefined,
    updatedAt: formatRelative(task.updatedAt),
    createdAt: formatDate(task.createdAt),
    commentCount: task._count?.comments ?? 0,
  }
}

function formatDate(date: Date) {
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

function formatRelative(date: Date) {
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  return `${days}天前`
}

export function formatUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatarUrl ?? undefined,
  }
}

export function formatProject(project: {
  id: string
  name: string
  key: string
  description: string | null
  updatedAt: Date
  tasks?: { status: TaskStatus }[]
  members?: { user: User }[]
}) {
  const tasks = project.tasks ?? []
  const todoCount = tasks.filter((t) => t.status === TaskStatus.TODO).length
  const inProgressCount = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length
  const doneCount = tasks.filter((t) => t.status === TaskStatus.DONE).length

  return {
    id: project.id,
    name: project.name,
    key: project.key,
    description: project.description ?? '',
    todoCount,
    inProgressCount,
    doneCount,
    updatedAt: formatRelative(project.updatedAt),
    members: (project.members ?? []).map((m) => formatUser(m.user)),
  }
}
