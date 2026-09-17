import { CalendarDays, ExternalLink, MapPin, Phone, ShieldAlert, X } from 'lucide-react'
import type { PoolLocation } from '../types/location'
import { SOURCE_TYPE_LABELS } from '../types/location'
import { formatVerifiedDate, getGoogleMapsUrl } from '../utils/location'
import { LocationImage } from './LocationImage'
import { StatusBadge } from './StatusBadge'
import { useEffect } from 'react'

interface LocationDetailProps {
  location: PoolLocation
  onClose?: () => void
  onReport?: () => void
}

export function LocationDetail({
  location,
  onClose,
  onReport,
}: LocationDetailProps) {
  const verifiedText = formatVerifiedDate(location.lastVerified)
  const sourceLabel = location.sourceName ?? SOURCE_TYPE_LABELS[location.sourceType]

  useEffect(() => {
    if (!onClose) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const mapsUrl = getGoogleMapsUrl(location.latitude, location.longitude, location.address)

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
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="關閉詳細資料">
            <X size={20} />
          </button>
        </div>

        <div className="detail-scroll-content">
          <LocationImage
            className="detail-image"
            imageUrl={location.imageUrl}
            alt={`${location.name}泳池`}
            loading="eager"
          />
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
              <dd>
                {sourceLabel}
                {location.sourceUrl && (
                  <a className="source-link" href={location.sourceUrl} target="_blank" rel="noreferrer">
                    查看來源
                  </a>
                )}
              </dd>
            </div>
            {location.phone && (
              <div>
                <dt>電話</dt>
                <dd className="detail-phone">
                  <Phone size={14} aria-hidden="true" />
                  <a className="source-link" href={`tel:${location.phone}`}>{location.phone}</a>
                </dd>
              </div>
            )}
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
            <p>
              {location.sourceName && `資料由${location.sourceName}整理，建議前往前再次向場館確認。`}
              {!location.sourceName && location.sourceType === 'community' && '此資訊來自網友回報，建議前往前再次向場館確認。'}
              {location.sourceType !== 'community' && (location.notes ?? '規則可能隨場館安排變動，前往前建議再次確認。')}
            </p>
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
