import { useOrganization } from '@clerk/clerk-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApiClient } from '@/hooks/use-api-client'
import type { Project, Task } from '@/types'

export interface OrgMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
}

export interface ProjectMember extends OrgMember {
  role: string
}

export interface ProjectStats {
  total: number
  done: number
  completionRate: number
  overdue: number
  statusGroups: Array<{ status: string; _count: { _all: number } }>
  priorityGroups: Array<{ priority: string; _count: { _all: number } }>
  assigneeWorkload: Array<{ name: string; count: number }>
}

export interface TaskComment {
  id: string
  content: string
  createdAt: string
  author: { id: string; name: string; avatar?: string }
}

export function useProjects() {
  const { organization } = useOrganization()
  const { request } = useApiClient()

  return useQuery({
    queryKey: ['projects', organization?.id],
    queryFn: () => request<Project[]>('/api/v1/projects'),
    enabled: Boolean(organization?.id),
  })
}

export function useProject(projectId: string | undefined) {
  const { organization } = useOrganization()
  const { request } = useApiClient()

  return useQuery({
    queryKey: ['project', organization?.id, projectId],
    queryFn: () => request<Project>(`/api/v1/projects/${projectId}`),
    enabled: Boolean(organization?.id && projectId),
  })
}

export function useProjectTasks(projectId: string | undefined) {
  const { organization } = useOrganization()
  const { request } = useApiClient()

  return useQuery({
    queryKey: ['project-tasks', organization?.id, projectId],
    queryFn: () => request<Task[]>(`/api/v1/projects/${projectId}/tasks`),
    enabled: Boolean(organization?.id && projectId),
  })
}

export function useProjectStats(projectId: string | undefined) {
  const { organization } = useOrganization()
  const { request } = useApiClient()

  return useQuery({
    queryKey: ['project-stats', organization?.id, projectId],
    queryFn: () => request<ProjectStats>(`/api/v1/projects/${projectId}/stats`),
    enabled: Boolean(organization?.id && projectId),
  })
}

export function useProjectMembers(projectId: string | undefined) {
  const { organization } = useOrganization()
  const { request } = useApiClient()

  return useQuery({
    queryKey: ['project-members', organization?.id, projectId],
    queryFn: () => request<ProjectMember[]>(`/api/v1/projects/${projectId}/members`),
    enabled: Boolean(organization?.id && projectId),
  })
}

export function useOrgMembers() {
  const { organization } = useOrganization()
  const { request } = useApiClient()

  return useQuery({
    queryKey: ['org-members', organization?.id],
    queryFn: () => request<OrgMember[]>('/api/v1/organizations/members'),
    enabled: Boolean(organization?.id),
  })
}

export function useTaskComments(taskId: string | undefined) {
  const { organization } = useOrganization()
  const { request } = useApiClient()

  return useQuery({
    queryKey: ['task-comments', organization?.id, taskId],
    queryFn: () => request<TaskComment[]>(`/api/v1/tasks/${taskId}/comments`),
    enabled: Boolean(organization?.id && taskId),
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  const { request } = useApiClient()

  return useMutation({
    mutationFn: (input: { name: string; key: string; description?: string }) =>
      request<Project>('/api/v1/projects', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useCreateComment() {
  const queryClient = useQueryClient()
  const { request } = useApiClient()

  return useMutation({
    mutationFn: ({ taskId, content }: { taskId: string; content: string }) =>
      request<TaskComment>(`/api/v1/tasks/${taskId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['task-comments'] })
      void queryClient.invalidateQueries({ queryKey: ['tasks'] })
      void queryClient.invalidateQueries({ queryKey: ['project-tasks'] })
    },
  })
}
