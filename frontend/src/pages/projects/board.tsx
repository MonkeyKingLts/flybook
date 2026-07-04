import { Calendar, MessageSquare, Plus } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { mockTasks } from '@/data/mock'
import { KANBAN_COLUMNS, PRIORITY_COLORS, STATUS_LABELS } from '@/lib/constants'
import type { Task } from '@/types'
import type { TaskStatus } from '@/types'

export function ProjectBoardPage() {
  const columns = KANBAN_COLUMNS.map((status) => ({
    status,
    tasks: mockTasks.filter((task) => task.status === status),
  }))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm">
          负责人
        </Button>
        <Button variant="outline" size="sm">
          优先级
        </Button>
        <Input className="ml-auto max-w-xs" placeholder="筛选任务" />
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {columns.map((column) => (
          <KanbanColumn key={column.status} status={column.status} tasks={column.tasks} />
        ))}
      </div>
    </div>
  )
}

function KanbanColumn({
  status,
  tasks,
}: {
  status: TaskStatus
  tasks: Task[]
}) {
  return (
    <div className="w-[280px] shrink-0 rounded-lg bg-muted p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium">
          {STATUS_LABELS[status]} <span className="text-muted-foreground">({tasks.length})</span>
        </div>
        <Button variant="ghost" size="icon" className="size-7">
          <Plus className="size-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task.id} className="relative overflow-hidden border-border shadow-none">
            <CardContent className="space-y-3 p-3">
              <div
                className="absolute top-0 left-0 h-full w-[3px] rounded-l-lg"
                style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
              />
              <div className="text-xs text-muted-foreground">{task.key}</div>
              <div className="text-sm font-medium">{task.title}</div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  {task.dueDate}
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
                      <AvatarFallback className="text-[10px]">
                        {task.assignee.name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        variant="ghost"
        className="mt-3 w-full border border-dashed border-border text-muted-foreground"
      >
        <Plus className="size-4" />
        添加任务
      </Button>
    </div>
  )
}
