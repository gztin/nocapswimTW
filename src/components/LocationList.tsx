import { SearchX } from 'lucide-react'
import type { PoolLocation } from '../types/location'
import { LocationCard } from './LocationCard'

interface LocationListProps {
  locations: PoolLocation[]
  onSelect: (location: PoolLocation) => void
}

export function LocationList({
  locations,
  onSelect,
}: LocationListProps) {
  return (
    <section className="location-list" aria-labelledby="location-list-title">
      <div className="list-heading">
        <h2 className="visually-hidden" id="location-list-title">地點清單</h2>
      </div>
      {locations.length > 0 ? (
        <div className="location-card-list">
          {locations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
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
