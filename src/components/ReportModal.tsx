import { CheckCircle2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ApiError, createSubmission } from '../api/client'
import type { CapPolicy, PoolLocation, Region, SourceType } from '../types/location'
import { CAP_POLICY_LABELS, REGION_LABELS, SOURCE_TYPE_LABELS } from '../types/location'
import type { ReportType, SubmissionPayload } from '../types/submission'
import { REPORT_TYPE_LABELS } from '../types/submission'

interface ReportModalProps {
  open: boolean
  location?: PoolLocation | null
  onClose: () => void
}

const reportTypes: ReportType[] = ['new-location', 'policy-change', 'address-error', 'other']
const restrictionOptions = ['僅限房客', '需購票', '季節限定', '兒童需陪同']
const regionOptions = (Object.keys(REGION_LABELS) as Array<Region | 'all'>).filter((region): region is Region => region !== 'all')
const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

interface TurnstileApi {
  render: (element: HTMLElement, options: {
    sitekey: string
    callback: (token: string) => void
    'expired-callback': () => void
    'error-callback': () => void
  }) => string | number
  reset: (widgetId?: string | number) => void
  remove?: (widgetId: string | number) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

function loadTurnstileScript() {
  if (window.turnstile) return Promise.resolve()
  return new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-turnstile-script]')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('Turnstile script failed')), { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.dataset.turnstileScript = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Turnstile script failed'))
    document.head.appendChild(script)
  })
}

