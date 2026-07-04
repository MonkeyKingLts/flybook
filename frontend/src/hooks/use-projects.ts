import { useOrganization } from '@clerk/clerk-react'
import { useQuery } from '@tanstack/react-query'
import { useApiClient } from '@/hooks/use-api-client'
import type { Project } from '@/types'

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

export function useOrgMembers() {
  const { organization } = useOrganization()
  const { request } = useApiClient()

  return useQuery({
    queryKey: ['org-members', organization?.id],
    queryFn: () =>
      request<Array<{ id: string; name: string; email: string; avatar?: string }>>(
        '/api/v1/organizations/members',
      ),
    enabled: Boolean(organization?.id),
  })
}
