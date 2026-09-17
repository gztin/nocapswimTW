import { CalendarDays, ChevronRight, MapPin } from 'lucide-react'
import type { PoolLocation } from '../types/location'
import { SOURCE_TYPE_LABELS } from '../types/location'
import { formatVerifiedDate } from '../utils/location'
import { StatusBadge } from './StatusBadge'

interface LocationCardProps {
  location: PoolLocation
  selected?: boolean
  onSelect: (location: PoolLocation) => void
}

export function LocationCard({ location, selected = false, onSelect }: LocationCardProps) {
  const verificationText = location.lastVerified
    ? `最後確認：${formatVerifiedDate(location.lastVerified)}`
    : formatVerifiedDate(location.lastVerified)

  return (
    <article
      className={`location-card ${selected ? 'is-selected' : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(location)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(location)
        }
      }}
      aria-label={`查看${location.name}詳細資料`}
    >
      <div className="card-heading">
        <div>
          <h3>{location.name}</h3>
        </div>
        <ChevronRight className="card-chevron" size={19} aria-hidden="true" />
      </div>
      <StatusBadge policy={location.capPolicy} />
      <p className="location-address">
        <MapPin size={15} aria-hidden="true" />
        {location.address}
      </p>
      <div className="card-meta">
        <span className={location.lastVerified ? '' : 'is-stale'}>
          <CalendarDays size={14} aria-hidden="true" />
          {verificationText}
        </span>
        <span className="source-label">來源：{SOURCE_TYPE_LABELS[location.sourceType]}</span>
      </div>
      {!!location.restrictions?.length && (
        <div className="tag-list" aria-label="使用限制">
          {location.restrictions.map((restriction) => (
            <span className="restriction-tag" key={restriction}>
              {restriction}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}
