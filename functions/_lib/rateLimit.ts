import type { D1Database } from '@cloudflare/workers-types'
import type { Env, RequestLike } from './types'

const WINDOW_MS = 60 * 60 * 1000
const MAX_REQUESTS_PER_WINDOW = 5

async function getClientKey(request: RequestLike, env: Env) {
  const ip = request.headers.get('CF-Connecting-IP')?.trim()
    || request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim()
    || 'unknown'
  const salt = env.TURNSTILE_SECRET_KEY ?? 'nocapswimtw-development-rate-limit'
  const data = new TextEncoder().encode(`${salt}:${ip}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function checkSubmissionRateLimit(db: D1Database, request: RequestLike, env: Env) {
  if (env.ENVIRONMENT === 'development' || env.ENVIRONMENT === 'test') return true

  const key = await getClientKey(request, env)
  const now = Date.now()
  const windowBoundary = now - WINDOW_MS
  const results = await db.batch([
    db.prepare(`
      INSERT OR IGNORE INTO submission_rate_limits (rate_key, window_started_at, request_count)
      VALUES (?, ?, 0)
    `).bind(key, now),
    db.prepare(`
      UPDATE submission_rate_limits
      SET
        window_started_at = CASE WHEN window_started_at <= ? THEN ? ELSE window_started_at END,
        request_count = CASE WHEN window_started_at <= ? THEN 1 ELSE request_count + 1 END
      WHERE rate_key = ?
        AND (window_started_at <= ? OR request_count < ?)
    `).bind(windowBoundary, now, windowBoundary, key, windowBoundary, MAX_REQUESTS_PER_WINDOW),
  ])
  const updateResult = results[1] as { meta?: { changes?: number } }
  return Number(updateResult.meta?.changes ?? 0) > 0
}
