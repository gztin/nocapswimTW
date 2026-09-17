import { requireAdmin } from '../../../../_lib/auth'
import { errorResponse, json } from '../../../../_lib/response'
import type { Env, PageHandler } from '../../../../_lib/types'

export const onRequestPost: PageHandler = async ({ request, env, params }) => {
  const authError = await requireAdmin(request, env)
  if (authError) return authError
  if (!env.DB) return errorResponse('資料庫尚未設定。', 503, 'database-not-configured')

  const id = typeof params.id === 'string' ? params.id : ''
  if (!id) return errorResponse('投稿編號不正確。', 400, 'invalid-id')
  const now = new Date().toISOString()
  const result = await env.DB.prepare(
    'UPDATE submissions SET status = ?, reviewed_at = ? WHERE id = ? AND status = ?',
  ).bind('rejected', now, id, 'pending').run()
  if (!result.meta.changes) return errorResponse('找不到待審核的投稿。', 404, 'submission-not-pending')
  return json({ ok: true, status: 'rejected' })
}
