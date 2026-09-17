import { useCallback, useState } from 'react'
import { Header } from './components/Header'
import { LocationDetail } from './components/LocationDetail'
import { ReportModal } from './components/ReportModal'
import { locations } from './data/locations'
import { useLocationFilters } from './hooks/useLocationFilters'
import { HomePage } from './pages/HomePage'
import type { PoolLocation } from './types/location'

function App() {
  const { query, region, view, filteredLocations, setQuery, setRegion, setView } = useLocationFilters(locations)
  const [selectedLocation, setSelectedLocation] = useState<PoolLocation | null>(null)
  const [detailLocation, setDetailLocation] = useState<PoolLocation | null>(null)
  const [reportLocation, setReportLocation] = useState<PoolLocation | null>(null)
  const [isReportOpen, setIsReportOpen] = useState(false)

  const selectLocation = useCallback((location: PoolLocation) => {
    setSelectedLocation(location)
  }, [])

  const openReport = (location: PoolLocation | null = null) => {
    setReportLocation(location)
    setIsReportOpen(true)
  }

  const closeReport = () => {
    setIsReportOpen(false)
    setReportLocation(null)
  }

  return (
    <div className="app-shell">
      <Header onReport={() => openReport()} />

      <HomePage
        query={query}
        region={region}
        view={view}
        filteredLocations={filteredLocations}
        selectedLocation={selectedLocation}
        onQueryChange={setQuery}
        onRegionChange={setRegion}
        onViewChange={setView}
        onSelectListLocation={setDetailLocation}
        onSelectMapLocation={selectLocation}
        onViewDetails={setDetailLocation}
        onCloseMapSelection={() => setSelectedLocation(null)}
      />

      <nav className="mobile-view-nav" aria-label="檢視模式">
        <button className={view === 'list' ? 'is-active' : ''} type="button" onClick={() => setView('list')}>
          清單
        </button>
        <button className={view === 'map' ? 'is-active' : ''} type="button" onClick={() => setView('map')}>
          地圖
        </button>
      </nav>

      {detailLocation && (
        <LocationDetail
          location={detailLocation}
          onClose={() => setDetailLocation(null)}
          onReport={() => {
            setDetailLocation(null)
            openReport(detailLocation)
          }}
        />
      )}
      <ReportModal open={isReportOpen} location={reportLocation} onClose={closeReport} />
    </div>
  )
}

export default App
