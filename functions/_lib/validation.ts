import type { CapPolicy, Region, SourceType } from '../../src/types/location'
import type { ReportType } from '../../src/types/submission'

const REPORT_TYPES: ReportType[] = ['new-location', 'policy-change', 'address-error', 'other']
const CAP_POLICIES: CapPolicy[] = ['not-required', 'conditional', 'unknown']
const SOURCE_TYPES: SourceType[] = ['official', 'phone', 'onsite', 'community']
const REGIONS: Region[] = ['north', 'central', 'south', 'east', 'islands']
export const MAX_BULK_SUBMISSION_ITEMS = 50

const limits = {
  name: 160,
  city: 40,
  district: 40,
  address: 240,
  phone: 40,
  sourceUrl: 500,
  notes: 2000,
  nickname: 60,
  email: 254,
  restriction: 80,
  turnstileToken: 2048,
}

export interface ValidatedSubmission {
  type: ReportType
  locationId: string | null
  name: string
  city: string | null
  district: string | null
  region: Region | null
  address: string
  phone: string | null
  latitude: number | null
  longitude: number | null
  capPolicy: CapPolicy
  restrictions: string[]
  sourceType: SourceType
  officialUrl: string | null
  sourceUrl: string | null
  notes: string | null
  nickname: string | null
  email: string | null
  turnstileToken: string | null
}

export interface ApprovalOverrides {
  latitude?: number | null
  longitude?: number | null
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : {}
}

function optionalText(value: unknown, maxLength: number): string | null {
  if (value === undefined || value === null) return null
  if (typeof value !== 'string') throw new ValidationError('欄位格式不正確。')
  const normalized = value.trim().replace(/\s+/g, ' ')
  if (normalized.length > maxLength) throw new ValidationError('部分欄位內容過長。')
  return normalized || null
}

function requiredText(value: unknown, maxLength: number, label: string): string {
  const result = optionalText(value, maxLength)
  if (!result) throw new ValidationError(`請填寫${label}。`)
  return result
}

function enumValue<T extends string>(value: unknown, values: readonly T[], label: string): T {
  if (typeof value !== 'string' || !values.includes(value as T)) {
    throw new ValidationError(`${label}選項不正確。`)
  }
  return value as T
}

function optionalNumber(value: unknown, min: number, max: number): number | null {
  if (value === undefined || value === null || value === '') return null
  const result = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(result) || result < min || result > max) {
    throw new ValidationError('經緯度格式不正確。')
  }
  return result
}

function parseRestrictions(value: unknown): string[] {
  if (value === undefined || value === null || value === '') return []
  let parsed: unknown = value
  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value)
    } catch {
      throw new ValidationError('使用限制格式不正確。')
    }
  }
  if (!Array.isArray(parsed)) throw new ValidationError('使用限制格式不正確。')
  if (parsed.length > 10) throw new ValidationError('使用限制最多可填寫 10 項。')
  return parsed.map((item) => requiredText(item, limits.restriction, '使用限制'))
}

function optionalUrl(value: unknown, label: string): string | null {
  const result = optionalText(value, limits.sourceUrl)
  if (!result) return null
  try {
    const url = new URL(result)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('unsupported protocol')
  } catch {
    throw new ValidationError(`${label}格式不正確。`)
  }
  return result
}

export class ValidationError extends Error {}

