import { Info } from 'lucide-react'
import type { PoolLocation, ViewMode } from '../types/location'
import type { RegionFilter } from '../hooks/useLocationFilters'
import { LocationList } from '../components/LocationList'
import { PoolMap } from '../components/PoolMap'
import { RegionFilter as RegionFilterControl } from '../components/RegionFilter'
import { SearchBar } from '../components/SearchBar'
import { ViewSwitcher } from '../components/ViewSwitcher'

interface HomePageProps {
  query: string
  region: RegionFilter
  view: ViewMode
  filteredLocations: PoolLocation[]
  selectedLocation: PoolLocation | null
  onQueryChange: (query: string) => void
  onRegionChange: (region: RegionFilter) => void
  onViewChange: (view: ViewMode) => void
  onSelectListLocation: (location: PoolLocation) => void
  onSelectMapLocation: (location: PoolLocation) => void
  onViewDetails: (location: PoolLocation) => void
  onCloseMapSelection: () => void
}

export function HomePage({
  query,
  region,
  view,
  filteredLocations,
  selectedLocation,
  onQueryChange,
  onRegionChange,
  onViewChange,
  onSelectListLocation,
  onSelectMapLocation,
  onViewDetails,
  onCloseMapSelection,
}: HomePageProps) {
  return (
    <main>
      <section className="intro-section" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">No Cap Swim TW</p>
          <h1 id="page-title">台灣不強制配戴泳帽的飯店與泳池公開清單</h1>
        </div>
        <p className="intro-description">先找規則，再放心下水。</p>
      </section>

      <section className="search-panel" aria-label="搜尋與篩選">
        <div className="search-row">
          <SearchBar value={query} onChange={onQueryChange} />
          <ViewSwitcher value={view} onChange={onViewChange} />
        </div>
        <div className="filter-row">
          <RegionFilterControl value={region} onChange={onRegionChange} />
          <span className="filter-hint">共 {filteredLocations.length} 筆結果</span>
        </div>
      </section>

      <div className="demo-notice">
        <Info size={17} aria-hidden="true" />
        <span>目前為示範資料，實際泳帽規則可能變動，前往前請再次向場館確認。</span>
      </div>

      {view === 'list' ? (
        <LocationList locations={filteredLocations} onSelect={onSelectListLocation} />
      ) : (
        <section className="map-layout" aria-label="地圖檢視">
          <aside className="map-sidebar">
            <LocationList
              locations={filteredLocations}
              selectedLocation={selectedLocation}
              onSelect={onSelectMapLocation}
              sidebar
            />
          </aside>
          <div className="map-panel">
            <PoolMap
              locations={filteredLocations}
              selectedLocation={selectedLocation}
              onSelectLocation={onSelectMapLocation}
              onViewDetails={onViewDetails}
              onCloseSelection={onCloseMapSelection}
            />
          </div>
        </section>
      )}
    </main>
  )
}
