import { useAuth } from '@clerk/clerk-react'
import { useCallback } from 'react'
import { apiFetch } from '@/lib/api'

export function useApiClient() {
  const { getToken } = useAuth()

  const request = useCallback(
    async <T>(path: string, options: RequestInit = {}) => {
      const token = await getToken()
      return apiFetch<T>(path, { ...options, token })
    },
    [getToken],
  )

  return { request }
}
