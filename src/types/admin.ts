export type AdminRole = 'owner' | 'admin'

export interface AdminUser {
  id: string
  username: string
  displayName: string
  role: AdminRole
  isActive: boolean
  mustChangePassword: boolean
  createdAt: string
  lastLoginAt: string | null
}

export const ADMIN_PASSWORD_MIN_LENGTH = 6
export const ADMIN_PASSWORD_MAX_LENGTH = 128

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  owner: '主要管理員',
  admin: '協作管理者',
}
