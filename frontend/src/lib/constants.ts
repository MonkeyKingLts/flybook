import type { TaskPriority, TaskStatus } from '@/types'

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: '待办',
  in_progress: '进行中',
  in_review: '评审中',
  done: '已完成',
  blocked: '阻塞',
}

export const STATUS_STYLES: Record<TaskStatus, string> = {
  todo: 'bg-[#F0F1F3] text-[#646A73]',
  in_progress: 'bg-[#E8F0FF] text-[#3370FF]',
  in_review: 'bg-[#F3EBFF] text-[#7F3BF5]',
  done: 'bg-[#E8F7E6] text-[#34C724]',
  blocked: 'bg-[#FEE7E6] text-[#F54A45]',
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: '#F54A45',
  medium: '#FF8800',
  low: '#8F959E',
}

export const KANBAN_COLUMNS: TaskStatus[] = [
  'todo',
  'in_progress',
  'in_review',
  'done',
]
