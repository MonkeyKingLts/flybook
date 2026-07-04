import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useOrganization } from '@clerk/clerk-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useApiClient } from '@/hooks/use-api-client'
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
  isLoading: boolean
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
  refetchTasks: () => void
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
  const { organization } = useOrganization()
  const { request } = useApiClient()
  const queryClient = useQueryClient()

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createDefaultStatus, setCreateDefaultStatus] = useState<TaskStatus>('todo')

  const { data: tasks = [], isLoading, refetch } = useQuery({
    queryKey: ['tasks', organization?.id],
    queryFn: async () => {
      const projects = await request<Array<{ id: string }>>('/api/v1/projects')
      const taskLists = await Promise.all(
        projects.map((project) =>
          request<{ items: Task[] }>(`/api/v1/projects/${project.id}/tasks`).then(
            (res) => res.items,
          ),
        ),
      )
      return taskLists.flat()
    },
    enabled: Boolean(organization?.id),
  })

  const transitionMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      request<Task>(`/api/v1/tasks/${taskId}/transition`, {
        method: 'POST',
        body: JSON.stringify({ toStatus: status }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] })
      void queryClient.invalidateQueries({ queryKey: ['project-tasks'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('状态已更新')
    },
    onError: () => {
      toast.error('状态更新失败')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ taskId, patch }: { taskId: string; patch: Partial<Task> }) =>
      request<Task>(`/api/v1/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: patch.title,
          description: patch.description,
          priority: patch.priority,
          assigneeId: patch.assignee?.id,
          dueDate: patch.dueDate,
        }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] })
      void queryClient.invalidateQueries({ queryKey: ['project-tasks'] })
      void queryClient.invalidateQueries({ queryKey: ['my-tasks'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: () => {
      toast.error('任务更新失败')
    },
  })

  const createMutation = useMutation({
    mutationFn: (input: CreateTaskInput) =>
      request<Task>(`/api/v1/projects/${input.projectId}/tasks`, {
        method: 'POST',
        body: JSON.stringify({
          title: input.title,
          description: input.description,
          status: input.status,
          priority: input.priority,
          assigneeId: input.assigneeId,
          dueDate: input.dueDate,
        }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] })
      void queryClient.invalidateQueries({ queryKey: ['project-tasks'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setCreateDialogOpen(false)
      toast.success('任务已创建')
    },
    onError: () => {
      toast.error('任务创建失败')
    },
  })

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

  const updateTaskStatus = useCallback(
    (taskId: string, status: TaskStatus) => {
      const task = tasks.find((item) => item.id === taskId)
      if (!task) return false

      if (!isAllowedTransition(task.status, status)) {
        toast.error('无法流转到该状态', {
          description: `「${task.title}」不能从当前状态直接变更`,
        })
        return false
      }

      transitionMutation.mutate({ taskId, status })
      return true
    },
    [tasks, transitionMutation],
  )

  const updateTask = useCallback(
    (taskId: string, patch: Partial<Task>) => {
      updateMutation.mutate({ taskId, patch })
    },
    [updateMutation],
  )

  const createTask = useCallback(
    (input: CreateTaskInput) => {
      createMutation.mutate(input)
    },
    [createMutation],
  )

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
      isLoading,
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
      refetchTasks: () => {
        void refetch()
      },
    }),
    [
      tasks,
      isLoading,
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
      refetch,
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
