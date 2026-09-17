import type { D1Database } from '@cloudflare/workers-types'

export interface Env {
  DB: D1Database
  ADMIN_PASSWORD?: string
  TURNSTILE_SECRET_KEY?: string
  ENVIRONMENT?: string
}

export interface RequestLike {
  url: string
  headers: { get(name: string): string | null }
  json(): Promise<unknown>
}

export interface PageContext {
  request: RequestLike
  env: Env
  params: Record<string, string | undefined>
}

export type PageHandler = (context: PageContext) => Response | Promise<Response>
