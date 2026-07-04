import { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KanbanColumn } from '@/components/task/kanban-column'
import { TaskCard } from '@/components/task/task-card'
import { useTasks } from '@/contexts/task-context'
import { KANBAN_COLUMNS } from '@/lib/constants'
import type { Task, TaskStatus } from '@/types'

interface KanbanBoardProps {
  projectId: string
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { getProjectTasks, updateTaskStatus } = useTasks()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [search, setSearch] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  )

  const projectTasks = getProjectTasks(projectId)
  const filteredTasks = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return projectTasks
    return projectTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(keyword) ||
        task.key.toLowerCase().includes(keyword),
    )
  }, [projectTasks, search])

  const columns = KANBAN_COLUMNS.map((status) => ({
    status,
    tasks: filteredTasks.filter((task) => task.status === status),
  }))

  const handleDragStart = (event: DragStartEvent) => {
    const task = projectTasks.find((item) => item.id === event.active.id)
    setActiveTask(task ?? null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const taskId = String(active.id)
    const task = projectTasks.find((item) => item.id === taskId)
    if (!task) return

    let newStatus: TaskStatus | null = null

    if (over.data.current?.type === 'column') {
      newStatus = over.data.current.status as TaskStatus
    } else if (over.data.current?.type === 'task') {
      const overTask = projectTasks.find((item) => item.id === over.id)
      newStatus = overTask?.status ?? null
    } else if (KANBAN_COLUMNS.includes(over.id as TaskStatus)) {
      newStatus = over.id as TaskStatus
    }

    if (newStatus && newStatus !== task.status) {
      updateTaskStatus(taskId, newStatus)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm">
          负责人
        </Button>
        <Button variant="outline" size="sm">
          优先级
        </Button>
        <Input
          className="ml-auto max-w-xs bg-card"
          placeholder="筛选任务"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-2">
          {columns.map((column) => (
            <KanbanColumn key={column.status} status={column.status} tasks={column.tasks} />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
          {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
