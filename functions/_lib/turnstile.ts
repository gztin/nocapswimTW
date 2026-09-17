import type { Env, RequestLike } from './types'

interface TurnstileResponse {
  success: boolean
}

export async function verifyTurnstile(token: string | null, request: RequestLike, env: Env) {
  if (!env.TURNSTILE_SECRET_KEY) return env.ENVIRONMENT === 'development' || env.ENVIRONMENT === 'test'
  if (!token) return false

  const form = new URLSearchParams({
    secret: env.TURNSTILE_SECRET_KEY,
    response: token,
  })
  const remoteIp = request.headers.get('CF-Connecting-IP')
  if (remoteIp) form.set('remoteip', remoteIp)

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    })
    if (!response.ok) return false
    const result = await response.json() as TurnstileResponse
    return result.success === true
  } catch {
    return false
  }
}
