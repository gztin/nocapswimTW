import { CalendarDays, ExternalLink, MapPin, ShieldAlert, X } from 'lucide-react'
import type { PoolLocation } from '../types/location'
import { SOURCE_TYPE_LABELS } from '../types/location'
import { formatVerifiedDate, getGoogleMapsUrl } from '../utils/location'
import { StatusBadge } from './StatusBadge'
import { useEffect } from 'react'

interface LocationDetailProps {
  location: PoolLocation
  compact?: boolean
  onClose?: () => void
  onViewDetails?: () => void
  onReport?: () => void
}

export function LocationDetail({
  location,
  compact = false,
  onClose,
  onViewDetails,
  onReport,
}: LocationDetailProps) {
  const verifiedText = formatVerifiedDate(location.lastVerified)

  useEffect(() => {
    if (compact || !onClose) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [compact, onClose])

  if (compact) {
    return (
      <div className="location-detail location-detail--compact">
        <div className="compact-detail-header">
          <div>
            {location.isDemo && <span className="demo-label">示範資料</span>}
            <h3>{location.name}</h3>
          </div>
          {onClose && (
            <button className="icon-button" type="button" onClick={onClose} aria-label="關閉地點預覽">
              <X size={18} />
            </button>
          )}
        </div>
        <StatusBadge policy={location.capPolicy} compact />
        <p className="location-address">
          <MapPin size={15} aria-hidden="true" />
          {location.address}
        </p>
        <div className="compact-detail-meta">
          <span className={!location.lastVerified ? 'is-stale' : ''}>
            <CalendarDays size={14} aria-hidden="true" />
            {location.lastVerified ? `最後確認 ${verifiedText}` : verifiedText}
          </span>
          {!!location.restrictions?.length && (
            <div className="tag-list">
              {location.restrictions.map((restriction) => (
                <span className="restriction-tag" key={restriction}>
                  {restriction}
                </span>
              ))}
            </div>
          )}
        </div>
        <button className="button button--primary button--full" type="button" onClick={onViewDetails}>
          查看詳細資料
        </button>
      </div>
    )
  }

  const mapsUrl = getGoogleMapsUrl(location.latitude, location.longitude)

  return (
    <div className="detail-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="location-detail location-detail--drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="detail-header">
          <div>
            <span className="eyebrow">地點詳細資料</span>
            <h2 id="location-detail-title">{location.name}</h2>
            {location.isDemo && <span className="demo-label">示範資料</span>}
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="關閉詳細資料">
            <X size={20} />
          </button>
        </div>

        <div className="detail-scroll-content">
          <StatusBadge policy={location.capPolicy} />
          <div className="detail-address">
            <MapPin size={17} aria-hidden="true" />
            <span>{location.address}</span>
          </div>

          <dl className="detail-info-grid">
            <div>
              <dt>最後確認</dt>
              <dd className={!location.lastVerified ? 'is-stale' : ''}>{verifiedText}</dd>
            </div>
            <div>
              <dt>資料來源</dt>
              <dd>{SOURCE_TYPE_LABELS[location.sourceType]}</dd>
            </div>
          </dl>

          <div className="detail-section">
            <h3>使用限制</h3>
            {location.restrictions?.length ? (
              <div className="tag-list">
                {location.restrictions.map((restriction) => (
                  <span className="restriction-tag" key={restriction}>
                    {restriction}
                  </span>
                ))}
              </div>
            ) : (
              <p className="muted-text">目前沒有記錄使用限制</p>
            )}
          </div>

          <div className="detail-note">
            <ShieldAlert size={17} aria-hidden="true" />
            <p>{location.notes ?? '規則可能隨場館安排變動，前往前建議再次確認。'}</p>
          </div>

          <a className="external-map-link" href={mapsUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={16} aria-hidden="true" />
            在 Google Maps 開啟導航
          </a>
        </div>

        <div className="detail-footer">
          <button className="button button--text" type="button" onClick={onReport}>
            回報資訊有誤
          </button>
          <button className="button button--primary" type="button" onClick={onClose}>
            關閉
          </button>
        </div>
      </section>
    </div>
  )
}
