import { requireAdmin } from '../../../../_lib/auth'
import { type LocationRow, type SubmissionRow } from '../../../../_lib/db'
import { errorResponse, json } from '../../../../_lib/response'
import { ValidationError, validateApprovalPayload } from '../../../../_lib/validation'
import type { Env, PageHandler } from '../../../../_lib/types'

function submissionHasRequiredLocationFields(submission: SubmissionRow) {
  return Boolean(
    submission.name && submission.city && submission.region && submission.address
      && submission.cap_policy && submission.source_type,
  )
}

export const onRequestPost: PageHandler = async ({ request, env, params }) => {
  const authError = await requireAdmin(request, env)
  if (authError) return authError
  if (!env.DB) return errorResponse('資料庫尚未設定。', 503, 'database-not-configured')

  const id = typeof params.id === 'string' ? params.id : ''
  if (!id) return errorResponse('投稿編號不正確。', 400, 'invalid-id')

  let body: unknown = {}
  try {
    body = await request.json()
  } catch {
    // Empty body is valid when the admin does not add coordinates.
  }

  let overrides
  try {
    overrides = validateApprovalPayload(body)
  } catch (error) {
    if (error instanceof ValidationError) return errorResponse(error.message, 400, 'validation-failed')
    return errorResponse('核准資料不正確。', 400, 'validation-failed')
  }

  const submission = await env.DB.prepare('SELECT * FROM submissions WHERE id = ?').bind(id).first<SubmissionRow>()
  if (!submission) return errorResponse('找不到這筆投稿。', 404, 'submission-not-found')
  if (submission.status !== 'pending') return errorResponse('這筆投稿已經完成審核。', 409, 'submission-already-reviewed')

  const now = new Date().toISOString()
  const verifiedDate = now.slice(0, 10)

  if (submission.type === 'new-location') {
    if (!submissionHasRequiredLocationFields(submission)) {
      return errorResponse('這筆新增地點資料尚未完整，無法核准。', 422, 'incomplete-submission')
    }
    const currentLocations = await env.DB.prepare('SELECT name, address FROM locations').all<{ name: string; address: string }>()
    const duplicate = currentLocations.results.some((item) => (
      item.name && item.address && submission.name && submission.address
        && item.name.normalize('NFKC') === submission.name.normalize('NFKC')
        && item.address.normalize('NFKC') === submission.address.normalize('NFKC')
    ))
    if (duplicate) return errorResponse('核准前發現已有相同地點，請改以既有地點回報。', 409, 'duplicate-location')

    const locationId = crypto.randomUUID()
    const latitude = Object.prototype.hasOwnProperty.call(overrides, 'latitude') ? overrides.latitude : submission.latitude
    const longitude = Object.prototype.hasOwnProperty.call(overrides, 'longitude') ? overrides.longitude : submission.longitude
    try {
      await env.DB.batch([
        env.DB.prepare(`
          INSERT INTO locations (
            id, name, city, district, region, address, latitude, longitude,
            cap_policy, restrictions, source_type, source_url, last_verified,
            notes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          locationId,
          submission.name,
          submission.city,
          submission.district,
          submission.region,
          submission.address,
          latitude ?? null,
          longitude ?? null,
          submission.cap_policy,
          submission.restrictions,
          submission.source_type,
          submission.source_url,
          verifiedDate,
          submission.notes,
          now,
          now,
        ),
        env.DB.prepare('UPDATE submissions SET status = ?, reviewed_at = ? WHERE id = ? AND status = ?')
          .bind('approved', now, id, 'pending'),
      ])
      return json({ ok: true, status: 'approved', locationId })
    } catch {
      return errorResponse('核准投稿失敗，請稍後再試。', 500, 'submission-approve-failed')
    }
  }

  if (!submission.location_id) return errorResponse('這筆投稿缺少既有地點編號。', 422, 'missing-location-id')
  const location = await env.DB.prepare('SELECT * FROM locations WHERE id = ?').bind(submission.location_id).first<LocationRow>()
  if (!location) return errorResponse('找不到投稿所對應的既有地點。', 422, 'location-not-found')

  const latitude = Object.prototype.hasOwnProperty.call(overrides, 'latitude') ? overrides.latitude : location.latitude
  const longitude = Object.prototype.hasOwnProperty.call(overrides, 'longitude') ? overrides.longitude : location.longitude
  const address = submission.type === 'address-error' && submission.address ? submission.address : location.address
  try {
    await env.DB.batch([
      env.DB.prepare(`
        UPDATE locations SET
          address = ?, latitude = ?, longitude = ?,
          cap_policy = COALESCE(?, cap_policy),
          restrictions = COALESCE(?, restrictions),
          source_type = COALESCE(?, source_type),
          source_url = COALESCE(?, source_url),
          last_verified = ?, notes = COALESCE(?, notes), updated_at = ?
        WHERE id = ?
      `).bind(
        address,
        latitude ?? null,
        longitude ?? null,
        submission.cap_policy,
        submission.restrictions,
        submission.source_type,
        submission.source_url,
        verifiedDate,
        submission.notes,
        now,
        submission.location_id,
      ),
      env.DB.prepare('UPDATE submissions SET status = ?, reviewed_at = ? WHERE id = ? AND status = ?')
        .bind('approved', now, id, 'pending'),
    ])
    return json({ ok: true, status: 'approved', locationId: submission.location_id })
  } catch {
    return errorResponse('核准投稿失敗，請稍後再試。', 500, 'submission-approve-failed')
  }
}
