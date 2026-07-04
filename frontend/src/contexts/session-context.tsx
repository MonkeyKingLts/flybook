import { createContext, useContext, type ReactNode } from 'react'
import { useOrganization } from '@clerk/clerk-react'
import { useQuery } from '@tanstack/react-query'
import { useApiClient } from '@/hooks/use-api-client'

interface MeResponse {
  user: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  organizationId: string | null
  orgRole: string | null
}

interface SessionContextValue {
  me: MeResponse | undefined
  organizationId: string | null
  isLoading: boolean
  refetch: () => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const { organization } = useOrganization()
  const { request } = useApiClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['me', organization?.id],
    queryFn: () => request<MeResponse>('/api/v1/me'),
    enabled: Boolean(organization?.id),
    retry: 1,
  })

  return (
    <SessionContext.Provider
      value={{
        me: data,
        organizationId: data?.organizationId ?? null,
        isLoading,
        refetch: () => {
          void refetch()
        },
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within SessionProvider')
  }
  return context
}
