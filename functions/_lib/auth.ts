import type { Env } from './types'
import type { RequestLike } from './types'
import { errorResponse, json } from './response'

const COOKIE_NAME = 'nocapswim_admin'
const SESSION_SECONDS = 60 * 60 * 8
const encoder = new TextEncoder()

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

async function getKey(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

async function sign(value: string, secret: string) {
  const signature = await crypto.subtle.sign('HMAC', await getKey(secret), encoder.encode(value))
  return encodeBase64Url(new Uint8Array(signature))
}

function getCookie(request: RequestLike, name: string) {
  const cookieHeader = request.headers.get('Cookie') ?? ''
  for (const part of cookieHeader.split(';')) {
    const [key, ...value] = part.trim().split('=')
    if (key === name) return value.join('=')
  }
  return null
}

export async function hasAdminSession(request: RequestLike, env: Env) {
  if (!env.ADMIN_PASSWORD) return false
  const token = getCookie(request, COOKIE_NAME)
  if (!token) return false
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return false
  try {
    const validSignature = await crypto.subtle.verify(
      'HMAC',
      await getKey(env.ADMIN_PASSWORD),
      decodeBase64Url(signature),
      encoder.encode(payload),
    )
    if (!validSignature) return false
    const session = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload))) as { exp?: number }
    return typeof session.exp === 'number' && session.exp > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

export async function requireAdmin(request: RequestLike, env: Env) {
  if (!env.ADMIN_PASSWORD) return errorResponse('管理員尚未完成設定。', 503, 'admin-not-configured')
  if (!(await hasAdminSession(request, env))) return errorResponse('請先登入管理後台。', 401, 'unauthorized')
  return null
}

export async function createAdminCookie(env: Env) {
  if (!env.ADMIN_PASSWORD) return null
  const payload = encodeBase64Url(encoder.encode(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS })))
  const signature = await sign(payload, env.ADMIN_PASSWORD)
  const secure = env.ENVIRONMENT === 'development' ? '' : '; Secure'
  return `${COOKIE_NAME}=${payload}.${signature}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_SECONDS}${secure}`
}

export function clearAdminCookie(env: Env) {
  const secure = env.ENVIRONMENT === 'development' ? '' : '; Secure'
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
}

export function authSuccess(cookie: string) {
  return json({ ok: true }, 200, { 'Set-Cookie': cookie, 'Cache-Control': 'no-store' })
}
