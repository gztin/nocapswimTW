import type { RequestLike } from './types'

export class RequestBodyTooLargeError extends Error {}

function getContentLength(request: RequestLike) {
  const value = request.headers.get('content-length')
  if (!value) return null
  const length = Number(value)
  return Number.isSafeInteger(length) && length >= 0 ? length : null
}

export async function parseJsonWithLimit(request: RequestLike, maxBytes: number): Promise<unknown> {
  const contentLength = getContentLength(request)
  if (contentLength !== null && contentLength > maxBytes) {
    throw new RequestBodyTooLargeError()
  }

  if (!request.body) {
    const parsed = await request.json()
    const encoded = new TextEncoder().encode(JSON.stringify(parsed))
    if (encoded.byteLength > maxBytes) throw new RequestBodyTooLargeError()
    return parsed
  }

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      totalBytes += value.byteLength
      if (totalBytes > maxBytes) {
        await reader.cancel()
        throw new RequestBodyTooLargeError()
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }

  const body = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }
  return JSON.parse(new TextDecoder().decode(body)) as unknown
}
