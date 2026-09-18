import { CheckCircle2, KeyRound, LoaderCircle, UserPlus, UserRound, UserRoundX } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import {
  ApiError,
  changeAdminPassword,
  createAdminUser,
  deactivateAdminUser,
  fetchAdminUsers,
} from '../api/client'
import {
  ADMIN_PASSWORD_MAX_LENGTH,
  ADMIN_PASSWORD_MIN_LENGTH,
  ADMIN_ROLE_LABELS,
} from '../types/admin'
import type { AdminUser } from '../types/admin'

interface AdminAccountPanelProps {
  user: AdminUser
  mustChangePassword: boolean
  onPasswordChanged: () => void
}

interface PasswordFieldsProps {
  password: string
  onChange: (value: string) => void
  autoComplete?: string
  label?: string
}

function PasswordFields({ password, onChange, autoComplete = 'new-password', label = '新密碼' }: PasswordFieldsProps) {
  const checks = [
    { label: `至少 ${ADMIN_PASSWORD_MIN_LENGTH} 個字元`, valid: password.length >= ADMIN_PASSWORD_MIN_LENGTH },
    { label: `不超過 ${ADMIN_PASSWORD_MAX_LENGTH} 個字元`, valid: password.length <= ADMIN_PASSWORD_MAX_LENGTH },
    { label: '包含大寫英文字母', valid: /[A-Z]/.test(password) },
    { label: '包含小寫英文字母', valid: /[a-z]/.test(password) },
    { label: '包含數字', valid: /[0-9]/.test(password) },
    { label: '包含特殊符號', valid: /[^A-Za-z0-9\s]/.test(password) },
    { label: '不含空白字元', valid: password.length > 0 && !/\s/.test(password) },
  ]

  return (
    <>
      <label className="form-field">
        <span>{label}</span>
        <input
          type="password"
          value={password}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          minLength={ADMIN_PASSWORD_MIN_LENGTH}
          maxLength={ADMIN_PASSWORD_MAX_LENGTH}
          required
        />
      </label>
      <ul className="password-policy" aria-label="密碼規則">
        {checks.map((check) => (
          <li className={check.valid ? 'is-valid' : ''} key={check.label}>
            <CheckCircle2 size={14} aria-hidden="true" />
            {check.label}
          </li>
        ))}
      </ul>
    </>
  )
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback
}

