import { mapLocation, type LocationRow } from '../_lib/db'
import { errorResponse, json } from '../_lib/response'
import type { Env, PageHandler } from '../_lib/types'

export const onRequestGet: PageHandler = async ({ env }) => {
  if (!env.DB) return errorResponse('資料庫尚未設定。', 503, 'database-not-configured')
  try {
    const result = await env.DB.prepare(`
      SELECT id, name, city, district, region, address, phone, image_url, latitude, longitude,
        cap_policy, restrictions, source_type, source_name, official_url, source_url, last_verified,
        notes, created_at, updated_at
      FROM locations
      ORDER BY city ASC, name ASC
    `).all<LocationRow>()
    return json(result.results.map(mapLocation), 200, { 'Cache-Control': 'no-store' })
  } catch {
    return errorResponse('無法讀取地點資料。', 500, 'locations-read-failed')
  }
}
