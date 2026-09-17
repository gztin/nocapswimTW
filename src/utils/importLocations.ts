import type { CapPolicy, Region, SourceType } from '../types/location'
import type { BulkSubmissionItemPayload } from '../types/submission'

export const MAX_IMPORT_FILE_BYTES = 1024 * 1024
export const MAX_IMPORT_ROWS = 50

export interface ImportRowError {
  row: number
  message: string
}

export interface ImportPreview {
  rowCount: number
  items: BulkSubmissionItemPayload[]
  errors: ImportRowError[]
}

export class ImportFormatError extends Error {}

const regionAliases: Record<string, Region> = {
  north: 'north',
  central: 'central',
  south: 'south',
  east: 'east',
  islands: 'islands',
  北部: 'north',
  中部: 'central',
  南部: 'south',
  東部: 'east',
  離島: 'islands',
}

const capPolicyAliases: Record<string, CapPolicy> = {
  'not-required': 'not-required',
  notrequired: 'not-required',
  reported_not_required: 'not-required',
  reportednotrequired: 'not-required',
  不強制泳帽: 'not-required',
  不需泳帽: 'not-required',
  conditional: 'conditional',
  reported_conditional: 'conditional',
  reportedconditional: 'conditional',
  有條件: 'conditional',
  unknown: 'unknown',
  待確認: 'unknown',
}

const sourceTypeAliases: Record<string, SourceType> = {
  official: 'official',
  phone: 'phone',
  onsite: 'onsite',
  community: 'community',
  main_post: 'community',
  mainpost: 'community',
  facebook: 'community',
  官方網站: 'official',
  電話確認: 'phone',
  現場確認: 'onsite',
  網友回報: 'community',
}

const cityNames = [
  '台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市', '基隆市', '新竹市', '嘉義市',
  '新竹縣', '苗栗縣', '彰化縣', '南投縣', '雲林縣', '嘉義縣', '屏東縣', '宜蘭縣', '花蓮縣',
  '台東縣', '澎湖縣', '金門縣', '連江縣',
]

const headerAliases: Record<string, string> = {
  name: 'name',
  地點名稱: 'name',
  city: 'city',
  縣市: 'city',
  district: 'district',
  行政區: 'district',
  region: 'region',
  地區: 'region',
  address: 'address',
  地址: 'address',
  phone: 'phone',
  電話: 'phone',
  latitude: 'latitude',
  緯度: 'latitude',
  longitude: 'longitude',
  經度: 'longitude',
  cappolicy: 'capPolicy',
  cap_policy: 'capPolicy',
  swimcappolicy: 'capPolicy',
  swim_cap_policy: 'capPolicy',
  泳帽規定: 'capPolicy',
  restrictions: 'restrictions',
  使用限制: 'restrictions',
  sourcetype: 'sourceType',
  source_type: 'sourceType',
  資料來源: 'sourceType',
  officialurl: 'officialUrl',
  official_url: 'officialUrl',
  官方網站: 'officialUrl',
  sourceurl: 'sourceUrl',
  source_url: 'sourceUrl',
  website: 'officialUrl',
  來源網址: 'sourceUrl',
  notes: 'notes',
  補充說明: 'notes',
  備註: 'notes',
  verificationstatus: 'verificationStatus',
  verification_status: 'verificationStatus',
  schema_version: 'schemaVersion',
}

function normalizeKey(value: string) {
  return value.replace(/^\uFEFF/, '').trim().toLocaleLowerCase('zh-TW').replace(/[\s-]/g, '')
}

function getField(record: Record<string, unknown>, field: string) {
  for (const [key, value] of Object.entries(record)) {
    if (headerAliases[normalizeKey(key)] === field || normalizeKey(key) === field.toLocaleLowerCase()) return value
  }
  return undefined
}

function textValue(value: unknown) {
  if (value === undefined || value === null) return null
  if (typeof value === 'string' || typeof value === 'number') return String(value).trim()
  return null
}

function deriveAddressParts(address: string) {
  const city = cityNames.find((name) => address.startsWith(name)) ?? null
  if (!city) return { city: null, district: null }
  const remainder = address.slice(city.length)
  const districtMatch = remainder.match(/^([^\s]{1,8}(?:區|鄉|鎮|市))/)
  return { city, district: districtMatch?.[1] ?? null }
}

function mapRegion(value: unknown) {
  const text = textValue(value)
  return text ? regionAliases[normalizeKey(text)] ?? null : null
}

