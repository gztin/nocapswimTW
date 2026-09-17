export function json(body: unknown, status = 200, headers?: HeadersInit) {
  const responseHeaders = new Headers(headers)
  responseHeaders.set('Content-Type', 'application/json; charset=utf-8')
  responseHeaders.set('X-Content-Type-Options', 'nosniff')
  return new Response(JSON.stringify(body), { status, headers: responseHeaders })
}

export function errorResponse(message: string, status: number, code?: string) {
  return json({ error: message, ...(code ? { code } : {}) }, status)
}
