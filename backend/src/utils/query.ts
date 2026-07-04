import type { Request } from 'express'
import type { TaskPriority, TaskStatus } from '@prisma/client'
import { fromApiPriority, fromApiStatus } from './task-mappers.js'

export interface TaskListQuery {
  status?: TaskStatus
  priority?: TaskPriority
  projectId?: string
  assigneeId?: string
  search?: string
  overdue?: boolean
  page: number
  pageSize: number
}

export function parseTaskListQuery(req: Request): TaskListQuery {
  const page = Math.max(1, Number(req.query.page) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20))

  let status: TaskStatus | undefined
  if (typeof req.query.status === 'string' && req.query.status) {
    status = fromApiStatus(req.query.status)
  }

  let priority: TaskPriority | undefined
  if (typeof req.query.priority === 'string' && req.query.priority) {
    priority = fromApiPriority(req.query.priority)
  }

  return {
    status,
    priority,
    projectId: typeof req.query.projectId === 'string' ? req.query.projectId : undefined,
    assigneeId: typeof req.query.assigneeId === 'string' ? req.query.assigneeId : undefined,
    search: typeof req.query.search === 'string' ? req.query.search.trim() : undefined,
    overdue: req.query.overdue === 'true',
    page,
    pageSize,
  }
}

export function parseSearchQuery(req: Request) {
  return typeof req.query.search === 'string' ? req.query.search.trim() : undefined
}