export function validateSubmissionPayload(input: unknown): ValidatedSubmission {
  const body = asRecord(input)
  const type = enumValue(body.type, REPORT_TYPES, '投稿類型')
  const locationId = optionalText(body.location_id ?? body.locationId, 120)
  if (type === 'new-location' && locationId) throw new ValidationError('新增地點不可帶入既有地點。')
  if (type !== 'new-location' && !locationId) throw new ValidationError('請指定要回報的地點。')

  const name = requiredText(body.name, limits.name, '地點名稱')
  const address = requiredText(body.address, limits.address, '地址')
  const phone = optionalText(body.phone, limits.phone)
  const city = optionalText(body.city, limits.city)
  const district = optionalText(body.district, limits.district)
  const region = body.region === undefined || body.region === null || body.region === ''
    ? null
    : enumValue(body.region, REGIONS, '地區')
  if (type === 'new-location' && (!city || !region)) {
    throw new ValidationError('新增地點需要填寫縣市與地區。')
  }

  const latitude = optionalNumber(body.latitude, -90, 90)
  const longitude = optionalNumber(body.longitude, -180, 180)
  if ((latitude === null) !== (longitude === null)) throw new ValidationError('經緯度需要同時填寫。')

  const capPolicy = enumValue(body.cap_policy ?? body.capPolicy, CAP_POLICIES, '泳帽規定')
  const sourceType = enumValue(body.source_type ?? body.sourceType, SOURCE_TYPES, '資料來源')
  const email = optionalText(body.email, limits.email)
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ValidationError('Email 格式不正確。')
  const turnstileToken = optionalText(body.turnstile_token ?? body.turnstileToken, limits.turnstileToken)

  return {
    type,
    locationId,
    name,
    city,
    district,
    region,
    address,
    phone,
    latitude,
    longitude,
    capPolicy,
    restrictions: parseRestrictions(body.restrictions),
    sourceType,
    officialUrl: optionalUrl(body.official_url ?? body.officialUrl, '官方網站網址'),
    sourceUrl: optionalUrl(body.source_url ?? body.sourceUrl, '來源網址'),
    notes: optionalText(body.notes, limits.notes),
    nickname: optionalText(body.nickname, limits.nickname),
    email,
    turnstileToken,
  }
}

export interface ValidatedBulkSubmission {
  items: ValidatedSubmission[]
  nickname: string | null
  email: string | null
  turnstileToken: string | null
}

export function validateBulkSubmissionPayload(input: unknown): ValidatedBulkSubmission {
  const body = asRecord(input)
  if (!Array.isArray(body.items)) throw new ValidationError('批次資料格式不正確。')
  if (!body.items.length) throw new ValidationError('檔案沒有可投稿的資料。')
  if (body.items.length > MAX_BULK_SUBMISSION_ITEMS) {
    throw new ValidationError(`單次最多只能投稿 ${MAX_BULK_SUBMISSION_ITEMS} 筆資料。`)
  }

  const nickname = optionalText(body.nickname, limits.nickname)
  const email = optionalText(body.email, limits.email)
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ValidationError('Email 格式不正確。')
  const turnstileToken = optionalText(body.turnstile_token ?? body.turnstileToken, limits.turnstileToken)
  const items = body.items.map((item, index) => {
    try {
      return validateSubmissionPayload({
        ...(asRecord(item)),
        type: 'new-location',
        nickname,
        email,
        turnstileToken,
      })
    } catch (error) {
      if (error instanceof ValidationError) throw new ValidationError(`第 ${index + 1} 筆：${error.message}`)
      throw new ValidationError(`第 ${index + 1} 筆資料不正確。`)
    }
  })

  return { items, nickname, email, turnstileToken }
}

export function validateApprovalPayload(input: unknown): ApprovalOverrides {
  const body = asRecord(input)
  const hasLatitude = Object.prototype.hasOwnProperty.call(body, 'latitude')
  const hasLongitude = Object.prototype.hasOwnProperty.call(body, 'longitude')
  if (!hasLatitude && !hasLongitude) return {}
  const latitude = optionalNumber(body.latitude, -90, 90)
  const longitude = optionalNumber(body.longitude, -180, 180)
  if ((latitude === null) !== (longitude === null)) throw new ValidationError('經緯度需要同時填寫。')
  return { latitude, longitude }
}

export function normalizeForDuplicate(value: string) {
  return value.normalize('NFKC').toLocaleLowerCase('zh-TW').replace(/\s+/g, '')
}

export function isPossibleDuplicate(name: string, address: string, existingName: string, existingAddress: string) {
  const normalizedName = normalizeForDuplicate(name)
  const normalizedAddress = normalizeForDuplicate(address)
  const otherName = normalizeForDuplicate(existingName)
  const otherAddress = normalizeForDuplicate(existingAddress)
  const nameMatches = normalizedName === otherName || normalizedName.includes(otherName) || otherName.includes(normalizedName)
  const addressMatches = normalizedAddress === otherAddress || normalizedAddress.includes(otherAddress) || otherAddress.includes(normalizedAddress)
  return nameMatches && addressMatches
}
