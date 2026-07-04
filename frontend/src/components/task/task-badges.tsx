import type { TaskPriority, TaskStatus } from '@/types'
import { Badge } from '@/components/ui/badge'
import { PRIORITY_LABELS, STATUS_LABELS, STATUS_STYLES } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge variant="secondary" className={cn('border-0 font-normal', STATUS_STYLES[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const colors = {
    high: 'text-[#F54A45]',
    medium: 'text-[#FF8800]',
    low: 'text-[#8F959E]',
  }

  return (
    <span className={cn('text-sm', colors[priority])}>
      {PRIORITY_LABELS[priority]}
    </span>
  )
}
