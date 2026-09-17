import { SearchX } from 'lucide-react'
import type { PoolLocation } from '../types/location'
import { LocationCard } from './LocationCard'

interface LocationListProps {
  locations: PoolLocation[]
  selectedLocation?: PoolLocation | null
  onSelect: (location: PoolLocation) => void
  sidebar?: boolean
}

export function LocationList({
  locations,
  selectedLocation,
  onSelect,
  sidebar = false,
}: LocationListProps) {
  return (
    <section className={`location-list ${sidebar ? 'location-list--sidebar' : ''}`}>
      <div className="list-heading">
        <div>
          <p className="eyebrow">公開清單</p>
          <h2>{locations.length} 個地點</h2>
        </div>
        <span className="list-sort">依地區</span>
      </div>
      {locations.length > 0 ? (
        <div className="location-card-list">
          {locations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              selected={selectedLocation?.id === location.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <SearchX size={28} aria-hidden="true" />
          <strong>找不到符合條件的地點</strong>
          <p>試著更換關鍵字或地區篩選。</p>
        </div>
      )}
    </section>
  )
}