function mapCapPolicy(value: unknown) {
  const text = textValue(value)
  return text ? capPolicyAliases[normalizeKey(text)] ?? null : null
}

function mapSourceType(value: unknown) {
  const text = textValue(value)
  return text ? sourceTypeAliases[normalizeKey(text)] ?? null : null
}

function parseRestrictions(value: unknown) {
  if (Array.isArray(value)) return value.map(textValue).filter((item): item is string => Boolean(item))
  const text = textValue(value)
  if (!text) return []
  if (text.startsWith('[')) {
    try {
      const parsed: unknown = JSON.parse(text)
      if (Array.isArray(parsed)) return parsed.map(textValue).filter((item): item is string => Boolean(item))
    } catch {
      return null
    }
    return null
  }
  return text.split(/[|｜,，;；、]/).map((item) => item.trim()).filter(Boolean)
}

function parseCoordinate(value: unknown) {
  const text = textValue(value)
  if (!text) return null
  const number = Number(text)
  return Number.isFinite(number) ? number : Number.NaN
}

function normalizeDuplicateValue(value: string) {
  return value.normalize('NFKC').toLocaleLowerCase('zh-TW').replace(/\s+/g, '')
}

function sameLocation(left: BulkSubmissionItemPayload, right: BulkSubmissionItemPayload) {
  const leftName = normalizeDuplicateValue(left.name)
  const rightName = normalizeDuplicateValue(right.name)
  const leftAddress = normalizeDuplicateValue(left.address)
  const rightAddress = normalizeDuplicateValue(right.address)
  const nameMatches = leftName === rightName || leftName.includes(rightName) || rightName.includes(leftName)
  const addressMatches = leftAddress === rightAddress || leftAddress.includes(rightAddress) || rightAddress.includes(leftAddress)
  return nameMatches && addressMatches
}

function toRecord(value: unknown) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

function normalizeRow(value: unknown, row: number): { item: BulkSubmissionItemPayload | null; errors: ImportRowError[] } {
  const record = toRecord(value)
  if (!record) return { item: null, errors: [{ row, message: '資料列必須是物件格式。' }] }

  const name = textValue(getField(record, 'name'))
  const address = textValue(getField(record, 'address'))
  const suppliedCity = textValue(getField(record, 'city'))
  const suppliedDistrict = textValue(getField(record, 'district'))
  const addressParts = address ? deriveAddressParts(address) : { city: null, district: null }
  const city = suppliedCity || addressParts.city
  const district = suppliedDistrict || addressParts.district
  const region = mapRegion(getField(record, 'region'))
  const capPolicy = mapCapPolicy(getField(record, 'capPolicy')) ?? 'unknown'
  const sourceType = mapSourceType(getField(record, 'sourceType')) ?? 'community'
  const restrictions = parseRestrictions(getField(record, 'restrictions'))
  const officialUrl = textValue(getField(record, 'officialUrl')) || null
  const sourceUrl = textValue(getField(record, 'sourceUrl')) || null
  const notes = textValue(getField(record, 'notes')) || null
  const phone = textValue(getField(record, 'phone')) || null
  const latitude = parseCoordinate(getField(record, 'latitude'))
  const longitude = parseCoordinate(getField(record, 'longitude'))
  const errors: ImportRowError[] = []

  if (!name) errors.push({ row, message: '缺少地點名稱。' })
  if (!address) errors.push({ row, message: '缺少地址。' })
  if (!city) errors.push({ row, message: '缺少縣市，且無法從地址判斷。' })
  if (!region) errors.push({ row, message: '地區必須是北部、中部、南部、東部、離島，或對應英文值。' })
  if (latitude !== null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) {
    errors.push({ row, message: '緯度格式不正確。' })
  }
  if (longitude !== null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)) {
    errors.push({ row, message: '經度格式不正確。' })
  }
  if ((latitude === null) !== (longitude === null)) errors.push({ row, message: '緯度與經度需要同時填寫。' })
  if (phone && phone.length > 40) errors.push({ row, message: '電話不可超過 40 個字元。' })
  for (const [url, label] of [[officialUrl, '官方網站'], [sourceUrl, '來源網址']] as const) {
    if (!url) continue
    try {
      const parsedUrl = new URL(url)
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') throw new Error('unsupported protocol')
    } catch {
      errors.push({ row, message: `${label}必須是 http 或 https 網址。` })
    }
  }
  if (notes && notes.length > 2000) errors.push({ row, message: '補充說明不可超過 2,000 個字元。' })
  if (restrictions === null) {
    errors.push({ row, message: '使用限制必須是 JSON 陣列，或以逗號／直線分隔的文字。' })
  } else if (restrictions.length > 10 || restrictions.some((item) => item.length > 80)) {
    errors.push({ row, message: '使用限制最多 10 項，且每項不可超過 80 個字元。' })
  }

  if (errors.length || !name || !address || !city || !region) return { item: null, errors }
  return {
    item: {
      name,
      city,
      district,
      region,
      address,
      phone,
      latitude: latitude === null ? null : latitude,
      longitude: longitude === null ? null : longitude,
      capPolicy,
      restrictions: restrictions ?? [],
      sourceType,
      officialUrl,
      sourceUrl,
      notes,
    },
    errors,
  }
}

