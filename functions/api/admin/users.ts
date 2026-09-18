import { createPasswordHash, mapAdminUser, requireAdminUser, type AdminUserRow } from '../../_lib/auth'
import { errorResponse, json } from '../../_lib/response'
import { validateAdminDisplayName, validateAdminPassword, validateAdminUsername, ValidationError } from '../../_lib/validation'
import type { Env, PageHandler } from '../../_lib/types'

function ownerOnly(result: Awaited<ReturnType<typeof requireAdminUser>>) {
  if (result instanceof Response) return result
  if (result.user.role !== 'owner') return errorResponse('只有主要管理員可以管理協作管理者。', 403, 'owner-required')
  return null
}

const SELECT_USERS = `
  SELECT id, username, display_name, password_hash, password_salt, password_iterations,
    role, is_active, must_change_password, created_at, updated_at,
    password_changed_at, last_login_at
  FROM admin_users
`

export const onRequestGet: PageHandler = async ({ request, env }) => {
  const result = await requireAdminUser(request, env)
  const accessError = ownerOnly(result)
  if (accessError) return accessError

  try {
    const users = await env.DB.prepare(`${SELECT_USERS} ORDER BY CASE role WHEN 'owner' THEN 0 ELSE 1 END, created_at ASC`).all<AdminUserRow>()
    return json({ users: users.results.map(mapAdminUser) }, 200, { 'Cache-Control': 'no-store' })
  } catch {
    return errorResponse('無法讀取管理員資料。', 500, 'admin-users-read-failed')
  }
}

export const onRequestPost: PageHandler = async ({ request, env }) => {
  const result = await requireAdminUser(request, env)
  const accessError = ownerOnly(result)
  if (accessError) return accessError

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errorResponse('請提供有效的 JSON 資料。', 400, 'invalid-json')
  }
  const values = typeof body === 'object' && body !== null
    ? body as { username?: unknown; displayName?: unknown; password?: unknown; confirmPassword?: unknown }
    : {}

  let username: string
  let displayName: string
  let password: string
  try {
    username = validateAdminUsername(values.username)
    displayName = validateAdminDisplayName(values.displayName)
    password = validateAdminPassword(values.password, '初始密碼')
  } catch (error) {
    return error instanceof ValidationError
      ? errorResponse(error.message, 400, 'invalid-admin-user')
      : errorResponse('管理員資料格式不正確。', 400, 'invalid-admin-user')
  }
  if (password !== values.confirmPassword) return errorResponse('兩次輸入的初始密碼不一致。', 400, 'password-confirmation-mismatch')

  try {
    const existing = await env.DB.prepare('SELECT id FROM admin_users WHERE username = ? COLLATE NOCASE').bind(username).first<{ id: string }>()
    if (existing) return errorResponse('這個管理員帳號已經存在。', 409, 'admin-username-exists')

    const passwordHash = await createPasswordHash(password)
    const now = new Date().toISOString()
    const id = crypto.randomUUID()
    await env.DB.prepare(`
      INSERT INTO admin_users (
        id, username, display_name, password_hash, password_salt, password_iterations,
        role, is_active, must_change_password, created_at, updated_at,
        password_changed_at, last_login_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'admin', 1, 1, ?, ?, ?, NULL)
    `).bind(
      id,
      username,
      displayName,
      passwordHash.hash,
      passwordHash.salt,
      passwordHash.iterations,
      now,
      now,
      now,
    ).run()
    const created = await env.DB.prepare(`${SELECT_USERS} WHERE id = ?`).bind(id).first<AdminUserRow>()
    if (!created) return errorResponse('管理員建立後無法讀取資料。', 500, 'admin-user-create-failed')
    return json({ user: mapAdminUser(created) }, 201, { 'Cache-Control': 'no-store' })
  } catch {
    return errorResponse('管理員建立失敗，請稍後再試。', 500, 'admin-user-create-failed')
  }
}
