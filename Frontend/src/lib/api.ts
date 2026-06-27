// ─── Token storage ────────────────────────────────────────────────────────────

const TOKEN_KEY = 'campusos_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// ─── Base fetch ───────────────────────────────────────────────────────────────

const BASE = '/api'   // Vite proxy rewrites /api → http://localhost:3001/api

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  auth = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  // Parse JSON even on error responses so we can surface the error message
  let data: any
  try {
    data = await res.json()
  } catch {
    data = {}
  }

  if (!res.ok) {
    // Throw the backend's error message if present, else HTTP status text
    throw new Error(data?.error ?? `${res.status} ${res.statusText}`)
  }

  return data as T
}

// ─── API surface ──────────────────────────────────────────────────────────────

export const api = {

  auth: {
    /** POST /api/auth/register — returns { id } */
    register(body: { name: string; email: string; password: string }) {
      return request<{ id: number }>('POST', '/auth/register', body, false)
    },

    /** POST /api/auth/login — returns { token, user } */
    login(body: { email: string; password: string }) {
      return request<{ token: string; user: { id: number; name: string; email: string } }>(
        'POST',
        '/auth/login',
        body,
        false
      )
    },

    /** GET /api/auth/profile — returns { user } (requires auth) */
    profile() {
      return request<{ user: { id: number; name: string; email: string } }>(
        'GET',
        '/auth/profile'
      )
    },
  },

  tasks: {
    /** GET /api/tasks — returns { tasks } */
    list() {
      return request<{ tasks: Array<{ id: number; title: string; dueDate: string | null; completed: boolean }> }>(
        'GET',
        '/tasks'
      )
    },

    /** POST /api/tasks — returns { task } */
    create(body: { title: string; due_date?: string; completed?: boolean }) {
      return request<{ task: { id: number; title: string; dueDate: string | null; completed: boolean } }>(
        'POST',
        '/tasks',
        body
      )
    },

    /** PUT /api/tasks/:id — returns { task } */
    update(id: number, body: { title?: string; due_date?: string; completed?: boolean }) {
      return request<{ task: { id: number; title: string; dueDate: string | null; completed: boolean } }>(
        'PUT',
        `/tasks/${id}`,
        body
      )
    },

    /** DELETE /api/tasks/:id — returns 204 No Content */
    delete(id: number) {
      return request<void>('DELETE', `/tasks/${id}`)
    },
  },

  notes: {
    /** GET /api/notes — returns { notes } */
    list() {
      return request<{ notes: Array<{ id: number; title: string; subject: string; fileUrl: string }> }>(
        'GET',
        '/notes'
      )
    },

    /** GET /api/notes/:id — returns { note } */
    get(id: number) {
      return request<{ note: { id: number; title: string; subject: string; fileUrl: string } }>(
        'GET',
        `/notes/${id}`
      )
    },

    /** POST /api/notes/upload — returns { note } */
    upload(body: { title: string; subject: string; file_url: string }) {
      return request<{ note: { id: number; title: string; subject: string; fileUrl: string } }>(
        'POST',
        '/notes/upload',
        body
      )
    },

    /** DELETE /api/notes/:id — returns 204 No Content */
    delete(id: number) {
      return request<void>('DELETE', `/notes/${id}`)
    },
  },
}
