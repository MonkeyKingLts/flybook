import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TaskCard } from '@/components/task/task-card'
import { useTasks } from '@/contexts/task-context'
import { STATUS_LABELS } from '@/lib/constants'
import type { Task, TaskStatus } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_DOT_COLORS: Record<TaskStatus, string> = {
  todo: 'bg-[#8F959E]',
  in_progress: 'bg-[#3370FF]',
  in_review: 'bg-[#7F3BF5]',
  done: 'bg-[#34C724]',
  blocked: 'bg-[#F54A45]',
}

interface KanbanColumnProps {
  status: TaskStatus
  tasks: Task[]
}

export function KanbanColumn({ status, tasks }: KanbanColumnProps) {
  const { openCreateDialog } = useTasks()
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: 'column', status },
  })

  return (
    <div
      className={cn(
        'flex w-[280px] shrink-0 flex-col rounded-lg bg-[#F5F6F7] p-3',
        isOver && 'ring-2 ring-primary/30',
      )}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className={cn('size-2 rounded-full', STATUS_DOT_COLORS[status])} />
          {STATUS_LABELS[status]}
          <span className="text-muted-foreground">({tasks.length})</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground"
          onClick={() => openCreateDialog(status)}
        >
          <Plus className="size-4" />
        </Button>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'min-h-[120px] flex-1 space-y-3 rounded-md transition-colors',
          isOver && 'bg-primary/5',
        )}
      >
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {tasks.length === 0 ? (
          <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground">
            拖拽任务到此处
          </div>
        ) : null}
      </div>

      <Button
        variant="ghost"
        className="mt-3 w-full border border-dashed border-border text-muted-foreground hover:text-foreground"
        onClick={() => openCreateDialog(status)}
      >
        <Plus className="size-4" />
        添加任务
      </Button>
    </div>
  )
}
