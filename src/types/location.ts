export type Region = 'north' | 'central' | 'south' | 'east' | 'islands'

export type CapPolicy = 'not-required' | 'conditional' | 'unknown'

export type SourceType = 'official' | 'phone' | 'onsite' | 'community'

export interface PoolLocation {
  id: string
  name: string
  city: string
  district?: string
  region: Region
  address: string
  phone?: string
  imageUrl?: string
  latitude: number | null
  longitude: number | null
  capPolicy: CapPolicy
  restrictions?: string[]
  sourceType: SourceType
  sourceName?: string
  officialUrl?: string
  sourceUrl?: string
  lastVerified?: string
  notes?: string
}

export const REGION_LABELS: Record<Region | 'all', string> = {
  all: '全部',
  north: '北部',
  central: '中部',
  south: '南部',
  east: '東部',
  islands: '離島',
}

export const CAP_POLICY_LABELS: Record<CapPolicy, string> = {
  'not-required': '不強制泳帽',
  conditional: '有條件',
  unknown: '待確認',
}

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  official: '官方網站',
  phone: '電話確認',
  onsite: '現場確認',
  community: '網友回報',
}
