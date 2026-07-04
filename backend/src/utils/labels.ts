import { TaskStatus } from '@prisma/client'

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: '待办',
  IN_PROGRESS: '进行中',
  IN_REVIEW: '评审中',
  DONE: '已完成',
  BLOCKED: '阻塞',
}

export const PRIORITY_LABELS = {
  HIGH: '高',
  MEDIUM: '中',
  LOW: '低',
} as const
