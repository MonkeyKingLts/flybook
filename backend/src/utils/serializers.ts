import type { Task, TaskPriority, User } from '@prisma/client'
import { TaskStatus } from '@prisma/client'
import {
  formatDisplayDate,
  formatDueDateLabel,
  formatRelativeTime,
  isOverdue,
} from './date-format.js'
import { toApiPriority, toApiStatus } from './task-mappers.js'
import { STATUS_LABELS } from './labels.js'

type TaskWithRelations = Task & {
  assignee?: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'> | null
  project?: { id: string; name: string; key: string }
  _count?: { comments: number }
}

type HistoryItem = {
  id: string
  fromStatus: TaskStatus | null
  toStatus: TaskStatus
  comment: string | null
  createdAt: Date
  changedBy: { id: string; name: string }
}

type CommentItem = {
  id: string
  content: string
  createdAt: Date
  author: { id: string; name: string; avatarUrl: string | null }
}

export function formatTask(task: TaskWithRelations, projectKey?: string) {
  const key = projectKey
    ? `${projectKey}-${task.number}`
    : task.project
      ? `${task.project.key}-${task.number}`
      : `TASK-${task.number}`

  const overdue = isOverdue(task.dueDate, task.status)

  return {
    id: task.id,
    key,
    title: task.title,
    description: task.description ?? undefined,
    status: toApiStatus(task.status),
    priority: toApiPriority(task.priority),
    tags: task.tags ?? [],
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
    dueDate: task.dueDate ? formatDueDateLabel(task.dueDate, task.status) : undefined,
    dueDateRaw: task.dueDate?.toISOString(),
    isOverdue: overdue,
    updatedAt: formatRelativeTime(task.updatedAt),
    createdAt: formatDisplayDate(task.createdAt),
    commentCount: task._count?.comments ?? 0,
  }
}

export function formatTaskDetail(
  task: TaskWithRelations & {
    comments?: CommentItem[]
    history?: HistoryItem[]
  },
) {
  return {
    ...formatTask(task),
    comments: (task.comments ?? []).map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      createdAtLabel: formatRelativeTime(comment.createdAt),
      author: {
        id: comment.author.id,
        name: comment.author.name,
        avatar: comment.author.avatarUrl ?? undefined,
      },
    })),
    activity: (task.history ?? []).map((item) => ({
      id: item.id,
      type: item.fromStatus ? 'status_change' : 'created',
      message: formatActivityMessage(item),
      createdAt: item.createdAt.toISOString(),
      createdAtLabel: formatRelativeTime(item.createdAt),
      actor: {
        id: item.changedBy.id,
        name: item.changedBy.name,
      },
    })),
  }
}

function formatActivityMessage(item: HistoryItem) {
  if (!item.fromStatus) {
    return `${item.changedBy.name} 创建了任务`
  }

  const fromLabel = STATUS_LABELS[item.fromStatus] ?? item.fromStatus
  const toLabel = STATUS_LABELS[item.toStatus] ?? item.toStatus
  return `${item.changedBy.name} 将状态由 ${fromLabel} 改为 ${toLabel}`
}

export function formatUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatarUrl ?? undefined,
  }
}

const PROJECT_COLORS = ['#3370FF', '#7F3BF5', '#FF8800', '#34C724', '#F54A45']

export function pickProjectColor(key: string) {
  const index = key.charCodeAt(0) % PROJECT_COLORS.length
  return PROJECT_COLORS[index]!
}

export function formatProject(project: {
  id: string
  name: string
  key: string
  description: string | null
  color?: string
  updatedAt: Date
  tasks?: { status: TaskStatus }[]
  members?: { user: User }[]
}) {
  const tasks = project.tasks ?? []
  const todoCount = tasks.filter((t) => t.status === TaskStatus.TODO).length
  const inProgressCount = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length
  const inReviewCount = tasks.filter((t) => t.status === TaskStatus.IN_REVIEW).length
  const doneCount = tasks.filter((t) => t.status === TaskStatus.DONE).length

  return {
    id: project.id,
    name: project.name,
    key: project.key,
    description: project.description ?? '',
    color: project.color ?? pickProjectColor(project.key),
    todoCount,
    inProgressCount,
    inReviewCount,
    doneCount,
    totalCount: tasks.length,
    updatedAt: formatRelativeTime(project.updatedAt),
    members: (project.members ?? []).map((m) => formatUser(m.user)),
  }
}

export function formatPaginated<T>(items: T[], total: number, page: number, pageSize: number) {
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}
