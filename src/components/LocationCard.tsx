import { CalendarDays } from 'lucide-react'
import type { PoolLocation } from '../types/location'
import { formatVerifiedDate } from '../utils/location'
import { StatusBadge } from './StatusBadge'

interface LocationCardProps {
  location: PoolLocation
  onSelect: (location: PoolLocation) => void
}

export function LocationCard({ location, onSelect }: LocationCardProps) {
  const verificationText = location.lastVerified
    ? `最後確認：${formatVerifiedDate(location.lastVerified)}`
    : formatVerifiedDate(location.lastVerified)
  const placeText = [location.city, location.district].filter(Boolean).join('・')

  return (
    <button
      className="location-card"
      type="button"
      onClick={() => onSelect(location)}
      aria-label={`查看${location.name}詳細資料`}
    >
      <div className="location-card-content">
        <div className="card-heading">
          <div>
            <h3>{location.name}</h3>
            <p className="location-place">{placeText}</p>
          </div>
        </div>
        <StatusBadge policy={location.capPolicy} />
        <div className="card-meta">
          <span className={!location.lastVerified ? 'is-stale' : ''}>
            <CalendarDays size={14} aria-hidden="true" />
            {verificationText}
          </span>
        </div>
      </div>
    </button>
  )
}
