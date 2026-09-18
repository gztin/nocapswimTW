import { createPasswordHash, requireAdminUser } from '../../../../_lib/auth'
import { errorResponse, json } from '../../../../_lib/response'
import { validateAdminPassword, ValidationError } from '../../../../_lib/validation'
import type { PageHandler } from '../../../../_lib/types'

export const onRequestPost: PageHandler = async ({ request, env, params }) => {
  const result = await requireAdminUser(request, env)
  if (result instanceof Response) return result
  if (result.user.role !== 'owner') return errorResponse('只有主要管理員可以管理協作管理者。', 403, 'owner-required')

  const id = params.id
  if (!id || id === result.user.id) return errorResponse('無法重設目前主要管理員的密碼。', 400, 'invalid-admin-user')

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errorResponse('請提供有效的 JSON 資料。', 400, 'invalid-json')
  }

  const values = typeof body === 'object' && body !== null
    ? body as { newPassword?: unknown; confirmPassword?: unknown }
    : {}
  if (typeof values.newPassword !== 'string' || typeof values.confirmPassword !== 'string') {
    return errorResponse('請完整填寫新密碼與確認密碼。', 400, 'password-fields-required')
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
    const target = await env.DB.prepare(`
      SELECT id, role, is_active
      FROM admin_users
      WHERE id = ?
    `).bind(id).first<{ id: string; role: string; is_active: number }>()
    if (!target || target.role !== 'admin' || target.is_active !== 1) {
      return errorResponse('找不到可重設密碼的協作管理者。', 404, 'admin-user-not-found')
    }

    const passwordHash = await createPasswordHash(newPassword)
    const now = new Date().toISOString()
    await env.DB.batch([
      env.DB.prepare(`
        UPDATE admin_users
        SET password_hash = ?, password_salt = ?, password_iterations = ?,
          must_change_password = 1, password_changed_at = ?, updated_at = ?
        WHERE id = ? AND role = 'admin' AND is_active = 1
      `).bind(
        passwordHash.hash,
        passwordHash.salt,
        passwordHash.iterations,
        now,
        now,
        id,
      ),
      env.DB.prepare('DELETE FROM admin_sessions WHERE admin_user_id = ?').bind(id),
    ])
    return json({ ok: true }, 200, { 'Cache-Control': 'no-store' })
  } catch {
    return errorResponse('協作管理者密碼重設失敗，請稍後再試。', 500, 'admin-user-password-reset-failed')
  }
}
