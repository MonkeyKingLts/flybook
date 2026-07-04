const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

export class ApiError extends Error {
  status: number
  code: number

  constructor(message: string, status: number, code: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers, ...rest } = options

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  const json = (await response.json()) as ApiResponse<T>

  if (!response.ok || json.code !== 0) {
    throw new ApiError(json.message ?? '请求失败', response.status, json.code)
  }

  return json.data
}
