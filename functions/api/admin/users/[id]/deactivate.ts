import { deleteAdminUserSessions, requireAdminUser } from '../../../../_lib/auth'
import { errorResponse, json } from '../../../../_lib/response'
import type { Env, PageHandler } from '../../../../_lib/types'

export const onRequestPost: PageHandler = async ({ request, env, params }) => {
  const result = await requireAdminUser(request, env)
  if (result instanceof Response) return result
  if (result.user.role !== 'owner') return errorResponse('只有主要管理員可以管理協作管理者。', 403, 'owner-required')

  const id = params.id
  if (!id || id === result.user.id) return errorResponse('無法停用目前的主要管理員。', 400, 'invalid-admin-user')
  try {
    const update = await env.DB.prepare(`
      UPDATE admin_users
      SET is_active = 0, updated_at = ?
      WHERE id = ? AND role = 'admin' AND is_active = 1
    `).bind(new Date().toISOString(), id).run()
    if (Number(update.meta?.changes ?? 0) === 0) return errorResponse('找不到可停用的協作管理者。', 404, 'admin-user-not-found')
    await deleteAdminUserSessions(env, id)
    return json({ ok: true }, 200, { 'Cache-Control': 'no-store' })
  } catch {
    return errorResponse('停用管理員失敗，請稍後再試。', 500, 'admin-user-deactivate-failed')
  }
}
