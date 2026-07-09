import { useMemo } from 'react'

export type ApiError = { error?: string; message?: string }

// ─── Token storage ────────────────────────────────────────────────────────────

const TOKEN_KEY = 'campusos_ai_token'

export function getToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY)
}

// ─── Base URL / Fetch ─────────────────────────────────────────────────────────
// Vite dev server can proxy /api -> backend, so we call relative /api paths.
// If you set VITE_API_BASE_URL it will be used; otherwise we rely on /api proxy.

const BASE = '/api'

function getApiBaseUrl(): string {
  const v = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined
  const trimmed = typeof v === 'string' ? v.trim() : ''
  return trimmed || BASE
}

async function request<T>(
  path: string,
  opts?: { method?: string; body?: unknown; auth?: boolean }
): Promise<T> {
  const method = opts?.method ?? 'GET'
  const auth = opts?.auth ?? true

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(
    `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`,
    {
      method,
      headers,
      body: opts?.body === undefined ? undefined : JSON.stringify(opts.body),
      credentials: 'include',
    }
  )

  const ct = res.headers.get('content-type') ?? ''
  const data: any = ct.includes('application/json')
    ? await res.json().catch(() => ({}))
    : await res.text().catch(() => ({}))

  if (!res.ok) {
    const payload = data as ApiError
    const message = payload?.error || payload?.message || `Request failed: ${res.status}`
    throw new Error(message)
  }

  return data as T
}

// ─── API surface ──────────────────────────────────────────────────────────────

export const api = {
  auth: {
    login(body: { email: string; password: string }) {
      return request<{ token: string; user: { id: number; name: string; email: string } }>(
        '/auth/login',
        { method: 'POST', body, auth: false }
      )
    },

    register(body: { name: string; email: string; password: string }) {
      return request<{ id: number }>('/auth/register', { method: 'POST', body, auth: false })
    },

    profile() {
      return request<{ user: { id: number; name: string; email: string } }>('/auth/profile', {
        method: 'GET',
        auth: true,
      })
    },
  },

  tasks: {
    list() {
      return request<{
        tasks: Array<{
          id: number
          title: string
          description: string
          dueDate: string | null
          completed: boolean
          createdAt: string
        }>
      }>('/tasks', { method: 'GET' })
    },

    create(body: { title: string; description?: string; due_date?: string; completed?: boolean }) {
      return request<{
        task: {
          id: number
          title: string
          description: string
          dueDate: string | null
          completed: boolean
          createdAt: string
        }
      }>('/tasks', { method: 'POST', body })
    },

    update(
      id: number,
      body: { title?: string; description?: string; due_date?: string | null; completed?: boolean }
    ) {
      return request<{
        task: {
          id: number
          title: string
          description: string
          dueDate: string | null
          completed: boolean
          createdAt: string
        }
      }>(`/tasks/${id}`, { method: 'PUT', body })
    },

    delete(id: number) {
      return request<void>(`/tasks/${id}`, { method: 'DELETE' })
    },
  },

  studyPlanner: {
    list() {
      return request<{
        sessions: Array<{
          id: number
          subject: string
          topic: string
          studyDate: string
          completed: boolean
          createdAt: string
        }>
      }>('/study-planner', { method: 'GET' })
    },

    create(body: { subject: string; topic: string; study_date: string; completed?: boolean }) {
      return request<{
        session: {
          id: number
          subject: string
          topic: string
          studyDate: string
          completed: boolean
          createdAt: string
        }
      }>('/study-planner', { method: 'POST', body })
    },

    update(
      id: number,
      body: { subject?: string; topic?: string; study_date?: string | null; completed?: boolean }
    ) {
      return request<{
        session: {
          id: number
          subject: string
          topic: string
          studyDate: string
          completed: boolean
          createdAt: string
        }
      }>(`/study-planner/${id}`, { method: 'PUT', body })
    },

    delete(id: number) {
      return request<void>(`/study-planner/${id}`, { method: 'DELETE' })
    },
  },

  ai: {
    chat(body: { message: string }) {
      return request<{ reply: string }>('/ai/chat', { method: 'POST', body })
    },
  },

  assistant: {
    chat(body: { message: string }) {
      return request<{ reply: string }>('/assistant/chat', { method: 'POST', body })
    },
  },

  notes: {
    list() {
      return request<{ notes: Array<{ id: number; title: string; content: string; updatedAt: string | null }> }>(
        '/notes',
        { method: 'GET' }
      )
    },

    get(id: number) {
      return request<{ note: { id: number; title: string; content: string; updatedAt: string | null } }>(
        `/notes/${id}`,
        { method: 'GET' }
      )
    },

    create(body: { title: string; content?: string }) {
      return request<{ note: { id: number; title: string; content: string; updatedAt: string | null } }>(
        '/notes',
        { method: 'POST', body }
      )
    },

    update(id: number, body: { title?: string; content?: string }) {
      return request<{ note: { id: number; title: string; content: string; updatedAt: string | null } }>(
        `/notes/${id}`,
        { method: 'PUT', body }
      )
    },

    delete(id: number) {
      return request<void>(`/notes/${id}`, { method: 'DELETE' })
    },
  },
}

// Some parts of the app may import this hook-like helper.
export function useApi() {
  return useMemo(() => api, [])
}

