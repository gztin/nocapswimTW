import { clearAdminCookie } from '../../_lib/auth'
import { json } from '../../_lib/response'
import type { Env, PageHandler } from '../../_lib/types'

export const onRequestPost: PageHandler = async ({ env }) => (
  json({ ok: true }, 200, { 'Set-Cookie': clearAdminCookie(env), 'Cache-Control': 'no-store' })
)
