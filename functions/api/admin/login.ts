import { authSuccess, createAdminCookie } from '../../_lib/auth'
import { errorResponse } from '../../_lib/response'
import type { Env, PageHandler } from '../../_lib/types'

export const onRequestPost: PageHandler = async ({ request, env }) => {
  if (!env.ADMIN_PASSWORD) return errorResponse('管理員尚未完成設定。', 503, 'admin-not-configured')
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errorResponse('請提供有效的 JSON 資料。', 400, 'invalid-json')
  }
  const password = typeof body === 'object' && body !== null && 'password' in body
    ? (body as { password?: unknown }).password
    : null
  if (typeof password !== 'string' || password !== env.ADMIN_PASSWORD) {
    return errorResponse('管理員密碼不正確。', 401, 'invalid-password')
  }
  const cookie = await createAdminCookie(env)
  if (!cookie) return errorResponse('無法建立管理員 session。', 500, 'session-create-failed')
  return authSuccess(cookie)
}
