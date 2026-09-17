import type { PoolLocation } from '../types/location'
import type {
  ApprovalPayload,
  BulkSubmissionPayload,
  Submission,
  SubmissionPayload,
  SubmissionStatus,
} from '../types/submission'

export class ApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, {
      credentials: 'same-origin',
      ...init,
    cache: url === '/api/locations' ? 'no-store' : init?.cache,
    headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })
  } catch {
    throw new ApiError('網路連線失敗，請稍後再試。', 0, 'network-error')
  }

  let payload: unknown = null
  try {
    payload = await response.json()
  } catch {
    // Keep the status-based error below for non-JSON responses.
  }
  if (!response.ok) {
    const body = typeof payload === 'object' && payload !== null ? payload as { error?: unknown; code?: unknown } : {}
    throw new ApiError(
      typeof body.error === 'string' ? body.error : '服務暫時無法使用，請稍後再試。',
      response.status,
      typeof body.code === 'string' ? body.code : undefined,
    )
  }
  return payload as T
}

export function fetchLocations() {
  return requestJson<PoolLocation[]>('/api/locations').then((locations) => {
    if (!Array.isArray(locations)) {
      throw new ApiError('地點資料格式不正確，請稍後再試。', 500, 'invalid-locations-response')
    }
    return locations
  })
}

export function createSubmission(payload: SubmissionPayload) {
  return requestJson<{ id: string; status: SubmissionStatus }>('/api/submissions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function createBulkSubmissions(payload: BulkSubmissionPayload) {
  return requestJson<{ ids: string[]; status: SubmissionStatus; accepted: number }>('/api/submissions/bulk', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function adminLogin(password: string) {
  return requestJson<{ ok: true }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
}

export function adminLogout() {
  return requestJson<{ ok: true }>('/api/admin/logout', { method: 'POST' })
}

export function fetchAdminSubmissions(status?: SubmissionStatus) {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  return requestJson<Submission[]>(`/api/admin/submissions${query}`)
}

export function approveSubmission(id: string, payload: ApprovalPayload = {}) {
  return requestJson<{ ok: true; status: 'approved'; locationId: string }>(
    `/api/admin/submissions/${encodeURIComponent(id)}/approve`,
    { method: 'POST', body: JSON.stringify(payload) },
  )
}

export function rejectSubmission(id: string) {
  return requestJson<{ ok: true; status: 'rejected' }>(
    `/api/admin/submissions/${encodeURIComponent(id)}/reject`,
    { method: 'POST', body: JSON.stringify({}) },
  )
}
