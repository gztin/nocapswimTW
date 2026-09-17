import { Info } from 'lucide-react'
import type { PoolLocation } from '../types/location'
import type { RegionFilter } from '../hooks/useLocationFilters'
import { LocationList } from '../components/LocationList'
import { RegionFilter as RegionFilterControl } from '../components/RegionFilter'
import { SearchBar } from '../components/SearchBar'

interface HomePageProps {
  query: string
  region: RegionFilter
  filteredLocations: PoolLocation[]
  loading: boolean
  error: string | null
  onRetry: () => void
  onQueryChange: (query: string) => void
  onRegionChange: (region: RegionFilter) => void
  onSelectListLocation: (location: PoolLocation) => void
}

export function HomePage({
  query,
  region,
  filteredLocations,
  loading,
  error,
  onRetry,
  onQueryChange,
  onRegionChange,
  onSelectListLocation,
}: HomePageProps) {
  return (
    <main>
      <section className="intro-section" aria-labelledby="page-title">
        <div>
          <h1 id="page-title">免泳帽泳池</h1>
          <p className="intro-description">找找台灣有哪些不用戴泳帽的飯店與泳池</p>
        </div>
      </section>

      <section className="search-toolbar" aria-label="搜尋與篩選">
        <div className="search-row">
          <SearchBar value={query} onChange={onQueryChange} />
        </div>
        <div className="filter-row">
          <RegionFilterControl value={region} onChange={onRegionChange} />
          <div className="results-meta">
            <span className="filter-hint">共 {filteredLocations.length} 個地點</span>
            <span className="data-notice">
              <Info size={14} aria-hidden="true" />
              泳池規定可能變動，前往前建議再次確認
            </span>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="status-state" role="status">
          <strong>正在載入地點資料⋯</strong>
          <p>請稍候片刻。</p>
        </div>
      ) : error ? (
        <div className="status-state status-state--error" role="alert">
          <strong>地點資料暫時無法載入</strong>
          <p>{error}</p>
          <button className="button button--outline" type="button" onClick={onRetry}>重新載入</button>
        </div>
      ) : (
        <LocationList locations={filteredLocations} onSelect={onSelectListLocation} />
      )}
    </main>
  )
}
