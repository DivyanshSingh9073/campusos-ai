export type ApiError = { error?: string; message?: string }

const getBaseUrl = (): string => {
  const meta: any = import.meta as any
  const v = meta.env?.VITE_API_BASE_URL as string | undefined
  return (v && v.trim()) || 'http://localhost:3001'
}

export function getToken(): string | null {
  return localStorage.getItem('token')
}

export function setToken(token: string) {
  localStorage.setItem('token', token)
}

export function clearToken() {
  localStorage.removeItem('token')
}

async function request<T>(path: string, opts?: { method?: string; body?: unknown }) {
  const token = getToken()

  const res = await fetch(`${getBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`, {
    method: opts?.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: opts?.body === undefined ? undefined : JSON.stringify(opts.body),
  })

  if (!res.ok) {
    let payload: ApiError | undefined
    try {
      payload = (await res.json()) as ApiError
    } catch {
      // ignore
    }
    const message = payload?.error || payload?.message || `Request failed: ${res.status}`
    throw new Error(message)
  }

  return (await res.json()) as T
}

export const api = {
  auth: {
    login: (body: { email: string; password: string }) =>
      request<{ token: string; user: { id: number; name: string; email: string } }>(
        '/api/auth/login',
        { method: 'POST', body },
      ),
    register: (body: { name: string; email: string; password: string }) =>
      request<{ id: number }>('/api/auth/register', { method: 'POST', body }),
    profile: () => request<{ user: { id: number; name: string; email: string } }>('/api/auth/profile'),
  },
  tasks: {
    list: () =>
      request<{ tasks: Array<{ id: number; title: string; dueDate: string; completed: boolean }> }>(
        '/api/tasks',
      ),
    update: (
      id: number,
      body: { title?: string; due_date?: string | null; completed?: boolean },
    ) =>
      request<{ task: { id: number; title: string; dueDate: string; completed: boolean } }>(
        `/api/tasks/${id}`,
        {
          method: 'PUT',
          body,
        },
      ),
  },
}

