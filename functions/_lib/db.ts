import type { PoolLocation } from '../../src/types/location'
import type { Submission } from '../../src/types/submission'

export interface LocationRow {
  id: string
  name: string
  city: string
  district: string | null
  region: PoolLocation['region']
  address: string
  latitude: number | null
  longitude: number | null
  cap_policy: PoolLocation['capPolicy']
  restrictions: string | null
  source_type: PoolLocation['sourceType']
  source_url: string | null
  last_verified: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface SubmissionRow {
  id: string
  type: Submission['type']
  location_id: string | null
  name: string | null
  city: string | null
  district: string | null
  region: PoolLocation['region'] | null
  address: string | null
  latitude: number | null
  longitude: number | null
  cap_policy: PoolLocation['capPolicy'] | null
  restrictions: string | null
  source_type: PoolLocation['sourceType'] | null
  source_url: string | null
  notes: string | null
  nickname: string | null
  email: string | null
  status: Submission['status']
  created_at: string
  reviewed_at: string | null
}

export function parseRestrictions(value: string | null | undefined): string[] {
  if (!value) return []
  try {
    const parsed: unknown = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string' && item.length > 0)
  } catch {
    return []
  }
}

export function mapLocation(row: LocationRow): PoolLocation {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    district: row.district ?? undefined,
    region: row.region,
    address: row.address,
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    capPolicy: row.cap_policy,
    restrictions: parseRestrictions(row.restrictions),
    sourceType: row.source_type,
    sourceUrl: row.source_url ?? undefined,
    lastVerified: row.last_verified ?? undefined,
    notes: row.notes ?? undefined,
  }
}

export function mapSubmission(row: SubmissionRow): Submission {
  return {
    id: row.id,
    type: row.type,
    locationId: row.location_id,
    name: row.name,
    city: row.city,
    district: row.district,
    region: row.region,
    address: row.address,
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    capPolicy: row.cap_policy,
    restrictions: parseRestrictions(row.restrictions),
    sourceType: row.source_type,
    sourceUrl: row.source_url,
    notes: row.notes,
    nickname: row.nickname,
    email: row.email,
    status: row.status,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
  }
}
