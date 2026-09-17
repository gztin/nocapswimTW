import type { Region } from '../types/location'
import { REGION_LABELS } from '../types/location'
import type { RegionFilter } from '../hooks/useLocationFilters'

interface RegionFilterProps {
  value: RegionFilter
  onChange: (region: RegionFilter) => void
}

const regions: RegionFilter[] = ['all', 'north', 'central', 'south', 'east', 'islands']

export function RegionFilter({ value, onChange }: RegionFilterProps) {
  return (
    <div className="region-filter" aria-label="依地區篩選">
      {regions.map((region) => (
        <button
          className={`filter-chip ${value === region ? 'is-active' : ''}`}
          type="button"
          key={region}
          onClick={() => onChange(region)}
          aria-pressed={value === region}
        >
          {REGION_LABELS[region as Region | 'all']}
        </button>
      ))}
    </div>
  )
}
