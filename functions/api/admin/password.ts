import { clearAdminCookie, createPasswordHash, requireAdminUser, verifyPassword, type AdminUserRow } from '../../_lib/auth'
import { errorResponse, json } from '../../_lib/response'
import { validateAdminPassword, ValidationError } from '../../_lib/validation'
import type { Env, PageHandler } from '../../_lib/types'

export const onRequestPost: PageHandler = async ({ request, env }) => {
  const result = await requireAdminUser(request, env)
  if (result instanceof Response) return result

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errorResponse('請提供有效的 JSON 資料。', 400, 'invalid-json')
  }

  const values = typeof body === 'object' && body !== null
    ? body as { currentPassword?: unknown; newPassword?: unknown; confirmPassword?: unknown }
    : {}
  if (typeof values.currentPassword !== 'string' || typeof values.newPassword !== 'string' || typeof values.confirmPassword !== 'string') {
    return errorResponse('請完整填寫目前密碼、新密碼與確認密碼。', 400, 'password-fields-required')
  }
  if (values.newPassword !== values.confirmPassword) {
    return errorResponse('兩次輸入的新密碼不一致。', 400, 'password-confirmation-mismatch')
  }

  let newPassword: string
  try {
    newPassword = validateAdminPassword(values.newPassword, '新密碼')
  } catch (error) {
    return error instanceof ValidationError
      ? errorResponse(error.message, 400, 'invalid-password-policy')
      : errorResponse('新密碼格式不正確。', 400, 'invalid-password-policy')
  }

  try {
    const user = await env.DB.prepare(`
      SELECT id, username, display_name, password_hash, password_salt, password_iterations,
        role, is_active, must_change_password, created_at, updated_at,
        password_changed_at, last_login_at
      FROM admin_users
      WHERE id = ? AND is_active = 1
    `).bind(result.user.id).first<AdminUserRow>()
    if (!user || !(await verifyPassword(values.currentPassword, user))) {
      return errorResponse('目前密碼不正確。', 401, 'invalid-current-password')
    }
    if (values.currentPassword === newPassword) {
      return errorResponse('新密碼不可與目前密碼相同。', 400, 'password-unchanged')
    }

    const passwordHash = await createPasswordHash(newPassword)
    const now = new Date().toISOString()
    await env.DB.batch([
      env.DB.prepare(`
        UPDATE admin_users
        SET password_hash = ?, password_salt = ?, password_iterations = ?,
          must_change_password = 0, password_changed_at = ?, updated_at = ?
        WHERE id = ?
      `).bind(passwordHash.hash, passwordHash.salt, passwordHash.iterations, now, now, result.user.id),
      env.DB.prepare('DELETE FROM admin_sessions WHERE admin_user_id = ?').bind(result.user.id),
    ])
    return json({ ok: true, requiresLogin: true }, 200, {
      'Set-Cookie': clearAdminCookie(env),
      'Cache-Control': 'no-store',
    })
  } catch {
    return errorResponse('密碼修改失敗，請稍後再試。', 500, 'password-change-failed')
  }
}