export function AdminAccountPanel({ user, mustChangePassword, onPasswordChanged }: AdminAccountPanelProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const [users, setUsers] = useState<AdminUser[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [collaboratorPassword, setCollaboratorPassword] = useState('')
  const [collaboratorConfirmPassword, setCollaboratorConfirmPassword] = useState('')
  const [createLoading, setCreateLoading] = useState(false)

  const loadUsers = useCallback(async () => {
    if (user.role !== 'owner') return
    setUsersLoading(true)
    setUsersError(null)
    try {
      const result = await fetchAdminUsers()
      setUsers(result.users)
    } catch (error) {
      setUsersError(errorMessage(error, '協作管理者資料載入失敗。'))
    } finally {
      setUsersLoading(false)
    }
  }, [user.role])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  const submitPasswordChange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordLoading(true)
    setPasswordError(null)
    try {
      await changeAdminPassword(currentPassword, newPassword, confirmPassword)
      onPasswordChanged()
    } catch (error) {
      setPasswordError(errorMessage(error, '密碼更新失敗，請稍後再試。'))
    } finally {
      setPasswordLoading(false)
    }
  }

  const submitCollaborator = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCreateLoading(true)
    setUsersError(null)
    try {
      await createAdminUser({
        username,
        displayName,
        password: collaboratorPassword,
        confirmPassword: collaboratorConfirmPassword,
      })
      setUsername('')
      setDisplayName('')
      setCollaboratorPassword('')
      setCollaboratorConfirmPassword('')
      await loadUsers()
    } catch (error) {
      setUsersError(errorMessage(error, '協作管理者新增失敗，請稍後再試。'))
    } finally {
      setCreateLoading(false)
    }
  }

  const deactivate = async (target: AdminUser) => {
    if (target.id === user.id || target.role === 'owner' || !target.isActive) return
    if (!window.confirm(`確定要停用「${target.displayName}」的管理權限嗎？`)) return
    setUsersError(null)
    try {
      await deactivateAdminUser(target.id)
      await loadUsers()
    } catch (error) {
      setUsersError(errorMessage(error, '協作管理者停用失敗，請稍後再試。'))
    }
  }

  return (
    <section className="admin-account-panel" aria-labelledby="admin-account-title">
      <div className="admin-account-heading">
        <div>
          <p className="eyebrow">帳號與安全性</p>
          <h2 id="admin-account-title">{user.displayName}</h2>
          <p className="admin-account-meta"><UserRound size={14} aria-hidden="true" /> @{user.username} · {ADMIN_ROLE_LABELS[user.role]}</p>
        </div>
        {user.mustChangePassword && <span className="admin-status admin-status--pending">需要更新密碼</span>}
      </div>

      {mustChangePassword && (
        <div className="admin-password-warning" role="status">
          這是第一次使用目前的管理員帳號，請先設定新的安全密碼。設定完成後需要重新登入。
        </div>
      )}

      <div className="admin-account-layout">
        <section className="admin-account-section">
          <div className="admin-account-section-heading">
            <KeyRound size={18} aria-hidden="true" />
            <div>
              <h3>修改管理員密碼</h3>
              <p>修改後目前所有登入工作階段都會失效。</p>
            </div>
          </div>
          <form onSubmit={submitPasswordChange}>
            <label className="form-field">
              <span>目前密碼</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            <PasswordFields password={newPassword} onChange={setNewPassword} />
            <label className="form-field">
              <span>確認新密碼</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                required
              />
            </label>
            {passwordError && <p className="form-error" role="alert">{passwordError}</p>}
            <button className="button button--primary" type="submit" disabled={passwordLoading}>
              {passwordLoading ? <LoaderCircle className="spin" size={16} aria-hidden="true" /> : <KeyRound size={16} aria-hidden="true" />}
              {passwordLoading ? '更新中...' : '更新密碼'}
            </button>
          </form>
        </section>

        {user.role === 'owner' && (
          <section className="admin-account-section">
            <div className="admin-account-section-heading">
              <UserPlus size={18} aria-hidden="true" />
              <div>
                <h3>協作管理者</h3>
                <p>協作管理者可以審核投稿，但不能管理其他管理員。</p>
              </div>
            </div>
            <form onSubmit={submitCollaborator}>
              <div className="form-grid">
                <label className="form-field">
                  <span>登入帳號</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    autoComplete="username"
                    pattern="[a-z0-9._-]{3,40}"
                    placeholder="例如：editor01"
                    required
                  />
                </label>
                <label className="form-field">
                  <span>顯示名稱</span>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="例如：小明"
                    maxLength={60}
                    required
                  />
                </label>
              </div>
              <PasswordFields password={collaboratorPassword} onChange={setCollaboratorPassword} label="初始密碼" />
              <label className="form-field">
                <span>確認初始密碼</span>
                <input
                  type="password"
                  value={collaboratorConfirmPassword}
                  onChange={(event) => setCollaboratorConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                />
              </label>
              {usersError && <p className="form-error" role="alert">{usersError}</p>}
              <button className="button button--outline" type="submit" disabled={createLoading}>
                {createLoading ? <LoaderCircle className="spin" size={16} aria-hidden="true" /> : <UserPlus size={16} aria-hidden="true" />}
                {createLoading ? '新增中...' : '新增協作管理者'}
              </button>
            </form>

            <div className="admin-users-list" aria-live="polite">
              {usersLoading ? <p className="muted-text"><LoaderCircle className="spin" size={15} aria-hidden="true" /> 載入管理員清單中...</p> : users.map((adminUser) => (
                <div className={`admin-user-row${adminUser.isActive ? '' : ' is-inactive'}`} key={adminUser.id}>
                  <div className="admin-user-meta">
                    <strong>{adminUser.displayName}</strong>
                    <span>@{adminUser.username} · {ADMIN_ROLE_LABELS[adminUser.role]}</span>
                  </div>
                  <div className="admin-user-actions">
                    <span className={`admin-user-status${adminUser.isActive ? ' is-active' : ''}`}>
                      {adminUser.isActive ? '使用中' : '已停用'}
                    </span>
                    {adminUser.role === 'admin' && adminUser.isActive && (
                      <button className="button button--text" type="button" onClick={() => void deactivate(adminUser)}>
                        <UserRoundX size={15} aria-hidden="true" />
                        停用
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  )
}
