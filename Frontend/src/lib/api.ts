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

// ─── Base URL / Fetch ────────────────────────────────────────────────────────
// Vite dev server can proxy /api -> backend, so we call relative /api paths.
// If you use VITE_API_BASE_URL you can set it; otherwise rely on /api proxy.

const BASE = '/api'

function getApiBaseUrl(): string {
  const v = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined
  const trimmed = typeof v === 'string' ? v.trim() : ''
  return trimmed || BASE
}

function makeHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  return headers
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

  const res = await fetch(`${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`, {
    method,
    headers: {
      ...headers,
    },
    body: opts?.body === undefined ? undefined : JSON.stringify(opts.body),
    credentials: 'include',
  })

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
      return request<{ tasks: Array<{ id: number; title: string; dueDate: string | null; completed: boolean }> }>(
        '/tasks',
        { method: 'GET' }
      )
    },

    create(body: { title: string; due_date?: string; completed?: boolean }) {
      return request<{ task: { id: number; title: string; dueDate: string | null; completed: boolean } }>(
        '/tasks',
        { method: 'POST', body }
      )
    },

    update(id: number, body: { title?: string; due_date?: string | null; completed?: boolean }) {
      return request<{ task: { id: number; title: string; dueDate: string | null; completed: boolean } }>(
        `/tasks/${id}`,
        { method: 'PUT', body }
      )
    },

    delete(id: number) {
      return request<void>(`/tasks/${id}`, { method: 'DELETE' })
    },
  },

  notes: {
    list() {
      return request<{ notes: Array<{ id: number; title: string; subject: string; fileUrl: string }> }>(
        '/notes',
        { method: 'GET' }
      )
    },

    get(id: number) {
      return request<{ note: { id: number; title: string; subject: string; fileUrl: string } }>(
        `/notes/${id}`,
        { method: 'GET' }
      )
    },

    upload(body: { title: string; subject: string; file_url: string }) {
      return request<{ note: { id: number; title: string; subject: string; fileUrl: string } }>(
        '/notes/upload',
        { method: 'POST', body }
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

