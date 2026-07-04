import { TaskStatus } from '@prisma/client'

const TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  TODO: [TaskStatus.IN_PROGRESS],
  IN_PROGRESS: [TaskStatus.TODO, TaskStatus.IN_REVIEW, TaskStatus.BLOCKED],
  IN_REVIEW: [TaskStatus.IN_PROGRESS, TaskStatus.DONE],
  DONE: [TaskStatus.IN_REVIEW],
  BLOCKED: [TaskStatus.TODO, TaskStatus.IN_PROGRESS],
}

export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  if (from === to) return true
  return TRANSITIONS[from]?.includes(to) ?? false
}

export function toApiStatus(status: TaskStatus): string {
  const map: Record<TaskStatus, string> = {
    TODO: 'todo',
    IN_PROGRESS: 'in_progress',
    IN_REVIEW: 'in_review',
    DONE: 'done',
    BLOCKED: 'blocked',
  }
  return map[status]
}

export function fromApiStatus(status: string): TaskStatus {
  const map: Record<string, TaskStatus> = {
    todo: TaskStatus.TODO,
    in_progress: TaskStatus.IN_PROGRESS,
    in_review: TaskStatus.IN_REVIEW,
    done: TaskStatus.DONE,
    blocked: TaskStatus.BLOCKED,
  }
  const value = map[status]
  if (!value) throw new Error(`Invalid status: ${status}`)
  return value
}

export function toApiPriority(priority: string): string {
  return priority.toLowerCase()
}

export function fromApiPriority(priority: string) {
  const map = {
    high: 'HIGH',
    medium: 'MEDIUM',
    low: 'LOW',
  } as const
  const value = map[priority as keyof typeof map]
  if (!value) throw new Error(`Invalid priority: ${priority}`)
  return value
}
