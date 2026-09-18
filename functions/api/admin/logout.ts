import { clearAdminCookie, deleteAdminSession } from '../../_lib/auth'
import { json } from '../../_lib/response'
import type { Env, PageHandler } from '../../_lib/types'

export const onRequestPost: PageHandler = async ({ request, env }) => {
  await deleteAdminSession(request, env)
  return json({ ok: true }, 200, { 'Set-Cookie': clearAdminCookie(env), 'Cache-Control': 'no-store' })
}
