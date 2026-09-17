import type { CapPolicy, Region, SourceType } from './location'

export type ReportType = 'new-location' | 'policy-change' | 'address-error' | 'other'

export type SubmissionStatus = 'pending' | 'approved' | 'rejected'

export interface Submission {
  id: string
  type: ReportType
  locationId: string | null
  name: string | null
  city: string | null
  district: string | null
  region: Region | null
  address: string | null
  phone: string | null
  latitude: number | null
  longitude: number | null
  capPolicy: CapPolicy | null
  restrictions: string[]
  sourceType: SourceType | null
  sourceUrl: string | null
  notes: string | null
  nickname: string | null
  email: string | null
  status: SubmissionStatus
  createdAt: string
  reviewedAt: string | null
}

export interface SubmissionPayload {
  type: ReportType
  locationId?: string | null
  name: string
  city?: string | null
  district?: string | null
  region?: Region | null
  address: string
  phone?: string | null
  latitude?: number | null
  longitude?: number | null
  capPolicy: CapPolicy
  restrictions: string[]
  sourceType: SourceType
  sourceUrl?: string | null
  notes?: string | null
  nickname?: string | null
  email?: string | null
  turnstileToken?: string | null
}

export interface ApprovalPayload {
  latitude?: number | null
  longitude?: number | null
}

export interface BulkSubmissionItemPayload {
  name: string
  city: string
  district?: string | null
  region: Region
  address: string
  phone?: string | null
  latitude?: number | null
  longitude?: number | null
  capPolicy: CapPolicy
  restrictions: string[]
  sourceType: SourceType
  sourceUrl?: string | null
  notes?: string | null
}

export interface BulkSubmissionPayload {
  items: BulkSubmissionItemPayload[]
  nickname?: string | null
  email?: string | null
  turnstileToken?: string | null
}

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  'new-location': '新增地點',
  'policy-change': '規則已變更',
  'address-error': '地址錯誤',
  other: '其他',
}

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: '待審核',
  approved: '已核准',
  rejected: '已拒絕',
}
