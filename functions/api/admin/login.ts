import { authSuccess, createAdminSession, createPasswordHash, mapAdminUser, verifyPassword, type AdminUserRow } from '../../_lib/auth'
import { errorResponse } from '../../_lib/response'
import { checkAdminLoginRateLimit, clearAdminLoginRateLimit } from '../../_lib/rateLimit'
import { validateAdminUsername } from '../../_lib/validation'
import type { Env, PageHandler } from '../../_lib/types'

export const onRequestPost: PageHandler = async ({ request, env }) => {
  if (!env.DB) return errorResponse('資料庫尚未設定。', 503, 'database-not-configured')
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errorResponse('請提供有效的 JSON 資料。', 400, 'invalid-json')
  }
  const values = typeof body === 'object' && body !== null ? body as { username?: unknown; password?: unknown } : {}
  const password = values.password
  let username: string
  try {
    username = validateAdminUsername(values.username === undefined || values.username === '' ? 'owner' : values.username)
  } catch {
    return errorResponse('管理員帳號或密碼不正確。', 401, 'invalid-credentials')
  }
  if (typeof password !== 'string') return errorResponse('管理員帳號或密碼不正確。', 401, 'invalid-credentials')

  let failureStage = 'rate-limit'
  try {
    if (!(await checkAdminLoginRateLimit(env.DB, request, env))) {
      return errorResponse('登入嘗試次數過多，請稍後再試。', 429, 'login-rate-limit-exceeded', { 'Retry-After': '900' })
    }

    failureStage = 'load-user'
    const selectUser = () => env.DB.prepare(`
      SELECT id, username, display_name, password_hash, password_salt, password_iterations,
        role, is_active, must_change_password, created_at, updated_at,
        password_changed_at, last_login_at
      FROM admin_users
      WHERE username = ? COLLATE NOCASE AND is_active = 1
    `).bind(username).first<AdminUserRow>()

    let user = await selectUser()
    if (!user) {
      failureStage = 'bootstrap-owner'
      const countRow = await env.DB.prepare('SELECT COUNT(*) AS count FROM admin_users').first<{ count: number }>()
      const userCount = Number(countRow?.count ?? 0)
      if (userCount === 0 && username === 'owner' && env.ADMIN_PASSWORD && password === env.ADMIN_PASSWORD) {
        const passwordHash = await createPasswordHash(password)
        const now = new Date().toISOString()
        await env.DB.prepare(`
          INSERT INTO admin_users (
            id, username, display_name, password_hash, password_salt, password_iterations,
            role, is_active, must_change_password, created_at, updated_at,
            password_changed_at, last_login_at
          ) VALUES (?, ?, ?, ?, ?, ?, 'owner', 1, 1, ?, ?, ?, ?)
        `).bind(
          crypto.randomUUID(),
          'owner',
          '主要管理員',
          passwordHash.hash,
          passwordHash.salt,
          passwordHash.iterations,
          now,
          now,
          now,
          now,
        ).run()
        user = await selectUser()
      }
    }

    failureStage = 'verify-password'
    if (!user || !(await verifyPassword(password, user))) {
      return errorResponse('管理員帳號或密碼不正確。', 401, 'invalid-credentials')
    }

    failureStage = 'update-login'
    const now = new Date().toISOString()
    await env.DB.prepare('UPDATE admin_users SET last_login_at = ?, updated_at = ? WHERE id = ?')
      .bind(now, now, user.id)
      .run()
    failureStage = 'create-session'
    const cookie = await createAdminSession(env, user.id)
    if (!cookie) return errorResponse('無法建立管理員 session。', 500, 'session-create-failed')
    await clearAdminLoginRateLimit(env.DB, request, env)
    return authSuccess(cookie, { ok: true, user: mapAdminUser({ ...user, last_login_at: now }) })
  } catch (error) {
    console.error('admin-login-unavailable', {
      stage: failureStage,
      message: error instanceof Error ? error.message : String(error),
    })
    return errorResponse('登入服務暫時無法使用，請稍後再試。', 503, 'admin-login-unavailable')
  }
}
