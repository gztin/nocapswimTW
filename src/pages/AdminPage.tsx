import { Check, ExternalLink, LoaderCircle, LogOut, RefreshCw, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError, adminLogin, adminLogout, approveSubmission, fetchAdminSubmissions, rejectSubmission } from '../api/client'
import { CAP_POLICY_LABELS, SOURCE_TYPE_LABELS } from '../types/location'
import type { ApprovalPayload, Submission, SubmissionStatus } from '../types/submission'
import { REPORT_TYPE_LABELS, SUBMISSION_STATUS_LABELS } from '../types/submission'

const statusTabs: SubmissionStatus[] = ['pending', 'approved', 'rejected']

function formatSubmissionDate(value: string) {
  return new Intl.DateTimeFormat('zh-TW', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function displayValue(value: string | null | undefined) {
  return value?.trim() || '—'
}

interface AdminLoginPageProps {
  onLoggedIn: () => void
}

function AdminLoginPage({ onLoggedIn }: AdminLoginPageProps) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await adminLogin(password)
      onLoggedIn()
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : '登入失敗，請稍後再試。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="admin-page admin-page--login">
      <a className="admin-back-link" href="/">返回前台</a>
      <section className="admin-login-card">
        <p className="eyebrow">No Cap Swim TW</p>
        <h1>投稿管理</h1>
        <p>請輸入管理員密碼以查看與審核投稿。</p>
        <form onSubmit={submit}>
          <label className="form-field">
            <span>管理員密碼</span>
            <input
              autoFocus
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button--primary button--full" type="submit" disabled={loading}>
            {loading ? '登入中...' : '登入管理後台'}
          </button>
        </form>
      </section>
    </main>
  )
}

interface SubmissionDetailProps {
  submission: Submission
  busy: boolean
  onApprove: (payload: ApprovalPayload) => void
  onReject: () => void
}

function SubmissionDetail({ submission, busy, onApprove, onReject }: SubmissionDetailProps) {
  const [latitude, setLatitude] = useState(submission.latitude === null ? '' : String(submission.latitude))
  const [longitude, setLongitude] = useState(submission.longitude === null ? '' : String(submission.longitude))
  const [coordinateError, setCoordinateError] = useState<string | null>(null)

  useEffect(() => {
    setLatitude(submission.latitude === null ? '' : String(submission.latitude))
    setLongitude(submission.longitude === null ? '' : String(submission.longitude))
    setCoordinateError(null)
  }, [submission])

  const submitApproval = () => {
    const hasLatitude = latitude.trim() !== ''
    const hasLongitude = longitude.trim() !== ''
    if (!hasLatitude && !hasLongitude) {
      onApprove({})
      return
    }
    const parsedLatitude = Number(latitude)
    const parsedLongitude = Number(longitude)
    if (!hasLatitude || !hasLongitude || !Number.isFinite(parsedLatitude) || !Number.isFinite(parsedLongitude)
      || parsedLatitude < -90 || parsedLatitude > 90 || parsedLongitude < -180 || parsedLongitude > 180) {
      setCoordinateError('請同時填寫有效的緯度與經度，或兩欄都留白。')
      return
    }
    setCoordinateError(null)
    onApprove({ latitude: parsedLatitude, longitude: parsedLongitude })
  }

  return (
    <aside className="admin-detail-panel">
      <div className="admin-detail-header">
        <div>
          <p className="eyebrow">投稿詳情</p>
          <h2>{displayValue(submission.name)}</h2>
        </div>
        <span className={`admin-status admin-status--${submission.status}`}>
          {SUBMISSION_STATUS_LABELS[submission.status]}
        </span>
      </div>

      <dl className="admin-detail-grid">
        <div><dt>投稿類型</dt><dd>{REPORT_TYPE_LABELS[submission.type]}</dd></div>
        <div><dt>投稿時間</dt><dd>{formatSubmissionDate(submission.createdAt)}</dd></div>
        <div><dt>地址</dt><dd>{displayValue(submission.address)}</dd></div>
        <div><dt>電話</dt><dd>{displayValue(submission.phone)}</dd></div>
        <div><dt>縣市／地區</dt><dd>{[submission.city, submission.district].filter(Boolean).join('／') || '—'}</dd></div>
        <div><dt>泳帽規定</dt><dd>{submission.capPolicy ? CAP_POLICY_LABELS[submission.capPolicy] : '—'}</dd></div>
        <div><dt>資料來源</dt><dd>{submission.sourceType ? SOURCE_TYPE_LABELS[submission.sourceType] : '—'}</dd></div>
      </dl>

      {submission.sourceUrl && (
        <a className="admin-source-link" href={submission.sourceUrl} target="_blank" rel="noreferrer">
          <ExternalLink size={15} aria-hidden="true" />
          開啟來源網址
        </a>
      )}

      <div className="admin-detail-section">
        <h3>使用限制</h3>
        {submission.restrictions.length ? (
          <div className="tag-list">
            {submission.restrictions.map((restriction) => <span className="restriction-tag" key={restriction}>{restriction}</span>)}
          </div>
        ) : <p className="muted-text">沒有填寫使用限制</p>}
      </div>

      <div className="admin-detail-section">
        <h3>補充說明</h3>
        <p className="admin-notes">{displayValue(submission.notes)}</p>
      </div>

      <div className="admin-detail-section">
        <h3>管理者補充座標（選填）</h3>
        <div className="form-grid">
          <label className="form-field">
            <span>緯度</span>
            <input inputMode="decimal" value={latitude} onChange={(event) => setLatitude(event.target.value)} placeholder="例如：25.033" />
          </label>
          <label className="form-field">
            <span>經度</span>
            <input inputMode="decimal" value={longitude} onChange={(event) => setLongitude(event.target.value)} placeholder="例如：121.565" />
          </label>
        </div>
        {coordinateError && <p className="form-error" role="alert">{coordinateError}</p>}
      </div>

      {submission.nickname || submission.email ? (
        <p className="admin-contributor">投稿者：{displayValue(submission.nickname)}{submission.email ? `（${submission.email}）` : ''}</p>
      ) : null}

      {submission.status === 'pending' && (
        <div className="admin-action-row">
          <button className="button button--text" type="button" onClick={onReject} disabled={busy}>
            <X size={16} aria-hidden="true" />
            拒絕
          </button>
          <button className="button button--primary" type="button" onClick={submitApproval} disabled={busy}>
            <Check size={16} aria-hidden="true" />
            {busy ? '處理中...' : '核准並公開'}
          </button>
        </div>
      )}
    </aside>
  )
}