export function ReportModal({ open, location, onClose }: ReportModalProps) {
  const [reportType, setReportType] = useState<ReportType>('new-location')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileLoadError, setTurnstileLoadError] = useState(false)
  const turnstileRef = useRef<HTMLDivElement>(null)
  const turnstileWidgetId = useRef<string | number | null>(null)

  useEffect(() => {
    if (!open) return
    setReportType(location ? 'policy-change' : 'new-location')
    setSubmitted(false)
    setSubmitting(false)
    setSubmitError(null)
    setTurnstileToken(null)
    setTurnstileLoadError(false)
  }, [location, open])

  useEffect(() => {
    if (!open || !turnstileSiteKey || !turnstileRef.current) return
    let active = true
    loadTurnstileScript()
      .then(() => {
        if (!active || !turnstileRef.current || !window.turnstile) return
        turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
          sitekey: turnstileSiteKey,
          callback: (token) => setTurnstileToken(token),
          'expired-callback': () => setTurnstileToken(null),
          'error-callback': () => setTurnstileToken(null),
        })
      })
      .catch(() => {
        if (active) setTurnstileLoadError(true)
      })
    return () => {
      active = false
      if (turnstileWidgetId.current !== null) window.turnstile?.remove?.(turnstileWidgetId.current)
      turnstileWidgetId.current = null
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, open, submitting])

  if (!open) return null

  const availableReportTypes = location ? reportTypes.filter((type) => type !== 'new-location') : ['new-location'] as ReportType[]
  const customRestrictions = location?.restrictions?.filter((restriction) => !restrictionOptions.includes(restriction)) ?? []

  const submitReport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (turnstileSiteKey && !turnstileToken) {
      setSubmitError('請先完成安全驗證後再送出。')
      return
    }

    const form = new FormData(event.currentTarget)
    const restrictions = form.getAll('restrictions').map(String)
    const otherRestriction = String(form.get('restriction_other') ?? '').trim()
    if (otherRestriction) restrictions.push(otherRestriction)

    const payload: SubmissionPayload = {
      type: reportType,
      locationId: location?.id ?? null,
      name: String(form.get('name') ?? ''),
      city: String(form.get('city') ?? '') || null,
      district: String(form.get('district') ?? '') || null,
      region: (String(form.get('region') ?? '') || null) as Region | null,
      address: String(form.get('address') ?? ''),
      capPolicy: String(form.get('cap_policy') ?? 'unknown') as CapPolicy,
      restrictions,
      sourceType: String(form.get('source_type') ?? 'community') as SourceType,
      sourceUrl: String(form.get('source_url') ?? '') || null,
      notes: String(form.get('notes') ?? '') || null,
      nickname: String(form.get('nickname') ?? '') || null,
      email: String(form.get('email') ?? '') || null,
      turnstileToken,
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      await createSubmission(payload)
      setSubmitted(true)
    } catch (error) {
      if (error instanceof ApiError && error.code === 'possible-duplicate') {
        setSubmitError(error.message)
      } else {
        setSubmitError('送出失敗，請稍後再試。')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const isNewLocation = reportType === 'new-location'
  const isAddressError = reportType === 'address-error'

  return (
    <div className="detail-backdrop" role="presentation" onMouseDown={() => !submitting && onClose()}>
      <section
        className="report-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {submitted ? (
          <div className="report-success">
            <span className="success-icon"><CheckCircle2 size={32} /></span>
            <h2>感謝你的回報</h2>
            <p>資料會經過確認後加入或更新地圖。<br />謝謝你一起協助維護 NoCapSwimTW。</p>
            <button className="button button--primary" type="button" onClick={onClose}>
              完成
            </button>
          </div>
        ) : (
          <>
            <div className="detail-header">
              <div>
                <span className="eyebrow">一起維護清單</span>
                <h2 id="report-modal-title">回報地點</h2>
              </div>
              <button className="icon-button" type="button" onClick={onClose} disabled={submitting} aria-label="關閉回報表單">
                <X size={20} />
              </button>
            </div>
            {location && (
              <div className="report-context">
                <strong>{location.name}</strong>
                <span>{location.address}</span>
              </div>
            )}
            <form className="report-form" onSubmit={submitReport}>
              <input type="hidden" name="location_id" value={location?.id ?? ''} />
              {location && (
                <>
                  <input type="hidden" name="name" value={location.name} />
                  <input type="hidden" name="city" value={location.city} />
                  <input type="hidden" name="district" value={location.district ?? ''} />
                  <input type="hidden" name="region" value={location.region} />
                </>
              )}

              <fieldset>
                <legend>回報類型</legend>
                <div className="report-type-grid">
                  {availableReportTypes.map((type) => (
                    <label className={`radio-card ${reportType === type ? 'is-selected' : ''}`} key={type}>
                      <input
                        type="radio"
                        name="report-type"
                        value={type}
                        checked={reportType === type}
                        onChange={() => setReportType(type)}
                      />
                      <span>{REPORT_TYPE_LABELS[type]}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {isNewLocation && (
                <>
                  <div className="form-grid">
                    <label className="form-field">
                      <span>地點名稱</span>
                      <input name="name" required placeholder="例如：海邊渡假飯店" />
                    </label>
                    <label className="form-field">
                      <span>縣市</span>
                      <input name="city" required placeholder="例如：台北市" />
                    </label>
                  </div>
                  <div className="form-grid">
                    <label className="form-field">
                      <span>行政區</span>
                      <input name="district" placeholder="例如：中山區" />
                    </label>
                    <label className="form-field">
                      <span>地區</span>
                      <select name="region" defaultValue="north" required>
                        {regionOptions.map((region) => <option value={region} key={region}>{REGION_LABELS[region]}</option>)}
                      </select>
                    </label>
                  </div>
                  <label className="form-field">
                    <span>地址</span>
                    <input name="address" required placeholder="請填寫完整地址" />
                  </label>
                </>
              )}

              {location && !isNewLocation && (
                isAddressError ? (
                  <label className="form-field">
                    <span>正確地址</span>
                    <input name="address" defaultValue={location.address} required />
                  </label>
                ) : (
                  <input type="hidden" name="address" value={location.address} />
                )
              )}

              {!location && !isNewLocation && (
                <label className="form-field">
                  <span>地點名稱</span>
                  <input name="name" required placeholder="請填寫地點名稱" />
                </label>
              )}

              {(isNewLocation || reportType === 'policy-change') ? (
                <div className="form-grid">
                  <label className="form-field">
                    <span>泳帽規定</span>
                    <select name="cap_policy" defaultValue={location?.capPolicy ?? 'unknown'} required>
                      {(Object.keys(CAP_POLICY_LABELS) as CapPolicy[]).map((policy) => (
                        <option value={policy} key={policy}>{CAP_POLICY_LABELS[policy]}</option>
                      ))}
                    </select>
                  </label>
                  <label className="form-field">
                    <span>資料來源</span>
                    <select name="source_type" defaultValue={location?.sourceType ?? 'community'} required>
                      {(Object.keys(SOURCE_TYPE_LABELS) as SourceType[]).map((source) => (
                        <option value={source} key={source}>{SOURCE_TYPE_LABELS[source]}</option>
                      ))}
                    </select>
                  </label>
                </div>
              ) : (
                <>
                  <input type="hidden" name="cap_policy" value={location?.capPolicy ?? 'unknown'} />
                  <label className="form-field">
                    <span>資料來源</span>
                    <select name="source_type" defaultValue={location?.sourceType ?? 'community'} required>
                      {(Object.keys(SOURCE_TYPE_LABELS) as SourceType[]).map((source) => (
                        <option value={source} key={source}>{SOURCE_TYPE_LABELS[source]}</option>
                      ))}
                    </select>
                  </label>
                </>
              )}

              <fieldset className="restriction-fieldset">
                <legend>使用限制</legend>
                <div className="restriction-checkbox-grid">
                  {restrictionOptions.map((restriction) => (
                    <label className="checkbox-label" key={restriction}>
                      <input
                        type="checkbox"
                        name="restrictions"
                        value={restriction}
                        defaultChecked={location?.restrictions?.includes(restriction)}
                      />
                      <span>{restriction}</span>
                    </label>
                  ))}
                  {customRestrictions.map((restriction) => (
                    <label className="checkbox-label" key={restriction}>
                      <input type="checkbox" name="restrictions" value={restriction} defaultChecked />
                      <span>{restriction}</span>
                    </label>
                  ))}
                </div>
                <input className="restriction-other-input" name="restriction_other" placeholder="其他限制（選填）" />
              </fieldset>

              <label className="form-field">
                <span>來源網址（選填）</span>
                <input name="source_url" type="url" defaultValue={location?.sourceUrl ?? ''} placeholder="https://..." />
              </label>

              <label className="form-field">
                <span>補充說明</span>
                <textarea name="notes" rows={4} placeholder="請提供你知道的資訊，協助我們確認資料。" />
              </label>

              <div className="form-grid">
                <label className="form-field">
                  <span>暱稱（選填）</span>
                  <input name="nickname" placeholder="如何稱呼你" />
                </label>
                <label className="form-field">
                  <span>Email（選填）</span>
                  <input name="email" type="email" placeholder="you@example.com" />
                </label>
              </div>

              {turnstileSiteKey ? (
                <div className="turnstile-field">
                  <div ref={turnstileRef} />
                  {turnstileLoadError && <p className="form-error">安全驗證載入失敗，請重新整理後再試。</p>}
                </div>
              ) : (
                <p className="form-hint">本機開發環境暫未啟用安全驗證。</p>
              )}

              {submitError && <p className="form-error" role="alert">{submitError}</p>}

              <div className="form-actions">
                <button className="button button--text" type="button" onClick={onClose} disabled={submitting}>取消</button>
                <button className="button button--primary" type="submit" disabled={submitting || turnstileLoadError}>
                  {submitting ? '送出中...' : '送出回報'}
                </button>
              </div>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
