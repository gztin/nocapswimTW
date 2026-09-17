import { errorResponse, json } from '../_lib/response'
import { parseJsonWithLimit, RequestBodyTooLargeError } from '../_lib/request'
import { checkSubmissionRateLimit } from '../_lib/rateLimit'
import { isPossibleDuplicate, ValidationError, validateSubmissionPayload } from '../_lib/validation'
import { verifyTurnstile } from '../_lib/turnstile'
import type { Env, PageHandler } from '../_lib/types'

const MAX_SINGLE_SUBMISSION_BODY_BYTES = 32 * 1024

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
    body = await parseJsonWithLimit(request, MAX_SINGLE_SUBMISSION_BODY_BYTES)
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return errorResponse('投稿資料過大，請縮減內容後再試。', 413, 'payload-too-large')
    }
    return errorResponse('請提供有效的 JSON 資料。', 400, 'invalid-json')
  }

  let submission
  try {
    submission = validateSubmissionPayload(body)
  } catch (error) {
    if (error instanceof ValidationError) return errorResponse(error.message, 400, 'validation-failed')
    return errorResponse('投稿資料不正確。', 400, 'validation-failed')
  }

  if (!(await verifyTurnstile(submission.turnstileToken, request, env))) {
    return errorResponse('驗證失敗，請重新完成安全驗證後再試。', 403, 'turnstile-failed')
  }

  if (submission.type === 'new-location') {
    const existingLocations = await env.DB.prepare('SELECT name, address FROM locations').all<{ name: string; address: string }>()
    const existingSubmissions = await env.DB.prepare(`
      SELECT name, address FROM submissions WHERE type = 'new-location' AND status = 'pending'
    `).all<{ name: string; address: string }>()
    const duplicate = [...existingLocations.results, ...existingSubmissions.results].some((item) => (
      isPossibleDuplicate(submission.name, submission.address, item.name, item.address)
    ))
    if (duplicate) {
      return errorResponse('這個地點可能已經存在，請先搜尋看看，或改用「回報資訊有誤」。', 409, 'possible-duplicate')
    }
  }

  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()
  try {
    await env.DB.prepare(`
      INSERT INTO submissions (
        id, type, location_id, name, city, district, region, address,
        phone, latitude, longitude, cap_policy, restrictions, source_type, source_url,
        notes, nickname, email, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `).bind(
      id,
      submission.type,
      submission.locationId,
      submission.name,
      submission.city,
      submission.district,
      submission.region,
      submission.address,
      submission.phone,
      submission.latitude,
      submission.longitude,
      submission.capPolicy,
      submission.restrictions.length ? JSON.stringify(submission.restrictions) : null,
      submission.sourceType,
      submission.sourceUrl,
      submission.notes,
      submission.nickname,
      submission.email,
      createdAt,
    ).run()
    return json({ id, status: 'pending' }, 201)
  } catch {
    return errorResponse('投稿儲存失敗，請稍後再試。', 500, 'submission-create-failed')
  }
}