export function AdminPage() {
  const [mode, setMode] = useState<'login' | 'dashboard'>(window.location.pathname === '/admin/login' ? 'login' : 'dashboard')
  const [activeStatus, setActiveStatus] = useState<SubmissionStatus>('pending')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionId, setActionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadSubmissions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchAdminSubmissions()
      setSubmissions(result)
      setSelectedId((current) => current && result.some((item) => item.id === current) ? current : result[0]?.id ?? null)
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        setMode('login')
        window.history.replaceState(null, '', '/admin/login')
      } else {
        setError(requestError instanceof ApiError ? requestError.message : '投稿資料載入失敗。')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (mode === 'dashboard') void loadSubmissions()
  }, [loadSubmissions, mode])

  const counts = useMemo(() => ({
    pending: submissions.filter((submission) => submission.status === 'pending').length,
    approved: submissions.filter((submission) => submission.status === 'approved').length,
    rejected: submissions.filter((submission) => submission.status === 'rejected').length,
  }), [submissions])

  const visibleSubmissions = submissions.filter((submission) => submission.status === activeStatus)
  const selectedSubmission = submissions.find((submission) => submission.id === selectedId) ?? null

  const loginSucceeded = () => {
    window.history.replaceState(null, '', '/admin')
    setMode('dashboard')
  }

  const logout = async () => {
    await adminLogout().catch(() => undefined)
    window.history.replaceState(null, '', '/admin/login')
    setMode('login')
  }

  const approve = async (payload: ApprovalPayload) => {
    if (!selectedSubmission || !window.confirm('核准後會公開或更新前台地點資料，確定要核准嗎？')) return
    setActionId(selectedSubmission.id)
    setError(null)
    try {
      await approveSubmission(selectedSubmission.id, payload)
      await loadSubmissions()
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : '核准失敗，請稍後再試。')
    } finally {
      setActionId(null)
    }
  }

  const reject = async () => {
    if (!selectedSubmission || !window.confirm('確定要拒絕這筆投稿嗎？')) return
    setActionId(selectedSubmission.id)
    setError(null)
    try {
      await rejectSubmission(selectedSubmission.id)
      await loadSubmissions()
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : '拒絕失敗，請稍後再試。')
    } finally {
      setActionId(null)
    }
  }

  if (mode === 'login') return <AdminLoginPage onLoggedIn={loginSucceeded} />

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="eyebrow">No Cap Swim TW</p>
          <h1>投稿管理</h1>
        </div>
        <div className="admin-header-actions">
          <button className="button button--outline" type="button" onClick={() => void loadSubmissions()} disabled={loading}>
            <RefreshCw size={16} aria-hidden="true" />
            重新整理
          </button>
          <button className="button button--text" type="button" onClick={() => void logout()}>
            <LogOut size={16} aria-hidden="true" />
            登出
          </button>
        </div>
      </header>

      {error && <div className="admin-error" role="alert">{error}</div>}

      <nav className="admin-tabs" aria-label="投稿狀態">
        {statusTabs.map((status) => (
          <button
            className={activeStatus === status ? 'is-active' : ''}
            type="button"
            key={status}
            onClick={() => {
              setActiveStatus(status)
              const first = submissions.find((submission) => submission.status === status)
              setSelectedId(first?.id ?? null)
            }}
          >
            {SUBMISSION_STATUS_LABELS[status]} <span>{counts[status]}</span>
          </button>
        ))}
      </nav>

      <section className="admin-content">
        <div className="admin-list-panel">
          {loading && !submissions.length ? (
            <div className="admin-empty"><LoaderCircle className="spin" size={24} /><span>載入投稿資料中...</span></div>
          ) : visibleSubmissions.length ? (
            <div className="admin-submission-list">
              {visibleSubmissions.map((submission) => (
                <button
                  className={`admin-submission-row ${selectedId === submission.id ? 'is-selected' : ''}`}
                  type="button"
                  key={submission.id}
                  onClick={() => setSelectedId(submission.id)}
                >
                  <span className="admin-submission-row-main">
                    <strong>{displayValue(submission.name)}</strong>
                    <small>{REPORT_TYPE_LABELS[submission.type]} · {formatSubmissionDate(submission.createdAt)}</small>
                  </span>
                  <span className="admin-submission-row-meta">{displayValue(submission.city)}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="admin-empty"><strong>目前沒有{SUBMISSION_STATUS_LABELS[activeStatus]}投稿</strong><span>新的投稿會顯示在這裡。</span></div>
          )}
        </div>
        {selectedSubmission ? (
          <SubmissionDetail
            key={selectedSubmission.id}
            submission={selectedSubmission}
            busy={actionId === selectedSubmission.id}
            onApprove={(payload) => void approve(payload)}
            onReject={() => void reject()}
          />
        ) : (
          <div className="admin-empty admin-empty--detail">選取一筆投稿查看詳情。</div>
        )}
      </section>
    </main>
  )
}
