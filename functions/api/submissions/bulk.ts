import { errorResponse, json } from '../../_lib/response'
import { parseJsonWithLimit, RequestBodyTooLargeError } from '../../_lib/request'
import { checkSubmissionRateLimit } from '../../_lib/rateLimit'
import {
  isPossibleDuplicate,
  MAX_BULK_SUBMISSION_ITEMS,
  ValidationError,
  validateBulkSubmissionPayload,
} from '../../_lib/validation'
import { verifyTurnstile } from '../../_lib/turnstile'
import type { Env, PageHandler } from '../../_lib/types'

const MAX_BULK_SUBMISSION_BODY_BYTES = 2 * 1024 * 1024

export const onRequestPost: PageHandler = async ({ request, env }) => {
  if (!env.DB) return errorResponse('資料庫尚未設定。', 503, 'database-not-configured')

  try {
    if (!(await checkSubmissionRateLimit(env.DB, request, env))) {
      return errorResponse('投稿次數已達上限，請稍後再試。', 429, 'rate-limit-exceeded', { 'Retry-After': '3600' })
    }
  } catch {
    return errorResponse('投稿服務暫時無法使用，請稍後再試。', 503, 'rate-limit-unavailable')
  }

  let body: unknown
  try {
    body = await parseJsonWithLimit(request, MAX_BULK_SUBMISSION_BODY_BYTES)
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return errorResponse('批次投稿資料過大，請縮減檔案內容後再試。', 413, 'payload-too-large')
    }
    return errorResponse('請提供有效的 JSON 資料。', 400, 'invalid-json')
  }

  let submission
  try {
    submission = validateBulkSubmissionPayload(body)
  } catch (error) {
    if (error instanceof ValidationError) return errorResponse(error.message, 400, 'validation-failed')
    return errorResponse('批次投稿資料不正確。', 400, 'validation-failed')
  }

  if (!(await verifyTurnstile(submission.turnstileToken, request, env))) {
    return errorResponse('驗證失敗，請重新完成安全驗證後再試。', 403, 'turnstile-failed')
  }

  try {
    const [existingLocations, existingSubmissions] = await Promise.all([
      env.DB.prepare('SELECT name, address FROM locations').all<{ name: string; address: string }>(),
      env.DB.prepare(`
        SELECT name, address FROM submissions WHERE type = 'new-location' AND status = 'pending'
      `).all<{ name: string; address: string }>(),
    ])
    const existing = [...existingLocations.results, ...existingSubmissions.results]
    const seen: Array<{ name: string; address: string; row: number }> = []
    for (const [index, item] of submission.items.entries()) {
      const duplicate = [...existing, ...seen].find((candidate) => (
        isPossibleDuplicate(item.name, item.address, candidate.name, candidate.address)
      ))
      if (duplicate) {
        const duplicateRow = 'row' in duplicate ? `第 ${duplicate.row} 筆` : '既有資料'
        return errorResponse(`第 ${index + 1} 筆資料可能與${duplicateRow}重複，請先確認。`, 409, 'possible-duplicate')
      }
      seen.push({ name: item.name, address: item.address, row: index + 1 })
    }

    const createdAt = new Date().toISOString()
    const ids = submission.items.map(() => crypto.randomUUID())
    const statements = submission.items.map((item, index) => env.DB.prepare(`
      INSERT INTO submissions (
        id, type, location_id, name, city, district, region, address,
        phone, latitude, longitude, cap_policy, restrictions, source_type, official_url, source_url,
        notes, nickname, email, status, created_at
      ) VALUES (?, 'new-location', NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `).bind(
      ids[index],
      item.name,
      item.city,
      item.district,
      item.region,
      item.address,
      item.phone,
      item.latitude,
      item.longitude,
      item.capPolicy,
      item.restrictions.length ? JSON.stringify(item.restrictions) : null,
      item.sourceType,
      item.officialUrl,
      item.sourceUrl,
      item.notes,
      submission.nickname,
      submission.email,
      createdAt,
    ))

    await env.DB.batch(statements)
    return json({ ids, status: 'pending', accepted: submission.items.length }, 201)
  } catch {
    return errorResponse(`批次投稿儲存失敗，請稍後再試。最多可投稿 ${MAX_BULK_SUBMISSION_ITEMS} 筆。`, 500, 'submission-create-failed')
  }
}
