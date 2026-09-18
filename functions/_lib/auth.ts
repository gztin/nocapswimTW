import type { AdminRole, AdminUser } from '../../src/types/admin'
import type { Env, RequestLike } from './types'
import { errorResponse, json } from './response'

const COOKIE_NAME = 'nocapswim_admin'
const SESSION_SECONDS = 60 * 60 * 8
const PASSWORD_HASH_ITERATIONS = 120_000
const encoder = new TextEncoder()

export interface AdminUserRow {
  id: string
  username: string
  display_name: string
  password_hash: string
  password_salt: string
  password_iterations: number
  role: AdminRole
  is_active: number
  must_change_password: number
  created_at: string
  updated_at: string
  password_changed_at: string
  last_login_at: string | null
}

interface AdminSessionRow extends AdminUserRow {
  session_id: string
}

export interface AdminSession {
  sessionId: string
  user: AdminUser
}

function encodeBase64Url(value: Uint8Array) {
  let binary = ''
  for (const byte of value) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function decodeBase64Url(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4)
  const binary = atob(padded)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

async function digestBase64Url(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value))
  return encodeBase64Url(new Uint8Array(digest))
}

function getCookie(request: RequestLike, name: string) {
  const cookieHeader = request.headers.get('Cookie') ?? ''
  for (const part of cookieHeader.split(';')) {
    const [key, ...value] = part.trim().split('=')
    if (key === name) return value.join('=')
  }
  return null
}

function safeEqual(left: Uint8Array, right: Uint8Array) {
  let difference = left.length ^ right.length
  const length = Math.max(left.length, right.length)
  for (let index = 0; index < length; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0)
  }
  return difference === 0
}

async function derivePasswordHash(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const saltBuffer = salt.slice().buffer as ArrayBuffer
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBuffer, iterations, hash: 'SHA-256' },
    key,
    256,
  )
  return new Uint8Array(bits)
}

export async function createPasswordHash(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await derivePasswordHash(password, salt, PASSWORD_HASH_ITERATIONS)
  return {
    hash: encodeBase64Url(hash),
    salt: encodeBase64Url(salt),
    iterations: PASSWORD_HASH_ITERATIONS,
  }
}

export async function verifyPassword(password: string, row: Pick<AdminUserRow, 'password_hash' | 'password_salt' | 'password_iterations'>) {
  try {
    const expected = decodeBase64Url(row.password_hash)
    const actual = await derivePasswordHash(password, decodeBase64Url(row.password_salt), row.password_iterations)
    return safeEqual(actual, expected)
  } catch {
    return false
  }
}

export function mapAdminUser(row: AdminUserRow): AdminUser {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    role: row.role,
    isActive: row.is_active === 1,
    mustChangePassword: row.must_change_password === 1,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
  }
}

function sessionCookie(token: string, env: Env, maxAge: number) {
  const secure = env.ENVIRONMENT === 'development' || env.ENVIRONMENT === 'test' ? '' : '; Secure'
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`
}

export async function createAdminSession(env: Env, userId: string) {
  if (!env.DB) return null
  const token = encodeBase64Url(crypto.getRandomValues(new Uint8Array(32)))
  const tokenHash = await digestBase64Url(token)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + SESSION_SECONDS * 1000).toISOString()
  await env.DB.batch([
    env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at <= ?').bind(now.toISOString()),
    env.DB.prepare(`
      INSERT INTO admin_sessions (id, admin_user_id, token_hash, expires_at, created_at, last_seen_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(crypto.randomUUID(), userId, tokenHash, expiresAt, now.toISOString(), now.toISOString()),
  ])
  return sessionCookie(token, env, SESSION_SECONDS)
}

export async function getAdminSession(request: RequestLike, env: Env): Promise<AdminSession | null> {
  if (!env.DB) return null
  const token = getCookie(request, COOKIE_NAME)
  if (!token) return null
  const tokenHash = await digestBase64Url(token)
  const row = await env.DB.prepare(`
    SELECT
      s.id AS session_id,
      u.id, u.username, u.display_name, u.password_hash, u.password_salt,
      u.password_iterations, u.role, u.is_active, u.must_change_password,
      u.created_at, u.updated_at, u.password_changed_at, u.last_login_at
    FROM admin_sessions s
    INNER JOIN admin_users u ON u.id = s.admin_user_id
    WHERE s.token_hash = ?
      AND s.expires_at > ?
      AND u.is_active = 1
  `).bind(tokenHash, new Date().toISOString()).first<AdminSessionRow>()
  if (!row) return null

  return {
    sessionId: row.session_id,
    user: mapAdminUser(row),
  }
}

export async function deleteAdminSession(request: RequestLike, env: Env) {
  if (!env.DB) return
  const token = getCookie(request, COOKIE_NAME)
  if (!token) return
  const tokenHash = await digestBase64Url(token)
  await env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').bind(tokenHash).run()
}

export async function deleteAdminUserSessions(env: Env, userId: string) {
  if (!env.DB) return
  await env.DB.prepare('DELETE FROM admin_sessions WHERE admin_user_id = ?').bind(userId).run()
}

export function clearAdminCookie(env: Env) {
  return sessionCookie('', env, 0)
}

export function authSuccess(cookie: string, body: unknown = { ok: true }) {
  return json(body, 200, { 'Set-Cookie': cookie, 'Cache-Control': 'no-store' })
}

export async function requireAdminUser(request: RequestLike, env: Env): Promise<AdminSession | Response> {
  if (!env.DB) return errorResponse('資料庫尚未設定。', 503, 'database-not-configured')
  const session = await getAdminSession(request, env)
  if (!session) return errorResponse('請先登入管理後台。', 401, 'unauthorized')
  return session
}

export async function requireAdmin(request: RequestLike, env: Env) {
  const result = await requireAdminUser(request, env)
  return result instanceof Response ? result : null
}
