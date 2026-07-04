import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, GripVertical, MessageSquare } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { useTasks } from '@/contexts/task-context'
import { PRIORITY_COLORS } from '@/lib/constants'
import type { Task } from '@/types'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  isOverlay?: boolean
}

export function TaskCard({ task, isOverlay }: TaskCardProps) {
  const { openTask } = useTasks()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { type: 'task', task },
  })

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  const isOverdue = task.dueDate === '昨天'

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative cursor-pointer overflow-hidden border-border shadow-none transition-shadow',
        'hover:border-primary/50 hover:shadow-sm',
        (isDragging || isOverlay) && 'rotate-1 border-primary shadow-md',
        isOverlay && 'cursor-grabbing',
      )}
      onClick={() => openTask(task.id)}
    >
      <CardContent className="space-y-2.5 p-3">
        <div
          className="absolute top-0 left-0 h-full w-[3px]"
          style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
        />

        <div className="flex items-start gap-1 pl-1">
          <button
            type="button"
            className="mt-0.5 cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
            {...listeners}
            {...attributes}
            onClick={(event) => event.stopPropagation()}
          >
            <GripVertical className="size-3.5" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-muted-foreground">{task.key}</div>
            <div className="mt-1 line-clamp-2 text-sm font-medium leading-5">
              {task.title}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pl-5 text-xs text-muted-foreground">
          <div
            className={cn(
              'flex items-center gap-1',
              isOverdue && 'font-medium text-destructive',
            )}
          >
            <Calendar className="size-3.5" />
            {task.dueDate ?? '无截止'}
          </div>
          <div className="flex items-center gap-2">
            {task.commentCount ? (
              <span className="flex items-center gap-1">
                <MessageSquare className="size-3.5" />
                {task.commentCount}
              </span>
            ) : null}
            {task.assignee ? (
              <Avatar className="size-6">
                <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
                  {task.assignee.name.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
