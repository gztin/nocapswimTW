import { requireAdminUser } from '../../_lib/auth'
import { json } from '../../_lib/response'
import type { Env, PageHandler } from '../../_lib/types'

export const onRequestGet: PageHandler = async ({ request, env }) => {
  const result = await requireAdminUser(request, env)
  if (result instanceof Response) return result
  return json({ user: result.user }, 200, { 'Cache-Control': 'no-store' })
}
