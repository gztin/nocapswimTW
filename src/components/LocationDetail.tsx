import { ExternalLink, Globe2, MapPin, MessageSquare, Navigation, Phone, ShieldAlert, X } from 'lucide-react'
import { useEffect } from 'react'
import type { PoolLocation } from '../types/location'
import { SOURCE_TYPE_LABELS } from '../types/location'
import { formatPhone, formatVerifiedDate, getGoogleMapsUrl } from '../utils/location'
import { CopyButton } from './CopyButton'
import { StatusBadge } from './StatusBadge'

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
  const placeText = [location.city, location.district].filter(Boolean).join('・')
  const phoneText = location.phone ? formatPhone(location.phone) : null
  const mapsUrl = getGoogleMapsUrl(location.latitude, location.longitude, location.address)

  useEffect(() => {
    if (!onClose) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="detail-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="location-detail location-detail--drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="icon-button detail-close-button" type="button" onClick={onClose} aria-label="關閉詳細資料">
          <X size={20} aria-hidden="true" />
        </button>

        <div className="detail-scroll-content">
          <div className="detail-heading">
            <span className="eyebrow">地點詳細資料</span>
            <h2 id="location-detail-title">{location.name}</h2>
            {placeText && <p className="detail-place">{placeText}</p>}
            <StatusBadge policy={location.capPolicy} />
          </div>

          <section className="detail-section detail-info-section" aria-labelledby="hotel-info-title">
            <h3 id="hotel-info-title">飯店資訊</h3>
            <div className="info-list">
              <div className="info-row">
                <MapPin className="info-row-icon" size={18} aria-hidden="true" />
                <div className="info-row-content">{location.address}</div>
                <CopyButton value={location.address} label="複製地址" />
              </div>

              {phoneText && (
                <div className="info-row">
                  <Phone className="info-row-icon" size={18} aria-hidden="true" />
                  <div className="info-row-content">
                    <a className="info-link" href={`tel:${phoneText.replace(/[^\d+]/g, '')}`}>
                      {phoneText}
                    </a>
                  </div>
                  <CopyButton value={phoneText} label="複製電話" />
                </div>
              )}

              {location.officialUrl && (
                <div className="info-row">
                  <Globe2 className="info-row-icon" size={18} aria-hidden="true" />
                  <div className="info-row-content">
                    <a className="info-link" href={location.officialUrl} target="_blank" rel="noreferrer">
                      官方網站
                      <ExternalLink size={14} aria-hidden="true" />
                    </a>
                  </div>
                  <CopyButton value={location.officialUrl} label="複製官方網站網址" />
                </div>
              )}

              <div className="info-row">
                <Navigation className="info-row-icon" size={18} aria-hidden="true" />
                <div className="info-row-content">
                  <a className="info-link" href={mapsUrl} target="_blank" rel="noreferrer" aria-label="開啟 Google Maps 導航">
                    Google Maps
                    <ExternalLink size={14} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className="detail-section" aria-labelledby="restriction-title">
            <h3 id="restriction-title">使用限制</h3>
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
          </section>

          <section className="detail-section" aria-labelledby="verified-title">
            <h3 id="verified-title">最後確認</h3>
            <p className={`detail-verified ${!location.lastVerified ? 'is-stale' : ''}`}>{verifiedText}</p>
          </section>

          <section className="source-card" aria-labelledby="source-title">
            <div className="source-card-heading">
              <MessageSquare size={16} aria-hidden="true" />
              <h3 id="source-title">資訊來源</h3>
            </div>
            {location.sourceUrl ? (
              <a className="source-card-link" href={location.sourceUrl} target="_blank" rel="noreferrer">
                {sourceLabel}
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            ) : (
              <span className="source-card-name">{sourceLabel}</span>
            )}
            {location.sourceUrl && (
              <a className="source-card-secondary" href={location.sourceUrl} target="_blank" rel="noreferrer">
                查看原始內容
                <ExternalLink size={13} aria-hidden="true" />
              </a>
            )}
          </section>

          <div className="detail-note">
            <ShieldAlert size={17} aria-hidden="true" />
            <p>
              {location.notes ?? (location.sourceName
                ? `資料由${location.sourceName}整理。`
                : location.sourceType === 'community'
                  ? '此資訊來自網友回報。'
                  : '規則可能隨場館安排變動。')}
              <br />
              泳池規定可能變動，前往前建議再次向場館確認。
            </p>
          </div>
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
