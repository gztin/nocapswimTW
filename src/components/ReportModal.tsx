import { CheckCircle2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { CapPolicy, PoolLocation, SourceType } from '../types/location'
import { CAP_POLICY_LABELS, SOURCE_TYPE_LABELS } from '../types/location'

type ReportType = 'new-location' | 'policy-change' | 'address-error' | 'other'

interface ReportModalProps {
  open: boolean
  location?: PoolLocation | null
  onClose: () => void
}

const reportTypes: Array<[ReportType, string]> = [
  ['new-location', '新增地點'],
  ['policy-change', '規則已變更'],
  ['address-error', '地址錯誤'],
  ['other', '其他'],
]

export function ReportModal({ open, location, onClose }: ReportModalProps) {
  const [reportType, setReportType] = useState<ReportType>('new-location')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!open) return
    setReportType(location ? 'policy-change' : 'new-location')
    setSubmitted(false)
  }, [location, open])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, open])

  if (!open) return null

  const submitReport = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="detail-backdrop" role="presentation" onMouseDown={onClose}>
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
            <p>我們會確認資料，謝謝你一起讓清單更可靠。</p>
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
              <button className="icon-button" type="button" onClick={onClose} aria-label="關閉回報表單">
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
              <fieldset>
                <legend>回報類型</legend>
                <div className="report-type-grid">
                  {reportTypes.map(([value, label]) => (
                    <label className={`radio-card ${reportType === value ? 'is-selected' : ''}`} key={value}>
                      <input
                        type="radio"
                        name="report-type"
                        value={value}
                        checked={reportType === value}
                        onChange={() => setReportType(value)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {(reportType === 'new-location' || !location) && (
                <div className="form-grid">
                  <label className="form-field">
                    <span>地點名稱</span>
                    <input defaultValue={location?.name ?? ''} required={!location} placeholder="例如：海邊渡假飯店" />
                  </label>
                  <label className="form-field">
                    <span>地址</span>
                    <input defaultValue={location?.address ?? ''} required={!location} placeholder="請填寫完整地址" />
                  </label>
                </div>
              )}

              {location && reportType !== 'new-location' && (
                <div className="report-location-summary">
                  <span>目前資料</span>
                  <strong>{CAP_POLICY_LABELS[location.capPolicy]}</strong>
                  <span>{location.address}</span>
                </div>
              )}

              {(reportType === 'new-location' || reportType === 'policy-change') && (
                <div className="form-grid">
                  <label className="form-field">
                    <span>目前泳帽規定</span>
                    <select defaultValue={location?.capPolicy ?? 'unknown'}>
                      {(Object.keys(CAP_POLICY_LABELS) as CapPolicy[]).map((policy) => (
                        <option value={policy} key={policy}>{CAP_POLICY_LABELS[policy]}</option>
                      ))}
                    </select>
                  </label>
                  <label className="form-field">
                    <span>資料來源</span>
                    <select defaultValue="community">
                      {(Object.keys(SOURCE_TYPE_LABELS) as SourceType[]).map((source) => (
                        <option value={source} key={source}>{SOURCE_TYPE_LABELS[source]}</option>
                      ))}
                    </select>
                  </label>
                </div>
              )}

              <label className="form-field">
                <span>{reportType === 'address-error' ? '正確地址' : '使用條件或補充說明'}</span>
                <textarea rows={4} placeholder="請提供你知道的資訊，協助我們確認資料。" />
              </label>

              <div className="form-actions">
                <button className="button button--text" type="button" onClick={onClose}>取消</button>
                <button className="button button--primary" type="submit">送出回報</button>
              </div>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
