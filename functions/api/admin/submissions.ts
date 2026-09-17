import { requireAdmin } from '../../_lib/auth'
import { mapSubmission, type SubmissionRow } from '../../_lib/db'
import { errorResponse, json } from '../../_lib/response'
import type { Env, PageHandler } from '../../_lib/types'

export const onRequestGet: PageHandler = async ({ request, env }) => {
  const authError = await requireAdmin(request, env)
  if (authError) return authError
  if (!env.DB) return errorResponse('資料庫尚未設定。', 503, 'database-not-configured')

  const status = new URL(request.url).searchParams.get('status')
  if (status && !['pending', 'approved', 'rejected'].includes(status)) {
    return errorResponse('投稿狀態不正確。', 400, 'invalid-status')
  }

  try {
    const query = status
      ? 'SELECT * FROM submissions WHERE status = ? ORDER BY created_at DESC LIMIT 500'
      : 'SELECT * FROM submissions ORDER BY created_at DESC LIMIT 500'
    const result = status
      ? await env.DB.prepare(query).bind(status).all<SubmissionRow>()
      : await env.DB.prepare(query).all<SubmissionRow>()
    return json(result.results.map(mapSubmission), 200, { 'Cache-Control': 'no-store' })
  } catch {
    return errorResponse('無法讀取投稿資料。', 500, 'submissions-read-failed')
  }
}
