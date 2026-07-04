import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'
import { mockTasks, mockUsers } from '@/data/mock'
import { KANBAN_COLUMNS } from '@/lib/constants'
import type { Task, TaskPriority, TaskStatus } from '@/types'

interface CreateTaskInput {
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  projectId: string
  projectName: string
  assigneeId?: string
  dueDate?: string
}

interface TaskContextValue {
  tasks: Task[]
  selectedTask: Task | null
  createDialogOpen: boolean
  createDefaultStatus: TaskStatus
  openTask: (taskId: string) => void
  closeTask: () => void
  openCreateDialog: (status?: TaskStatus) => void
  closeCreateDialog: () => void
  updateTaskStatus: (taskId: string, status: TaskStatus) => boolean
  updateTask: (taskId: string, patch: Partial<Task>) => void
  createTask: (input: CreateTaskInput) => void
  getProjectTasks: (projectId: string) => Task[]
  getStatusCounts: () => Record<TaskStatus, number>
}

const TaskContext = createContext<TaskContextValue | null>(null)

function isAllowedTransition(from: TaskStatus, to: TaskStatus) {
  if (from === to) return true
  if (!KANBAN_COLUMNS.includes(from) || !KANBAN_COLUMNS.includes(to)) return false

  const transitions: Record<TaskStatus, TaskStatus[]> = {
    todo: ['in_progress'],
    in_progress: ['todo', 'in_review'],
    in_review: ['in_progress', 'done'],
    done: ['in_review'],
    blocked: ['todo', 'in_progress'],
  }

  return transitions[from]?.includes(to) ?? false
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createDefaultStatus, setCreateDefaultStatus] = useState<TaskStatus>('todo')

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId],
  )

  const openTask = useCallback((taskId: string) => {
    setSelectedTaskId(taskId)
  }, [])

  const closeTask = useCallback(() => {
    setSelectedTaskId(null)
  }, [])

  const openCreateDialog = useCallback((status: TaskStatus = 'todo') => {
    setCreateDefaultStatus(status)
    setCreateDialogOpen(true)
  }, [])

  const closeCreateDialog = useCallback(() => {
    setCreateDialogOpen(false)
  }, [])

  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    const task = tasks.find((item) => item.id === taskId)
    if (!task) return false

    if (!isAllowedTransition(task.status, status)) {
      toast.error('无法流转到该状态', {
        description: `「${task.title}」不能从当前状态直接变更`,
      })
      return false
    }

    setTasks((prev) =>
      prev.map((item) =>
        item.id === taskId
          ? { ...item, status, updatedAt: '刚刚' }
          : item,
      ),
    )
    toast.success('状态已更新')
    return true
  }, [tasks])

  const updateTask = useCallback((taskId: string, patch: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((item) =>
        item.id === taskId ? { ...item, ...patch, updatedAt: '刚刚' } : item,
      ),
    )
  }, [])

  const createTask = useCallback((input: CreateTaskInput) => {
    const projectTasks = tasks.filter((task) => task.projectId === input.projectId)
    const nextNum = projectTasks.length + 12
    const projectKey = input.projectName.includes('飞书')
      ? 'FB'
      : input.projectName.includes('官网')
        ? 'WEB'
        : 'APP'

    const assignee = input.assigneeId
      ? mockUsers.find((user) => user.id === input.assigneeId)
      : undefined

    const newTask: Task = {
      id: String(Date.now()),
      key: `${projectKey}-${nextNum}`,
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      projectId: input.projectId,
      projectName: input.projectName,
      assignee,
      dueDate: input.dueDate,
      updatedAt: '刚刚',
      createdAt: '今天',
      commentCount: 0,
    }

    setTasks((prev) => [newTask, ...prev])
    setCreateDialogOpen(false)
    toast.success('任务已创建')
  }, [tasks])

  const getProjectTasks = useCallback(
    (projectId: string) => tasks.filter((task) => task.projectId === projectId),
    [tasks],
  )

  const getStatusCounts = useCallback(() => {
    const counts: Record<TaskStatus, number> = {
      todo: 0,
      in_progress: 0,
      in_review: 0,
      done: 0,
      blocked: 0,
    }
    for (const task of tasks) {
      counts[task.status] += 1
    }
    return counts
  }, [tasks])

  const value = useMemo(
    () => ({
      tasks,
      selectedTask,
      createDialogOpen,
      createDefaultStatus,
      openTask,
      closeTask,
      openCreateDialog,
      closeCreateDialog,
      updateTaskStatus,
      updateTask,
      createTask,
      getProjectTasks,
      getStatusCounts,
    }),
    [
      tasks,
      selectedTask,
      createDialogOpen,
      createDefaultStatus,
      openTask,
      closeTask,
      openCreateDialog,
      closeCreateDialog,
      updateTaskStatus,
      updateTask,
      createTask,
      getProjectTasks,
      getStatusCounts,
    ],
  )

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

export function useTasks() {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('useTasks must be used within TaskProvider')
  }
  return context
}