function parseCsv(text: string) {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  const pushField = () => {
    row.push(field)
    field = ''
  }
  const pushRow = () => {
    pushField()
    if (row.some((value) => value.trim())) rows.push(row)
    row = []
  }

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (inQuotes) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"'
          index += 1
        } else {
          inQuotes = false
        }
      } else {
        field += character
      }
    } else if (character === '"' && field.length === 0) {
      inQuotes = true
    } else if (character === ',') {
      pushField()
    } else if (character === '\n' || character === '\r') {
      pushRow()
      if (character === '\r' && text[index + 1] === '\n') index += 1
    } else {
      field += character
    }
  }

  if (inQuotes) throw new ImportFormatError('CSV 有未關閉的引號。')
  if (field.length || row.length) pushRow()
  return rows
}

function parseJsonRows(text: string) {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new ImportFormatError('JSON 格式不正確。')
  }

  if (Array.isArray(parsed)) return parsed
  const record = toRecord(parsed)
  if (record && Array.isArray(record.locations)) {
    const version = textValue(record.schema_version ?? record.schemaVersion)
    if (version && version !== '1') throw new ImportFormatError('只支援 schema_version 1 的 JSON 格式。')
    return record.locations
  }
  throw new ImportFormatError('JSON 必須是資料陣列，或包含 locations 陣列。')
}

export function parseImportFile(fileName: string, text: string): ImportPreview {
  const extension = fileName.toLocaleLowerCase().split('.').pop()
  if (extension !== 'csv' && extension !== 'json') throw new ImportFormatError('只支援 CSV 或 JSON 檔案。')

  const rawRows: unknown[] = extension === 'json'
    ? parseJsonRows(text)
    : (() => {
        const rows = parseCsv(text)
        if (!rows.length) throw new ImportFormatError('CSV 沒有資料。')
        const headers = rows[0].map((header) => headerAliases[normalizeKey(header)] ?? null)
        const unknownHeaders = rows[0].filter((header, index) => !headers[index] && header.trim())
        if (unknownHeaders.length) throw new ImportFormatError(`CSV 包含不支援的欄位：${unknownHeaders.join('、')}。`)
        if (!headers.some(Boolean)) throw new ImportFormatError('CSV 第一列必須是欄位名稱。')
        return rows.slice(1).map((values) => Object.fromEntries(
          headers.map((header, index) => header ? [header, values[index] ?? ''] : null).filter(Boolean) as Array<[string, string]>,
        ))
      })()

  if (!rawRows.length) throw new ImportFormatError('檔案沒有可投稿的資料。')
  if (rawRows.length > MAX_IMPORT_ROWS) {
    return {
      rowCount: rawRows.length,
      items: [],
      errors: [{ row: 0, message: `單次最多只能上傳 ${MAX_IMPORT_ROWS} 筆資料。` }],
    }
  }

  const errors: ImportRowError[] = []
  const items: BulkSubmissionItemPayload[] = []
  rawRows.forEach((rawRow, index) => {
    const result = normalizeRow(rawRow, index + 1)
    errors.push(...result.errors)
    if (result.item) {
      const duplicate = items.findIndex((item) => sameLocation(item, result.item as BulkSubmissionItemPayload))
      if (duplicate >= 0) {
        errors.push({ row: index + 1, message: `與第 ${duplicate + 1} 筆資料可能重複。` })
      } else {
        items.push(result.item)
      }
    }
  })

  return { rowCount: rawRows.length, items: errors.length ? [] : items, errors }
}
